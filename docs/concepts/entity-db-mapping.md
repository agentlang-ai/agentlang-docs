# Entity-graph-Database Mapping

Entities in a Fractl model are backed by a backend store, typically a relational database.

The entire Entity-relationship graph (entities, relationships and associated metadata) is persisted in the database. The Fractl runtime automatically creates and manages the database schema, with fully automated data conversions between the language and the underlying storage-layer.

The exception to this are entities that correspond to external resources - such entities are persisted on the external system. The communication with the external system to perform operations on these entity instances is achieved through a Fractl **[Resolver](resolvers.md)**.
