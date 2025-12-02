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
  [key: string]: GetFilterParam | Record<string, GetFilterParam>;
};

export type JoinType = 'inner' | 'left' | 'right' | 'full' | 'cross';

export interface Join {
  /** The table to join */
  table: string;
  /** The type of join (default: 'inner') */
  type?: JoinType;
  /** The join condition - e.g., 'users.id' = 'posts.user_id' */
  on: {
    /** Left side of join condition (e.g., 'users.id') */
    left: string;
    /** Right side of join condition (e.g., 'posts.user_id') */
    right: string;
    /** Operator for join condition (default: '=') */
    operator?: '=' | '!=' | '<' | '<=' | '>' | '>=';
  };
  /** Alias for the joined table (optional) */
  alias?: string;
}
