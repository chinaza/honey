import { Request } from 'express';

export const createReqTransit = <T>(key: string) => {
  const inject = (req: Request, value: T) => {
    req._honeyTransit = { ...req._honeyTransit, [key]: value };
  };

  const extract = (req: Request, defaultValue?: T): T => {
    return req._honeyTransit?.[key] ?? defaultValue!;
  };

  return { inject, extract };
};
