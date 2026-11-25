export interface ILoginResponce {
    access_token : string , refreash_token : string
}



export interface ISignupWithGmail {
    status : number , 
    data :{access_token : string , refreash_token : string}
} 