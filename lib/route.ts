export interface IRoute {
  iconClass: string;
  text: string;
  routePath: string;
}

const getRoutes = async () => {
  return new Promise<IRoute[]>((resolve, reject) => {
    setTimeout(() => {
      resolve([
        {
          iconClass: 'icon-note',
          text: '笔记',
          routePath: '/note',
        },
        {
          iconClass: 'icon-works',
          text: '作品',
          routePath: '/works',
        },
        {
          iconClass: 'icon-about',
          text: '关于',
          routePath: '/about',
        },
        {
          iconClass: 'icon-message',
          text: '消息',
          routePath: '/message',
        },
      ]);
    }, 1000);
  });
};

export { getRoutes };
