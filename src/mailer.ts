// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sesv2/index.html

console.log('Loading mailer');

import { env } from './env'
import { User } from './models/user'
import { Job } from './models/job'
import { City } from './models/city'

const { SESv2Client, SendEmailCommand } = require("@aws-sdk/client-sesv2");

// a client can be shared by different commands.
const client = new SESv2Client({ region: env.AWS_REGION });

// key of the parameter in the URL that contains the city ID
const CITY_SEARCH_PARAM_KEY = "field_epso_location_target_id_1"

class MailerClass {
    /**
       * Meant to be as singleton
       */
    private static instance: MailerClass

    /**
       * The static method that controls the access to the singleton instance.
       *
       * This implementation let you subclass the Singleton class while keeping
       * just one instance of each subclass around.
       */
    public static getInstance(): MailerClass {
        if (!MailerClass.instance) {
            MailerClass.instance = new MailerClass()
        }

        return MailerClass.instance
    }

    /**
     * Set up variables and creates a transporter instance.
     */
    // constructor() {}

    /**
     * Notifies user about new job oportunities
     * 
     * @param {User} userToNotify
     * @param {Job[]} jobsSince
     * @param {City[]} citiesMentioned
     */
    public async notifyUser(userToNotify: User, jobsSince: Job[], citiesMentioned: City[]) {
        // console.log(userToNotify)
        // console.log(jobsSince)
        // console.log(citiesMentioned)

        // organize the jobs in a structured hiearchy with city code as the first level
        let jobsToProcessAsMap = new Map()
        
        // lets find all the cities user is interested in
        for (const cityCode in userToNotify.settings.cities) {
            jobsToProcessAsMap.set(cityCode, jobsSince.filter( job => {
                    // filter out only those cities user wants to be notified about
                    return (job.city == cityCode)
                })
            )
            
            // if there was no new jobs for the city, delete it
            if (jobsToProcessAsMap.get(cityCode).length == 0) {
                jobsToProcessAsMap.delete(cityCode)
            }
        }
        
        // console.log("jobsToProcessAsMap", jobsToProcessAsMap)

        // build up HTML body of the email
        let htmlBody = "";

        jobsToProcessAsMap.forEach((jobsToProcess, cityCode) => {
            const processedCity = citiesMentioned.find((city) => (cityCode == city.code))

            if (processedCity == null) {
                console.error("No city object present for:", cityCode)
                return
            }

            // console.log("processedCity", processedCity)
            env.URL_OBJECT.searchParams.set(CITY_SEARCH_PARAM_KEY, processedCity.id.toString())
            
            htmlBody += '<h2><a href="' + env.URL_OBJECT.toString() + '" target="_blank">' + processedCity.name + '</a></h2>'
            htmlBody += "<ul>"

            jobsToProcess.forEach((opportunity:Job) => {
                const jobURL = new URL(opportunity.href, env.URL_OBJECT.origin);
            
                htmlBody += '<li><a href="' + jobURL.href + '" target="_blank">' + opportunity.title + " (" + opportunity.grade + ')</a></li>'
            });
            
            htmlBody += "</ul>"
        })

        htmlBody += "<br><a href='" + env.URL_OBJECT.origin + env.URL_OBJECT.pathname + "' target='_blank'>Hurry to the website!!!</a>"

        return this._mail(userToNotify.email, htmlBody)
    }

    /**
     * Internal method. Mails whatever is passed in input.
     * @param {object} sendMailInput - object consisting of "to", "subject", "text" and "html" properties
     * @return {object} object containing information about sent email
     */
    private async _mail(toAddress: string, htmlBody: string): Promise<any> {
        // console.log("mail", arguments);

        const CHARSET = "UTF-8";

        var params = {
            Destination: {
                // BccAddresses: []
                // CcAddresses: [
                //     "recipient3@example.com"
                // ],
                // ToAddresses: [
                //     "recipient2@example.com"
                // ]
                ToAddresses: [toAddress]
            },
            Content: {
                Simple: {
                    Subject: {
                        Charset: CHARSET,
                        Data: "Changes in the EPSO jobs opportunities!"
                    },
                    Body: {
                        Html: {
                            Charset: CHARSET,
                            // Data: "This message body contains HTML formatting. It can, for example, contain links like this one: <a class=\"ulink\" href=\"http://docs.aws.amazon.com/ses/latest/DeveloperGuide\" target=\"_blank\">Amazon SES Developer Guide</a>."
                            Data: htmlBody
                        },
                        Text: {
                            Charset: CHARSET,
                            // Data: "This is the message body in text format."
                            Data: "There are new job opportunities!"
                        }
                    },
                }
            },
            // ReplyToAddresses: [],
            // ReturnPath: "",
            // ReturnPathArn: "",
            // FromEmailAddress: '"Vlado\'s EPSO cron 🐤" <no-reply@janevjem.us>'
            FromEmailAddress: '"Vlado\'s EPSO cron" <no-reply@janevjem.us>'
            // FromEmailAddress: "no-reply@janevjem.us"
            // SourceArn: ""
        };

        // async/await.
        try {
            const command = new SendEmailCommand(params);

            // console.log("command", command);

            const response = await client.send(command);

            console.log("response", response);

            return response;
            // process data.
        } catch (error: any) {
            // error handling.
            console.error("Message not sent", error);
            throw new Error(error);
        } finally {
            // finally.
            console.log("message sent");
        }
    }
}

export const Mailer = MailerClass.getInstance()