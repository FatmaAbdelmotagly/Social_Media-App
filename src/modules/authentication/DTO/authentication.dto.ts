// export interface IsignupDTO {
//     username : string;
//     phone : number ;
//     email : string ;
//     password : string ;
//     DOB : Date;

import { signup } from "../authentication.validation";
import z from "zod";
    
// }



export  type signupDTO = z.infer<ReturnType<typeof signup>>