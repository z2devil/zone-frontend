FROM node:18.18.2-slim

WORKDIR /app

ADD . /app

RUN npm install \
&& npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
