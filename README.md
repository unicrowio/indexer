# Unicrow Indexer 

## About

The indexer maintains an up-to-date record of all escrowed payments relevant for platforms integrating Unicrow. It does it by listening to events from Unicrow smart contracts and optionally filtering them by marketplace addresses.

Check out [Unicrow SDK Tutorial](https://github.com/unicrowio/sdk-tutorial) to learn how to query the indexed data.

## Prerequisites

Install [Docker](https://docs.docker.com/get-started/)

## Getting Started

### Configuration

Create and fill an `.env` file (see `.env.example`).

#### Setting the Marketplace addresses

Open `hasura/migrations/default/1641864689790_squashed/up.sql`

Replace `*` with the address of your marketplace. To add more addresses, duplicate the line.

```
INSERT INTO marketplace (address) VALUES ('*');
```

#### Setting the initial block number

In the same file, replace `0` with the block number that matters for you (like when you start testing)

```
INSERT INTO last_block_number (block_number) VALUES (0);
```

You can get the latest block number at [Arbiscan](https://arbiscan.io/blocks)


### Running the Container

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
