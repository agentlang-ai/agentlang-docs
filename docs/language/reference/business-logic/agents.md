# Agents

AI agents are instances of the `:Agentlang.Core/Agent` entity. An agent entity instance is defined with the following attributes:

```
:Name - a keyword or string that uniquely identifies the agent
:Type - the type of the agent - described in detail below
:Tools - a vector of entity, event are agent names that a planner agent can use to
         generate dataflow patterns
:UserInstruction - instructions to the agent in plain English
:LLM  - name of the LLM instance to be used by the agent
:Features - special feature flags to be enabled - currently supported values
            are `"chain-of-thought"` and `"self-critique"`
:CacheChatSession - if `true`, save the chat-history of the agent in persistent storage
:Delegates - a map that encodes information about an agent to which further work is delegated
:Input - an event name that can be used to pass further instructions to the agent
:Chat - a vector of messages used for "seeding" the agent
:Documents - a vector of documents that will act as a "knowledge-base" for the agent
```

The `:Type` attribute can take the following values:

```
:chat - a basic conversational agent. this is the default type of agent
:planner - an agent that inspects user input in English and executes a sequence to
           dataflow patterns (a workflow generator)
:ocr - an agent that can analyze images for text content
```

A custom LLM instance can be assigned for an agent. The same LLM may be shared by multiple agents. An LLM instance can be created with the following attributes:

```
:Type - the LLM provider to use, default is `:openai`
:Name - a keyword or string that uniquely identifies the LLM
:Config - a map of configurations for the LLM, the exact entries will depend on the provider
```

An example LLM instance:

```clojure
{:Agentlang.Core/LLM
 {:Type :openai
  :Name :MyLLM
  :Config
  {:ApiKey (agentlang.util/getenv "OPENAI_API_KEY")
   :EmbeddingApiEndpoint "https://api.openai.com/v1/embeddings"
   :EmbeddingModel "text-embedding-3-small"
   :CompletionApiEndpoint "https://api.openai.com/v1/chat/completions"
   :CompletionModel "gpt-3.5-turbo"}}}
```