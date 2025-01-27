'use client';

import {
  getPermissionListAPI,
  PermissionInfo,
  createPermissionAPI,
  putPermissionInfoAPI,
  removePermissionAPI,
} from '@/lib/api/permission';
import useRequest from '@/lib/hooks/useRequest';
import { useModalUtilsStore, useNotificationUtilsStore } from '@/lib/stores';
import { notFound } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
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

const PermissionPage = () => {
  const [request] = useRequest();

  const { utils: modalUtils } = useModalUtilsStore();

  const { utils: notificationUtils } = useNotificationUtilsStore();

  const [permissionList, setPermissionList] = useState<PermissionInfo[]>([]);

  /************************************************
   * ✨ 初始化
   ************************************************/

  const init = useCallback(async () => {
    try {
      const res = await getPermissionListAPI(request)({
        current: 1,
        size: 20,
      });
      console.log('[ res ]', res);
      setPermissionList(res.list);
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
    description: '',
  });

  const handleInputChange = useCallback(
    (e: FormEvent<HTMLInputElement>, field: string) => {
      (addFormData.current as any)[field] = e.currentTarget.value;
    },
    []
  );

  const validateForm = useCallback(() => {
    if (!addFormData.current.name.trim()) {
      notificationUtils?.open({
        type: NotificationType.WARNING,
        content: '名称不能为空',
        duration: 3,
      });
      return false;
    }
    return true;
  }, [notificationUtils]);

  const handleAdd = useCallback(async () => {
    const uuid = modalUtils?.open({
      title: '添加权限',
      children: () => (
        <div className='flex flex-col gap-3 p-6'>
          <div className='flex w-full flex-col gap-2'>
            <Label className='pl-1' htmlFor='name'>
              名称
            </Label>
            <Input
              placeholder='名称'
              type='text'
              onChange={e => handleInputChange(e, 'name')}
            />
          </div>
          <div className='flex w-full flex-col gap-2'>
            <Label className='pl-1' htmlFor='description'>
              描述
            </Label>
            <Input
              placeholder='描述'
              type='text'
              onChange={e => handleInputChange(e, 'description')}
            />
          </div>
        </div>
      ),
      okText: '保存',
      onOk: async () => {
        if (!validateForm()) return;
        try {
          const params = {
            name: addFormData.current.name.trim(),
            description: addFormData.current.description.trim(),
          };
          await createPermissionAPI(request)(params);
          notificationUtils?.open({
            type: NotificationType.SUCCESS,
            content: '添加成功',
            duration: 3,
          });
          init();
        } catch (error) {
          notificationUtils?.open({
            type: NotificationType.ERROR,
            content: '添加失败',
            duration: 3,
          });
        } finally {
          modalUtils.close(uuid);
          addFormData.current = {
            name: '',
            description: '',
          };
        }
      },
      cancelText: '取消',
      onCancel: () => {
        modalUtils.close(uuid);
        addFormData.current = {
          name: '',
          description: '',
        };
      },
    });
  }, [
    modalUtils,
    handleInputChange,
    validateForm,
    request,
    notificationUtils,
    init,
  ]);

  /************************************************
   * ✨ 编辑
   ************************************************/

  const editFormData = useRef({
    _id: '',
    name: '',
    description: '',
  });

  const handleSetting = useCallback(
    (permissionInfo: PermissionInfo) => {
      // 初始化编辑表单数据
      editFormData.current = {
        _id: permissionInfo._id,
        name: permissionInfo.name,
        description: permissionInfo.description,
      };
      const uuid = modalUtils?.open({
        title: '编辑权限',
        children: () => (
          <div className='flex flex-col gap-3 p-6'>
            <div className='flex w-full flex-col gap-2'>
              <Label className='pl-1' htmlFor='name'>
                名称
              </Label>
              <Input
                defaultValue={permissionInfo.name}
                onChange={e => (editFormData.current.name = e.target.value)}
              />
            </div>
            <div className='flex w-full flex-col gap-2'>
              <Label className='pl-1' htmlFor='description'>
                描述
              </Label>
              <Input
                defaultValue={permissionInfo.description}
                onChange={e =>
                  (editFormData.current.description = e.target.value)
                }
              />
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
            await putPermissionInfoAPI(request)({
              _id: editFormData.current._id,
              name: editFormData.current.name.trim(),
              description: editFormData.current.description.trim(),
            });
            notificationUtils?.open({
              type: NotificationType.SUCCESS,
              content: '更新成功',
              duration: 3,
            });
            init();
          } catch (error) {
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
    async (permissionInfo: PermissionInfo) => {
      try {
        await removePermissionAPI(request)(permissionInfo._id);
        notificationUtils?.open({
          type: NotificationType.SUCCESS,
          content: '删除成功',
          duration: 3,
        });
        init();
      } catch (error) {
        notificationUtils?.open({
          type: NotificationType.ERROR,
          content: '删除失败',
          duration: 3,
        });
      }
    },
    [request, init, notificationUtils]
  );

  const confirmRemove = useCallback(
    (permissionInfo: PermissionInfo) => {
      const uuid = modalUtils?.open({
        title: '删除确认',
        children: '确定删除该权限？',
        okText: '确定',
        onOk: () => {
          handleRemove(permissionInfo);
          modalUtils.close(uuid);
        },
        cancelText: '取消',
        onCancel: () => {
          modalUtils.close(uuid);
        },
      });
    },
    [modalUtils, handleRemove]
  );

  return (
    <div className='flex flex-1 flex-col gap-4 p-4'>
      <div className='flex flex-1 flex-col gap-4'>
        <div className=''>
          <Button size='sm' onClick={handleAdd}>
            添加权限
          </Button>
        </div>
        <p className='text-sm text-gray-500'>
          格式为：{`<实体>::<操作>::<范围>`}，例如：user::create::owner。其中：
          操作值为 all 表示包括所有操作。 范围值为 owner 表示仅限自己的数据，all
          表示所有数据。 需要注意的是，拥有 all 权限的用户同时具备 owner
          范围的权限。
        </p>
        <div className='flex-1 rounded-md ring-1 ring-black-50'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className=''>名称</TableHead>
                <TableHead className=''>描述</TableHead>
                <TableHead className='pr-7 text-right'>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className='border-b border-black-100'>
              {permissionList.map(permissionInfo => (
                <TableRow key={permissionInfo._id}>
                  <TableCell className='font-bold'>
                    {permissionInfo.name}
                  </TableCell>
                  <TableCell className='font-bold'>
                    {permissionInfo.description}
                  </TableCell>
                  <TableCell className='flex justify-end gap-2'>
                    <Button
                      size='sm'
                      onClick={() => handleSetting(permissionInfo)}>
                      编辑
                    </Button>
                    <Button
                      size='sm'
                      variant='destructive'
                      onClick={() => confirmRemove(permissionInfo)}>
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

export default PermissionPage;
