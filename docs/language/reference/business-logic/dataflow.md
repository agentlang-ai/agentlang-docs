# Dataflow

Business and data-processing logic is expressed in Fractl as *dataflows*. 
A `dataflow` declaration will have the following general syntax:

```clojure
(dataflow event-name patterns)
```

The dataflow is said to be *triggered* when an instance of the event of type `event-name` is created.
Triggering dataflow has the effect of *evaluating* each pattern in sequence, the result of this evaluation
process will be the value returned by the final pattern. If any of the pattern creates an instance of an event,
the dataflow attached to that event will be triggered.

**Example**

```clojure
(event :Social/CreateFriendship
 {:Email1 :Email
  :Email2 :Email})

(dataflow :Social/CreateFriendship
 {:Social/Person {:Email? :Social/CreateFriendship.Email1} [:P1]}
 {:Social/Person {:Email? :Social/CreateFriendship.Email2}
  :-> [[{:Social/Friendship {}} :P1]]})
```

The preceding code-snippet creates an event with two email attributes. Then a dataflow is defined on this event.
There are two patterns in this dataflow - the first pattern queries a `:Person` whose email is the value of
`:CreateFriendship.Email1`. If such a person exists, evaluation proceeds to the next pattern, if the person could not be
found the dataflow returns a data `not-found` result. The second pattern will query the person whose email
is `CreateFriendship.Email2` and links the two persons via a `:Friendship` relationship.

The pattern language used by dataflows is very expressive and may be categorized as,

1. **[Create pattern](docs/language/reference/business-logic/dataflow-patterns.md#create)**
2. **[Query pattern](docs/language/reference/business-logic/dataflow-patterns.md#query)**
3. **[Delete pattern](docs/language/reference/business-logic/dataflow-patterns.md#delete)**
4. **[Match pattern](docs/language/reference/business-logic/dataflow-patterns.md#match)**
5. **[For-each pattern](docs/language/reference/business-logic/dataflow-patterns.md#for-each)**
6. **[try pattern](docs/language/reference/business-logic/dataflow-patterns.md#try)**
7. **[eval pattern](docs/language/reference/business-logic/dataflow-patterns.md#eval)**

## Result format

Evaluating a dataflow produces a result-map of the form,

```clojure
{:status s :result r :message m}
```

`:status` will be `:ok` on success. If a query-pattern fails to find data, `:status` is set to `:not-found`.
If there's an exception, `:status` will be `:error` and `:message` may contain a string describing the error.

For query and update patterns, `:result` will be a sequence of entity-instances.