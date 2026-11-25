import { IUser } from "../../common/interface/user.interface";
import { Model } from "mongoose";
import { UserModel } from "../../DB/model/userModel";
import { BadRequstException, ConflictException, NotFoundException, TooManyRequestException } from "../../common/exception/domain.exception";
import { userRepo } from "../../common/repository/user.repo";
import { CacheService, cachService } from "../../common/service/cache.service";
import { EmailSubjectEnum, ProviderEnum } from "../../common/enum";
import { compare, hash } from "../../common/security";
import { emailEvent, UserEmailKey, UserEmailTrialsKey } from "../../common/utiles/email";
import { createOTP } from "../../common/utiles/OTP";
import { confirmEmailDTO, loginDTO, resendconfirmEmailDTO, signupDTO } from "./DTO/authentication.dto";
import { tokenService } from "../../common/security/token.securtiy";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { WEB_CLIENT_IDS } from "../../config";
import { ISignupWithGmail } from "./authentication.entities";


export class autenticationService {
    private userModel : Model<IUser>
    private UserRepo : userRepo
    private cacheService : CacheService
    private client : OAuth2Client
    private TokenService : tokenService
    constructor(){ 
        this.UserRepo = new userRepo()
        this.cacheService = cachService 
        this.client = new OAuth2Client()
        this.TokenService = new tokenService()
        console.log("in");
        this.userModel = UserModel
    }

async forgetPassword ({ email } :{email : string }) {
  const account = await this.UserRepo.findOne({
    filter: {
      email,
      provider: ProviderEnum.SYSTEM,
      confirmEmail: { $exists: true },
    },
  });

  if (!account) throw new NotFoundException("Invalid account");

  await this.sendEmailOTP({ email, subject: EmailSubjectEnum.FORGET_PASSWORD });

  return;
};
async confirmForgetPasswordCode ({ otp, email }:{otp : string , email : string})  {
  const account = await this.UserRepo.findOne({
    filter: {
      email,
      provider: ProviderEnum.SYSTEM,
      confirmEmail: { $exists: true },
    },
  });

  if (!account) throw new NotFoundException("Invalid account");

  const hashOtp = await this.cacheService.get({
    key: UserEmailKey({
      email,
      subject: EmailSubjectEnum.FORGET_PASSWORD,
    }),
  });

  if (!hashOtp || !(await compare(otp, hashOtp))) {
    throw new ConflictException("Invalid OTP");
  }

  return account;
};
async resetForgotPassword  ({ otp, email, password }:{otp :string , email : string , password : string }) {
  const account = await  this.confirmForgetPasswordCode({ otp, email });
  account.password = await hash(password);
  account.changeCredintialTime= new Date();
  await account.save();

  const revokePrefix = this.TokenService.userBaseRevokTokenKey({
    userID: account._id,
  });

  const otpKey = UserEmailKey({
    email,
    subject: EmailSubjectEnum.FORGET_PASSWORD,
  });

  const result = await Promise.all([
    this.cacheService.keys({ prefix: revokePrefix }),
    this.cacheService.keys({ prefix: otpKey }),
  ]);

  await this.cacheService.del({
    key: [...result[0], ...result[1]],
  });
  return;
};

    
  async verifyGoogleAccount(idToken: string) : Promise<TokenPayload> {
  const ticket = await this.client.verifyIdToken({
    idToken,
    audience: WEB_CLIENT_IDS,
  });
  const payload = ticket.getPayload() ;
  if (!payload?.email_verified ) {
    throw new BadRequstException("email not verified ");
  }
  return payload;
}

async signupWithGmail({ idToken }:{idToken: string}, issuer : string) :Promise<ISignupWithGmail> {
  const { email, name, picture } = await this.verifyGoogleAccount(idToken);
  const existAccount = await this.UserRepo.findOne({ filter: { email : email as string }});
  if (existAccount) {
    if (existAccount.provider != ProviderEnum.GOOGLE) {
      throw new ConflictException("invalid account provider");
    }
    return  {status : 201 , data :await this.TokenService.createLoginCredentials({ user: existAccount, issuer })}
  }
  const user = await this.UserRepo.createOne({
    data: {
      provider: ProviderEnum.GOOGLE,
      confirmEmail: Date.now(),
      email,
      username: name,
      image: picture,
    },
  });

    return  {status : 200, data :await this.TokenService.createLoginCredentials({ user, issuer })}
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
      password,
      phone,
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
  return await this.TokenService.createLoginCredentials({user : account , issuer})
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