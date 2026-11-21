import { ConflictException, NotFoundException } from "../../common/exception/domain.exception";
import { userRepo } from "../../common/repository/user.repo";
import TokenService, { JwtPayloadType, userIdType } from "../../common/security/token.securtiy";
import { CacheService } from "../../common/service/cache.service";
import { HUser } from "../../DB/model/userModel";
import { ACCESS_TOKEN_EXPIRES_IN } from "../../config";
import { LogoutEnum } from "../../common/enum";


export class userService {
  private readonly cacheService : CacheService
  private readonly UserRepo : userRepo
  constructor () {
    this.cacheService = new CacheService()
    this.UserRepo = new userRepo()
  }

 UserprofileKey ({user}: {user:HUser })  {
  return `User::${user._id}::CacheProfile`;
};

async profile (account :  HUser):Promise<HUser>{
  if (!account) {
    throw new NotFoundException("user not found ");
  }
  await this.cacheService.set({
    key: this.UserprofileKey({ user: account }),
    value: account,
    ttl: 180,
  });
  return account;
};

async publicProfile  (userId : userIdType) :Promise<{ user: { _id:userIdType, username:string, image: string } }>{
  const user = await this.UserRepo.findById({
    id: userId,
    options: { select: "username image", lean: true },
  });
  if (!user) {
    throw new NotFoundException("user not found");
  }
  return { user: { _id: user._id, username: user.username as string, image: user.image as string } };
};


async cacheProfile (user: HUser)  {
  const key = this.UserprofileKey({ user: user });

  const account = await this.cacheService.get({ key });

  if (account) {
    return account;
  }
  const userr = await this.UserRepo.findById({id:user._id});
  return await this.profile(userr as HUser);
};

async clearProfileCache (user : HUser) {
  const key = this.UserprofileKey({ user } );
  return await this.cacheService.del({ key });
};

async update(account: HUser, data: any){
  const user = await this.UserRepo.findByIdAndUpdate({
    update: data,
    id: account._id,
  });
  await this.clearProfileCache(account);
  return user;
};


async rotate(payLoad : JwtPayloadType, user:HUser, issuer:string)  {
  const accessExpiresIn = (payLoad.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000;
  const currentTime = Date.now() + 5 * 60000;
  if (currentTime < accessExpiresIn) {
    throw new ConflictException(
      "sorry we can not create another token while the current one is valid  ",
    );
  }
  const data = await TokenService.createLoginCredentials({ user, issuer });
  await TokenService.createRevokeToken(payLoad);
  return data;
};

async logout (payload : JwtPayloadType, user :HUser, { action = LogoutEnum.DEVICE }:{action ?: LogoutEnum} ) {
  switch (action) {
    case LogoutEnum.ALL:
      user.changeCredintialTime = new Date();
      await user.save();
      await this.cacheService.del({
        key: await this.cacheService.keys({prefix: TokenService.userBaseRevokTokenKey({ userID: payload.sub })})  as unknown as string
      });
      break;

    default:
      await TokenService.createRevokeToken(payload);
      break;
  }
};

}
const UserService = new userService()
export default UserService