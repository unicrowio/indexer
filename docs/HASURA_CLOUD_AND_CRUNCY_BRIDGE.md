
# Using Hasura (GraphQL API) and Crunchy Bridge (Postgres DB)

> This doc shows how to configure Hasura Cloud as your GraphQL API provider and Crunchy Bridge as your Postgres database provider.

## Crunchy Bridge

[Create an account and go to the Dashboard](https://www.crunchybridge.com/dashboard).

Create (provision) a cluster and open its control panel.

### Getting your new database's connection string

* Go to the `Connection` tab and select `Hasura`. 

* Select `Role: application` and `URL` format.

* Copy the URL in a temporary (and safe) place, you will need it soon. Note: If you experience connection errors related to encryption, try appending ?sslmode=require to the end of the connection URL.

## Hasura Cloud

### Creating the Project

[Create and account and go to the Projects menu](https://cloud.hasura.io/projects).

* Create a new project. The name you choose, like myapp-production or myapp-staging, will become the subdomain part of the GraphQL API URL. e.g. https://myapp-production.hasura.app/v1/graphql

### Settings

* Go to the project's [Settings](https://cloud.hasura.io/project/YOUR_PROJECT_ID/details), then to the `Env vars` tab
* Add the following variables:
  - HASURA_GRAPHQL_DATABASE_URL=<your_db_connection_url>
  - HASURA_GRAPHQL_UNAUTHORIZED_ROLE=anonymous
  - HASURA_GRAPHQL_CORS_DOMAIN=*
  - HASURA_GRAPHQL_ADMIN_SECRET=<your_admin_secret>

### Bootstrap metadata (schema tracking, API configuration and permissions, etc.) importing the provided file

* Go to the [Metadata Actions page](https://cloud.hasura.io/project/YOUR_PROJECT_ID/console/settings/metadata-actions) in your project's settings.

* Click `Import metadata`, and select the provided file: [hasura/hasura_metadata.json](../hasura/hasura_metadata.json)

### Connecting to the database and creating the schema

* Go to the [Data tab](https://cloud.hasura.io/project/YOUR_PROJECT_ID/console/data/manage) of your project. If the database connection string was set correctly and the metadata file has been imported, you should already see your database in the list.
* If that's not the case, you can try adding it manually from this page.
* Once the database is connected, go to the SQL tab and copy-paste the entire SQL init script from [hasura/migrations/unicrow/1726203142180_squashed/up.sql](../hasura/migrations/unicrow/1726203142180_squashed/up.sql). In the script, replace the block number with the one where you want the indexing to start (recommended), and (optionally) set one or more specific Marketplace addresses (see [README.md](../README.md)); then, finally, run it.

If all the operations succeeded, your Hasura GraphQL API should now be linked with your database and be ready to use!

P.S. You might want to review and tweak settings and permissions according to your own needs and preferences.
