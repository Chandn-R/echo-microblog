import { Request, Response, NextFunction, RequestHandler } from 'express';

const asyncHandler = (func: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await func(req, res, next)
        } catch (error: unknown) {

            const err = error as { message: string, statuscode: number }

            res.status(err.statuscode || 500).json({
                success: false,
                message: err.message
            })
        }
    }
}

export default asyncHandler;