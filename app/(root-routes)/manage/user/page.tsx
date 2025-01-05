'use client';

import {
  getUserListAPI,
  createUserAPI,
  putUserAPI,
  removeUserAPI,
  UserInfo,
  UserRole,
} from '@/lib/api/user';
import usePermission from '@/lib/hooks/usePermission';
import useRequest from '@/lib/hooks/useRequest';
import {
  useContextMenuUtilsStore,
  useModalUtilsStore,
  useNotificationUtilsStore,
} from '@/lib/stores';
import { notFound, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Contact, KeyRound, User } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/ui/components/ui/pagination';
import { Button } from '@/ui/components/ui/button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/components/ui/form';
import { Input } from '@/ui/components/ui/input';
import { useForm } from 'react-hook-form';
import { Label } from '@/ui/components/ui/label';
import { NotificationType } from '@/ui/Notification/components/Notification';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/ui/select';

const UserPage = () => {
  const navigation = useRouter();

  const [request] = useRequest();

  const contextMenuUtils = useContextMenuUtilsStore(state => state.utils);

  const { utils: modalUtils } = useModalUtilsStore();

  const { utils: notificationUtils } = useNotificationUtilsStore();

  const isLogin = usePermission([
    UserRole.LOGIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
  ]);

  const isAdmin = usePermission([UserRole.ADMIN, UserRole.MANAGER]);

  const [userList, setUserList] = useState<UserInfo[]>([]);

  /************************************************
   * ✨ 初始化
   ************************************************/

  const init = useCallback(async () => {
    try {
      const res = await getUserListAPI(request)({
        current: 1,
        size: 20,
      });
      console.log('[ res ]', res);
      setUserList(res[0]);
    } catch (error) {
      return notFound();
    }
  }, [request]);

  useEffect(() => {
    init();
  }, [init]);

  /************************************************
   * ✨ 添加
   ************************************************/
  const addFormData = useRef({ email: '', nickname: '', role: '' });

  const handleAdd = useCallback(() => {
    const uuid = modalUtils?.open({
      title: '添加用户',
      children: () => (
        <div className='flex flex-col gap-3 p-6'>
          <div className='flex w-full flex-col gap-2'>
            <Label className='pl-1'>邮箱</Label>
            <Input
              placeholder='邮箱'
              type='email'
              onChange={e => (addFormData.current.email = e.target.value)}
            />
          </div>
          <div className='flex w-full flex-col gap-2'>
            <Label className='pl-1'>昵称</Label>
            <Input
              placeholder='名称'
              onChange={e => (addFormData.current.nickname = e.target.value)}
            />
          </div>
        </div>
      ),
      okText: '保存',
      onOk: async () => {
        if (!addFormData.current.email.trim()) {
          notificationUtils?.open({
            type: NotificationType.WARNING,
            content: '邮箱不能为空',
            duration: 3,
          });
          return;
        }
        if (!addFormData.current.nickname.trim()) {
          notificationUtils?.open({
            type: NotificationType.WARNING,
            content: '名称不能为空',
            duration: 3,
          });
          return;
        }
        try {
          await createUserAPI(request)({
            email: addFormData.current.email,
            nickname: addFormData.current.nickname,
            role: addFormData.current.role,
          });
          notificationUtils?.open({
            type: NotificationType.SUCCESS,
            content: '新增成功',
            duration: 3,
          });
          init();
        } catch {
          notificationUtils?.open({
            type: NotificationType.ERROR,
            content: '新增失败',
            duration: 3,
          });
        } finally {
          modalUtils.close(uuid);
          addFormData.current = { email: '', nickname: '', role: '' };
        }
      },
      cancelText: '取消',
      onCancel: () => {
        modalUtils.close(uuid);
        addFormData.current = { email: '', nickname: '', role: '' };
      },
    });
  }, [init, modalUtils, notificationUtils, request]);

  /************************************************
   * ✨ 编辑
   ************************************************/
  const editFormData = useRef({ _id: '', email: '', nickname: '', role: '' });

  const handleSetting = useCallback(
    (userInfo: UserInfo) => {
      editFormData.current = {
        _id: userInfo._id,
        email: userInfo.email,
        nickname: userInfo.nickname,
        role: '',
      };
      const uuid = modalUtils?.open({
        title: '编辑用户',
        children: () => (
          <div className='flex flex-col gap-3 p-6'>
            <div className='flex w-full flex-col gap-2'>
              <Label className='pl-1' htmlFor='nickname'>
                昵称
              </Label>
              <Input
                defaultValue={editFormData.current.nickname}
                onChange={e => (editFormData.current.nickname = e.target.value)}
              />
            </div>
            <div className='flex w-full flex-col gap-2'>
              <Label className='pl-1' htmlFor='description'>
                角色
              </Label>
              <Select>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select a role' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='admin'>Admin</SelectItem>
                  <SelectItem value='manager'>Manager</SelectItem>
                  <SelectItem value='user'>User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ),
        okText: '保存',
        onOk: async () => {
          // ...表单校验逻辑...
          try {
            await putUserAPI(request)({
              _id: editFormData.current._id,
              email: editFormData.current.email,
              nickname: editFormData.current.nickname,
              role: editFormData.current.role,
            });
            notificationUtils?.open({
              type: NotificationType.SUCCESS,
              content: '更新成功',
              duration: 3,
            });
            init();
          } catch {
            notificationUtils?.open({
              type: NotificationType.ERROR,
              content: '更新失败',
              duration: 3,
            });
          } finally {
            modalUtils.close(uuid);
          }
        },
        cancelText: '取消',
        onCancel: () => {
          modalUtils.close(uuid);
        },
      });
    },
    [init, modalUtils, notificationUtils, request]
  );

  /************************************************
   * ✨ 删除
   ************************************************/

  const handleRemove = useCallback(
    async (userInfo: UserInfo) => {
      try {
        await removeUserAPI(request)(userInfo._id);
        notificationUtils?.open({
          type: NotificationType.SUCCESS,
          content: '删除成功',
          duration: 3,
        });
        init();
      } catch {
        notificationUtils?.open({
          type: NotificationType.ERROR,
          content: '删除失败',
          duration: 3,
        });
      }
    },
    [init, notificationUtils, request]
  );

  const confirmRemove = useCallback(
    (userInfo: UserInfo) => {
      const uuid = modalUtils?.open({
        title: '删除确认',
        children: '确定删除该用户？',
        okText: '确定',
        onOk: () => {
          handleRemove(userInfo);
          modalUtils.close(uuid);
        },
        cancelText: '取消',
        onCancel: () => {
          modalUtils.close(uuid);
        },
      });
    },
    [handleRemove, modalUtils]
  );

  return (
    <div className='flex flex-1 flex-col gap-4 p-4'>
      <div className='flex flex-1 flex-col gap-4'>
        <div className=''>
          <Button size='sm' onClick={handleAdd}>
            添加用户
          </Button>
        </div>
        <div className='flex-1 rounded-md ring-1 ring-black-50'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className=''>昵称</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>等级</TableHead>
                <TableHead className='pr-7 text-right'>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className='border-b border-black-100'>
              {userList.map(userInfo => (
                <TableRow key={userInfo._id}>
                  <TableCell className='font-bold'>
                    {userInfo.nickname}
                  </TableCell>
                  <TableCell className=''>{userInfo.email}</TableCell>
                  <TableCell>{userInfo.lv}</TableCell>
                  <TableCell className='flex justify-end'>
                    <Button size='sm' onClick={() => handleSetting(userInfo)}>
                      编辑
                    </Button>
                    <Button
                      className='ml-2'
                      size='sm'
                      variant='destructive'
                      onClick={() => confirmRemove(userInfo)}>
                      删除
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className='flex-shrink-0'>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href='#' />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href='#'>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive href='#'>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href='#'>3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href='#' />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default UserPage;
