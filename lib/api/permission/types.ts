import { CommonInfo, IPageData, IPageParams } from '../types';

/************************************************
 * ✨ 实体
 ************************************************/

/**
 * 权限实体
 */
export interface PermissionEntity extends CommonInfo {
  name: string;
  description: string;
}

/**
 * 权限信息
 */
export type PermissionInfo = Pick<
  PermissionEntity,
  '_id' | 'name' | 'description'
>;

/************************************************
 * ✨ API
 ************************************************/

export interface CreatePermissionParams {
  name: string;
  description?: string;
}

export interface PutPermissionParams {
  _id: string;
  name: string;
  description?: string;
}

export type GetPermissionListParams = IPageParams;

export type GetPermissionListResponse = IPageData<PermissionInfo>;
