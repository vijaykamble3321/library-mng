import  { Router } from "express";
import authRouter from "./authRouter.js";

const publicRouter = Router();

//api
publicRouter.use("/auth", authRouter);


export default publicRouter;
