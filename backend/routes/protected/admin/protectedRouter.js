import { Router } from "express";
import { authmiddleware, isSuperAdminMiddleware } from "../../../utils/jwtToken.js";
import adminUserRouter from "./adminUserRouter.js";
import adminbookRouter from "./adminbookRouter.js";
import bookuserRouter from "../user/bookuserRouter.js";




const protectedRouter = Router();

protectedRouter.use("/admin",isSuperAdminMiddleware,adminUserRouter);
protectedRouter.use("/book",isSuperAdminMiddleware,adminbookRouter);
protectedRouter.use("/user",bookuserRouter)

export default protectedRouter;
