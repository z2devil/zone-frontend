export interface IPageParams {
  current: number;
  size: number;
}

export interface IPageData<T> {
  total: number;
  list: T[];
}
