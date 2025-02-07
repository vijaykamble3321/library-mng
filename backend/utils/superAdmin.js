
import userModel from "../models/userModel.js";
import { hashPassword } from "./encryptPassword.js";
import bcryptjs from "bcryptjs"




async function createSuperAdmin() {

    const superAdmin= await userModel.findOne({
        email:"superadmin@gmail.com"
    });
    if (superAdmin)return;

    userModel.create({
         fname:"super",
         lname:"admin",
         email:"superadmin@gmail.com",
         password:hashPassword("superadmin"),
         role:"superadmin",
    })
    
}

export default createSuperAdmin;