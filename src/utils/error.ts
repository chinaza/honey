import { Response } from 'express';

export default class HttpError extends Error {
  constructor(message: string, public status: number) {
    super(message || 'Something went wrong');
  }
}

export const handleHttpError = (err: HttpError, res: Response) => {
  return res
    .status(err.status || 500)
    .send({ message: err.message || 'Something went wrong' });
};
