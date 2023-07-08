export interface IRoute {
  iconSrc: string;
  text: string;
  routePath: string;
}

const getRoutes = async () => {
  return new Promise<IRoute[]>((resolve, reject) => {
    setTimeout(() => {
      resolve([
        {
          iconSrc: '/icon/note.svg',
          text: '笔记',
          routePath: '/note',
        },
        {
          iconSrc: '/icon/works.svg',
          text: '作品',
          routePath: '/works',
        },
        {
          iconSrc: '/icon/about.svg',
          text: '关于',
          routePath: '/about',
        },
        {
          iconSrc: '/icon/message.svg',
          text: '消息',
          routePath: '/message',
        },
      ]);
    }, 1000);
  });
};

export { getRoutes };
