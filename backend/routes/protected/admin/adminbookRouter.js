import { Router } from "express";
import bookModel from "../../../models/bookModel.js";
import { errorResponse, successResponse } from "../../../utils/serverResponse.js";

const adminbookRouter = Router();

//api
adminbookRouter.post("/create", createBlogController);
adminbookRouter.get("/all", getAllController);
adminbookRouter.put("/update", updateController);
adminbookRouter.delete("/delete", deleteBlogController);
//

export default adminbookRouter;

async function getAllController(req, res) {
  try {
    const { email } = res.locals;
    console.log(email);

    if (!email) {
      return errorResponse(res, 403, "Unauthorized access.");
    }
    const books = await bookModel.find();

    if (books.length === 0) {
      return errorResponse(res, 404, "No bookss found.");
    }

    return successResponse(res, "User bookss retrieved successfully.", books);
  } catch (error) {
    console.error("Error in getAllController:", error);
    return errorResponse(res, 500, "Internal server error.");
  }
}

async function createBlogController(req, res) {
  try {
    if (!res.locals.email || !res.locals.role) {
      return errorResponse(res, 401, "unauthorized: missing email or role");
    }
    const { email, role } = res.locals;
    const { title, author, bookCode, publishDate, category, status } = req.body;

    // console.log(email);

    if (
      !title ||
      !bookCode ||
      !author ||
      !publishDate ||
      !category ||
      !status
    ) {
      return errorResponse(res, 400, "All fields are required.");
    }

    const newBlog = await bookModel.create({
      title,
      author,
      bookCode,
      publishDate:new Date(),
      category,
      status,
      email,
      role,
    });

    return successResponse(res, "Blog created successfully.", newBlog);
  } catch (error) {
    console.error("Error in createBlogController:", error);
    return errorResponse(res, 500, "Internal server error.");
  }
}

async function updateController(req, res) {
  try {
    const { email: Useremail, role } = res.locals;
    if (!Useremail || role !== "admin") {
      return errorResponse(res, 400, "all field requird");
    }
    const { _id, title, description, author, content, Published, email } =
      req.body;
    if (!title || !description || !author || !content || !Published || !email) {
      return errorResponse(res, 400, "unathorized user");
    }
    const newBlog = await bookModel.findByIdAndUpdate(_id, {
      title,
      email,
      description,
      author,
      content,
      Published,
    });
    succesResponse(res, "blog-update successful", newBlog);
  } catch (error) {
    errorResponse(res, "internal server errror");
  }
}
async function deleteBlogController(req, res) {
  try {
    const { email: Useremail1, role } = res.locals;

    if (!Useremail1 || role !== "admin") {
      return errorResponse(res, 400, "Admin access required");
    }

    const { _id, email } = req.body;

    if (!email || !_id) {
      return errorResponse(res, 400, "All fields are required");
    }

    if (email !== Useremail1) {
      return errorResponse(res, 400, "Unauthorized user");
    }
    const deletedBlog = await bookModel.deleteOne({ _id });

    if (deletedBlog.deletedCount === 0) {
      return errorResponse(res, 404, "Blog not found");
    }

    succesResponse(res, "Blog - deleted successfully");
  } catch (error) {
    console.error("Error deleting blog:", error.message);
    return errorResponse(res, 500, "Internal Server Error");
  }
}
//
