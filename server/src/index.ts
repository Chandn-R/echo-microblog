import dotenv from "dotenv";
dotenv.config();

import {server} from "./app.js";
import connectDB from "./config/db.js";
import logger from "./utilities/logger.js";

const PORT = parseInt(process.env.PORT || "8000", 10);

connectDB()
  .then(() => {
    server.listen(PORT, "0.0.0.0", () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB error and Server not running", error);
    logger.error("MongoDB error and Server not running", { error });
  });
