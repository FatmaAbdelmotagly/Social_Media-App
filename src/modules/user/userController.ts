import { NextFunction, Request, Router } from "express";
import { authentication, authorization } from "../../middelware/authentication.middleware";
import { responseFormatter } from "../../middelware";
import UserService from "./userService";
import { RoleEnum, TokenTypeEnum } from "../../common/enum";
import { getIssuer } from "../../common/utiles/Issuer";
import { validation } from "../../middelware";
import * as validators from './user.validation'
import { toObjectId } from "../../common/utiles/email/ObjectId";
const router = Router();


router.get("/search", authentication(),validation(validators.searchUsers),responseFormatter( async (req:Request, res:Response, next:NextFunction) => {
  const data = await UserService.searchUsers(req.user , req.query.keyword as string );
  return{ res, status: 200, data }
}))

router.post("/:targetId/follow",authentication(), responseFormatter(async (req:Request , res :Response , next : NextFunction)=>{
  const data = await UserService.follow(req.user , toObjectId(req.params.targetId as string))
  return {status :201 , data }

}))

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
