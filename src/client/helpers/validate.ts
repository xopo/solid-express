import {safeParse} from 'valibot';
import { uriSchema } from '../../common/validate/schema';

export function inputValidate(schema: any, value: string) {
    const result = safeParse(schema, value);
    return result.success
        ? true
        //@ts-ignore
        : result.issues[0].context.message
}

export const validateUri = (value: string) => inputValidate(uriSchema, value)