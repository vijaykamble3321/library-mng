import { model, Schema } from "mongoose";

const bookSchema = new Schema({
  title: 
  { type: String, 
    required: true },
  author: 
  { type: String,
     required: true },
  bookCode: 
  { type: String, 
    required: true },
  publishDate: 
  { type: Date,
     },
  category: 
  { type: String, 
    required: true },
  status: {
    type: String,
    enum: ["available", "not available"],
    default: "available",
   
  },
  
});

const bookModel = model("book", bookSchema);
export default bookModel;
