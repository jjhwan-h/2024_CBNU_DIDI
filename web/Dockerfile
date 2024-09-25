FROM node:18.19.0

COPY ./package.json /myfolder/
WORKDIR /myfolder/

RUN yarn install

COPY . /myfolder/

CMD npm run start