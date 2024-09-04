# Configuration

The runtime configuration required by a model in provided via the `config.edn` file.
Configuration is an arbitrary map, the keys that are considered by the Agentlang runtime is
described here:

**:service** - map

Settings for the application REST API service. For example, the port to run the service can be specified as:

```clojure
{:service {:port 7000}}
```

The default value for port is `8080`.

**:script-extn** - string
 
The extension of component files. Defaults to `.agentlang`.

**:store** - map

Identifies the storage layer to use. Defaults to `{:type :h2}`.
The map could take additional key-values based on the type of storage.
For instance, `:h2` can take these additional options - `:dbname`, `:username`, `:password`.

E.g 

```clojure
{:store {:type :h2
         :dbname "./data"
         :username "agentlang-db"
         :password #$ FRACTL_DB_PASSWORD}}
```
The tag `#$` identifies a variable reference and tries to derive its value from the system environment.
Here, the database password will be looked-up in the `FRACTL_DB_PASSWORD` environment variable.

Agentlang also has in-built support for the Postgres database, which can be configured as:

```clojure
{:store {:type :postgres
         :host #$ POSTGRES_HOST
         :dbname #$ POSTGRES_DB
         :username #$ POSTGRES_USER
         :password #$ POSTGRES_PASSWORD}}
```

If all the `:POSTGRES_XXX` environment variables are set, the configuration could simply be `{:type :postgres}`.

**:interceptors** - map

Each key in the map refers to the name of an interceptor. Each value must be a map, with only one required key called `:enabled`.

E.g:

```clojure
{:interceptors {:rbac {:enabled true}}}
```

Any additional keys in the value-map will be configuration specific to the interceptor implementation.

**:authentication** - map

The authentication backend to use and its configuration. The only backend currently supported in AWS Cognito.

E.g:

```clojure
{:authentication {:service :cognito
                  :superuser-email #$ FRACTL_SUPERUSER_EMAIL}}
```

Cognito expects a few environment variables to be set on the system running the Agentlang application. These are
listed below:

```shell
FRACTL_SUPERUSER_PASSWORD
AWS_REGION
AWS_ACCESS_KEY
AWS_SECRET_KEY 
AWS_COGNITO_CLIENT_ID 
AWS_COGNITO_USER_POOL_ID
```

Also note that setting up `:authentication` will also require the `:rbac` interceptor to be enabled.

**:rbac-enabled** - true or false

Setting `:rbac-enabled` to `true` will set `:authentication` to its default values. It also enabled the `:rbac` interceptor.
Usually this is the only flag required to enable authentication and authorization in an Agentlang application.

**:deploy** - map

Configuration for deploying Agentlang applications to the agentlang.io platform. This is usually invoked via the `agentlang deploy` command.

E.g:

```clojure
{:deploy {:host "https://agentlang.io/deployment/acme"
          :user "jj@acme.com"
          :password #$ FRACTL_DEPLOYMENT_PASSWORD}}
```

**:build** - map

Information required for the Agentlang compiler, invoked by the `agentlang build` command. For example, the compiler can be directed
to generate a UI for the application with the following setting:

```clojure
{:build {:client {:root-entity :Accounts.Core/Company
                  :api-host "https://agentlang-io/apps/acme/accounts"}}}
```
