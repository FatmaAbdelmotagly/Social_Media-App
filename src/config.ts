import { config } from "dotenv";
import { resolve } from "node:path";
export const NODE_ENV = process.env.NODE_ENV;
const envPath = resolve(`.env.${NODE_ENV}`);

const result = config({ path: envPath });

export const PORT :number =parseInt( process.env.PORT || "3000") as number ;
export const DB_URI:string = process.env.DB_URI as string;

export const DB_NAME = process.env.DB_NAME;
export const IV_LENGTH:number = parseInt(process.env.IV_LENGTH|| "16")
export const SALT :number = parseInt(process.env.SALT ?? "12");
export const ENC_KEY : string = process.env.ENC_KEY as string;
export const ACCESS_ADMIN_TOKEN_SEGNITURE =process.env.ACCESS_ADMIN_TOKEN_SEGNITURE as string;
export const ACCESS_USER_TOKEN_SEGNITURE =process.env.ACCESS_USER_TOKEN_SEGNITURE as string;
export const ACCESS_TOKEN_EXPIRES_IN = parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN ?? "18000",);

export const REFREASH_USER_TOKEN_SEGNITURE = process.env.REFREASH_USER_TOKEN_SEGNITURE as string;
export const REFREASH_ADMIN_TOKEN_SEGNITURE = process.env.REFREASH_ADMIN_TOKEN_SEGNITURE as string;
export const REFREASH_TOKEN_EXPIRES_IN = parseInt(process.env.REFREASH_TOKEN_EXPIRES_IN ?? "86400285");
export const REDIS_URI:string = process.env.REDIS_URI as string;
export const APP_EMAIL = process.env.APP_EMAIL;
export const APP_PASSWORD = process.env.APP_PASSWORD;
export const APPLICATION_NAME = process.env.APPLICATION_NAME;
export const WEB_CLIENT_IDS = (process.env.WEB_CLIENT_IDS || "").split(",");