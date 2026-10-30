import { NextFunction,Response ,Request} from "express";


export class autenticationService {

    public name:string = "fatma"
    constructor(){ 
        console.log("in");
        // console.log({this : this});
    }



  signup = async (data: any) => {
    return 201;
  };

}

export default new autenticationService()