# Crow Indexer

## 💻 About

The indexer listens to and optionally filters events from Unicrow smart contracts and maintains an up-to-date record of all escrowed payments relevant for the developer. 

Check out [Unicrow SDK Tutorial](https://github.com/unicrowio/sdk-tutorial) to learn how to query the indexed data.

## 🛠 Prerequisites

Install [Docker](https://docs.docker.com/get-started/)


## 🚀 Getting Started

### Configuration

### Setting the Marketplace addresses

Go to the (up.sql)[hasura/migrations/default/1641864689790_squashed/up.sql] file and change it as you need.

- replace the * with the address of your marketplace, you can duplicate this `INSERT` statement for adding more marketplace addresses.

ps. if you keep the '*' you will not filter, and then, you will store all events from the blockchain, even if it does not belong to your marketplace.

```
INSERT INTO marketplace (address) VALUES ('*');
```

### Setting the initial block number

-  replace the 0 with the genesis block number that matters for you (like when the unicrow contract was deployed)

```
INSERT INTO last_block_number (block_number) VALUES (0);
```


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

## ⌨️ Useful commands

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
