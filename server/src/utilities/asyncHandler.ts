import { Request, Response, NextFunction, RequestHandler } from "express";
import logger from "./logger";

const asyncHandler = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next);
    } catch (error: unknown) {
      const err = error as { message: string; statusCode: number };

      res.status(err.statusCode || 500).json({
        message: err.message,
        success: false,
      });
      console.log(err);

      logger.error(`Unexpected error occurred`, { error: err.message });
    }
  };
};

export default asyncHandler;
