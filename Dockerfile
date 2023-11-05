FROM node:18.18.2

WORKDIR /app

ADD . /app

RUN npm config set registry https://registry.npm.taobao.org \
&& npm i -g pnpm \ 
&& pnpm i \
&& pnpm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
