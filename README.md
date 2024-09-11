# Unicrow Indexer 

## About

The indexer keeps an up-to-date record of all escrowed payments relevant to platforms integrating Unicrow. It does it by listening to events from Unicrow smart contracts and optionally filtering them by marketplace addresses.

Check out [Unicrow SDK Tutorial](https://github.com/unicrowio/sdk-tutorial) to learn how to query the indexed data.

## Getting Started

### Configuration

Create and fill an `.env` file (see `.env.example`).

### Database

Unicrow's contracts are intentionally immutable. This also means that migrating to a new set of contracts (i.e. a new version) requires a completely fresh restart of the indexer and its database.

It is then critical for you to:

- Recreate or empty the database
- Configure the new contracts addresses in the `.env` file (we'll keep `.env.example` up to date with the latest addresses of every supported chain)
- Configure the new indexing starting block (see below)

**Important: failing to clean or reconfigure the environment properly could result in inconsistent, unpredictable data.**

#### Setting the Marketplace addresses

Open `hasura/migrations/default/1641864689790_squashed/up.sql`

Replace `*` with your marketplace's address. To add multiple addresses, duplicate the line.

```
INSERT INTO marketplace (address) VALUES ('*');
```

#### Setting the initial block number

In the same file as above, replace `0` with the block number where indexing should start (e.g. a block before the first contract of the set was deployed).

```
INSERT INTO last_block_number (block_number) VALUES (0);
```

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
