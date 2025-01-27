'use client';

import {
  getRoleListAPI,
  RoleInfo,
  createRoleAPI,
  putRoleInfoAPI,
  removeRoleAPI,
  getRolePermissionListAPI,
  putRolePermissionAPI,
} from '@/lib/api/role';
import useRequest from '@/lib/hooks/useRequest';
import { useModalUtilsStore, useNotificationUtilsStore } from '@/lib/stores';
import { notFound, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
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
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import { NotificationType } from '@/ui/Notification/components/Notification';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/ui/components/ui/collapsible';
import { ChevronsUpDownIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/ui/select';
import { getPermissionListAPI, PermissionInfo } from '@/lib/api/permission';

const RolePage = () => {
  const [request] = useRequest();

  const { utils: modalUtils } = useModalUtilsStore();

  const { utils: notificationUtils } = useNotificationUtilsStore();

  const [roleList, setRoleList] = useState<RoleInfo[]>([]);

  const [permissions, setPermissions] = useState<PermissionInfo[]>([]);

  const [currentRolePermissions, setCurrentRolePermissions] = useState<
    string[]
  >([]);

  const fetchRolePermissions = useCallback(
    async (roleId: string) => {
      try {
        const res = await getRolePermissionListAPI(request)(roleId);
        setCurrentRolePermissions(res || []);
      } catch {
        // handle error
      }
    },
    [request]
  );

  const updateRolePermissions = useCallback(
    async (roleId: string, permissionIds: string[]) => {
      try {
        await putRolePermissionAPI(request)({ roleId, permissionIds });
        // handle success
      } catch {
        // handle error
      }
    },
    [request]
  );

  /************************************************
   * ✨ 初始化
   ************************************************/

  const init = useCallback(async () => {
    try {
      const res = await getRoleListAPI(request)({
        current: 1,
        size: 20,
      });
      console.log('[ res ]', res);
      setRoleList(res.list);
      // 获取所有权限列表
      const permissionsRes = await getPermissionListAPI(request)({
        current: 1,
        size: 20,
      });
      setPermissions(permissionsRes.list);
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

  const addFormData = useRef({
    name: '',
  });

  const handleAdd = useCallback(() => {
    const uuid = modalUtils?.open({
      title: '添加角色',
      children: () => (
        <div className='flex flex-col gap-3 p-6'>
          <div className='flex w-full flex-col gap-2'>
            <Label className='pl-1' htmlFor='name'>
              名称
            </Label>
            <Input
              placeholder='名称'
              onChange={e => (addFormData.current.name = e.target.value)}
            />
          </div>
          <div className='flex w-full flex-col gap-2'>
            <Label className='pl-1'>权限</Label>
            <Select>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='选择权限' />
              </SelectTrigger>
              <SelectContent>
                {permissions.map(permission => (
                  <SelectItem key={permission._id} value={permission.name}>
                    <div className='flex flex-col gap-1'>
                      <span>{permission.name}</span>
                      <span className='text-xs text-black-400'>
                        {permission.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
      okText: '保存',
      onOk: async () => {
        if (!addFormData.current.name.trim()) {
          notificationUtils?.open({
            type: NotificationType.WARNING,
            content: '名称不能为空',
            duration: 3,
          });
          return;
        }
        try {
          const newRole = await createRoleAPI(request)({
            name: addFormData.current.name.trim(),
          });
          await updateRolePermissions(newRole._id, currentRolePermissions);
          notificationUtils?.open({
            type: NotificationType.SUCCESS,
            content: '添加成功',
            duration: 3,
          });
          init();
        } catch {
          notificationUtils?.open({
            type: NotificationType.ERROR,
            content: '添加失败',
            duration: 3,
          });
        } finally {
          modalUtils.close(uuid);
          addFormData.current = { name: '' };
          setCurrentRolePermissions([]);
        }
      },
      cancelText: '取消',
      onCancel: () => {
        modalUtils.close(uuid);
        addFormData.current = { name: '' };
        setCurrentRolePermissions([]);
      },
    });
  }, [
    modalUtils,
    permissions,
    notificationUtils,
    request,
    updateRolePermissions,
    currentRolePermissions,
    init,
  ]);

  /************************************************
   * ✨ 编辑
   ************************************************/

  const editFormData = useRef({
    _id: '',
    name: '',
  });

  const handleSetting = useCallback(
    (roleInfo: RoleInfo) => {
      editFormData.current = {
        _id: roleInfo._id,
        name: roleInfo.name,
      };
      fetchRolePermissions(roleInfo._id); // 初始化权限
      const uuid = modalUtils?.open({
        title: '编辑角色',
        children: () => (
          <div className='flex flex-col gap-3 p-6'>
            <div className='flex w-full flex-col gap-2'>
              <Label className='pl-1'>名称</Label>
              <Input
                defaultValue={roleInfo.name}
                onChange={e => (editFormData.current.name = e.target.value)}
              />
            </div>
            <div className='flex w-full flex-col gap-2'>
              <Label className='pl-1'>权限</Label>
              {/* <Select
                multiple
                value={currentRolePermissions}
                onChange={setCurrentRolePermissions}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='选择权限' />
                </SelectTrigger>
                <SelectContent>
                  {permissions.map(permission => (
                    <SelectItem key={permission} value={permission}>
                      {permission}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}
            </div>
          </div>
        ),
        okText: '保存',
        onOk: async () => {
          if (!editFormData.current.name.trim()) {
            notificationUtils?.open({
              type: NotificationType.WARNING,
              content: '名称不能为空',
              duration: 3,
            });
            return;
          }
          try {
            await putRoleInfoAPI(request)({
              _id: editFormData.current._id,
              name: editFormData.current.name.trim(),
            });
            await updateRolePermissions(
              editFormData.current._id,
              currentRolePermissions
            );
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
    [
      fetchRolePermissions,
      updateRolePermissions,
      init,
      modalUtils,
      notificationUtils,
      request,
      currentRolePermissions,
      permissions,
    ]
  );

  /************************************************
   * ✨ 删除
   ************************************************/

  const handleRemove = useCallback(
    async (roleInfo: RoleInfo) => {
      try {
        await removeRoleAPI(request)(roleInfo._id);
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
    (roleInfo: RoleInfo) => {
      const uuid = modalUtils?.open({
        title: '删除确认',
        children: '确定删除该角色？',
        okText: '确定',
        onOk: () => {
          handleRemove(roleInfo);
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
      <div className=''>
        <Button size='sm' onClick={handleAdd}>
          添加角色
        </Button>
      </div>
      <div className='flex-1 rounded-md ring-1 ring-black-50'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className=''>名称</TableHead>
              <TableHead className=''>权限</TableHead>
              <TableHead className='pr-7 text-right'>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='border-b border-black-100'>
            {roleList.map(roleInfo => (
              <TableRow key={roleInfo._id}>
                <TableCell className='flex font-bold'>
                  {roleInfo.name}
                </TableCell>
                <TableCell className='font-bold'>
                  <Collapsible className='w-[350px] space-y-2'>
                    <CollapsibleTrigger asChild>
                      <Button size='sm' variant='ghost'>
                        <ChevronsUpDownIcon className='h-4 w-4' />
                        <span>权限列表</span>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className='space-y-2'>
                      <div className='rounded-md border px-4 py-3 font-mono text-sm'>
                        @radix-ui/colors
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </TableCell>
                <TableCell className='flex justify-end gap-2'>
                  <Button size='sm' onClick={() => handleSetting(roleInfo)}>
                    编辑
                  </Button>
                  <Button
                    size='sm'
                    variant='destructive'
                    onClick={() => confirmRemove(roleInfo)}>
                    删除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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

export default RolePage;
