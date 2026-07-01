import { Request } from 'express';
import { ICreate, IUpdateById } from '../interfaces/crud';
import {
  Filter,
  FilterAndGroup,
  FilterCondition,
  FilterLocation,
  FilterNode,
  FilterOps,
  FilterParam,
  FilterPresets,
  GetFilterParam,
  GetQueryFilter,
  UpdateOpParam
} from '../shared/interface';
import HttpError from './error';

const formatters: Record<string, Function> = {
  string: String,
  number: Number,
  boolean: Boolean,
  json: JSON.stringify,
  // Required for updating JSON fields
  object: JSON.stringify,
  csv: (value: string) => value.split(','),
  'as-is': (value: any) => value
};

export const extractInsertData = (
  body: Record<string, any>,
  params: ICreate['params']
) => {
  const result: Record<string, string | number | boolean | Date | Object> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === '@updatedAt') {
      result[key] = new Date();
      return;
    }

    if (!Object.keys(body).includes(key)) return;

    const formatter = formatters[value];
    result[key] =
      formatter && ![null, undefined].includes(body[key])
        ? formatter(body[key])
        : body[key];
  });

  return result;
};

export const generateUpdateData = (
  body: Record<string, any>,
  params: IUpdateById['params']
) => {
  const result = Object.entries(params).reduce((acc, [key, value]) => {
    if (!Object.keys(body).includes(key) && value !== '@updatedAt')
      return { ...acc };

    let formattedValue: any;
    if (value === '@updatedAt') {
      formattedValue = new Date();
    } else {
      formattedValue = ![null, undefined].includes(body[key])
        ? formatters[typeof body[key]](body[key])
        : body[key];
    }

    return {
      ...acc,
      [key]: {
        value: formattedValue,
        operator: value === '@updatedAt' ? 'replace' : value
      }
    };
  }, {} as UpdateOpParam);

  return result;
};

const retrieveParamFromLocation = (
  req: Request,
  location: FilterLocation,
  key: string
) => {
  if (location === 'request') return (req as any)[key];

  return req[location][key];
};

export const formatReadFilter = (
  filterParams: Record<string, any>,
  filter: GetQueryFilter,
  req: Request
) => {
  const result: Filter = {};

  for (const [key, param] of Object.entries(filter)) {
    if (key === '$or') {
      const val = formatReadFilter(
        filterParams,
        param as Record<string, GetFilterParam>,
        req
      ) as Record<string, FilterParam>;

      result[key] = val;
    } else {
      let valueToUse: any;
      if (param.overrideValue) {
        if (typeof param.overrideValue === 'function') {
          valueToUse = param.overrideValue(req);
        } else {
          valueToUse = param.overrideValue;
        }
      } else if (!!param.location) {
        valueToUse = retrieveParamFromLocation(
          req,
          param.location as FilterLocation,
          key
        );
      } else {
        valueToUse = filterParams[key];
      }

      if (typeof valueToUse === 'undefined') {
        continue;
      }

      const valueFormatter = formatters[(param as GetFilterParam).value];
      result[key] = {
        operator: param.operator as FilterOps,
        value: valueFormatter(valueToUse)
      };
    }
  }

  return result;
};

// ── Filter Preset resolution (additive — existing functions above unchanged) ──

/**
 * A resolved leaf condition ready for knex: { field, operator, value }
 */
export interface ResolvedLeaf {
  field: string;
  operator: FilterOps;
  value: unknown;
}

/**
 * A single resolved node — either a leaf or an AND group
 */
// eslint-disable-next-line no-use-before-define
export type ResolvedNode = ResolvedLeaf | ResolvedAndGroup;

/**
 * A resolved AND group: all children must match
 */
export interface ResolvedAndGroup {
  $and: ResolvedNode[];
}

/**
 * The top-level resolved OR group produced by resolveFilterPreset.
 * Each element is one branch of the OR.
 */
export interface ResolvedOrGroup {
  $or: ResolvedNode[];
}

/**
 * Returns true if a FilterNode is an $and group.
 */
function isAndGroup(node: FilterNode): node is FilterAndGroup {
  return '$and' in node;
}

/**
 * Resolves a single FilterNode against the live Express request query.
 *
 * - For leaf conditions: if value === 'as-is', use overrideValue (call it if
 *   it is a function). Otherwise read the value from the query object using
 *   the same formatters as formatReadFilter.
 * - For $and groups: recursively resolve each child node.
 *
 * Returns null if any required query param is missing (for non-as-is values).
 */
export function resolveFilterNode(
  node: FilterNode,
  query: Record<string, unknown>
): ResolvedNode | null {
  if (isAndGroup(node)) {
    const resolvedChildren: ResolvedNode[] = [];
    for (const child of node.$and) {
      const resolved = resolveFilterNode(child, query);
      if (resolved === null) return null; // missing required param — whole AND fails
      resolvedChildren.push(resolved);
    }
    return { $and: resolvedChildren };
  }

  // Leaf condition — there should be exactly one field key
  const condition = node as FilterCondition;
  const entries = Object.entries(condition);
  if (entries.length === 0) return null;

  const [field, spec] = entries[0];

  let resolvedValue: unknown;

  if (spec.value === 'as-is') {
    // Use overrideValue directly (call if function)
    if (typeof spec.overrideValue === 'function') {
      resolvedValue = (spec.overrideValue as () => unknown)();
    } else {
      resolvedValue = spec.overrideValue;
    }
  } else {
    // Read from query; if missing, skip this node
    const rawValue = query[field];
    if (typeof rawValue === 'undefined') return null;
    const valueFormatter = formatters[spec.value as string];
    resolvedValue = valueFormatter ? valueFormatter(rawValue) : rawValue;
  }

  return { field, operator: spec.operator as FilterOps, value: resolvedValue };
}

/**
 * Given a preset name, the presets map, and the live query object, returns a
 * resolved $or array ready to be merged into the knex query, or null if no
 * preset name is provided.
 *
 * Throws HTTP 400 if the preset name is provided but does not exist in the map.
 */
export function resolveFilterPreset(
  presetName: string | undefined,
  presets: FilterPresets | undefined,
  query: Record<string, unknown>
): ResolvedOrGroup | null {
  if (!presetName) return null;

  if (!presets || !(presetName in presets)) {
    throw new HttpError(`Unknown filter preset: "${presetName}"`, 400);
  }

  const preset = presets[presetName];
  const orBranches: ResolvedNode[] = [];

  for (const node of preset) {
    const resolved = resolveFilterNode(node, query);
    if (resolved !== null) {
      orBranches.push(resolved);
    }
  }

  if (orBranches.length === 0) return null;

  return { $or: orBranches };
}
