# Graph-based Data Model

**Fractl** introduces an innovative **Graph-based Hierarchical** Data Model. This data model is ideal for representing the structure of information in most applications. This is a better fit over relational and, even, generic graph-based approaches.

The following are some salient features of the data model:

* **Entity-relationship Graph**: Domain data is captured as entities. Entities that are related to each other are mutually linked via a relationship. The entities and relationships form a graph, with entities as nodes and relationships as links.

![Graph Data Model](img/entity-relationship.png "Entity-Relationship")

* **Hierarchical**: There are two kinds of relationships - `:contains` and `:between`. While `:between` relationship is a simple association between the two entities, `:contains` relationship can be thought-of as a more structured parent-child relationship. Entities that are related to each other via a `:contains` relationship form a tree. So, the data model ends up being a graph of trees.

![Hierarchical Graph Data Model](img/entity-relationship-contains.png "Entity-Relationship-contains")

TBD:
* **Type Inheritance**:


