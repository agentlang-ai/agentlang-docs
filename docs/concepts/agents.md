# Intelligent Agents

Agentlang is the only language designed from the ground-up to program with AI agents. The abstractions for agents and LLMs are defined as entities, i.e the higher-level AI capabilities of Agentlang is modelled in Agentlang itself.

## Types of Agents

The various types of agents built-into Agentlang are:

1. `:chat` - An agent that can engage in a conversation with a human or other agents. Most other types of agents are built on top of the basic chat-agent.
2. `:ocr` - An agent that analyzes an image to extract textual information.
3. `:planner` - A planner can make use of *tools* in the form of entity and event definitions appearing in a component. A planner may also use other agents as tools. (For a detailed example of a planner-agent, please see the [advanced tutorial](../tutorial.md) section).
4. `:eval` - An agent that can generate dataflow patterns like `:planner`, but requires explicit instructions to do so.
5. `:classifier` - An agent that analyzes input text and decides which delegate to invoke the specific request.

An agent's capabilities can be enhanced not just by tools, but also with a *knowledge-base*. This is detailed in the [quick start](../quick-start.md) guide.

Let's conclude this section with an example that demonstrates the `ocr` and `eval` agents. The following programs show two interacting agents. The main agent is of type `eval` which makes use of an `ocr` sub-agent (or delegate) to extract expense data from the image of a bill and persist that data in a database by creating instances of an `:Expense` entity.

```clojure
(component :Expense.Workflow)

(entity
 :Expense
 {:Id :Identity
  :Title :String
  :Amount :Double})

{:Agentlang.Core/LLM {:Type :openai :Name :llm01}}

{:Agentlang.Core/Agent
 {:Name :receipt-ocr-agent
  :Type :ocr
  :UserInstruction (str "Analyse the image of a receipt and return only the items and their amounts. "
                        "No need to include sub-totals, totals and other data.")
  :LLM :llm01}}

{:Agentlang.Core/Agent
 {:Name :expense-agent
  :Type :planner
  :LLM :llm01
  :UserInstruction "Convert an expense report into individual instances of the expense entity."
  :Tools [:Expense.Workflow/Expense]
  :Input :Expense.Workflow/SaveExpenses
  :Delegates {:To :receipt-ocr-agent :Preprocessor true}}} ; preprocess the bill-image with the ocr-agent.

;; Usage:
;; POST api/Expense.Workflow/SaveExpenses
;; {"Expense.Workflow/SaveExpenses": {"UserInstruction": "https://acme.com/bills/myexpense.jpg"}}
```

## LLM Configuration

The `:Agentlang.Core/LLM` entity has an attribute called `:Config` which allows the LLM provider to be finely tuned. As of now only OpenAI is supported as a provider and the default configuration suffices for most purposes. The following code-snippet shows how a custom-configuration may be provided for an LLM instance:

```clojure
{:Agentlang.Core/LLM
 {:Type "openai"
  :Name "my-llm"
  :Config {:ApiKey (agentlang.util/getenv "OPENAI_API_KEY")
           :EmbeddingApiEndpoint "https://api.openai.com/v1/embeddings"
           :EmbeddingModel "text-embedding-3-small"
           :CompletionApiEndpoint "https://api.openai.com/v1/chat/completions"
           :CompletionModel "gpt-3.5-turbo"}}}
```