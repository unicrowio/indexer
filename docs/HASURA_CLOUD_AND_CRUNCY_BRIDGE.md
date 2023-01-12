
# Hosting the Indexer

> Hosting the indexer using Hasura Cloud as backend provider and Cruncy Bridge as postgres database provider

## Crunchy Bridge

[Create and account and go to the Dashboard](https://www.crunchybridge.com/dashboard).

You should create a cluster (Provision a Cluster).

* Create Cluster
* replace the Cluster name if you want, not required.
* Choose the Cloud Provider (AWS)
* Select the Region (US East (N. Virginia)
* Tier (Hooby-1) * you can change it as you need
* version: Postgres 15
* Storage: 25 GB you can scale the disk
* High Availability = yes
* Create Cluster

You will be redirected to the Cluster Overview.

### Conection with Hasura Cloud

https://www.crunchybridge.com/clusters/

* Go to the tab Connection, choose Hasura.

> Credential access is tracked in log

* Choose Role: application

copy the URL of string of connection and save it in some place, you will need this to connect from hasura backend to the crunchybridge postgress database.


## Hasura Cloud 

### Creating the Project

[Create and account and go to the Projects menu](https://cloud.hasura.io/projects).

* New Project
* Choose a pricing plan
* Select a region where the infrasctructure will be run on AWS.
* Click in Create the Project button.

You will be redirected to the project settings.

You can change the name, like myapp-production or myapp-staging, this will be a part of the graphql URL API. ex: https://myapp-production.hasura.app/v1/graphql

### Settings GUI Hasura Cloud

* General - Envoriment Name: edit to prod or staging
* Env vars:
  - HASURA_GRAPHQL_UNAUTHORIZED_ROLE=public
  - HASURA_GRAPHQL_CORS_DOMAIN=*
  - HASURA_GRAPHQL_ADMIN_SECRET=

### Connecting to the database

* Go to the https://cloud.hasura.io/projects and Lunch Console of your project.
* Go to the DATA tab
* Go the the Connect Existing Database
  - Database Display Name = default
  - Data Source Driver = Postgres
  - Connect Database Via -> Database URL

Paste in the input the string of postgres connection that you got above, in the Crunchy Bridge configuration.

* click in the button: Connect Database.

* Go to the SQL.
   - Copy/Paste the SQL script from [hasura/migrations/default/1641864689790_squashed/up.sql](../hasura/migrations/default/1641864689790_squashed/up.sql) and run.

### Update the Settings:

* Go to the [settings pages](https://cloud.hasura.io/project/YOUR_PROJECT_ID/console/settings/metadata-actions)

* Update the values from  [hasura/hasura_metadata_customers.json](../hasura/hasura_metadata_customers.json):
  - NAME_OF_THE_APP="unicrow-my-app"
  - X_HASURA_SECRET_KEY_VALUE="any secret here"
  - DATABASE_URL="same postgres URL connection you have generated above"

* Import metadata, choose the file with the variables values above updated: [hasura/hasura_metadata_customers.json](../hasura/hasura_metadata_customers.json)


Finished. Everything should be works. 🚀
