import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import {
  ACCESS_ADMIN_TOKEN_SEGNITURE,
  ACCESS_USER_TOKEN_SEGNITURE,
  ACCESS_TOKEN_EXPIRES_IN,
  REFREASH_ADMIN_TOKEN_SEGNITURE,
  REFREASH_USER_TOKEN_SEGNITURE,
  REFREASH_TOKEN_EXPIRES_IN,
} from "../../config.js";

import { CacheService } from "../service/cache.service.js";
import { userRepo } from "../repository/user.repo.js";
import mongoose from "mongoose";
import { RoleEnum } from "../enum/userEnum.js";
import { TokenTypeEnum } from "../enum/security.tokenEnum.js";
import { BadRequstException, NotFoundException, UnauthorizedException } from "../exception/domain.exception.js";
import { randomUUID } from "node:crypto";
import { toObjectId } from "../utiles/email/ObjectId.js";
import { HUser } from "../../DB/model/userModel.js";
import { compare } from "./hash.security.js";
export type userIdType = mongoose.Types.ObjectId | string
export type JwtPayloadType = JwtPayload & {
  sub : string |mongoose.Types.ObjectId
  aud : number[]
  jti : string
  iat : number
}
export class tokenService {
  private UserRepo :  userRepo
  private cacheService : CacheService
  constructor(){
    this.cacheService = new CacheService()
    this.UserRepo = new userRepo()
  }


 userBaseKey ({ userID }: {userID : userIdType}): string {
  return `User::${userID.toString()}`;
};

 userRevokTokenKey ({ userID, jti } : {userID : userIdType , jti : string}) :string {
  return `${this.userBaseRevokTokenKey({ userID })}${jti}`;
};

 userBaseRevokTokenKey ({ userID }: {userID : userIdType}):string {
  return `${this.userBaseKey({ userID })}::Revoke_Token::`;
};

async createToken  ({payLoad , options , secret} :{payLoad: string | Buffer | object, secret: Secret,options?: SignOptions  }):Promise<string > {
  return jwt.sign(payLoad, secret, options);
};
async verifyToken ({ token = "", secret} : {token : string , secret : Secret }):Promise<JwtPayloadType>  {
  return jwt.verify(token, secret) as JwtPayloadType;
};

 async getTokenSegnitures  ({ role = RoleEnum.USER }: {role : RoleEnum}):Promise<{ access_segniture: string,refreash_segniture: string}> {
  let Segnitures :{access_segniture: string,refreash_segniture: string};
  switch (role) {
    case RoleEnum.ADMIN:
      Segnitures = {
        access_segniture: ACCESS_ADMIN_TOKEN_SEGNITURE,
        refreash_segniture: REFREASH_ADMIN_TOKEN_SEGNITURE,
      };
      break;
    case RoleEnum.USER:
      Segnitures = {
        access_segniture: ACCESS_USER_TOKEN_SEGNITURE,
        refreash_segniture: REFREASH_USER_TOKEN_SEGNITURE,
      };
      break;
    default:
      Segnitures = {
        access_segniture: ACCESS_USER_TOKEN_SEGNITURE,
        refreash_segniture: REFREASH_USER_TOKEN_SEGNITURE,
      };
      break;
  }
  return Segnitures;
};

async getSegniture   ({ tokenType, role = RoleEnum.USER }: {tokenType : TokenTypeEnum , role?: RoleEnum}): Promise<string> {
  const segnitures = await this.getTokenSegnitures({ role: role });

  return tokenType == TokenTypeEnum.ACCESS
    ? segnitures.access_segniture
    : segnitures.refreash_segniture;
};

async decodeToken ({ authorization,tokenType = TokenTypeEnum.ACCESS,} :{authorization : string , tokenType ?: TokenTypeEnum}) : Promise<{ user:HUser, payLoad :JwtPayloadType}> {
  const decoded = jwt.decode(authorization) as JwtPayloadType;

  if (!decoded?.aud?.length) {
    throw new BadRequstException("missing token payLoad");
  }
  const payLoad = await this.verifyToken({
    token: authorization,
    secret: await this.getSegniture({ tokenType, role: decoded.aud[0] as unknown as RoleEnum}),
  });

  if (!payLoad?.sub) {
    throw new BadRequstException("missing token payLoad ");
  }

  if (
    await this.cacheService.exists({
      key: this.userRevokTokenKey({ userID: payLoad.sub, jti: payLoad.jti }),
    })
  ) {
    throw new UnauthorizedException("Expired login credintials");
  }

const user = await this.UserRepo.findById({
  id: toObjectId(payLoad.sub),
});
  if (!user) {
    throw new NotFoundException("user not found ");
  }
  if ((user.changeCredintialTime?.getTime() ?? 0 )> payLoad.iat * 1000) {
    throw new UnauthorizedException("Expired login credintials");
  }
  return { user, payLoad };
};

async createLoginCredentials  ({
  user,
  issuer
}:{
  user : HUser,
  issuer : string,
  options ?:SignOptions
})  :Promise<{ access_token :string, refreash_token :string}>{
  const { access_segniture, refreash_segniture } = await this.getTokenSegnitures({
    role: user.role,
  });
  const jwtid = randomUUID();
  const access_token = await this.createToken({
    payLoad: { sub: user._id },
    secret: access_segniture,
    options: {
      issuer,
      audience: [user.role as unknown as string],
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      jwtid,
    },
  });
  const refreash_token = await this.createToken({
    payLoad: { sub: user._id },

    secret: refreash_segniture,
    options: {
      issuer,
      audience: [user.role as unknown as string ],
      expiresIn: REFREASH_TOKEN_EXPIRES_IN,
      jwtid,
    },
  });

  return { access_token, refreash_token };
};

async createRevokeToken(payload :JwtPayloadType) {
  const consumedTime = Math.ceil(Date.now() / 1000) - payload.iat;
  const refreshExpiresIn = payload.iat + REFREASH_TOKEN_EXPIRES_IN;
  const ttl = refreshExpiresIn - consumedTime;

  await this.cacheService.set({
    key:await  this.userRevokTokenKey({ userID: payload.sub, jti: payload.jti }) ,
    value: payload.jti,
    ttl,
  });
};

async basicAuth({ email, password }: { email: string; password: string }) {
  const account = await this.UserRepo.findOne({
    filter: { email },
  });

  if (!account)
    throw new NotFoundException("Invalid login data", {
      extra: "k11",
    });

  const match = await compare(password, account.password);

  if (!match)
    throw new NotFoundException("Invalid login data", {
      extra: "k11",
    });

  return account;
}
}


const TokenService = new tokenService();

export default TokenService;