
import { Router,
  type Router as RouterType,
  type Request,
  type Response,
  type NextFunction
} from "express";
import authService from "./authentication.service";
import { responseFormatter } from "../../middelware/response.middelware";
import { IResponse } from "../../common/utiles/response.interface";
import { validation } from "../../middelware";
import * as validators from './authentication.validation'
import { IUser } from "../../common/interface/user.interface";
import authenticationService from "./authentication.service";
import { ILoginResponce } from "./authentication.entities";
import { getIssuer } from "../../common/utiles/Issuer";

const router: RouterType = Router({
  strict: true,
  caseSensitive: true
});


router.post(
  "/forget-password",
  validation(validators.resendconfirmEmail),
  responseFormatter(async (req :Request, res:Response, next:NextFunction):Promise<IResponse> => {
    const data = await authenticationService.forgetPassword(req.body);
    return {status : 201 , data}
  }),
);

router.post(
  "/confirm-forgetPassCode",
  validation(validators.confirmEmail),
  responseFormatter(async (req :Request, res:Response, next:NextFunction):Promise<IResponse<IUser>> => {
    const data = await authenticationService.confirmForgetPasswordCode(req.body);
    return{ status: 200, data };
  })
);

router.patch(
  "/reset-forget-password",
  validation(validators.resetPassword),
  responseFormatter(async (req :Request, res:Response, next:NextFunction) :Promise<IResponse>=> {
    const data = await authenticationService.resetForgotPassword(req.body);
    return{status: 200, data }
  })
);
router.post("/login",
  validation(validators.login)
  ,responseFormatter(
  async (req: Request, res: Response, next: NextFunction):Promise<IResponse<ILoginResponce>>=> {

  const data = await authService.login( req.validate.body  ,  getIssuer(req))
  return {status:200 , data };
}
));
router.post("/signup-with-gmail"
  ,responseFormatter(
  async (req: Request, res: Response, next: NextFunction):Promise<IResponse<ILoginResponce>>=> {
  const {status ,data} = await authService.signupWithGmail( req.body  , getIssuer(req))
  return {status , data };
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
