import ex , {type Request , type Response , type NextFunction}from 'express'
import { authenticationController } from './modules'
import { globalErrorHandling } from './middelware/error.middleware'
import { PORT } from './config'
import { bootStrap } from './DB/DBconnection'
import { sendEmail } from './common/utiles/email'
import { EmailSubjectEnum } from './common/enum'
import { userController } from './modules/user'
const app:ex.Application = ex()

app.use(ex.json())
bootStrap(app , PORT)
app.use("/auth", authenticationController);
app.use("/user", userController);

app.all("/",async(req:Request , res:Response , next:NextFunction):Promise<ex.Response>=>{
   return  res.status(200).json({message : "Done"})
})
app.use(globalErrorHandling)

// sendEmail({subject : EmailSubjectEnum.CONFIRM_EMAIL , to :["fatmabdelmotagly195@getMaxListeners.com"] ,html:"vbfuidhfh" })
