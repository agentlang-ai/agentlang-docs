# Quick Start

In this section, we will develop a more involved application in Agentlang. We'll be designing a customer-support agent, that can answer user queries on specific products and also keep track of its chat-session. Let's start by creating a new Agentlang script called `customer_support.agent`.


```clojure
(component :CustomerSupport)

(agent :CustomerSupport/Agent
 {:UserInstruction "You are an agent that user-questions about specific products."
  :LLM {:Type "openai"}})

(inference :Chat {:agent :CustomerSupport/Agent})
```

TODO: run the service and execute some queries. show how chat-history is maintained.

TODO: explain the need for documents and add documents.

TODO: split the various aspects of support into multiple agents and show interactions between them (delegates)

TODO: next application - ocr agent

TODO: next application - extend ocr example with a planner agent and pattern evaluation

TODO: get back to customer-support and show how agents can be made specific to users (this may involve dataflows for initing agents)
