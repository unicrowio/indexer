# Unicrow Indexer 

## About

The indexer maintains an up-to-date record of all escrowed payments relevant for platforms integrating Unicrow. It does it by listening to events from Unicrow smart contracts and optionally filtering them by marketplace addresses.

Check out [Unicrow SDK Tutorial](https://github.com/unicrowio/sdk-tutorial) to learn how to query the indexed data.

## Prerequisites

Install [Docker](https://docs.docker.com/get-started/)

## Getting Started

### Configuration

#### Setting up the network (required)

Open one of the `*.env` files based on which environment you're deploying to, and for the network you want to use uncomment the following lines and update RPC_HOST 

```
# RPC_HOST=
# UNICROW_ADDRESS=
# UNICROW_DISPUTE_ADDRESS=
# UNICROW_ARBITRATOR_ADDRESS=
# UNICROW_CLAIM_ADDRESS=
```

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

<details><summary>Macbook</summary>
<p>

```
docker-compose --env-file _mac.env -f docker-compose.mac.yml up -d
```

</p>
</details>

<details><summary>Linux (Ubuntu)</summary>
<p>

```
docker-compose --env-file _linux.env -f docker-compose.linux.yml up -d
```

</p>
</details>

<details><summary>Windows WSL 2.0 (Ubuntu)</summary>
<p>

```
docker-compose --env-file _wsl.env -f docker-compose.wsl.yml up -d
```

</p>
</details>

### Verification:
* API running: [http://localhost:5555](http://localhost:5555)
* Hasura running: [http://localhost:8080](http://localhost:8080)

## Useful commands

<details><summary>Macbook users</summary>
<p>

1. List all containers running

```
docker ps
```

2. Stop all containers

```
docker-compose -f docker-compose.mac.yml down
```

3. Logs

```
docker-compose -f docker-compose.mac.yml logs
```

4. Clean up all

```
docker-compose -f docker-compose.mac.yml down && docker rmi $(docker images -q) && docker volume rm $(docker volume ls -q)
```

or:

```
docker system prune -a --volumes
```

</p>
</details>

<details><summary>Linux (Ubuntu) users</summary>
<p>

1. List all containers running

```
docker ps
```

2. Stop all containers

```
docker-compose -f docker-compose.linux.yml down
```

3. Logs

```
docker-compose -f docker-compose.linux.yml logs
```

4. Clean up all

```
docker-compose -f docker-compose.linux.yml down && docker rmi $(docker images -q) && docker volume rm $(docker volume ls -q)
```

or:

```
docker system prune -a --volumes
```

</p>
</details>

<details><summary>Windows WSL 2.0 (Ubuntu) users</summary>
<p>

1. List all containers running

```
docker ps
```

2. Stop all container

```
docker-compose -f docker-compose.wsl.yml down
```

3. Logs

```
docker-compose -f docker-compose.wsl.yml logs
```

4. Clean up all

```
docker-compose -f docker-compose.wsl.yml down && docker rmi $(docker images -q) && docker volume rm $(docker volume ls -q)
```

or:

```
docker system prune -a --volumes
```

</p>
</details>
