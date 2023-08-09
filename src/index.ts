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
    //     order: [
    //         ['city', 'ASC'],
    //     ]
    })
    
    // console.log("usersToNotify", usersToNotify)

    if (usersToNotify.length == 0) {
        const message = "There were no users to notify"
        
        return happyEnding(message)
    }

    // get cities (their names, IDs, country, ...) that are mentioned in the jobs
    const citiesMentioned = await City.findAll({
        where: {
            code: {
                [Op.in]: Array.from(new Set(jobsSince.map( (job:Job) => { return job.city })))
            }
        }
    })

    // console.log("citiesMentioned", citiesMentioned)

    // iterate through users
    for (let i = 0; i < usersToNotify.length; i++) {
        const userToNotify = usersToNotify[i]
        
        console.log("Notifying user", userToNotify.email)

        // filter out only relevant jobs for the current user      
        const relevantJobs = jobsSince.filter( (job:Job) => {
            // user's settings has to contain wanted cities
            return userToNotify.settings.cities.hasOwnProperty(job.city)
        })

        // console.log("relevantJobs", relevantJobs)

        if (relevantJobs.length == 0) {
            console.info("There were no relevant jobs for user", userToNotify.email)
            continue
        }

        // send email to user
        await Mailer.notifyUser(userToNotify, relevantJobs, citiesMentioned)
    }
    
    return happyEnding('Success')
}

function happyEnding(message: string, info?: Object) {
    console.info("Happy ending", message, )

    // everything went OK, save is as the last run
    MailerRun.saveRun(true, {"message": message, "info": info})

    console.timeEnd("overall-execution-time")

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: message,
        }),
    }
}