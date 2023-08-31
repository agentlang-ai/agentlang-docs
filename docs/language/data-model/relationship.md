# Relationship

A `relationship` is a `record` used to create graph-like structures from entities. Relationships are derived from entities
(which are, in turn derived from records). As they are extension of entities, instances of relationships are also
persisted by fractl.

There are two types of relationships that are possible in fractl - `contains` and `between`.

## contains

A `contains` relationship creates a tree-like hierarchy where the root node is made up of a "parent" entity
and the leaves are made of "child" entities that are said to be "contained" within the parent. An example is the
relationship between department and employees.

**Example**

```clojure
(entity :Acme/Department
 {:No {:type :Kernel/Int :identity true}
  :Name {:type :Kernel/String :unique true}})

(entity :Acme/Employee
 {:Id {:type :Kernel/String :identity true}
  :FirstName :Kernel/String
  :LastName :Kernel/String
  ;; other attributes ...
  })

(relationship :Acme/WorksFor
 {:meta {:contains [:Acme/Department :Acme/Employee]}
  :StartDate :Kernel/DateTime})
```

Once an entity is declared to be "contained" by another entity, its instances can be created or queried only
in the context of the parent instance.

**Example**

```clojure
;; Query a department by `:No`
{:Acme/Department {:No? 123} :as :D}
;; Create a new employee in the department
{:Acme/Employee
  {:Id "emp01"
   :FirstName "A"
   ; ....
   }
 :-> [{:Acme/WorksFor {:StartDate "2023-12-01T00:00:00.000000"}}
      :D]}
```

The `:->` tag creates a link between the new employee and the department `:D` via a new instance of
the `:Acme/WorksFor` relationship. Now the employee could be loaded only in the context of this relationship.

**Example**

```clojure
;; query the employee
{:Acme/Employee {:Id? "emp01"}
 :-> [:Acme/WorksFor? {:Acme/Department {:No? 123}}]}
```

The above query will succeed only of a `:WorksFor` relationship exists between
the department `123` and the employee with `:Id` `"emp01"`.

## between

A `between` relationship creates a graph-like structure from entity declarations. All entities involved in a `between`
relationship has equal status and the relationship-link could be established from either side. A common example of
a `between` relationship is that of friendship between people.

**Example**

```clojure
{:Social/Person
 {:Email {:type :Kernel/Email :identity true}
  :FirstName :Kernel/String
  ; ...
  }}

(relationship :Social/Friendship
 {:meta {:between [:Social/Person :Social/Person]}})
```

The following pattern shows how to create a friendship relationship between two pre-existing persons:

```clojure
{:Social/Person {:Email? "abc@social.org"} :P1}
{:Social/Person {:Email? "xyz@social.org"}
 :-> [{:Social/Friendship {}} :P1]}
```
