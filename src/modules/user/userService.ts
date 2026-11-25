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


async searchUsers(user: HUser,keyword: string,page: number = 1,limit: number = 10) {
  const users = await this.UserRepo.paginate({
    filter: {
      $or: [
        { firstname: { $regex: keyword, $options: "i" } },
        { lastname: { $regex: keyword, $options: "i" } }
      ],
      _id: { $ne: user._id }},
    projection: {
      firstname: 1,
      lastname: 1
    },
    page,
    limit
  });
  return {...users,docs: users.docs.map(({ _id, username }) => ({_id,username}))};
}

async follow (user : HUser , targetUserId : userIdType) : Promise<string>{
  const targetAccount = await this.UserRepo.findById({id : targetUserId})
  if(!targetAccount){
    throw new NotFoundException("user id not found ")
  }
  if(user._id.toString() == targetUserId.toString()){
    throw new ConflictException("you cannot follow yourself ")
  }
  const follows = user.followingList.some(ele => ele.toString() == targetUserId.toString());
  if(!follows) {
    user.followingList.push(targetUserId)
    targetAccount.followers.push(user._id)
    await user.save()
    await targetAccount.save();
    return `you start following ${targetAccount.username} `
  }
  else {
    user.followingList = user.followingList.filter(ele => ele.toString() != targetUserId.toString())
    targetAccount.followers=targetAccount.followers.filter(ele=>ele.toString() != user._id.toString())
    await user.save() 
    await targetAccount.save();
    return `you stoped following ${targetAccount.username} `
  }
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
    id: userId
  });
  if (!user) {
    throw new NotFoundException("user not found");
  }
  return { user: { _id: user._id, username: user.username as string , image: user.image as string } };
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