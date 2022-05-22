export interface FilterParam {
  value: string | number | boolean;
  operator: '=' | '!=' | '<' | '<=' | '>' | '>=' | 'like' | 'not like';
}

export interface Filter {
  [key: string | '$or']: FilterParam | Record<string, FilterParam>;
}
