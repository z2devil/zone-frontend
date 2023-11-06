FROM node:18.18.2-slim

WORKDIR /app

ADD . /app

RUN npm i -g pnpm \ 
&& pnpm i \
&& pnpm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
