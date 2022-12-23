# Heroku App Hasura

Create an app Hasura on Heroku.

Follow this guide on how to create the app and deploy it on Heroku: [https://hasura.io/docs/latest/graphql/core/deployment/deployment-guides/heroku.html#deploying-hasura-on-heroku](https://hasura.io/docs/latest/graphql/core/deployment/deployment-guides/heroku.html#deploying-hasura-on-heroku)

You can just click on this link to quickly create Hasura app by template on Heroku:

[https://heroku.com/deploy?template=https://github.com/hasura/graphql-engine-heroku](https://heroku.com/deploy?template=https://github.com/hasura/graphql-engine-heroku)

Note:

<aside>
 
💡 If you don’t have an account on Heroku, you need to sign up on Heroku. You won’t need a credit card, and once you sign up you’ll be redirected to your Heroku app creation page automatically.

</aside>

Heroku’s free Postgres add-on is automatically provisioned.

<img width="673" alt="1" src="https://user-images.githubusercontent.com/380327/154988850-cc70c3b0-7df1-4c91-920c-70e054a947fa.png">

Click on **Deploy app** button to build the app.

Once the deployment is completed, click on the **`View`** button to open the Hasura Console where you can [connect a database](https://hasura.io/docs/latest/graphql/core/deployment/deployment-guides/heroku.html#heroku-connect-db) (screen with step-by-step).

After clicking on the **View button,** you'll be redirected to the app, then you can get the graphql endpoint

Get your GraphQL Endpoint URL:

[https://crow-indexer-test.herokuapp.com/v1/graphql](https://crow-indexer-test.herokuapp.com/v1/graphql)

<img width="589" alt="2" src="https://user-images.githubusercontent.com/380327/154988934-887bb64a-dd19-4bf7-8a18-e5cee7190188.png">

Go to GitHub and clone the crow-indexer project:

[https://github.com/popstand/crow-indexer](https://github.com/popstand/crow-indexer)

Clone the indexer project and create `.env` in the root folder, get the values from `.env.sample`.

replace the `HASURA_GRAPHQL_ENDPOINT`

```bash
 # deploy heroku
HASURA_GRAPHQL_ENDPOINT=https://crow-indexer-test.herokuapp.com/v1/graphql
```

After this, you can apply the **migrations** and **metadata**.

Go to the **hasura** folder inside of the terminal:

```bash
cd hasura
```

And run the commands below:

the address should be the link to your app.

```bash
 npx hasura metadata apply --endpoint "https://crow-indexer-test.herokuapp.com"
```

```bash
 npx hasura migrate apply --endpoint "https://crow-indexer-test.herokuapp.com"

✔ default
INFO migrations applied
```

![3](https://user-images.githubusercontent.com/380327/154988978-cc2a90e1-8a3a-46c2-8fce-d6c532515ded.png)

Great until here, you have deployed the Hasura and Postgres free

You ran also the metadata and migrations with the setup of the backend.

This is your endpoint:

```bash
https://crow-indexer-test.herokuapp.com/v1/graphql
```

With that, you can query and do mutation to the database.

If you have the API you can change [localhost](http://localhost) endpoint to the [https://crow-indexer-test.herokuapp.com/v1/graphql](https://crow-indexer-test.herokuapp.com/v1/graphql)

Everything even running locally in the API will be inserted on the indexer that is running on Heroku.

### **Create App Node.js API**

On terminal with heroku cli installed, type:

```bash
heroku login
heroku create node-api-crow
# order matter
heroku buildpacks:set https://github.com/timanovsky/subdir-heroku-buildpack.git -a node-api-crow

heroku buildpacks:add --index 2 heroku/nodejs -a node-api-crow

```

Now you can get the repository from github.

<img width="769" alt="4" src="https://user-images.githubusercontent.com/380327/154989035-8cbf305a-b225-4e03-8405-9bd70a567185.png">
<img width="1269" alt="5" src="https://user-images.githubusercontent.com/380327/154989091-501b502f-4575-4f62-9472-b02c2ac0daf3.png">

Then You can set the vars:

```bash
heroku config:set UNICROW_ADDRESS=XXX -a node-api-crow
heroku config:set UNICROW_DISPUTE_ADDRESS=XXX -a node-api-crow
heroku config:set UNICROW_ARBITRATOR_ADDRESS=XXX -a node-api-crow
heroku config:set UNICROW_CLAIM_ADDRESS=XXX -a node-api-crow
heroku config:set CROW_INDEXER_HOST=https://crow-node-api.herokuapp.com -a node-api-crow
heroku config:set HASURA_GRAPHQL_URL=https://crow-indexer-test.herokuapp.com/v1/graphql -a node-api-crow
heroku config:set PROJECT_PATH=api -a node-api-crow
heroku config:set TIME=5000 -a node-api-crow
heroku config:set RPC_HOST=http://3.134.33.205:7545 -a node-api-crow
```

deploy/build the project:

<img width="1345" alt="6" src="https://user-images.githubusercontent.com/380327/154989130-38d5bbfb-64eb-4d06-add1-ca05c3f6d4da.png">

After build try to access the app, like: [https://node-api-crow.herokuapp.com/](https://node-api-crow.herokuapp.com/)

```bash
status -> running
```

Done!
