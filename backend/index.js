import express from "express";
import path from "path";
import dbConnect from "./db.js";
import serverConfig from "./serverConfig.js";
import publicRouter from "./routes/public/publicRouter.js";
import createSuperAdmin from "./utils/superAdmin.js";

import { authmiddleware } from "./utils/jwtToken.js";
import protectedRouter from "./routes/protected/admin/protectedRouter.js";

const app = express();
const port = serverConfig.port;

app.use(express.json());
const dir = path.resolve();
app.use(express.static(path.join(dir, "frontend")));

//api
app.use("/api/public/", publicRouter);
app.use("/api/protected",authmiddleware,protectedRouter)



try {
  await dbConnect();
  app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
    createSuperAdmin();
  });
} catch (error) {
  console.log(error);
}
