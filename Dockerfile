FROM node:21.2.0

WORKDIR /app

ADD . /app

RUN npm install -g pnpm \
&& pnpm install \
&& pnpm build

EXPOSE 3000

CMD ["npm", "run", "start"]
