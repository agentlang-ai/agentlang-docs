# Intelligent Agents

Agentlang is the only language designed from the ground-up to program with AI agents. The abstractions for agents and LLMs are defined as entities, i.e the AI capabilities of Agentlang is modelled in Agentlang itself. In an Agentlang model (or program), the names `Agent` and `LLM` are bound to the entity names `:Agentlang.Inference.Service/Agent` and `:Agentlang.Inference.Provider/LLM` respectively. These bindings are provided only for convenience, you may use the complete entity names instead.

## Types of Agents

The various types of agents built-into Agentlang are:

1. `chat` - An agent that can engage in a conversation with a human or other agents. Most other types of agents are built on top of the basic chat-agent.
2. `classifier` - A classifier agent can be used to classify text into various categories. By default, it can be used to decide which delegate-agent can handle the input query or text.
3. `ocr` - An agent that can analyze an image and extract textual information.
4. `eval` - An agent that can generate and evaluate [dataflow](../language/reference/business-logic/dataflow.md) patterns. 
5. `planner` - A more sophisticated version of the `eval` agent. A planner can make use of *tools* in the form of business entity and event definitions appearing in a component. (For a detailed example of a planner-agent, please see the [advanced tutorial](../tutorial.md) section).

An agent's capabilities can be enhanced not just by tools, but also with a vector-db knowledge-base. This is detailed in the [quick start](../quick-start.md) guide. Let's conclude this section with an example that demonstrates the `ocr` and `eval` agents. The following programs shows two interacting agents. The main agent is of type `eval` which makes use of an `ocr` sub-agent to extract expense data from the image of a bill and persist that data in a database by creating instances of an `:Expense` entity.

```clojure
(component :Expense.Workflow)

(entity
 :Expense
 {:Id :Identity
  :Title :String
  :Amount :Double})

{LLM {:Type "openai" :Name "llm01"}}

{Agent
 {:Name "receipt-ocr-agent"
  :Type "ocr"
  :UserInstruction (str "Analyse the image of a receipt and return only the items and their amounts. "
                        "No need to include sub-totals, totals and other data.")
  :LLM "llm01"}}

{Agent
 {:Name "expense-agent"
  :Type "eval"
  :LLM "llm01"
  :Chat
  {:Messages
   [:q# [{:role :system
          :content (str "You are an intelligent agent who summarizes an expense report as a list of expense instances. For example, "
                        "if the report is \"I spent $200 on air ticket and $80 on food\", the summary should be "
                        "[{:Expense.Workflow/Expense {:Title \"air ticket\" :Amount 200}}, "
                        "{:Expense.Workflow/Expense {:Title \"food\", :Amount 80}}]")}]]}
  :Delegates {:To "receipt-ocr-agent" :Preprocessor true}}} ; preprocess the bill-image with the ocr-agent.

;; Usage:
;; POST api/Expense.Workflow/SaveExpenses
;; {"Expense.Workflow/SaveExpenses": {"UserInstruction": "https://acme.com/bill/myexpense.jpg"}}
(inference :SaveExpenses {:agent "expense-agent"})
```

## LLM Configuration

The `:Agentlang.Inference.Provider/LLM` entity has an attribute called `:Config` which allows the LLM provider to be finely tuned. As of now only the OpenAI is supported as a provider and the default configuration suffices for most purposes. The following code-snippet shows how a custom-configuration may be provided for an LLM instance:

```clojure
{:Agentlang.Inference.Provider/LLM ; or simply {LLM { ... }}
 {:Type "openai"
  :Name "my-llm"
  :Config {:ApiKey (agentlang.util/getenv "OPENAI_API_KEY")
           :EmbeddingApiEndpoint "https://api.openai.com/v1/embeddings"
           :EmbeddingModel "text-embedding-3-small"
           :CompletionApiEndpoint "https://api.openai.com/v1/chat/completions"
           :CompletionModel "gpt-3.5-turbo"}}}
```
