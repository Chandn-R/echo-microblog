import { Request, Response, NextFunction } from "express";
import logger from "../utilities/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.originalUrl}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
  });

  next();
};

export const errorLogger = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });
  next(err);
};
