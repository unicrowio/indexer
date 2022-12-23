# Crow Indexer

​

## Deploy on a Linux VM: AWS EC2/DigitalOcean Droplet

​

1. Launch an EC2 instance or a DigitalOcean droplet with appropriate config, enable security groups.
   ​
   ​

```shell script
## ssh into launched instance
​
## Update VM
sudo yum update -y
​
sudo yum install -y docker git
sudo apt-get install build-essential
sudo service docker start
​
```

​ 2. Git clone the project
​
​ 3. Option 1, without docker
​

- Set up Node, NPM, and Yarn
  ​
  ```shell script
  ## Set up [NVM](https://github.com/nvm-sh/nvm)
  ​
  ```
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
  ​
  nvm use 14
  ​
  ## Install pm2
  sudo npm install -g pm2
  ````
  ​
  ​
  ```shell script
  ## Install API dependencies
  nvm install && nvm use
  yarn
  ````
  ​
  ```shell script
  ​
  ## Start application
  pm2 start build/index.js
  ```
  ​
- Create a startup script to launch PM2 and its processes for server reboots
  ​
  ```shell script
  pm2 startup systemd
  ```
  Run the last line of the output with `sudo`
  ​
  e.g.
  ```
  Output
  [PM2] Init System found: systemd
  [PM2] You have to run this command as root. Execute the following command:
  sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
  ```
  Replace the username to you user if different
  ​
  ```shell script
  # e.g. your user: koa, this creates a systemd unit for this user on boot
  ## this pm2 instance runs the app
  sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u koa --hp /home/koa
  ```
  ​
  ```shell script
  ​
  ## Check systemd unit status
  systemctl status pm2-sammy
  ```
  ​
  ​
  ​

3. Option 2, using docker
   ​

- Build docker image
  ​
  `docker build -t escrow .`
- Using docker:
  ​

```
docker run --name escrow --restart always -p 80:5555 escrow:latest
```

​

- Test;
  ​
  `shell script curl 'http://<instance IP or public DNS address>/' `
  ​

4. Set up Nginx as a reverse proxy server
   ​
   Follow the following to set up nginx
   https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-16-04
   ​
   ​
   sudo nano /etc/nginx/sites-available/default
   ​
   Inside `server` -> `location /`, replace content with the following, use correct port:
   ​

```
. . .
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

​

```shell script
## Check if no config issues
sudo nginx -t
​
## restart Nginx:
​
sudo systemctl restart nginx
```

​
​

## Deploy on Amazon ECS

​

1.  Build docker image
    ​
2.  Create an IAM user: Go to the AWS Console, search for IAM -> Users -> Add user
    - Add user with prrogrammatic access
    - Click “Next: Permissions”
    - Select “Attach exisiting policies directly” at the top right.
    - To keep it simple, you should see “AdministratorAccess”.
    - Click “Next: Tags” and then “Next: Review”, we’re not going to add any tags, and “Create user”.
    - Now you should see a success page and an “Access key ID” and a “Secret access key”.
3.  Set up AWS cli and pasting Access Key ID and Secret access key when promted.
    ```
    aws configure
    ```
4.  Create ECS cluster:
    `shell script aws ecs create-cluster --cluster-name escrow ​ ## Validate cluster by listing aws ecs list-clusters `
5.  Push an image to AWS ECR:
    ​
    `shell script ## Authenticate with ECR aws ecr get-login --no-include-email `
    Copy and paste the output of the command above, should look something like `docker login -u AWS -p ...` followed by a token
    If successful you should see "Login Succeeded".
    ​
    ````shell script ## create repo
    aws ecr create-repository --repository-name escrow/api
    ​ ## tag docker image
    docker tag escrow <ACCOUNT ID>.dkr.ecr.us-east-1.amazonaws.com/escrow/api
    ​ ## Verify tag
    docker images
    ​ ## Push docker image
    docker push <ACCOUNT ID>.dkr.ecr.us-east-1.amazonaws.com/escrow/api
        ## Verify image upload
        aws ecr list-images --repository-name escrow/api
        ```
    ````
6.  Koa API to ECS
    ​ - We need to create an IAM role to allow us access to ECS. Create a file called `task-execution-assume-role.json`
    `json { "Version": "2012-10-17", "Statement": [ { "Sid": "", "Effect": "Allow", "Principal": { "Service": "ecs-tasks.amazonaws.com" }, "Action": "sts:AssumeRole" } ] } `
    `shell script ## Create role and copy ARN from the output aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document file://task-execution-assume-role.json `
    ​ - Attach role policy `AmazonECSTaskExecutionRolePolicy`
    ​
    `shell script aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy `
    ​ - With ARN from above, create a file `node-task-definition.json` for the executionRoleArn
    `json { "family": "koa-fargate-task", "networkMode": "awsvpc", "executionRoleArn": "arn:aws:iam::<ARN>:role/ecsTaskExecutionRole", "containerDefinitions": [ { "name": "nodejs-app", "image": "<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/escrow/api:latest", "portMappings": [ { "containerPort": 80, "hostPort": 80, "protocol": "tcp" } ], "essential": true } ], "requiresCompatibilities": [ "FARGATE" ], "cpu": "256", "memory": "512" } `
    ​ - Registering an ECS Task Definition
    `shell script aws ecs register-task-definition --cli-input-json file://node-task-definition.json `
    ​ - Create an ECS service
    ​
    ````shell script
    ​ ## Create a security group
    aws ec2 create-security-group --group-name ecs-security-group --description "Security Group us-east-1 for ECS".
        ## View info on the security group
        aws ec2 describe-security-groups --group-id <YOUR SG ID>
    ​ ## Allow required port 5555 for the koa API for testing
    aws ec2 authorize-security-group-ingress --group-id <YOUR SG ID> --protocol tcp --port 5555 --cidr 0.0.0.0/0
    ​ ## Get a list of public subnets available and copy `SubnetArn` from the output subnet-XXXXXX, there should be6 subnets in us-east-1
    aws ec2 describe-subnet
        ## Create our service replace the subnets and security group Id from outputs above
        aws ecs create-service --cluster docker-on-aws \
          --service-name escrow-api-service \
          --task-definition koa-fargate-task:1 \
          --desired-count 1 --network-configuration "awsvpcConfiguration={subnets=[ subnet-XXXXXXXXXX, subnet-XXXXXXXXXX, subnet-XXXXXXXXXX, subnet-XXXXXXXXXX, subnet-XXXXXXXXXX, subnet-XXXXXXXXXX],securityGroups=[sg-XXXXXXXXXX],assignPublicIp=ENABLED}" --launch-type "FARGATE".
        ```
    ​
    This creates an ECS service escrow-api-service and a task koa-fargate-task:1. Here :1 is the revision count, this goes up every time you update the task
    ​
    ````
7.  Get public IP:
    View service in AWS ECS console -> Your cluster -> tasks -> Network -> Public IP
    ​
8.  Go to your public IP to view the API
    ​
    ​
    TODO: Update the api to use HTTPS.
    ​

## Deploy on Kubernetes
