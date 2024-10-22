# Quick Start

In this section, we will develop a more involved Agentlang application. We'll be designing a customer-support agent that can answer user queries on specific products and also keep track of its chat-session. Let's start by creating a new Agentlang script called `customer_support.al`.


```clojure
(component :CustomerSupport)

{:Agentlang.Core/Agent
 {:Name :CustomerSupport/Agent
  :UserInstruction "You are a customer-support agent."
  :Input :CustomerSupport/Chat}}
```

As we saw in the last section, you can use the `agent` command to run the customer-support agent:

```shell
agent customer_support.al
```

Now you can raise a query to the agent:

```shell
curl --location --request POST 'http://localhost:8080/api/CustomerSupport/Chat' \
--header 'Content-Type: application/json' \
--data-raw '{"CustomerSupport/Chat": {"UserInstruction": "Can you help me with setting-up a custom-menu item in my Panasonic G9?"}}'
```

## Enhancing the Agent with a Knowledge-Base

The preceding HTTP request will give a valid response based on what the LLM already knows about that specific camera model. What if we need to build a customer-support agent for some niche products that the LLM is not aware of? Agents can be provided with a `:Documents` attribute. This is basically a list of document files that the agent can use as a "knowledge-base" to give accurate answers on very specific topics. The following snippet shows how the customer-support agent can be enhanced with a knowledge-base:

```clojure
{:Agentlang.Core/Agent
 {:Name :CustomerSupport/Agent
  :UserInstruction "You are a customer-support agent."
  :Input :CustomerSupport/Chat
  :Documents [{:Title "ABC Camera User Manual"
               :Uri "file://./docs/abc.md"}
              {:Title "XYZ Camera User Manual"
               :Uri "file://./docs/xyz.md"}]}}
```

Here we set two text files as the knowledge-base for the customer-support agent. (You can set any text file for the `:Uri` attribute). Now if you ask questions specific to the products "ABC" and "XYZ", the agent will formulate an answer based on the provided manuals.

Agentlang makes use of a [vector database](https://en.wikipedia.org/wiki/Vector_database) for maintaining its knowledge-base and it has built-in support for [pgvector](https://github.com/pgvector/pgvector). So before you actually run and test the updated agent, please make sure you have an instance of Postgres with the pgvector extension enabled. Also make sure the following DDL statement is executed in your Postgres instance:

```sql
CREATE TABLE text_embedding
(
    embedding_uuid      UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    embedding_classname VARCHAR(128), -- may be repeated
    text_content        TEXT        NOT NULL,
    meta_content        JSON,
    embedding_model     VARCHAR(64) NOT NULL,
    embedding_1536      VECTOR(1536),
    embedding_3072      VECTOR(3072),
    created_at          TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP   NOT NULL DEFAULT NOW()
);
```

The `text_embedding` table is where the knowledge-base will be stored. Once the vector database is setup, we need to tell the Agentlang runtime to start using it as a knowledge-base. This information is passed via a configuration file called `config.edn`. You can add the following content to this file:

```clojure
{:embeddings
 {:vectordb :pgvector
  :config
  {:host "postgres_host"
   :port 5432 ; postgres_port
   :dbname "postgres_dbname"
   :user "postgres_user"
   :password "postgres_password"}}}
```

Now you can run the agent again with this configuration:

```shell
agent -c config.edn customer_support.al
```

Here's a sample query that you may post to the agent on one of the products in the knowledge-base:

```shell
curl --location --request POST 'http://localhost:8080/api/CustomerSupport/Chat' \
--header 'Content-Type: application/json' \
--data-raw '{"CustomerSupport/Chat": {"UserInstruction": "how can I set white-balance in ABC camera?"}}'
```

The response will contain very specific information based on the data from the manual relevant for the "ABC" camera.

## Interactions between Agents

The example knowledge-base that we used in the last section is rather small - it has only two text documents. Real knowledge-bases can be quite large and it would help to split the documents among multiple agents. To continue on the customer-support example, we add two dedicated agents for answering queries on each product. Then we will add a third "master" agent that will *delegate* the user query to the appropriate product-specific sub-agent. All this can be modelled as:

```clojure
{:Agentlang.Core/Agent
 {:Name :CustomerSupport/AbcAgent
  :UserInstruction "You are a customer-support agent that answer queries on the ABC camera only."
  :Documents [{:Title "ABC Camera User Manual"
               :Uri "file://./docs/abc.md"
               :Agent :CustomerSupport/AbcAgent}]}}

{:Agentlang.Core/Agent
 {:Name :CustomerSupport/XyzAgent
  :UserInstruction "You are a customer-support agent that answer queries on the XYZ camera only."
  :Documents [{:Title "XYZ Camera User Manual"
               :Uri "file://./docs/xyz.md"
               :Agent :CustomerSupport/XyzAgent}]}}

{:Agentlang.Core/Agent
 {:Name :CustomerSupport/Master
  :Type :classifier
  :Input :CustomerSupport/Chat
  :Delegates
  [{:To :CustomerSupport/AbcAgent}
   {:To :CustomerSupport/XyzAgent}]}}
```

There are two new agents in the updated model - each one dedicated for a specific product. The `master` agent now acts as a "classifier" who decides which sub-agent or *delegate* should be invoked to handle the user-query. The actual response for the user will be generated by the selected delegate.

In this tutorial, we learned about some of the common patterns that can be used to design AI application using Agentlang's powerful abstractions. So far, we have only scratched the surface of what Agentlang can do. As mentioned earlier, Agentlang is a tool for bridging the gap between AI-oriented problem solving and traditional business applications. In the [advanced tutorial](tutorial.md) that follows, we will explore this in more depth.
