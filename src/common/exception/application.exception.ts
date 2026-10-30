export class ApplicationException extends Error {
    constructor(message:string , public status :number , cause:unknown){
        super(message , {cause})
        this.name  = this.constructor.name
        Error.captureStackTrace(this, this.constructor)
    }
}
export class BadRequstException extends ApplicationException {
    constructor(message:string = "bad requse" , cause?:unknown){
        super(message ,400 ,cause)
    }
}
export class NotFoundException extends ApplicationException {
    constructor(message:string = "not found " , cause?:unknown){
        super(message ,404 ,cause)
    }
}
export class UnauthorizedException extends ApplicationException {
    constructor(message:string = "Unauthorized" , cause?:unknown){
        super(message ,401 ,cause)
    }
}
export class ForbiddenException extends ApplicationException {
    constructor(message:string = "Forbidden" , cause?:unknown){
        super(message ,403 ,cause)
    }
}

export class ConflictException extends ApplicationException {
    constructor(message:string = "Conflict" , cause?:unknown){
        super(message ,409 ,cause)
    }
}
export class TooManyRequestException extends ApplicationException {
    constructor(message:string = "TooManyRequest" , cause?:unknown){
        super(message ,429 ,cause)
    }
}
