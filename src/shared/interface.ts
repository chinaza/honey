export interface FilterParam {
  value: string | number | boolean;
  operator:
    | '='
    | '!='
    | '<'
    | '<='
    | '>'
    | '>='
    | 'like'
    | 'not like'
    | 'inc'
    | 'dec'
    | 'replace';
}

export interface Filter {
  [key: string | '$or']: FilterParam | Record<string, FilterParam>;
}
