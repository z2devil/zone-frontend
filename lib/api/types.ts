export interface IPageParams {
  current: number;
  size: number;
}

export interface IPageData<T> {
  total: number;
  list: T[];
}

export interface CommonInfo {
  _id: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}
