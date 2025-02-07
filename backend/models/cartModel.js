import { Schema, model, Types } from "mongoose";
// import bookModel from "./bookModel.js";
import bookModel from "./bookModel.js";

const cartSchema = new Schema({
  userId: { 
    type: Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  bookId: { 
    type: Types.ObjectId, 
    ref: "book", 
    required: true 
  },
  addedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const cartModel = model("Cart", cartSchema);
export default cartModel;
