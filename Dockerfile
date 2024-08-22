FROM node:18

COPY ./ /myfolder/
WORKDIR /myfolder/

#RUN mkdir myfolder

CMD npm run start