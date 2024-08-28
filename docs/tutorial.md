# Advanced Tutorial

So far we have explored the AI-oriented capabilities of Agentlang. But Agentlang is not just a wrapper for programming with intelligent agents. It's a fully-capable programming language suitable for developing any complex business application. Agentlang's declarative nature allows developers to specify solutions to a problem as high-level specifications or "models", while the language runtime takes care of all incidental complexities like talking to a database and integrating with external REST APIs or libraries.

In this section, first we will have a quick look at Agentlang's modelling capabilities. Then we will see how agents can be programmed to make use of the business-model to solve advanced use-cases.

## Entities

Assume that the company you works for needs to keep track of information about all its customers. It should be possible to persist customer records in a database and it should be possible to list all customers, or retrieve information about a specific customer, given some identifier, like the customer's email address. It should also be possible to list customers belonging to one of the categories - "premium" or "standard". All this is solved by the following Agentlang program:

```clojure
(component :MyCompany)

(entity :Customer
 {:Email {:type :Email :guid true}
  :Name :String
  :Created :Now
  :Type {:oneof ["premium" "standard"] :indexed true}})
```

What the program does is to simply define an `entity` called `:Customer`. An `entity` defines the "schema" or data-structure for a business object. The structure of a business object is defined in terms of `attributes`. The `:Customer` entity has four attributes - `:Email`, `:Name`, `:Created` and `:Type`. The `:Email` attribute is defined as the globally-unique-identifier (`:guid`) of the entity, which means no two customers can have the same email address.

Save this program to a file named `customer.agent` and run it as:

```shell
$ agent customer.agent
```

To create a new `:Customer`, use the following HTTP POST:

```shell
curl --location --request POST 'http://localhost:8080/api/MyCompany/Customer' \
--header 'Content-Type: application/json' \
--data-raw '{"MyCompany/Customer": {"Email": "joe@acme.com", "Name": "J Joe", "Type": "standard"}}`
```

You can create as many *instances* of `:Customer` as you want - they are all automatically persisted to a local [H2](https://www.h2database.com/html/main.html) database file. (To reuse this database for multiple runs of the application, update `config.edn` with the setting - `{:store {:type :h2 :dbname "./data/customer"}}`. You may also point the application to a Postgres database. For this, create a `config.edn` file with the setting - `{:store {:type :postgres}}`. Also set these environment variables to the appropriate values: `POSTGRES_HOST` (default "localhost"), `POSTGRES_DB` (default "postgres"), `POSTGRES_USER` (default "postgres") and `POSTGRES_PASSWORD`).

To list all customers, send a `GET` request to the same endpoint:

```shell
curl http://localhost:8080/api/MyCompany/Customer
```

To fetch a specific customer by email:

```shell
curl http://localhost:8080/api/MyCompany/Customer/joe@acme.com
```

To filter customers by their type:

```shell
curl http://localhost:8080/api/MyCompany/Customer?Type=premium
```

**TODO**: Planning, pattern generation and evaluation with agents

**TODO**: Add OCR capabilities to the planner

We have reached the end of our whirlwind tour of Agentlang. There's a lot of ground left to cover - please
continue your journey by reading about the core [concepts](concepts/intro.md) of Agentlang and
the [language reference](language/reference/overview.md).
