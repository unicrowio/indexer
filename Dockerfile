FROM node:22

WORKDIR /usr/api
COPY ["src", "./src"]
COPY ["package.json", "yarn.lock", "tsconfig.json", "tsup.config.ts", "ecosystem.config.js", "./"]


RUN npm install -g yarn --force
RUN yarn install
RUN yarn run build


RUN ls -la

EXPOSE 5555

CMD ["node", "build/index.js"]
