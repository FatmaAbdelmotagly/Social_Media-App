import { NextFunction,Response ,Request} from "express";
import { signupDTO } from "./DTO/authentication.dto";


export class autenticationService {

    public name:string = "fatma"
    constructor(){ 
        console.log("in");
    }


signup = async ({email , password , confirmPassword , username }: signupDTO["body"]) => {
  console.log({email});
  return 201;
};
}

export default new autenticationService()