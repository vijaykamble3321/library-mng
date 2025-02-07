import { Router } from "express";
import userModel from "../../../models/userModel.js";
import { errorResponse, successResponse } from "../../../utils/serverResponse.js";
import { hashPassword } from "../../../utils/encryptPassword.js";
import BorrowModel from "../../../models/borrowModel.js";

const adminUserRouter = Router();

adminUserRouter.get("/", getAllUsersController);
adminUserRouter.put("/update", updateUsersController);
adminUserRouter.delete("/delete", deleteUserController);
adminUserRouter.post("/create", createUsersController);
adminUserRouter.get("/viewdata", allUsersBorrowedBooksController);

export default adminUserRouter;


async function allUsersBorrowedBooksController(req, res) {
  try {
    const allBorrowedBooks = await BorrowModel.find({ returned: false }) 
      .populate("userId", "email name") 
      .populate("bookId", "title author") 
      .exec();

    if (allBorrowedBooks.length === 0) {
      return errorResponse(res, 404, "No borrowed books found.");
    }

    return successResponse(res, "All users' borrowed books.", allBorrowedBooks);
  } catch (error) {
    console.error("Error fetching borrowed books:", error);
    return errorResponse(res, 500, "Internal server error.");
  }
}
//

async function getAllUsersController(req, res) {
  try {
    const { email } = res.locals;
    console.log("locals", email);
    const blogs = await userModel.find({ email });

    successResponse(res, "all blogs found", blogs);
  } catch (error) {
    errorResponse(res, 500, "internal server error");
  }
}

async function updateUsersController(req, res) {
  try {
    const id = req.query.id?.trim();
    const updateData = req.body;

    if (!id) {
      return errorResponse(res, 400, "id is not provided");
    }

    const updatedataUser = await userModel.findByIdAndUpdate(id, updateData);
    successResponse(res, "success", updatedataUser);
  } catch (error) {
    console.log("__getalluserController__", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function deleteUserController(req, res) {
  try {
    const id = req.query.id?.trim();

    if (!id) {
      return errorResponse(res, 400, "id is not provided");
    }
    const deleteUser = await userModel.findByIdAndDelete(id);

    successResponse(res, "success", deleteUser);
  } catch (error) {
    console.log("__getalluserController__", error);
    errorResponse(res, 500, "internal server error");
  }
}

async function createUsersController(req, res) {
  try {
    const { fname, lname, email, password, age, mobile, role } = req.body;
    console.log("Create user:", req.body);

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 200, "Email already in use.");
    }

    // Hash the password correctly using await
    const hashedPassword = await hashPassword(password);

    // Create the user
    const newUser = await userModel.create({
      fname,
      lname,
      email,
      age,
      mobile,
      role,
      password: hashedPassword, 
    });

    return successResponse(res, "User created successfully", newUser);
  } catch (error) {
    console.error("Error in createUsersController:", error);
    return errorResponse(res, 500, "Internal server error");
  }
}
