// export interface IsignupDTO {
//     username : string;
//     phone : number ;
//     email : string ;
//     password : string ;
//     DOB : Date;

import { confirmEmail, login, resendconfirmEmail, signup } from "../authentication.validation";
import z from "zod";
    
// }



export  type signupDTO = z.infer<ReturnType<typeof signup>>
export  type confirmEmailDTO = z.infer<ReturnType<typeof confirmEmail>>
export  type resendconfirmEmailDTO = z.infer<ReturnType<typeof resendconfirmEmail>>
export  type loginDTO = z.infer<ReturnType<typeof login>>