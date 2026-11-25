import mongoose from "mongoose"
import { userIdType } from "../../security/token.securtiy"

export const toObjectId = (id : string  ): mongoose.Types.ObjectId=>{
    return mongoose.Types.ObjectId.createFromHexString(id)

}