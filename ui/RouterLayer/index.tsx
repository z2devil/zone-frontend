'use client';

import { UserRole, putUserInfoAPI } from '@/lib/api/user';
import UserInfo from '@/ui/UserInfo';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import style from './style.module.scss';
import Button from '../Button';
import { NotificationType } from '../Notification/components/Notification';
import usePermission from '@/lib/hooks/usePermission';
import {
  useAuthStore,
  useModalUtilsStore,
  useNotificationUtilsStore,
  userRoleNameSelector,
} from '@/lib/stores';
import usePersistStoreHydration from '@/lib/hooks/usePersistStoreHydration';
import useRequest from '@/lib/hooks/useRequest';
import RouterLink from './components/RouterLink';
import { ROUTER } from '@/lib/constants/router';

interface NavLayerProps {
  show: boolean;
  onHide: () => void;
}

const NavLayer = (props: NavLayerProps) => {
  const { show, onHide } = props;

  const pathname = usePathname();

  const [request] = useRequest();

  const isLogin = usePermission([
    UserRole.LOGIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
  ]);

  const { utils: notificationUtils } = useNotificationUtilsStore();

  const { utils: modalUtils } = useModalUtilsStore();

  const handleBack = useCallback(() => {
    onHide();
  }, [onHide]);

  /************************************************
   * ✨ 用户信息
   ************************************************/

  const { userInfo, setUserInfo, setToken } = useAuthStore();

  const userRoleName = userRoleNameSelector(useAuthStore);

  const hydrated = usePersistStoreHydration(useAuthStore);

  const [isEditting, setIsEditting] = useState(false);

  const [form, setForm] = useState({
    nickname: '',
    avatarPath: '',
  });

  useEffect(() => {
    if (userInfo) {
      setForm({
        nickname: userInfo.nickname,
        avatarPath: userInfo.avatarPath,
      });
    }
  }, [userInfo, isEditting]);

  const handleSetting = useCallback(() => {
    setIsEditting(!isEditting);
  }, [isEditting]);

  const handleSave = useCallback(async () => {
    setIsEditting(false);
    try {
      const { token, info } = await putUserInfoAPI(request)({
        nickname: form.nickname,
        avatarPath: form.avatarPath,
      });
      setUserInfo(info);
      setToken(token);
      notificationUtils?.open({
        type: NotificationType.SUCCESS,
        content: '保存成功',
        duration: 3,
      });
      setIsEditting(false);
    } catch (error) {
      console.log(error);
    }
  }, [
    request,
    form.nickname,
    form.avatarPath,
    setUserInfo,
    setToken,
    notificationUtils,
  ]);

  /************************************************
   * ✨ 退出登录
   ************************************************/

  const handleLogout = useCallback(() => {
    const uuid = modalUtils?.open({
      title: '退出登录',
      children: '确定退出登录吗？',
      okText: '确定',
      onOk: () => {
        modalUtils?.close(uuid);
        setUserInfo(null);
        setToken(null);
        notificationUtils?.open({
          type: NotificationType.SUCCESS,
          content: '退出成功',
          duration: 3,
        });
        handleBack();
      },
      cancelText: '取消',
      onCancel: () => {
        modalUtils?.close(uuid);
      },
    });
  }, [modalUtils, setUserInfo, setToken, notificationUtils, handleBack]);

  return (
    <div
      className={clsx('fixed left-0 top-0 z-20 flex h-full w-full flex-col', {
        'pointer-events-none': !show,
      })}>
      {/* mask */}
      <div
        className={clsx(
          'absolute left-0 top-0 h-full w-full bg-black-100 duration-500 max-sm:bg-white max-sm:bg-opacity-20 max-sm:backdrop-blur-3xl',
          show ? '' : 'pointer-events-none opacity-0 delay-200'
        )}
        onClick={handleBack}></div>
      {/* modal */}
      <div
        className={clsx(
          'absolute left-0 right-0 top-1/2 flex w-full flex-col items-center justify-between transition-all duration-300 sm:mx-auto sm:w-[480px] sm:rounded-2xl sm:bg-gray-100 sm:shadow-2xl',
          show ? 'delay-200' : 'pointer-events-none opacity-0',
          show ? style.modalShow : style.modalHide
        )}>
        <div className='flex w-full items-center justify-between p-6 sm:rounded-t-2xl sm:border-b sm:border-black-80 sm:bg-white'>
          {hydrated ? (
            <UserInfo
              avatarPath={userInfo?.avatarPath}
              nickname={userInfo?.nickname}
              roleName={userRoleName}
            />
          ) : null}
          {isLogin ? (
            <div className='flex items-center gap-2'>
              <button
                className='group p-2'
                title='编辑信息'
                onClick={handleSetting}>
                <i className='iconfont icon-setting-filled text-2xl text-black-600 transition-colors duration-100 group-hover:text-black-900'></i>
              </button>
              <button
                className='group p-2'
                title='退出登录'
                onClick={handleLogout}>
                <i className='iconfont icon-signout-filled text-2xl text-black-600 transition-colors duration-100 group-hover:text-black-900'></i>
              </button>
            </div>
          ) : null}
        </div>
        {isEditting ? (
          <div className='flex w-full flex-col gap-7 pb-8 pt-6'>
            {/* user info */}
            <div className='flex flex-col gap-6 px-8'>
              <div className='flex flex-col gap-1'>
                <label className='text-15 text-black-600'>昵称</label>
                <input
                  className='h-10 w-full rounded-md border border-gray-200 px-3 focus:border-primary-50 focus:outline-none'
                  type='text'
                  value={form.nickname}
                  onChange={e => setForm({ ...form, nickname: e.target.value })}
                />
              </div>
              <div className='flex w-full justify-center gap-5'>
                <Button
                  className='relative flex h-11 flex-grow items-center justify-center rounded-xl border border-black-80 text-17 text-black-600 hover:text-black-900 active:border-primary-50'
                  onClick={handleSetting}>
                  取消
                </Button>
                <Button
                  className='relative flex h-11 flex-shrink-0 items-center justify-center rounded-xl border border-black-80 bg-primary-50 px-6 text-17 text-white hover:bg-primary-100'
                  onClick={handleSave}>
                  保存
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className='flex w-full flex-col gap-7 py-6'>
            {/* router list */}
            {ROUTER.map(item => {
              return (
                <div key={item.path} onClick={onHide}>
                  <RouterLink {...item} active={pathname === item.path} />
                </div>
              );
            })}
          </div>
        )}
        {/* back button */}
        <div
          className='group absolute bottom-0 flex h-12 w-12 flex-shrink-0 translate-y-24 cursor-pointer items-center justify-center rounded-full bg-white px-5 transition-colors duration-100 hover:bg-primary-50 sm:shadow-2xl'
          onClick={handleBack}>
          <i className='iconfont icon-error text-2xl text-black-600 transition-colors duration-100 group-hover:text-white'></i>
        </div>
      </div>
    </div>
  );
};

export default NavLayer;
