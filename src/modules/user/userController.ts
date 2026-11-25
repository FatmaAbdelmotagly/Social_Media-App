import { NextFunction, Request, Router } from "express";
import { authentication, authorization } from "../../middelware/authentication.middleware";
import { responseFormatter } from "../../middelware";
import UserService from "./userService";
import { RoleEnum, TokenTypeEnum } from "../../common/enum";
import { getIssuer } from "../../common/utiles/Issuer";
const router = Router();



router.get("/", authentication(),responseFormatter( async (req:Request, res:Response, next:NextFunction) => {
  const data = await UserService.profile(req.user);
  return{ res, status: 201, data }
}))

router.get("/public-profile/:userId", responseFormatter(async (req:Request, res:Response, next:NextFunction) => {
  const data = await UserService.publicProfile(req.params.userId as string);
  return{ res, status: 200, data }
}))
router.patch(
  "/",
  authentication(),
  authorization(RoleEnum.USER),
  responseFormatter( async (req:Request, res:Response, next:NextFunction) => {
    const data = await UserService.update(req.user, req.body);
    return{ res, status: 201, data }
  })
 
);

router.get("/cacheProfile", authentication(),responseFormatter( async (req:Request, res:Response, next:NextFunction) => {
  const data = await UserService.cacheProfile(req.user);
  return{ res, status: 200, data }
}))
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
