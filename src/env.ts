// console.log("At the beginning of env")

if (typeof(process.env.BASE_URL) !== 'string') {
    const errorMessage = "BASE_URL is not defined properly!"
    console.error(errorMessage, process.env.BASE_URL)
    throw new Error(errorMessage)
}

if (typeof(process.env.PG_DATABASE) !== 'string' || typeof(process.env.PG_USERNAME) !== 'string') {
    const errorMessage = "Postgres settings are not defined properly!"
    console.error(errorMessage, process.env.PG_DATABASE, process.env.PG_USERNAME)
    throw new Error(errorMessage)
}

let env = {
    AWS_REGION: process.env.AWS_REGION,
    
    BASE_URL: process.env.BASE_URL,
    BASE_URL_OBJECT: new URL(process.env.BASE_URL),
    
    PG_HOST: process.env.PG_HOST,
    PG_DATABASE: process.env.PG_DATABASE,
    PG_USERNAME: process.env.PG_USERNAME,
    PG_PASSWORD: process.env.PG_PASSWORD
}

// console.log(env);

export { env }