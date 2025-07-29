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

export interface OperationParam<T> {
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

type FilterOverrideValue =
  | string
  | number
  | boolean
  | Date
  | Record<string, any>;
export type FilterLocation =
  | 'query'
  | 'body'
  | 'headers'
  | 'request'
  | 'params';
export type GetFilterParam = {
  value: 'string' | 'number' | 'boolean' | 'json';
  operator: FilterOps;
  /**
   * Force a value to be used as filter regardless of request value
   */
  overrideValue?: FilterOverrideValue;
  /**
   * The location of the filter variable
   */
  location?: FilterLocation;
};

export type GetQueryFilter = {
  [key: string]: GetFilterParam;
} & {
  $or?: Record<string, GetFilterParam>;
};
