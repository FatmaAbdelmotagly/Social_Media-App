import { IResponse } from "./response.interface"

export const successResponse =({message="Done",status =200,data=undefined , res}:IResponse )=>{
    res.status(status).json({message,status,data})
}