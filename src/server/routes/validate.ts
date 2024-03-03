import { Request, Response, NextFunction } from 'express';
import {parse, BaseSchema} from 'valibot';

const validate = (schema: BaseSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
        parse(schema, {
            body: req.body,
            query: req.query,
            params: req.params,
        })
        next();
    } catch (e: any) {
        //console.info('---, ', req.body, e);
        console.info('[validation schema express error:] ', e.message);
        return res.status(401).send({
            error: true,
            message: e.issues[0].message
        });
    }

}

export default validate;