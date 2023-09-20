# Relationship

A `relationship` is used to create graph-like structures from entities. There are two types of relationships that are possible in fractl - `contains` and `between`.

## contains

A `contains` relationship creates a tree-like hierarchy where the root node is made up of a *parent* entity
and the leaves are made of *child* entities that are said to be *contained* within the parent. An example is the
relationship between department and employees.

**Example**

```clojure
(entity :Acme/Department
 {:No {:type :Int :identity true}
  :Name {:type :String :unique true}})

(entity :Acme/Employee
 {:Id {:type :String :identity true}
  :FirstName :String
  :LastName :String
  ;; other attributes ...
  })

(relationship :Acme/WorksFor
 {:meta {:contains [:Acme/Department :Acme/Employee]}})
```

Once an entity is declared to be *contained* by another entity, its instances may be created or queried only
in the context of the parent instance.

**Example**

```clojure
;; Query a department by `:No`
{:Acme/Department {:No? 123} :as [:D]}
;; Create a new employee in the department
{:Acme/Employee
  {:Id "emp01"
   :FirstName "A"
   ; ....
   }
 :-> [[:Acme/WorksFor :D]]}
```

The `:->` tag creates a link between the new employee and the department `:D` via the `:Acme/WorksFor` relationship. 
Now the employee may be referred to only in the context of this relationship.

**Example**

```clojure
;; query the employee
{:Acme/Employee {:Id? "emp01"}
 :-> [[:Acme/WorksFor? {:Acme/Department {:No? 123}}]]}
```

The above query will succeed only if a `:WorksFor` relationship exists between the department `123` and the employee with `:Id` `"emp01"`.

## between

A `between` relationship creates a flat-graph structure with entity instances as nodes. All entities involved in a `between`
relationship has equal status and the relationship-link could be established from either side. A common example of
a `between` relationship is that of friendship between people.

**Example**

```clojure
{:Social/Person
 {:Email {:type :Email :identity true}
  :FirstName :String
  ; ...
  }}

(relationship :Social/Friendship
 {:meta {:between [:Social/Person :Social/Person]}})
```

The following pattern shows how to create a friendship relationship between two pre-existing persons:

```clojure
{:Social/Person {:Email? "abc@social.org"} [:P1]}
{:Social/Person {:Email? "xyz@social.org"}
 :-> [[{:Social/Friendship {}} :P1]]}
```

Unlike a `:contains` relationship, a `:between` relationship is persisted in the store just like an entity instance.
This means a `:between` relationship can have its own attributes and can be created an queried just like entities.
The following pattern directly queries an instance of `:Friendship` based on the two node attributes:

```clojure
{:Social/Friendship
 {:Person1? "abc@social.org"
  :Person2? "xyz@social.org"}}
```

It's possible to customize the names of the node-attributes, as well as have custom attributes:

```clojure
(relationship :Social/Friendship
 {:meta {:between [:Social/Person :Social/Person :as [:From :To]]}
  :FriendsSince :Date})
```

The preceding declaration renames `:Person1` as `:From` and `:Person2` as `:To`. 
It also keeps track of the date and time when the friendship was created.

```clojure
;; Creating a friendship

{:Social/Person {:Email? "abc@social.org"} [:P1]}
{:Social/Person {:Email? "xyz@social.org"}
 :-> [[{:Social/Friendship {:FriendsSince "2022-12-30"}} :P1]]}
 
 ;; or

{:Social/Friendship  
 {:From "abc@social.org"
  :To "xyz@social.org"
  :FriendsSince "2022-12-30"}}
  
;; query by email
{:Social/Friendship
 {:From? "abc@social.org"
  :To? "xyz@social.org"}}

;; query all friendships for a person, established since a date
{:Social/Friendship
 {:From? "abc@social.org"
  :FriendsSince? [:>= "2022-01-01"]}}
```
