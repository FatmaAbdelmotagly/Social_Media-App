import { Query } from "mongoose";
import { BadRequstException } from "../common/exception/domain.exception";
import { LangEnum } from "../common/enum/securityEnum.js";
import { NextFunction , Request ,Response } from "express";
import { ZodType } from "zod";


type validationSchemaType = (lang : LangEnum)=>ZodType

export const validation = (schema :validationSchemaType)=>{
    return (req : Request,res:Response,next:NextFunction):void=>{


        const lang = Number( req.headers['accept-language'] ?? LangEnum.EN) ;
        console.log({lang})
        
const validationResult =schema(lang).safeParse({
    body : req.body,
    headers : req.headers,
    params : req.params,

})
      if(!validationResult.success){

    throw new BadRequstException("validation error", validationResult.error.issues);
 
    }
    req.validate = validationResult.data
    next()
    }
 }