import { safeParse } from "valibot";
import { uriSchema, ValidateUrl } from "../../common/validate/schema";

export function inputValidate(schema: any, value: string) {
  const result = safeParse(schema, value);
  console.log({ result, schema, value });
  return result.success ? true : result.issues[0].context;
}

export const validateUri = (value: string) => inputValidate(uriSchema, value);

export const validateInputUrl = (value: string) =>
  inputValidate(ValidateUrl, value);
