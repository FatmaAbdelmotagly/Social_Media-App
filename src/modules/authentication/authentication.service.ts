import { IUser } from "../../common/interface/user.interface";
import { Model } from "mongoose";
import { UserModel } from "../../DB/model/userModel";
import { ConflictException, NotFoundException, TooManyRequestException } from "../../common/exception/domain.exception";
import { userRepo } from "../../common/repository/user.repo";
import { CacheService, cachService } from "../../common/service/cache.service";
import { EmailSubjectEnum, ProviderEnum } from "../../common/enum";
import { compare, encryption, hash } from "../../common/security";
import { emailEvent, UserEmailKey, UserEmailTrialsKey } from "../../common/utiles/email";
import { createOTP } from "../../common/utiles/OTP";
import { confirmEmailDTO, loginDTO, resendconfirmEmailDTO, signupDTO } from "./DTO/authentication.dto";
import TokenService from "../../common/security/token.securtiy";

export class autenticationService {
    private userModel : Model<IUser>
    private UserRepo : userRepo
    private cacheService : CacheService

    public name:string = "fatma"
    constructor(){ 
        this.UserRepo = new userRepo()
        this.cacheService = cachService 
        console.log("in");
        this.userModel = UserModel
    }

 async sendEmailOTP  ({email,subject,maxTrials = 10, blockInSeconds = 300}:{email:string , subject : EmailSubjectEnum , maxTrials ?: number , blockInSeconds ?: number}){
  const existOTP_ttl = await this.cacheService.ttl({
    key: UserEmailKey({ email, subject }),
  });
  if (existOTP_ttl > 0) {
    throw new ConflictException(
      `we can not send a new otp while the current one is valid , please try again after ${existOTP_ttl}s`,
    );
  }
  const oldTrials =(
    await this.cacheService.get({ key: UserEmailTrialsKey({ email, subject }) })) ?? 0;
  if (oldTrials >= maxTrials) {
    throw new TooManyRequestException(
      "maximum number of trials has been reatched ",
    );
  }

  const code = createOTP();
  await this.cacheService.set({
    key: UserEmailKey({ email, subject }),
    value: await hash(code.toString()),
    ttl: 120,
  });

  const trials = await this.cacheService.incBy({ key: UserEmailTrialsKey({ email, subject }) });
  if (trials == maxTrials) {
    await this.cacheService.expire({
      key: UserEmailTrialsKey({ email, subject }),
      ttl: blockInSeconds,
    });
  }
  emailEvent.emit("sendEmail", {
    recipients: { to: email },
    data: { code, subject },
  });
};

 async signup  ({ username, email, password, phone, age, gender }: signupDTO['body']){
  console.log({ username });
  const account = await this.UserRepo.findOne({
    filter: { email },
  });
  if (account) {
    throw new ConflictException("email exists");
  }

  const user = await this.UserRepo.createOne({
    data: {
      username,
      email,
      password: await hash(password),
      phone: await encryption(phone),
      age,
      gender,
    },
  });

  await this.sendEmailOTP({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL });

  return user;
};
 async login  (user:loginDTO['body'], issuer:  string){
  const {password , email }= user

  const account = await this.UserRepo.findOne({
    filter: { email}});
  if (!account) {
    throw new NotFoundException("Invalid login data");
  }
  const match = await compare(password, account.password)
  if (!match)
    throw new NotFoundException("Invalid login data");
  return TokenService.createLoginCredentials({user : account , issuer})
};

async confirmEmail({ otp, email }:confirmEmailDTO['body']) {
  const account = await this.UserRepo.findOne({
    filter: {
      email,
      provider: ProviderEnum.SYSTEM,
      confirmEmail: { $exists: false },
    },
  });

  if (!account) throw new NotFoundException("Invalid account");

  const hashOtp = await this.cacheService.get({
    key: UserEmailKey({
      email,
      subject: EmailSubjectEnum.CONFIRM_EMAIL,
    }),
  });

  if (!hashOtp || !(await compare(otp, hashOtp))) {
    throw new ConflictException("Invalid OTP");
  }

  account.confirmEmail = new Date();
  await account.save();
  await this.cacheService.del({
    key: await this.cacheService.keys({prefix: UserEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL })}) as unknown as string
  });
  return;
};


 async resendconfirmEmail  ({ email }:resendconfirmEmailDTO['body']){
  const account = await this.UserRepo.findOne({
    filter: {
      email,
      provider: ProviderEnum.SYSTEM,
      confirmEmail: { $exists: false },
    },
  });

  if (!account) throw new NotFoundException("Invalid account");
  await this.sendEmailOTP({ email, subject:EmailSubjectEnum.CONFIRM_EMAIL });

  return;
};


}



export default new autenticationService()