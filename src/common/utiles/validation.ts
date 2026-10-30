 
 import {z} from'zod'
import { GenderEnum } from '../enum/userEnum'
import { LangEnum } from '../enum/securityEnum';
import mongoose from 'mongoose';


const matchFields = ({ original, copy, data, ctx, lang }:{original :string , copy : string , data : any , ctx : z.RefinementCtx , lang ?: LangEnum}) => {
    if (data[original] != data[copy]) {
        ctx.addIssue({
            code: "custom",
            path: [copy],
            message:
                lang == LangEnum.AR
                    ? `فشل التطابق بين ${original} و ${copy}`
                    : `Fail to match between ${original} and ${copy}`
        });
    }
};


 export const generalValidationFields = {
    email : (lang:LangEnum) =>{return z.email({message : (lang ) == LangEnum.AR ? "الايميل غير صحيح " :"invalid email format please add valid one "})},
    password : z.string().regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\s)(?=.*[!@#$%^_&*()]).{8,16}/),
    username :(lang:LangEnum)=>{ return z.string().min(2,{ message : (lang) == LangEnum.AR  ? "يجب ان يحتوي الاسم علي الاقل حرفين " : "minimum length is 2 chars "})} ,
    phone : z.e164(),
    gender : z.enum(GenderEnum),
    otp : z.string().regex(/^\d{6}$/ , {error:"invalid code"}),
    confirmPassword : z.string().regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\s)(?=.*[!@#$%^_&*()]).{8,16}/) ,
   Id : (lang:LangEnum)=>{ return z.string().refine((data)=>{return mongoose.Types.ObjectId.isValid(data)},{message : "invalid format"})},
   file : (lang:LangEnum)=>{
   return z.strictObject({
        fieldname : z.string(),
        originalname : z.string(),
        encoding : z.string(),
        mimetype : z.string(),
        buffer : z.instanceof(Buffer),
        size : z.number(),
        path :z.string() 
    })}
   ,
    matchFields 
    
 }