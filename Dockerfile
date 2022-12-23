FROM node:16.14.2

WORKDIR /usr/api
COPY ["src", "./src"]
COPY ["heroku.sh", "package.json", "yarn.lock", "tsconfig.json", "tsup.config.ts", "ecosystem.config.js", "./"]

# ENV NPM_TOKEN="REPLACE BY YOUR NPM AUTH_TOKEN (type on terminal: cat ~/.npmrc)"
ENV NPM_TOKEN=

RUN npm install -g yarn --force
RUN yarn run heroku-prebuild
RUN yarn install
RUN yarn run build


RUN ls -la

EXPOSE 5000

CMD ["node", "build/index.js"]
