# Quick Start

In this section, we will develop a more involved application in Agentlang. We'll be designing a customer-support agent, that can answer user queries on specific products and also keep track of its chat-session. Let's start by creating a new Agentlang script called `customer_support.agent`.


```clojure
(component :CustomerSupport)

{Agent
 {:Name "support-agent"
  :UserInstruction "You are a customer-support agent."
  :LLM {:Type "openai"}}}

(inference :Chat {:agent "support-agent"})
```

As we saw in the last section, you can use the `agent` command to run the customer-support agent:

```shell
$ agent customer_support.agent
```

Now you can raise a query to the agent:

```shell
$ curl --location --request POST 'http://localhost:8080/api/CustomerSupport/Chat' \
--header 'Content-Type: application/json' \
--data-raw '{"CustomerSupport/Chat": {"UserInstruction": "Can you help me with setting-up a custom-menu item in my Panasonic G9?"}}'
```

## Enhancing the Agent with a Knowledge-Base

The preceding `curl` request will give a valid response based on what the LLM already knows about the specific camera model. What if we need to build a customer-support agent for some niche products that the LLM is not aware of? Agentlang allows its agents to be extended with a `:Documents` attribute. This is basically a list of document files that the agent can use as a "knowledge-base" to provide accurate answers on specific topics. The following snippet shows how the customer-support agent can be enhanced with a knowledge-base:

```clojure
{Agent
 {:Name "support-agent"
  :UserInstruction "You are a customer-support agent."
  :LLM {:Type "openai"}
  :Documents [{:Title "ABC Camera User Manual"
               :Uri "file://./docs/abc.md"}
              {:Title "XYZ Camera User Manual"
               :Uri "file://./docs/xyz.md"}]}}
```

We have set two user-manuals as the knowledge-base for the customer-support agent. (You can set any text file for the `:Uri` attribute). Now if you ask questions specific to the products "ABC" and "XYZ", the agent will formulate an answer based on the provided manuals.

Agentlang makes use of a [vector database](https://en.wikipedia.org/wiki/Vector_database) for maintaining its knowledge-base and it has built-in support for [pgvector](https://github.com/pgvector/pgvector). So before you actually run and test the updated agent, please make sure you have an instance of Postgres with the pgvector extension enabled. You also need to ensure that the following DDL statement is executed in your Postgres server:

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
{:inference-service-enabled true
 :publish-schema {:vectordb :pgvector
                  :config {:host "your-postgres-hostname"
                           :port 5432 ; postgres-port
                           :dbname "postgres-db-name"
                           :user "postgres-user"
                           :password "postgres-password"}}}
```

Now you can run the agent again with this configuration:

```shell
$ agent -c config.edn customer_support.agent
```

Here's a sample query that you may post to the agent on one of the products in the knowledge-base:

```shell
$ curl --location --request POST 'http://localhost:8080/api/CustomerSupport/Chat' \
--header 'Content-Type: application/json' \
--data-raw '{"CustomerSupport/Chat": {"UserInstruction": "how can I set white-balance in ABC camera?"}}'
```

## Interactions between Agents

The example knowledge-base that we used in the last section is rather small - it has only two text documents. Real knowledge-bases can be quite large and it would help to split the documents among multiple agents. To continue on the customer-support example, we add two dedicated agents for answering queries on each product. Then we will add a third "master" agent that will *delegate* the user query to the appropriate product-specific sub-agent. All this can be modelled as:

```clojure
{LLM {:Type "openai" :Name "customer-support-llm"}}

{Agent
 {:Name "abc-agent"
  :UserInstruction "You are a customer-support agent that answer queries on the ABC camera only."
  :LLM "customer-support-llm"
  :Documents [{:Title "ABC Camera User Manual"
               :Uri "file://./docs/abc.md"
               :Agent "abc-agent"}]}}

{Agent
 {:Name "xyz-agent"
  :UserInstruction "You are a customer-support agent that answer queries on the XYZ camera only."
  :LLM "customer-support-llm"
  :Documents [{:Title "XYZ Camera User Manual"
               :Uri "file://./docs/xyz.md"
               :Agent "xyz-agent"}]}}

{Agent
 {:Name "support-agent"
  :LLM "customer-support-llm"
  :Type "classifier"
  :Delegates
  [{:To "abc-agent"}
   {:To "xyz-agent"}]}}

(inference :Chat {:agent "support-agent"})
```

There are two new agents in the updated model - each one dedicated for a specific product. The `support-agent` now acts as a "classifier" that decides which sub-agent or *delegate* should be invoked to handle the user-query. The actual response is generated by one of the delegates.

Also note that we moved the definition of the `LLM` outside of the `Agent` constructs - this is useful when more than one agent will be interacting with the same llm-provider.

In this tutorial, we learned about some of the common patterns that can be used to design AI application using Agentlang's powerful `agent` abstraction. So far, we have only scratched the surface of what Agentlang can do. As mentioned earlier, Agentlang is a tool for bridging the gap between AI-oriented problem solving and traditional business applications. In the [advanced tutorial](tutorial.md) that follows, we will explore this in some more depth.
