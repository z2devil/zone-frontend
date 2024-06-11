FROM node:21.2.0

WORKDIR /app

ADD . /app

RUN npm install \
&& npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
