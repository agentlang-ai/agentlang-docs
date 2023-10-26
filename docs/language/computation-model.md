# Computation Model

This document describes the rules followed by the Fractl runtime for evaluating dataflow-patterns.

## The Fractl Interpreter

Evaluating the patterns in a dataflow is the job of an abstract machine known as the Fractl interpreter.
The Fractl interpreter executes a sequence of low-level commands known as opcode - this means it cannot work 
directly with dataflow patterns. So before evaluating a dataflow, the interpreter will ask the Fractl compiler 
to translate the patterns to opcode. This compilation process happens only once for a dataflow, as the generated 
opcode is cached for future executions.

Each dataflow evaluation happens in the context of a datastructure known as the **environment** and an active
**transaction** on the underlying persistent store. The **environment** is a simple map of key-value pairs and it
stores some internal values relevant for the interpreter and also *bindings* of values created by the evaluation of
patterns. The **transaction** is used for updating and querying the data-store. If any of the patterns result in an error,
the interpreter will rollback the transaction, terminate the evaluation process and return the error. On success, the value 
returned by a dataflow will be the result of evaluating the last pattern in the dataflow.

## Instance Patterns

The patterns of the form `{:Name {:Attribute1 value1 ...} :as :Alias}` are treated as representations of
record, entity or event instances. These patterns will cause an instance of the appropriate type to
be created. Data-validations are applied to the attribute-values before the instance is fully realized. 
If the instance creation succeeds, it will be "interned" into the environment under the key `:Name`. 
In the case of records and entities, if `:Alias` is specified, the instance can also be accessed from 
the environment using `:Alias` as a key. If there was an error creating the instance, the dataflow evaluation 
is terminated and the error returned.

If `:Name` refers to an entity, the new instance is added to the persistent store. If there's a conflict in the
store over the unique-attributes of the instance, this will be a no-op.

If `:Name` refers to an event, the dataflow attached to the event is executed, and the value is interned in the environment.
(This value is also bound to `:Alias`, if that's specified).

## Query Patterns

If the `:Name` of `:Attribute` keys indicate queries, as in `{:Name {:Attribute1? value1} :as :Alias}` or `{:Name? {} :as :Alias}`,
the compiler will generate an abstract query that can further be compiled to store-specific query-strings or commands.
If the query-pattern in mixed with normal attribute bindings, as in `{:Name {:Attribute1? value1 :Attribute2 new-value}}`, the
compiler will generate code to query and then update the queried instance.

## Vector Patterns

A **vector pattern** takes the form `[:command arg1 arg2 ...]`. Fractl can deal with a bunch of commands like `:delete`, 
`:match` or `:for-each`, the rules of compiling and evaluating these being built-into the language.

## References

**References** denote names that can point to values in the environment. This could be fully-qualified names like
`:Acme.Core/Employee` or aliases like `:Emp`. The value associated with the name is looked up in the environment and returned.
If no value is bound, an error is raised and evaluation of the dataflow terminates.
