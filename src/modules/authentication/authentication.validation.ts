import { z } from "zod";
import { generalValidationFields } from "../../common/utiles/validation";
import {LangEnum} from '../../common/enum/securityEnum'
const loginSchema = (lang:LangEnum) => {
  return z.strictObject({
    email: generalValidationFields.email(lang),
    password: generalValidationFields.password,
  });
};

export const login = (lang:LangEnum) => {
  return z.object({
    body: loginSchema(lang),
  });
};

export const signup = (lang:LangEnum) => {
  return z.object({
    body: loginSchema(lang)
      .safeExtend({
        username: generalValidationFields.username(lang),
        confirmPassword: generalValidationFields.confirmPassword,
        phone: generalValidationFields.phone,
        gender: generalValidationFields.gender,
        email : generalValidationFields.email(lang)
      })
      .superRefine((data, ctx) => {
        generalValidationFields.matchFields({
          original: "password",
          copy: "confirmPassword",
          data,
          ctx,
          lang,
        });
        if (!data.username.includes(" ")) {
          ctx.addIssue({
            code: "custom",
            path: ["username"],
            message: "username must contain 2 parts",
          });
        }
      }),
  });
};

export const confirmEmail = (lang:LangEnum) => {
  return z.object({
    body: z.strictObject({
      email: generalValidationFields.email(lang),
      otp: generalValidationFields.otp
    }),
    query: z.object({}),
    headers: z.object({}),
    params: z.object({})
  });
};
export const resetPassword = (lang:LangEnum) => {
  return z.object({
    body: z.object({
      email: generalValidationFields.email(lang),
      otp: generalValidationFields.otp,
      password: generalValidationFields.password,
      confirmPassword: generalValidationFields.confirmPassword,
    }).superRefine((data, ctx) => {
      generalValidationFields.matchFields({
        original: "password",
        copy: "confirmPassword",
        data,
        ctx,
      });
    }),
  });
};
export const resendconfirmEmail = (lang:LangEnum) => {
  return z.object({
    body: z.strictObject({
      email: generalValidationFields.email(lang)
    }),
    query: z.object({}),
    headers: z.object({}),
    params: z.object({})
  });
};