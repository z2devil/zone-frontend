'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/ui/components/ui/sidebar';
import { Contact, KeyRound, SlidersHorizontal, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAVIGATIONS = [
  {
    name: '用户',
    icon: User,
    path: '/manage/user',
  },
  {
    name: '角色',
    icon: Contact,
    path: '/manage/role',
  },
  {
    name: '权限',
    icon: KeyRound,
    path: '/manage/permission',
  },
];

const Manage = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <div
      className='relative mx-auto flex w-full gap-8 overflow-hidden'
      style={{
        height: 'calc(100vh - 3.625rem)',
      }}>
      <SidebarProvider
        className='h-full min-h-0'
        style={
          {
            '--sidebar-width': '19rem',
          } as React.CSSProperties
        }>
        <Sidebar className='flex' collapsible='none'>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size='lg'>
                  <div className='cursor-default'>
                    <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                      <SlidersHorizontal className='size-4' />
                    </div>
                    <div className='flex flex-col gap-0.5 leading-none'>
                      <span className='font-semibold'>后台管理</span>
                    </div>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAVIGATIONS.map(item => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        className='pl-3'
                        isActive={item.path === pathname}>
                        <Link href={item.path}>
                          <item.icon className='size-4' />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className='min-h-0 overflow-auto'>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default Manage;
