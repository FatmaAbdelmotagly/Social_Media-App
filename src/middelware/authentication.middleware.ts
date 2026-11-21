
import { NextFunction, Request } from "express";
import { RoleEnum, TokenTypeEnum } from "../common/enum/index.js";
import { default as TokenService } from "../common/security/token.securtiy.js";
import { ForbiddenException, UnauthorizedException } from "../common/exception/domain.exception.js";
import { RequestHandler } from "express";
import { log } from "node:console";


export const bearerAuth = async ({req,tokenType = TokenTypeEnum.ACCESS}: {req: Request ,tokenType: TokenTypeEnum}) => {
  const [key, credential] = (req.headers['authorization']?.split(" ") || []) as [string,string];
  const { user, payLoad } = await TokenService.decodeToken({authorization: credential ,tokenType});

  req.user = user;
  req.payLoad = payLoad;
};




export const authentication = ({tokenType = TokenTypeEnum.ACCESS}: { tokenType?: TokenTypeEnum}={}): RequestHandler => {
  return async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new UnauthorizedException("unauthorized account");
    }

    await bearerAuth({ req, tokenType });
    
    next();
  };
};

export const authorization = (accessRole:RoleEnum) => {
  return async (req :Request, res :Response, next:NextFunction) => {
    if (req.user.role < accessRole) {
      throw new ForbiddenException("forbidden user");
    }
    next();
  };
};
