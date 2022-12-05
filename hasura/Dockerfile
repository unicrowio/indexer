FROM node:14.17.0

WORKDIR /usr/api
COPY api ./

RUN npm i
RUN npm run build
RUN ls -la

EXPOSE 5000

CMD ["node", "build/index.js"]
