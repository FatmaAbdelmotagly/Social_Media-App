import { type Response } from "express";


export interface IResponse<T = any, Z = any> {
  res: Response;
  message?: string;
  data?: T;
  extra?: Z;
  status?: number;
}