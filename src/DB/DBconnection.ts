import  express  from "express";
import mongoose from "mongoose";
import { DB_URI } from "../config";


export const bootStrap = async (app : express.Application, port:number) => {
  try {
    mongoose.connect(DB_URI)
    console.log("DB connected 🌸");
    app.listen(port, () => {
      console.log(`server is running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
    console.log("fail to connect on DB 😤");
  }
};
