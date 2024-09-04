# AI

The `:Agentlang.Core` component defines entities, relationships and events required for the AI-related abstraction of Agentlang. The main entities in this component are `:LLM` and `:Agent`. It also defines entities like `:Document` (for knowledge-bases) and `:Tool`. There are relationships defined between `:Agent` and the other entities. There's also a `:between` relationship between agents called `:AgentDelegate` for managing inter-agent dependencies.
