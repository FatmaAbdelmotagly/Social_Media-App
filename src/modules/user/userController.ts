import { NextFunction, Request, Router } from "express";
import { authentication } from "../../middelware/authentication.middleware";
import { responseFormatter } from "../../middelware";
import UserService from "./userService";
import { TokenTypeEnum } from "../../common/enum";
import { getIssuer } from "../../common/utiles/Issuer";
const router = Router();

router.post(
  "/rotate-token",
  authentication({tokenType:TokenTypeEnum.REFREASH}),
  responseFormatter(
     async (req:Request, res:Response, next:NextFunction) => {
    const data = await UserService.rotate(
      req.payLoad,
      req.user,
      getIssuer(req),
    );
return {status : 201 , data}
  },

  )
);

router.post("/logout", authentication(), responseFormatter(
  async (req:Request, res:Response, next:NextFunction) => {
  const data = await UserService.logout(req.payLoad, req.user, req.body);
  return{status :200 , data }
})
);

export default router;
