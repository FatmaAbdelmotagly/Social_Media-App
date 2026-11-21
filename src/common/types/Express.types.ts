import { HUser } from "../../DB/model/userModel";
import { JwtPayloadType } from "../security/token.securtiy";

declare module "express-serve-static-core" {
    interface Request {
        validate : any,
        payLoad : JwtPayloadType,
        user : HUser
    }
}