import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import logger from "./utilities/logger.js";

const PORT = (process.env.PORT as string) || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB error and Server not running", error);
    logger.error("MongoDB error and Server not running", { error });
  });
