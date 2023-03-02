export type FilterOps =
  | '='
  | '!='
  | '<'
  | '<='
  | '>'
  | '>='
  | 'like'
  | 'not like';

type UpdateOp = 'inc' | 'dec' | 'replace' | '@updatedAt';

interface OperationParam<T> {
  value: string | number | boolean | Date | Object;
  operator: T;
}

export type FilterParam = OperationParam<FilterOps>;

export interface Filter {
  [key: string]:
    | OperationParam<FilterOps>
    | Record<string, OperationParam<FilterOps>>;
}

export interface UpdateOpParam {
  [key: string]:
    | OperationParam<UpdateOp>
    | Record<string, OperationParam<UpdateOp>>;
}

export type GetFilterParam = {
  value: 'string' | 'number' | 'boolean' | 'json';
  operator: FilterOps;
};

export type GetQueryFilter = {
  [key: string]: GetFilterParam | Record<string, GetFilterParam>;
};
