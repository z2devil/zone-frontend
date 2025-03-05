interface RouterConfig {
  name: string;
  path: string;
  icon: string;
}

export const ROUTER: RouterConfig[] = [
  {
    name: '笔记',
    path: '/note',
    icon: 'icon-note',
  },
  {
    name: '关于',
    path: '/about',
    icon: 'icon-about',
  },
];
