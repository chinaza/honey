export type FilterOps =
  | '='
  | '!='
  | '<'
  | '<='
  | '>'
  | '>='
  | 'in'
  | 'not in'
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
  value: 'string' | 'number' | 'boolean' | 'json' | 'csv' | 'as-is';
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

// ── Filter Preset types (additive — do not modify existing types above) ──────

/** The operator type used in filter conditions */
export type FilterOperator = FilterOps;

/** The value type used in filter conditions */
export type FilterValue = GetFilterParam['value'];

/**
 * A single leaf condition — same shape as GetFilterParam but with an optional
 * overrideValue. When value === 'as-is', overrideValue is used directly.
 */
export interface FilterCondition {
  [field: string]: {
    operator: FilterOperator;
    value: FilterValue | 'as-is';
    overrideValue?: unknown | (() => unknown);
  };
}

/** A node in a filter tree is either a leaf condition or an AND group */
// eslint-disable-next-line no-use-before-define
export type FilterNode = FilterCondition | FilterAndGroup;

/** An AND group: all child nodes must match */
export interface FilterAndGroup {
  $and: FilterNode[];
}

/** A preset is an array of FilterNodes joined by OR at the top level */
export type FilterPreset = FilterNode[];

/** The full presets map: preset name → FilterPreset */
export type FilterPresets = Record<string, FilterPreset>;

// ─────────────────────────────────────────────────────────────────────────────

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
