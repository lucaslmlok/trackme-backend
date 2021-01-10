import "reflect-metadata";
import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createConnection } from "typeorm";

import config from "./util/config";
import userRoutes from "./routes/user";
import actionRoutes from "./routes/action";
import actionRecordRoutes from "./routes/actionRecord";
import errorHandler from "./middlewares/errorHandler";

const PORT = +config.port;

createConnection()
  .then(async (connection) => {
    const app = express();

    app.use(cors());
    app.use(bodyParser.json());

    app.use("/user", userRoutes);
    app.use("/action", actionRoutes);
    app.use("/action-record", actionRecordRoutes);

    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.log(error));
