import { AnyKeys, CreateOptions, HydratedDocument, Model } from "mongoose";
import { IUser } from "../interface/user.interface";
import { DatabaseRepository } from "./db.repo";
import { UserModel } from "../../DB/model/userModel";


export class userRepo extends DatabaseRepository<IUser> {
  constructor(){
    super(UserModel)
  }
}
