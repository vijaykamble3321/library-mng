import { connect } from "mongoose";
import serverConfig from "./serverConfig.js";

async function dbConnct() {
  try {
    await connect(serverConfig.dburl),
      {
        timeoutMS: 1000000,
      };
    console.log("dbConnect Seccssfull");
  } catch (error) {
    throw error;
  }
}

export default dbConnct;
