# Crow Indexer

## 💻 About

The indexer listens to and optionally filters events from Unicrow smart contracts and maintains an up-to-date record of all escrowed payments relevant for the developer. 

Check out [Unicrow SDK Tutorial](https://github.com/unicrowio/sdk-tutorial) to learn how to query the indexed data.

## 🛠 Prerequisites

Install [Docker](https://docs.docker.com/get-started/)


## 🚀 Getting Started

### Configuration

_*tbd*_

### Running the Container

<details><summary>Macbook</summary>
<p>

```
docker-compose --env-file .env.mac -f docker-compose.mac.yml up -d
```

</p>
</details>

<details><summary>Linux (Ubuntu)</summary>
<p>

```
docker-compose --env-file .env.linux -f docker-compose.linux.yml up -d
```

</p>
</details>

<details><summary>Windows WSL 2.0 (Ubuntu)</summary>
<p>

```
docker-compose --env-file .env.wsl -f docker-compose.wsl.yml up -d
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

1. List all container running

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
