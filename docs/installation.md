# Installation

TODO: add install instructions

## hello, world

To make sure everything works fine, let's create a very simple Agentlang program. We will design an agent that will entertain the user by telling jokes.

In your favorite text editor, create a file named `hello.agent` with the following code:

```clojure
(component :Hello)

{:Agentlang.Core/Agent
 {:Name "funny-agent"
  :UserInstruction "You are a friendly agent who entertains the user by telling jokes."
  :LLM {:Type "openai"}}}

(inference :TellMeAJoke {:agent "funny-agent"})
```

An application written in Agentlang consists of multiple modules called *components*. In the above program, we have just one component - `:Hello`.

After declaring the component, we define an `agent` named `"funny-agent"`. An agent definition is basically a map of key-value pairs. Agents belong to a built-in component called `:Agentlang.Core`, so an agent definition map has a single key `:Agentlang.Core/Agent`. The value of that key is another map that contains the properties or *attributes* of the agent. An `agent` requires at-least two attributes to be specified. One is `:UserInstruction` which tells the `agent` what it's supposed to do. The other attribute is `:LLM`, which configures the llm-provider. Here we set `openai` as the llm-provider. It's possible to have fine-grained configuration for the LLM, but the default settings are good-enough for now.

The last part of the program defines an `inference`, which is the preferred way to invoke an agent. When we define an `inference`, the Agentlang runtime will setup an HTTP endpoint that can be used to interact with the `agent`. To test this endpoint, we have to first start the application. Before that, make sure you have set the `OPENAI_API_KEY` environment variable to a valid [OpenAI API key](https://help.openai.com/en/articles/4936850-where-do-i-find-my-openai-api-key). Then run the following command:

```clojure
$ agent hello.agent
```

This will start the application as an HTTP service on port `8080`. You can interact with the newly-created agent by sending it a request as shown below:

```shell
curl --location --request POST 'http://localhost:8080/api/Hello/TellMeAJoke' \
--header 'Content-Type: application/json' \
--data-raw '{"Hello/TellMeAJoke": {"UserInstruction": "Tell me a joke about AI agents"}}'
```

If all goes well, you will get a response like,

```javascript
[
    {
        "status": "ok",
        "result": [
            "Why did the AI agent go to therapy? \because it had too many unresolved issues!",
            "gpt-3.5-turbo"
        ]
    }
]
```

With Agentlang setup and working properly, you can now explore the language further by proceeding to the [Quick start](quick-start.md) guide.
