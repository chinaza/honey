import { ObjectSchema, ValidationOptions } from 'joi';
import { Middleware } from 'src/interfaces/express';
import HttpError, { handleHttpError } from './error';

export const validateRequestData =
  (
    schema: ObjectSchema,
    location: 'body' | 'params' | 'query' | 'headers' | 'cookies' = 'body',
    options: ValidationOptions = { allowUnknown: true }
  ): Middleware =>
  async (req, res, next) => {
    try {
      const validationResult = schema.validate(req[location], options);
      const validationError = validationResult.error?.message;
      if (validationError) {
        throw new HttpError(validationError, 422);
      }

      return next();
    } catch (error: any) {
      handleHttpError(error, res);
    }
  };

export default validateRequestData;
