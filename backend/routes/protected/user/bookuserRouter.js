import { Router } from "express";
import bookModel from "../../../models/bookModel.js";
import userModel from "../../../models/userModel.js";
import borrowModel from "../../../models/borrowModel.js";
import {
  errorResponse,
  successResponse,
} from "../../../utils/serverResponse.js";
import { authmiddleware } from "../../../utils/jwtToken.js";
import cartModel from "../../../models/cartModel.js";

const bookuserRouter = Router();

// API Route
bookuserRouter.get("/booksall", authmiddleware, booksallController);
bookuserRouter.get("/getcart", authmiddleware, getcartController);
bookuserRouter.post("/singlebuy", authmiddleware, singlebookbuyController);
bookuserRouter.post("/cart", authmiddleware, addToCartController);
bookuserRouter.post("/buyall", authmiddleware, checkoutController); //buy
bookuserRouter.delete("/deletecart", authmiddleware, deletecartController);
// bookuserRouter.get("/detail", authmiddleware, detailController);

export default bookuserRouter;

//detail

// async function detailController(req, res) {
//   try {
//     const { email } = res.locals;

//     const user = await userModel.findOne({ email });
//     if (!user) return errorResponse(res, 404, "User not found.");

//     const userId = user._id;

//     // Count total borrowed books
//     const totalBorrowed = await borrowModel.countDocuments({ userId });

//     //  Count total returned books
//     const totalReturned = await borrowModel.countDocuments({
//       userId,
//       returned: true,
//     });

    //  Get currently borrowed books (not returned)
//     const currentBorrowed = await borrowModel
//       .find({ userId, returned: false })
//       .populate("bookId", "title author"); // Fetch book details (title & author)

//     return successResponse(res, "User borrow details fetched successfully.", {
//       totalBorrowed,
//       totalReturned,
//       currentBorrowed,
//     });
//   } catch (error) {
//     console.error("Error fetching borrow details:", error);
//     return errorResponse(res, 500, "Internal server error.");
//   }
// }

async function deletecartController(req, res) {
  try {
    const { email } = res.locals;
    const { bookId } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) return errorResponse(res, 404, "User not found.");

    const cartItem = await cartModel.findOneAndDelete({
      userId: user._id,
      bookId,
    });

    if (!cartItem) return errorResponse(res, 404, "Book not found in cart.");

    return successResponse(res, "Book removed from cart.");
  } catch (error) {
    console.error("Error removing book from cart:", error);
    return errorResponse(res, 500, "Internal server error.");
  }
}

async function booksallController(req, res) {
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

async function singlebookbuyController(req, res) {
  try {
    const { email } = res.locals;
    const { bookId } = req.body;

    if (!bookId) {
      return errorResponse(res, 400, "Book ID is required.");
    }

    const user = await userModel.findOne({ email });
    if (!user) return errorResponse(res, 404, "User not found.");

    const userId = user._id;

    const book = await bookModel.findById(bookId);
    if (!book) return errorResponse(res, 404, "Book not found.");

    if (book.availableCopies <= 0) {
      return errorResponse(res, 400, "No copies available for borrowing.");
    }

    const existingBorrow = await borrowModel.findOne({
      userId,
      bookId,
      returned: false,
    });

    if (existingBorrow)
      return errorResponse(res, 400, "You have already borrowed this book.");

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const newBorrow = new borrowModel({
      userId,
      bookId,
      borrowDate: new Date(),
      dueDate,
      returned: false,
    });

    await newBorrow.save();

    book.availableCopies -= 1;
    await book.save();

    await cartModel.deleteOne({ userId, bookId });

    return successResponse(res, "Book borrowed successfully.", newBorrow);
  } catch (error) {
    console.error("Error in borrowing book:", error);
    return errorResponse(res, 500, "Internal server error.");
  }
}

async function getcartController(req, res) {
  try {
    const { email } = res.locals;
    const user = await userModel.findOne({ email });
    if (!user) return errorResponse(res, 404, "user not found");

    const cartItem = await cartModel
      .find({ userId: user._id })
      .populate("bookId");
    return successResponse(res, "cart retrived successfull", cartItem);
  } catch (error) {
    console.error("error retriving cart", error);
    return errorResponse(res, 500, "intrnal servr error");
  }
}

async function checkoutController(req, res) {
  try {
    const { email } = res.locals;

    const user = await userModel.findOne({ email });
    if (!user) return errorResponse(res, 404, "User not found.");

    const cartItems = await cartModel
      .find({ userId: user._id })
      .populate("bookId");

    if (cartItems.length === 0)
      return errorResponse(res, 400, "Cart is empty.");

    const borrowedBooks = [];
    for (let cartItem of cartItems) {
      const book = cartItem.bookId;

      if (!book || book.availableCopies <= 0) continue;

      const existingBorrow = await borrowModel.findOne({
        userId: user._id,
        bookId: book._id,
        returned: false,
      });

      if (existingBorrow) continue;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const newBorrow = new borrowModel({
        userId: user._id,
        bookId: book._id,
        borrowDate: new Date(),
        dueDate,
        returned: false,
      });

      await newBorrow.save();
      borrowedBooks.push(newBorrow);

      book.availableCopies -= 1;
      await book.save();
    }

    await cartModel.deleteMany({ userId: user._id });

    if (borrowedBooks.length === 0) {
      return errorResponse(res, 400, "No books were available to borrow.");
    }

    return successResponse(res, "Books borrowed successfully.", borrowedBooks);
  } catch (error) {
    console.error("Error during checkout:", error);
    return errorResponse(res, 500, "Internal server error.");
  }
}

//add to cart
async function addToCartController(req, res) {
  try {
    const { email } = res.locals;
    const { bookId } = req.body;

    if (!bookId) {
      return errorResponse(res, 400, "Book ID is required.");
    }

    const user = await userModel.findOne({ email });
    if (!user) return errorResponse(res, 404, "User not found.");

    const existingCartItem = await cartModel.findOne({
      userId: user._id,
      bookId,
    });

    if (existingCartItem)
      return errorResponse(res, 400, "Book already in cart.");

    const newCartItem = new cartModel({ userId: user._id, bookId });
    await newCartItem.save();

    return successResponse(res, "Book added to cart.");
  } catch (error) {
    console.error("Error adding book to cart:", error);
    return errorResponse(res, 500, "Internal server error.");
  }
}
