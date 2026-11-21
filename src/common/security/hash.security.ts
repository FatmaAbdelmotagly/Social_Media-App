import bcrypt from "bcrypt";
import { SALT } from "../../config.js";

export const hash = async (plantext : string, salt_round:number = SALT, minor:'b'|'a' = "b"):Promise<string> => {
  const saltSegniture = await bcrypt.genSalt(salt_round, minor);
  const cipherText = await bcrypt.hash(plantext, saltSegniture);
  return cipherText;
};

export const compare = async (FE_password:string, cipherText:string):Promise<boolean> => {
  const match = await bcrypt.compare(FE_password, cipherText);
  return match;
};
