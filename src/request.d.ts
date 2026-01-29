declare global {
  namespace Express {
    export interface Request {
      _honeyTransit: Record<string, any>;
    }
  }
}

export {};
