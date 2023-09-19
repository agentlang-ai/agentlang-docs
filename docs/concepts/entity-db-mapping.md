# Entity-graph-Database Mapping

Entities in a Fractl model are backed by a backend store, typically a relational database.

The entire Entity-relationship graph (entities, relationships and associated metadata) is persisted in the configured database. The Fractl runtime automatically creates and manages the database schema, handling the conversion of the graph data model to the store's data model (we support relational DBs, currently), automatically.

The exception to this are entities that correspond to external resources - such entities are persisted on the external system and the communication with the external system to perform operations on these entity instances is achieved through a Fractl **[Resolver](resolvers.md)** for the system.
