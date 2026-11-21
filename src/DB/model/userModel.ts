import mongoose, { HydratedDocument } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enum/index.js";
import { IUser } from "../../common/interface/user.interface.js";
const userSchema = new mongoose.Schema<IUser>(
  {
   
    firstname:{type : String,  required: true},
    lastname:{type : String,  required: true},
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: function ():boolean {
        return this.provider === ProviderEnum.SYSTEM;
      },
    },
    phone: {
      type: String,
      required: true,
    },
    image: String,
    cover: [String],
    confirmEmail: Date,
    changeCredintialTime: Date,
    gender: {
      type: Number,
      default: GenderEnum.MALE,
      enum: GenderEnum,
    },
    role: {
      type: Number,
      default: RoleEnum.USER,
      enum: RoleEnum,
    },
    provider: {
      type: Number,
      default: ProviderEnum.SYSTEM,
      enum: ProviderEnum,
    },
    confirmPassword: String,
  },
  {
    timestamps: true,
  },
);

userSchema.virtual("username").set(function (value) {
    const [firstname, lastname] = value?.split(" ") || [];
    this.set({ firstname, lastname })
}).get(function () {
    return `${this.firstname} ${this.lastname}`
})
 
export const UserModel = mongoose.models.User || mongoose.model<IUser>("User", userSchema)
export type HUser = HydratedDocument<IUser>