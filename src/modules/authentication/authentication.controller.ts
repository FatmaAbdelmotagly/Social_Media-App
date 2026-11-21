
import { Router,
  type Router as RouterType,
  type Request,
  type Response,
  type NextFunction
} from "express";
import autenticationService from "./authentication.service";
import { log } from "node:console";
import authService from "./authentication.service";
import { responseFormatter } from "../../middelware/response.middelware";
import { IResponse } from "../../common/utiles/response.interface";
import { validation } from "../../middelware";
import * as validators from './authentication.validation'
import { IUser } from "../../common/interface/user.interface";
import authenticationService from "./authentication.service";



const router: RouterType = Router({
  strict: true,
  caseSensitive: true
});

router.post("/login",
  validation(validators.login)
  ,responseFormatter(
  async (req: Request, res: Response, next: NextFunction):Promise<IResponse<{ access_token : string , refreash_token : string}>>=> {

  const data = await authService.login( req.validate.body  ,  `${req.protocol}://${req.host}`)
  return {status:200 , data };
}
));

router.post("/signup",
  validation(validators.signup)
  ,responseFormatter(
  async (req: Request, res: Response, next: NextFunction):Promise<IResponse<IUser>>=> {
  const data = await authService.signup(req.validate.body)
  return {status:201 , data };
}
));

router.patch("/confirm-email", validation(validators.confirmEmail),
    responseFormatter(
        async (req: Request, res: Response, next: NextFunction) => {
            await authenticationService.confirmEmail(req.body)
        }
    )
)

router.patch("/resend-confirm-email", validation(validators.resendconfirmEmail),
    responseFormatter(
        async (req: Request, res: Response, next: NextFunction) => {
            await authenticationService.resendconfirmEmail(req.body)
        }
    )
)

export default router;
