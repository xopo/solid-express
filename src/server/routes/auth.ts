import { Request, Response, NextFunction } from 'express';

export const isAuthorized = (req: Request, res: Response, next: NextFunction) => {
    //console.log('-- orig function req.session', req.originalUrl, req.session)
    if (req.session.authorized) {
        return next();
    }
    res.status(401).json({error: 'not authorized'});
}