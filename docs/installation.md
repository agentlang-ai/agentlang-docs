# Installation

TODO: add install instructions

## hello, world

To make sure everything works fine, let's create a very simple Agentlang program. We will design an agent that will entertain the user by telling jokes.

In your favorite text editor, create a file named `hello.agent` with the following code:

```clojure
(component :Hello)

(agent :FunnyAgent
 {:UserInstruction "You are a friendly agent who entertains the user by telling jokes."
  :LLM {:Type "openai"}})

(inference :TellMeAJoke {:agent :FunnyAgent})
```

An application written in Agentlang consists of multiple modules called *components*. In the above program, we have just one component named `:Hello`.

After specifying the component, we define an `agent` named `:FunnyAgent`. (In Agentlang, names are usually specified as keywords (i.e symbols prefixed by a full-colon). By convention, these names are [upper camel cased](https://en.wikipedia.org/wiki/Camel_case). For agents, names may also be a string, like "funny-agent", but for consistency, let's stick to keywords for now). An `agent` requires atleast two attributes to be specified, one is the `:UserInstruction` which tells the `agent` what it's supposed to do. The other attribute is `:LLM`, which configures the llm-provider. Here we set `openai` as the llm-provider. It's possible to have fine-grained configuration for the LLM, but the default settings are good-enough for now.

The last part of the program defines an `inference`, which is the preferred way to invoke an agent. When we define an `inference`, the Agentlang runtime will setup an HTTP endpoint that can be used to interact with the `agent`. To test this endpoint, we have to first start the application. As we have set OpenAI as the llm-provider, make sure you have set the `OPENAI_API_KEY` environment variable to a valid OpenAI API key. Then run the following command:

```clojure
$ agent hello.agent
```

This will start the application as an HTTP service on port `8080`. You can interact with the funny agent by sending it a request as shown below:

```shell
curl --location --request POST 'http://localhost:8080/api/Hello/TellMeAJoke' \
--header 'Content-Type: application/json' \
--data-raw '{"Hello/TellMeAJoke": {"UserInstruction": "Tell me a joke about AI agents"}}'
```

You should get a response similar to this:

```javascript
[
    {
        "status": "ok",
        "result": [
            "Why did the AI agent go to therapy? \nBecause it had too many unresolved issues!",
            "gpt-3.5-turbo"
        ]
    }
]
```

With Agentlang setup and working properly, you can now explore the language further by proceeding to the [Quick start](quick-start) guide.
