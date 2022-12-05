# Backup README - Development

### About

After 5 seconds the `api` catch the events from the crow contract based on the lastEventStored to lastBlockNumberOnBlockchain, parse, and call the endpoint from `hasura` store it in their postgres database.

### Install Tools

Install [Docker](https://www.docker.com/get-started)

> Clone the project from github - [Link](git@github.com:popstand/crow-indexer.git)

### Basic Way To Go

> Steps for put the project running without efforts

Inside of the root of the project folder, rename the `.env.sample` to `.env` with these values:

```
PORT=5555
RPC_HOST=http://3.134.33.205:7545
UNICROW_ADDRESS=0x2a433e48c6F14C9f3A14Da237D6Da062fdc47D5c

## Ubuntu Users
# The Docker bridge IP can be found via ifconfig
HASURA_GRAPHQL_URL=http://172.17.0.1:8080/v1/graphql
CROW_INDEXER_HOST=http://172.17.0.1

## MacOS M1 and Windows Users
# HASURA_GRAPHQL_URL=http://host.docker.internal:8080/v1/graphql
# CROW_INDEXER_HOST=http://host.docker.internal

DATABASE_URL=postgres://postgres:postgrespassword@postgres:5432/postgres
POSTGRES_PASSWORD=postgrespassword
```

ps. it can be changed any time.

Go to the terminal, inside of the root folder of the project run the command bellow:

/Users/my-user/developer/projects/crow-indexer »

```
docker-compose up -d
```

> Great, everything should works!

In the terminal you can run the command bellow, it should display all the services running!

```
docker ps

CONTAINER ID   IMAGE                                                        COMMAND                  CREATED          STATUS          PORTS                              NAMES
f346932bd5a9   escrow                                                       "docker-entrypoint.s…"   17 minutes ago   Up 17 minutes   5000/tcp, 0.0.0.0:5555->5555/tcp   crow-indexer-api
d02ecf83bc10   fedormelexin/graphql-engine-arm64:latest.cli-migrations-v3   "docker-entrypoint.s…"   17 minutes ago   Up 17 minutes   0.0.0.0:8080->8080/tcp             crow-indexer_graphql-engine_1
7bef13d2498a   postgres:12                                                  "docker-entrypoint.s…"   17 minutes ago   Up 17 minutes   0.0.0.0:5432->5432/tcp             crow-indexer_postgres_1
```

To make sure the `api` is running you can go to web browser with the address:

```
http://localhost:5555
```

You should see the message: `status -> running`

And you can see the hasura working, typing in the browser:

```
http://localhost:8080/
```

You don't need change nothing, the events should be inside of the [table](http://localhost:8080/console/data/default/schema/public/tables/events/browse)

You can go to the Front End App and start use it! 🚀

### Tips

You can stop the containers:

```
docker-compose down
```

You can restart or stop some container by PID.

```
docker ps -a
```

Will display the containers, then you can type `docker start PID` or `docker stop PID`

Restart using the PID (Container ID):

```
docker start 10d9a00aaff4
docker start 67f4fab0da19
docker start 368dff99855f
```

image from hasura:
in the line 13 of the docker-compose.yml, we are using this image for Linux users:

```
image: hasura/graphql-engine:v2.0.4.cli-migrations-v3
```

If you are facing some issue with Macbook M1, try to replace for this one:

```
image: fedormelexin/graphql-engine-arm64:latest.cli-migrations-v3
```

ps. You can ignore the label Error Api that can appear in the console when running the `docker-compose up -d` script.

### Structure

```
>
.
├── DEPLOYMENT.md # How to run this project in some host provider like AWS.
├── Dockerfile # Docker file for build node.js image with the api
├── Procfile
├── README.md
├── api # Node.js App that listen, parse and call the hasura to store data after TIME=5 seconds.
│   ├── build # build file it should be generated automatically after run yarn build or npm run build
│   ├── node_modules # folder generated after yarn or npm i, all dependencies is declared in the package.json
│   ├── package.json
│   ├── src # Main folder from the code
│   ├── tsconfig.json # Typescript settings
│   ├── tsup.config.ts # file to with description how to build the app
│   └── yarn.lock
├── docker-compose.yml # docker file to orchestrate the 3 services: api, postgres and graphql-engine from hasura
├── hasura # Folder dedicated to setup the hasura
│   ├── config.yaml
│   ├── metadata # contain all meta information related the setup of the hasura and postgres, like conection etc.
│   ├── migrations # contain the SQL migration files to create tables, views and functions on postgres database
│   └── seeds
├── heroku.yml - ignore it for now
└── package.json # required from heroku and maybe others host providers
```

> crow-indexer/api/src

```
.
├── app.ts
├── batch
│   └── storeEvents.ts
├── config
│   └── contract.ts
├── contractTypes
│   ├── README.md
│   └── ethers-contracts
├── env.ts
├── graphql
│   ├── connection.ts
│   ├── functions.ts
│   ├── mutations.ts
│   └── queries.ts
├── index.ts
├── infra
│   └── logger.ts
├── listeners
│   ├── callbacks.ts
│   ├── enums.ts
│   └── eventNames.ts
├── parseClaim.ts
└── parser.ts
```

## Advanced Setup - Only for Devs from the project

Inside of `hasura/config.yaml` and `hasura/metadata/databases/databases.yaml` you should replace for `production` and `dev` for the values indicated. By default is dev, so you must change these value for production.

### Developers - Maitainers:

Download the [Hasura CLI](https://hasura.io/docs/latest/graphql/core/hasura-cli/install-hasura-cli.html#install-hasura-cli) to run migrations and metadata scripts when necessary

run Hasura and Postgres:

```
docker-compose up -d postgres graphql-engine
```

Rename `.env.sample` to `.env` and fill the envs:

## it can be changed any time.

```
PORT=5555
RPC_HOST=http://3.134.33.205:7545
UNICROW_ADDRESS=0x2a433e48c6F14C9f3A14Da237D6Da062fdc47D5c
HASURA_GRAPHQL_URL=http://host.docker.internal:8080/v1/graphql
CROW_INDEXER_HOST=http://host.docker.internal
DATABASE_URL=postgres://postgres:postgrespassword@postgres:5432/postgres
POSTGRES_PASSWORD=postgrespassword
```

Install dependencies of the `api` folder and run the project in development mode.

```
cd api && yarn && yarn dev
```

> 🚀 server running at http://localhost:5555 💻
> ⌗ Graphql running at http://localhost:8080/console 💻

### Logs

You can watch the logs with this command:

```
docker-compose logs -f
```

### Restarting containers

run docker ps to see all containers

```
docker ps -a
```

Result:

```
~/Developer/popstand/crow-indexer(docker*) » docker ps -a
CONTAINER ID   IMAGE                                                        COMMAND                  CREATED          STATUS          PORTS                              NAMES
10d9a00aaff4   escrow                                                       "docker-entrypoint.s…"   25 minutes ago   Up 25 minutes   5000/tcp, 0.0.0.0:5555->5555/tcp   crow-indexer_api_1
67f4fab0da19   fedormelexin/graphql-engine-arm64:latest.cli-migrations-v3   "docker-entrypoint.s…"   25 minutes ago   Up 25 minutes   0.0.0.0:8080->8080/tcp             crow-indexer_graphql-engine_1
368dff99855f   postgres:12                                                  "docker-entrypoint.s…"   25 minutes ago   Up 25 minutes   0.0.0.0:5432->5432/tcp             crow-indexer_postgres_1

```

Restart using the PID (Container ID):

```
docker start 10d9a00aaff4
docker start 67f4fab0da19
docker start 368dff99855f
```

### Kill Containers

```
docker-compose down
```

it will stop and remove containers

### Remove Image, Container and Volumes

☢️ 🚨 - These commands are irreversive and will remove all volumens, imagens and containers! Do it only with you are working with this project.

```
docker-compose down && docker rmi $(docker images -q) && docker volume rm $(docker volume ls -q)
```

These way you will clean-up your machine, then you can run again or only save storage in your Hard Disk.

### Endpoints

```
/ - run the job (it's no mandatory)
/status - Status server
```
