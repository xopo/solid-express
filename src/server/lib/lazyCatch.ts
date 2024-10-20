import { Request, Response, NextFunction } from "express";

type AsyncFunction = (
    req: Request,
    res: Response,
    next: NextFunction,
) => Promise<any>;

const lazyCatch =
    (fn: AsyncFunction) =>
    (req: Request, res: Response, next: NextFunction): Promise<any> => {
        return Promise.resolve(fn(req, res, next)).catch((er) => next(er));
    };

export default lazyCatch;