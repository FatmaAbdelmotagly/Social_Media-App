
import { type NextFunction, type Request, type Response } from "express";
import { type IResponse } from "../common/utiles/response.interface";

export const responseFormatter = (handler: Function) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ):Promise<Response | void> => {
    const {
      status = 200,
      message = "Done",
      data = undefined,
      extra = undefined
    }: IResponse = await handler(req, res, next)||{};
    console.log(res.headersSent);

    if(res.headersSent)return;
    

    return res.status(status).json({
      message,
      status,
      data,
      extra
    });
  };
};
