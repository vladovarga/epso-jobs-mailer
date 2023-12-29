import { Op } from "sequelize"

// import { env } from './env'
import { sequelizeInstance } from './inits/sequelize'
import { Job } from './models/job'
import { City } from './models/city'
import { MailerRun } from './models/mailerRun'
import { User } from './models/user'
import { Mailer } from './mailer'

import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';

// console.log(env);
export const handler = async (event?: APIGatewayEvent, context?: Context): Promise<APIGatewayProxyResult> => {
    // console.log(`Event: ${JSON.stringify(event, null, 2)}`)
    // console.log(`Context: ${JSON.stringify(context, null, 2)}`)

    console.time("overall-execution-time")

    // connect to the DB //
    try {
        await sequelizeInstance.authenticate()
        console.log('Connection to database has been established successfully.')
    } catch (error) {
        console.error('Unable to connect to the database:', error)
        throw error
    }

    // get the last successful mailer run

    const lastSuccessfulMailerRun = await MailerRun.getLastSuccessfulRun()

    let since;
    
    if (lastSuccessfulMailerRun == null) {
        // there was never a successful run => since stays empty
        console.info("There was never a successful mailer run before")
    } else {
        since = lastSuccessfulMailerRun.created_at
        console.log("lastSuccessfulMailerRun", lastSuccessfulMailerRun.created_at)
    }

    // query all jobs since
    const jobsSince = await Job.getJobsSince(since)

    // console.log("jobsSince", jobsSince)

    if (jobsSince.length == 0) {
        const message = "There were no new jobs to notify about since the last run"
        
        return happyEnding(message)
    }

    // transform data by city code?
    
    // query users that needs to be notified
    let usersToNotify = await User.findAll({
        where: {
            is_verified: true
        }
    })
    
    // console.log("usersToNotify", usersToNotify)

    if (usersToNotify.length == 0) {
        const message = "There were no users to notify"
        
        return happyEnding(message)
    }

    // get cities (their names, IDs, country, ...) that are mentioned in the jobs
    const citiesMentionedInJobs = await City.findAll({
        where: {
            display_name: {
                [Op.in]: Array.from(new Set(jobsSince.map( (job:Job) => { return job.location })))
            }
        }
    })

    if (citiesMentionedInJobs.length == 0 || citiesMentionedInJobs == null || citiesMentionedInJobs == undefined) {
        // something went wrong, there are no cities mentioned in the jobs
        return returnStatusCodeResponse(500, "There were no cities mentioned in the jobs")
    }

    // console.log("citiesMentionedInJobs", citiesMentionedInJobs)

    // iterate through users
    for (let i = 0; i < usersToNotify.length; i++) {
        const userToNotify = usersToNotify[i]
        
        console.log("Notifying user", userToNotify.email)

        // filter out only relevant jobs for the current user      
        const relevantJobs = jobsSince.filter( (job:Job) => {
            // job.location
            // translate job location into city code
            const cityByLocation = citiesMentionedInJobs.find( (city:City) => {
                return city.display_name == job.location
            })

            if (cityByLocation == null || cityByLocation == undefined) {
                // something went wrong, there is no city with such display name
                console.error("There is no city with display name", job.location)
                return false
            }

            // user's settings has to contain wanted cities
            return userToNotify.settings.cities.hasOwnProperty(cityByLocation.code)
        })

        // console.log("relevantJobs", relevantJobs)

        if (relevantJobs.length == 0) {
            console.info("There were no relevant jobs for user", userToNotify.email)
            continue
        }

        // send email to user
        await Mailer.notifyUser(userToNotify, relevantJobs, citiesMentionedInJobs)
    }
    
    return happyEnding('Success')
}

function happyEnding(message: string, info?: Object) {
    // console.info("Happy ending", message)

    // everything went OK, save is as the last run
    MailerRun.saveRun(true, {"message": message, "info": info})

    console.timeEnd("overall-execution-time")

    return returnStatusCodeResponse(200, message)
}

function returnStatusCodeResponse(statusCode: number, message: string): any {
    return {
        statusCode: statusCode,
        body: JSON.stringify({
            message: message,
        })
    }
};

// uncomment to run locally as script
// (async function () {
//     // run the handler
//     await handler()
// }) ()
