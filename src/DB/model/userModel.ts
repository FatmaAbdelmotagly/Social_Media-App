import mongoose, { HydratedDocument } from "mongoose";
import { AccountStatusEnum, GenderEnum, ProviderEnum, RoleEnum } from "../../common/enum/index.js";
import { IUser } from "../../common/interface/user.interface.js";
import { hash } from "../../common/security/hash.security.js";
import { encryption } from "../../common/security/encryption.security.js";
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
    status : {type : Number , enum : AccountStatusEnum , default: AccountStatusEnum.ACTIVE},
    changeStatusAt: Date ,
    followingList :{
      type : [mongoose.Types.ObjectId],
      default : []
    },
    followers : {
      type : [mongoose.Types.ObjectId],
      default : []
    }
  },
  {
    timestamps: true,
    strictQuery : true ,
    autoIndex: true ,
    toObject:{virtuals : true },
    toJSON :{virtuals : true}
  },
);

userSchema.virtual("username").set(function (value) {
    const [firstname, lastname] = value?.split(" ") || [];
    this.set({ firstname, lastname })
}).get(function () {
    return `${this.firstname} ${this.lastname}`
})

userSchema.pre(["findOne", "find" , 'countDocuments'], function () {
  const query = this.getFilter();
  console.log(query);

  if (query.paranoid != false)
    this.setQuery({ ...query, status: { $ne: AccountStatusEnum.ARCHIVE } });

  console.log({ post: this.getFilter() });
});
userSchema.pre(
  ["updateOne", "updateMany", "findOneAndUpdate"],
  function () {
    const query = this.getFilter();
    const update = this.getUpdate() as HUser;

    if (update.status == AccountStatusEnum.ACTIVE) {
      this.setQuery({
        ...query,
        status: { $eq: AccountStatusEnum.ARCHIVE },
      });
    } else if (update.status == AccountStatusEnum.ARCHIVE) {
      this.setQuery({
        ...query,
        status: { $ne: AccountStatusEnum.ARCHIVE },
      });
    }
    if (!update.status && query.paranoid != false) {
  this.setQuery({
    ...query,
    status: { $ne: AccountStatusEnum.ARCHIVE },
  });
}

    this.setUpdate({
      ...this.getUpdate(),
      ...(update.status ? { changeStatusAt: new Date() } : {}),
    });
  }
);
userSchema.pre(
  ["deleteOne", "deleteMany", "findOneAndDelete"],
  function () {
    const query = this.getFilter();

    if (!query.force) {
      this.setQuery({
        ...query,
        status: { $eq: AccountStatusEnum.ARCHIVE },
      });
    }
  }
);

userSchema.pre('save' , async function(){
  if(this.isModified('password')){

    this.password = await hash(this.password)
  }
  if(this.isModified('phone')){

   this.phone = await encryption(this.phone as string)
  }
  
})


export const UserModel = mongoose.models.User || mongoose.model<IUser>("User", userSchema)
export type HUser = HydratedDocument<IUser>