FROM node:18.19.0

COPY ./package.json /myfolder/
WORKDIR /myfolder/

RUN yarn install

COPY . /myfolder/

# 컨테이너가 종료되지 않도록 대기 상태 유지
CMD ["tail", "-f", "/dev/null"]
# CMD ["npm", "run", "start"]