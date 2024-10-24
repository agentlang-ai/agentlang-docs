# Installation

[Download](https://github.com/agentlang-ai/agentlang.cli/releases) the latest release of the Agentlang CLI tool. You may download a binary distribution 
and decompress as follows:

```shell
tar xvf agentlang.cli-<version>-bin.tar.gz
```

Now, you may set `PATH` environment variable to the created directory and use the agent command. You would need Java 21 and Git installed to use this CLI tool.

## hello, world

To make sure the installation went fine, let's create a very simple Agentlang program. We will design an agent that will help you with your most pressing questions!

In your favorite text editor, create a file named `hello.al` with the following code:

```clojure
(component :Hello)

{:Agentlang.Core/Agent
 {:Name :friendly-agent
  :UserInstruction "You are a friendly agent who answer questions posted by a human."
  :Input :Hello/Chat}}
```

Before we explain the code, a word about syntax - Agentlang programs are encoded in [edn](https://github.com/edn-format/edn), the extensible data notation. Specifically, an Agentlang script is made up of:

- lists  - sequences enclosed in parenthesis `()`
- maps - key-value pairs enclosed in curly braces `{}`
- vectors - sequences enclosed in square brackets `[]`
- symbols - identifiers that refer to values in memory
- keywords - identifiers that start with a `:` and typically refer to themselves
- strings - sequence of characters enclosed in double-quotes
- numbers - integer or floating-point values
- boolean - `true` or `false`

An application written in Agentlang consists of multiple modules called *components*. In the above program, we have just one component named `:Hello`.

After declaring the component, we define an *agent* named `:friendly-agent`. An agent definition is basically a map of key-value pairs. Agents belong to the built-in component called `:Agentlang.Core`, so an agent definition map has a single key `:Agentlang.Core/Agent`. The value of that key is another map that contain the properties or *attributes* of the agent. An `agent` require at-least three attributes to be specified. One, as we saw earlier, is its `:Name`. The next required attribute is `:UserInstruction`, which describes the agent to itself or explains to the agent what it's supposed to do - all in plain English. The third attribute required by an agent is `:Input` - which simply defines a name under which an HTTP API will be exposed for interacting with the agent. User interaction with an agent happens by giving it more user-instructions.

With that basic description of the agent behind us, we can proceed to run it. But before that, make sure you have set the `OPENAI_API_KEY` environment variable to a valid [OpenAI API key](https://help.openai.com/en/articles/4936850-where-do-i-find-my-openai-api-key).

Now run the following command:

```clojure
agent hello.al
```

This will start the application as an HTTP service on port `8080`. You can interact with the newly-created agent by sending it a request as shown below:

```shell
curl --location --request POST 'http://localhost:8080/api/Hello/Chat' \
--header 'Content-Type: application/json' \
--data-raw '{"Hello/Chat": {"UserInstruction": "What are the important uses of AI?"}}'
```

You should get a response like,

```javascript
[
    {
        "status": "ok",
        "result": [
            "AI has a wide range of important uses across various industries and sectors ...."
        ]
    }
]
```

## Setting up a custom LLM provider

An agent internally uses a default LLM provider for generating its responses. A custom LLM provider can be assigned for this purpose. The following code snippet shows how this could be done:

```clojure
(component :Hello)

{:Agentlang.Core/LLM
 {:Type :openai
  :Name :my-llm
  :Config {:ApiKey (agentlang.util/getenv "OPENAI_API_KEY")
           :CompletionApiEndpoint "https://api.openai.com/v1/chat/completions"
           :CompletionModel "gpt-4o-min"}}}

{:Agentlang.Core/Agent
 {:Name :friendly-agent
  :LLM :my-llm
  :UserInstruction "You are a friendly agent who answer questions posted by a human."
  :Input :Hello/Chat}}
```

You can test the custom LLM by using the HTTP POST request from the preceding section.

With Agentlang now installed and setup, you may further explore the language by proceeding to the [Quick start](quick-start.md) guide.
