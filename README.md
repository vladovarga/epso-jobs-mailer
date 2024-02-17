# EPSO Jobs mailer

## What is EPSO?

EPSO is an acronym that stands for *European Personnel Selection Office*, and in brief they are responsible for hiring people that want to work for the European institutions. More can be read here [https://eu-careers.europa.eu/en](https://eu-careers.europa.eu/en)

Part of their website is also the open vacancies list, which can be found here [https://eu-careers.europa.eu/en/job-opportunities/open-vacancies](https://eu-careers.europa.eu/en/job-opportunities/open-vacancies). This list is the subject of this crawler.

## What does EPSO Jobs mailer do?

This mailer is a complementary module to the [EPSO Jobs crawler](https://github.com/vladovarga/epso-jobs-crawler).

It loads lastly stored vacancies in PostgreSQL database and then iterates user by user and sends an email notification (via Amazon SES) listing the relevant open vacancies for that current user.

## Requirements

Based on the previously mentioned, the prerequisites are:
* Amazon SES - used for sending emails
* PostgreSQL database - for reading crawled vacancies and also user settings

## Deployment

### Docker + AWS Lambda
One possibility is to build the docker image and deploy it as-is in AWS Lambda (dockerfile is already adjusted to be extended from lambda nodejs image) and be triggered at regular intervals to send email notifications.

### As script
Another possibility would be to run the script as is. In that case:
1. modification in the `index` is necessary - specially the commented part at the end that would actually trigger the function. Or some sort of wrapper needs to be implemented.
1. then the code needs to be built from .ts -> .js (`npm run build`)
1. code can be run - for example via `npm run start` (or accessing the wrapper from first step)

## Configuration

Crawler has to be configured via environment variables. They are all mandatory, except when deploying in AWS Lambda - in that case the `AWS_` variables will be automatically handled by Lambda itself.

| Config Parameter          |  Description                                                  |
| ------------------------- | ------------------------------------------------------------- |
| `BASE_URL`                | URL used in email as base for hyperlinks. Should look like https://eu-careers.europa.eu/en/job-opportunities/open-vacancies/  |
|   |   |
| `AWS_REGION`              | Amazon region                                                 |
| `AWS_ACCESS_KEY_ID`       | Amazon access key ID                                          |
| `AWS_SECRET_ACCESS_KEY`   | Amazon secret access key                                      |
|   |   |
| `PG_HOST`                 | PostgreSQL hostname                                           |
| `PG_DATABASE`             | PostgreSQL database name                                      |
| `PG_USERNAME`             | PostgreSQL username                                           |
| `PG_PASSWORD`             | PostgreSQL password                                           |

## Database structure

Crawler needs these tables to be present:
* `users` - table of users to be notified, together with their configuration
* `jobs` - table with crawled vacancies
* `mailer_run` - stores the state of the latest mailer run
* `cities` - enum holding the location possibilities as on the EPSO website select.

SQL CREATE scripts can be found in the [src/models/](src/models/) subfolder. (for the rest of the tables have a look in the [EPSO Jobs crawler](https://github.com/vladovarga/epso-jobs-crawler))