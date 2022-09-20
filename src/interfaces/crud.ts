import { Middleware } from '@src/services/express';

export interface ICreate {
  resource: string;
  params: Record<string, 'string' | 'number' | 'boolean' | '@updatedAt'>;
  message: string;
  middleware?: Middleware[];
}

export interface IUpdateById {
  resource: string;
  params: Record<string, 'replace' | 'inc' | 'dec' | '@updatedAt'>;
  message: string;
  middleware?: Middleware[];
}
