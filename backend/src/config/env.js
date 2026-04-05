import dotenv from "dotenv";
dotenv.config();

function required(key){
    const value = process.env[key]
    if(!value){
        throw new Error(`${key} not provided`);
    }
    return value;
}

function optional(key, defaultValue=""){
    const value = process.env[key] || defaultValue
    return value;
}

export const ENV = {
    PORT: optional("PORT", 5000),
    NODE_ENV: optional("NODE_ENV", "development"),
    CLIENT_URL: optional("CLIENT_URL", "http://localhost:5173"),
    DB_URL: required("DB_URL"),
    INNGEST_EVENT_KEY: required("INNGEST_EVENT_KEY"),
    INNGEST_SIGNING_KEY: required("INNGEST_SIGNING_KEY"),
    CLERK_PUBLISHABLE_KEY: required("CLERK_PUBLISHABLE_KEY"), 
    CLERK_SECRET_KEY: required("CLERK_SECRET_KEY"), 
    STREAM_API_KEY: required("STREAM_API_KEY"), 
    STREAM_API_SECRET: required("STREAM_API_SECRET"), 
}