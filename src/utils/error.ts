import { Response } from 'express';

export default class HttpError extends Error {
  public status: number = 500;
  constructor(message: string, status?: number) {
    super(message || 'Something went wrong');
    if (status) this.status = status;
  }
}

export const handleHttpError = (err: HttpError, res: Response) => {
  return res
    .status(err.status || 500)
    .send({ message: err.message || 'Something went wrong' });
};
