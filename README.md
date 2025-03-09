# Unicrow Indexer 

## About

The indexer keeps an up-to-date record of all escrowed payments relevant to platforms integrating Unicrow. It does it by listening to events from Unicrow smart contracts and optionally filtering them by marketplace addresses.

The indexer supports all the chains that Unicrow is deployed at, currently Arbitrum and Base and their Sepolia testnets. You can enable or disable indexing from the networks in the configuration file (see below).

Check out [Unicrow SDK Tutorial](https://github.com/unicrowio/sdk-tutorial) to learn how to query the indexed data.

## Getting Started

### Configuration

Create a copy of the example file `.env.example` named `.env` and fill it out according to your setup and preferences. It is recommended to disable indexing of chains you don't plan to use and also to set starting block number to when you are launching your platform in order to not index past history that you're not interested in.

### Database

Unicrow's contracts are intentionally immutable. This also means that migrating to a new set of contracts (i.e. a new version) requires a completely fresh restart of the indexer and its database.

It is then critical for you to:

- Recreate or empty the database
- Configure the new contracts addresses in the `.env` file (we'll keep `.env.example` up to date with the latest addresses of every supported chain)
- Configure the new indexing starting block (see below)

**Important: failing to clean or reconfigure the environment properly could result in inconsistent, unpredictable data.**

### Build and run a full local environment using Docker Compose

```
docker compose up -d
```

### Verification:
* API running: [http://localhost:5555](http://localhost:5555)
* Hasura running: [http://localhost:8080](http://localhost:8080)

## Useful commands

<details><summary>Docker</summary>
<p>

1. List all containers running

```
docker ps
```

2. Stop all containers

```
docker compose down
```

3. Logs

```
docker compose logs
```

4. Clean up all

```
docker compose down && docker rmi $(docker images -q) && docker volume rm $(docker volume ls -q)
```

or:

```
docker system prune -a --volumes
```

</p>
</details>

## 🚢 Deploy using Heroku CLI

1. Set remote: `heroku git:remote -a <app_name>`
2. Push a new commit/deploy: `git push heroku <branch>:master`
