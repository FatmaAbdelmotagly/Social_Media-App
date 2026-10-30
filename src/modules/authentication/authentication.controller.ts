
import { Router,
  type Router as RouterType,
  type Request,
  type Response,
  type NextFunction
} from "express";
import autenticationService from "./authentication.service";
import { log } from "node:console";
import authService from "./authentication.service";
import { responseFormatter } from "../../middelware/response.middelware";
import { IResponse } from "../../common/utiles/response.interface";



const router: RouterType = Router({
  strict: true,
  caseSensitive: true
});

router.post("/signup",responseFormatter(
  async (req: Request, res: Response, next: NextFunction):Promise<IResponse<number>>=> {
  const data = await authService.signup(req.body)
  return {status:201 , data , res};
}
));

export default router;
