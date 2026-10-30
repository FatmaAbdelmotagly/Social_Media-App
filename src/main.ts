import ex , {type Request , type Response , type NextFunction}from 'express'
import { log } from 'node:console'
import { authenticationController } from './modules'
import authenticationService from './modules/authentication/authentication.service'
import { globalErrorHandling } from './middelware/error.middleware'
const app:ex.Application = ex()

app.use(ex.json())
app.use("/auth", authenticationController);

app.all("/",async(req:Request , res:Response , next:NextFunction):Promise<ex.Response>=>{
   return  res.status(200).json({message : "Done"})
})
app.use(globalErrorHandling)
app.listen(3000 , ()=>{
    console.log("server is runnint on 3000");

    
})

