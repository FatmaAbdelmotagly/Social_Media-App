import strict from "node:assert/strict";
import { number } from "zod";
import { AccountStatusEnum, GenderEnum, ProviderEnum, RoleEnum } from "../enum";
import { userIdType } from "../security/token.securtiy";


export interface IUser 
  {
    status : AccountStatusEnum;
    changeStatusAt: Date;
    firstname:string;
    lastname:string;
    username?:string;
    email:string;
    password:string;
    phone?:string;
    image?: string;
    DOB?:Date;
    cover?: [string];
    confirmEmail?: Date;
    changeCredintialTime?: Date;
    gender?: GenderEnum;
    role: RoleEnum;
    provider:ProviderEnum;
    confirmPassword: string,
    craetedAt?:Date;
    updatedAt?:Date;
    age?:number;
    followingList : userIdType[];
    followers : userIdType []
  }