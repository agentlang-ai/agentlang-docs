# Declarative Dataflow

Custom business logic is written in Fractl using Dataflows. Each dataflow is a collection of patterns. Each pattern is a declarative assertion on the domain that performs a (sometimes, conditional) CRUD operation on entity instance(s), evaluates a function or triggers other events.

Dataflow patterns are written in a data-oriented syntax in fractl language and are represented by dataflow pattern blocks in the design studio.

## References

Most Dataflow patterns, when evaluated, generate a result set - the result set, or a subset of it, might be used in one or more of the dataflow pattern(s) that follow. Dataflow patterns can simply reference the result of a prior dataflow pattern using the name of the entity in the pattern or an alias assigned to the result set.

These references together form a graph of references within the dataflow. There are a multitude of use cases for this graph - static analysis, test generation, parallel evaluation, etc. This graph can also, and will in the future, be used to instantiate a dataflow as a stream-processing operator graph.

## Destructuring

Some dataflow patterns return a collection of entity instances as the result of evaluation (e.g., queries). However, only a subset of the result set (first, or first n, or second, or last, or last n, etc) might be relevant for future dataflow patterns. To enable this, Dataflow patterns support destructuring the results - with this capability, the subset of the result set that is of interest can be assigned an alias and future patterns reference the subset by simply using the alias.
