export interface IUser {
  name: string;
  avatarUrl: string;
  lv: UserRole;
}

export enum UserRole {
  LOGIN = 1,
  ADMIN,
  MASTER,
}

const getUserInfo = async () => {
  return new Promise<IUser>((resolve, reject) => {
    setTimeout(() => {
      resolve(
        Math.random() > 0.5
          ? {
              name: '中二Devil',
              avatarUrl:
                'https://z2devil-bucket.oss-cn-beijing.aliyuncs.com/blog/image/9f37aa07-eef2-4822-af27-1d0e9f2bf54d.png?x-oss-process=image/resize,s_120',
              lv: UserRole.LOGIN,
            }
          : {
              name: '哈士奇',
              avatarUrl:
                'https://z2devil-bucket.oss-cn-beijing.aliyuncs.com/blog/image/9f37aa07-eef2-4822-af27-1d0e9f2bf54d.png?x-oss-process=image/resize,s_120',
              lv: UserRole.ADMIN,
            }
      );
    }, 1000);
  });
};

export { getUserInfo };
