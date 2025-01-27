import { CommonInfo, IPageData, IPageParams } from '../types';

/************************************************
 * ✨ 实体
 ************************************************/

/**
 * 角色实体
 */
export interface RoleEntity extends CommonInfo {
  name: string;
}

/**
 * 角色信息
 */
export type RoleInfo = Pick<RoleEntity, '_id' | 'name'>;

/************************************************
 * ✨ API
 ************************************************/

export interface CreateRoleParams {
  name: string;
}

export interface PutRoleParams {
  _id: string;
  name: string;
}

export type GetRoleListParams = IPageParams;

export type GetRoleListResponse = IPageData<RoleInfo>;
