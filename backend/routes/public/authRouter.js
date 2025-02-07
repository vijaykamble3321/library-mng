import { Router } from "express";
import { errorResponse, successResponse } from "../../utils/serverResponse.js";
import userModel from "../../models/userModel.js";

import { authmiddleware, generatToken } from "../../utils/jwtToken.js";
import { comparePassword, hashPassword } from "../../utils/encryptPassword.js";

const authRouter = Router();
//api
authRouter.post("/signin", signinController);
authRouter.post("/forgot", forgotPasswordController);
authRouter.post("/reset", resetPasswordController);

export default authRouter;

async function signinController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, "Email and password are required.");
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    const passwordvalid = comparePassword(password, user.password);

    if (!passwordvalid) {
      return errorResponse(res, 401, "invalid password");
    }
    const token = generatToken({
      userid: user._id,
      email: user.email,
      // userid: user._id,
      role: user.role,
    });
    console.log("Generated Token:", token);

    return successResponse(res, "Signin successful", token);
  } catch (error) {
    console.error("Error during signin", error);
    return errorResponse(res, 500, "Internal server error.");
  }
}



//forgot
async function forgotPasswordController(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 400, "email and password are required.");
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return errorResponse(res, 400, "user not found");
    }
    const randomNum = Math.round(Math.random() * 100000);
    const forgototp = randomNum < 1000000 ? randomNum + 100000 : randomNum;

    await userModel.findOneAndUpdate({ email }, { forgototp });
    //fuction to email otp to user email -

    //
    return successResponse(res, "otp generate successful.", { otp: forgototp });
  } catch (error) {
    console.log("error during signin", error);
    errorResponse(res, 500, "internal server error");
  }
}
//reset

async function resetPasswordController(req, res) {
  try {
    const { email, otp, password } = req.body;

    if (!email) {
      return errorResponse(res, 400, "email and password are required.");
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return errorResponse(res, 400, "user not found");
    }

    if (user.forgototp !==  Number.otp) {
      return errorResponse(res, 400, "invalid otp");
    }

    await userModel.findOneAndUpdate({ email }, { password:hashPassword(password) });

    return successResponse(res, "password reset successful");
  } catch (error) {
    console.log("error during signin", error);
    errorResponse(res, 500, "internal server error");
  }
}

