# Relationship

A `relationship` is used to create hierarchical or graph-like structures from entities. 
There are two types of relationships that are possible in Fractl - `contains` and `between`.

## contains

A `contains` relationship creates a tree-like hierarchy where the root node is made up of a *parent* entity
and the leaves are made of *child* entities. Child entities are said to be *contained* within the parent. An example is the
relationship between department and employees.

**Example**

```clojure
(entity :Acme/Department
 {:No {:type :Int :guid true}
  :Name {:type :String :unique true}})

(entity :Acme/Employee
 {:Id :Identity
  :Name {:type :String 
         :id true}
  :FirstName :String
  :LastName :String
  ;; other attributes ...
  })

(relationship :Acme/WorksFor
 {:meta {:contains [:Acme/Department :Acme/Employee]}})
```

Once an entity is declared to be *contained* by another entity, its instances may be created or queried only
in the context of the parent instance. In the above example, an `:Employee` belongs to a `:Department` and is
uniquely identified within the department by its `:Name` attribute. This means, employees with the same name 
may belong to different departments. The `:id` setting of `:Name` builds a unique path for each
`:Employee` in the format `"path://Acme/Department/<dept-no>/WorksFor/Employee/<employee-name>"`. The `:Id`
attribute is declared as `:Identity` for the `:Employee`. It will be an auto-generated `UUID` that acts as the 
globally-unique identifier for an employee.


**Example**

```clojure
;; Query a department by `:No`
{:Acme/Department {:No? 123} :as [:D]}
;; Create a new employee in the department
 {:Acme/Employee
  {:Name "emp01"
   :FirstName "A"
   :LastName "B"}
  :-> [[:Acme/WorksFor :D]]})
```

The `:->` tag creates a link between the new employee and the department `:D` via the `:Acme/WorksFor` relationship. 
Now the employee may be referred to only in the context of this relationship.

**Example**

```clojure
;; query the employee
 {:Acme/Employee {}
  :-> [[:Acme/WorksFor? {:Acme/Department {:No? 123}} "emp01"]]})
```

The above query will succeed only if a `:WorksFor` relationship exists between the department `123` and the employee with `:Name` `"emp01"`.

## between

A `between` relationship creates a flat-graph structure with entity instances as nodes. All entities involved in a `between`
relationship has equal status and the relationship-link could be established from either side. A common example of
a `between` relationship is that of friendship between people.

**Example**

```clojure
(entity :Social/Person
 {:Email {:type :Email :guid true}
  :FirstName :String
  ; ...
  })

(relationship :Social/Friendship
 {:meta {:between [:Social/Person :Social/Person]}})
```

The following pattern shows how to create a friendship relationship between two pre-existing persons:

```clojure
{:Social/Person {:Email? "abc@social.org"} :as [:P1]}
{:Social/Person {:Email? "xyz@social.org"}
 :-> [[{:Social/Friendship {}} :P1]]}
```

Unlike a `:contains` relationship, a `:between` relationship is persisted in the store just like an entity instance.
This means a `:between` relationship can have its own attributes and can be created or queried just like entities.
The following pattern directly queries an instance of `:Friendship` based on the two node attributes:

```clojure
{:Social/Friendship
 {:Person1? "xyz@social.org"
  :Person2? "abc@social.org"}}
```

It's possible to customize the names of the node-attributes, as well as to have custom attributes:

```clojure
(relationship :Social/Friendship
 {:meta {:between [:Social/Person :Social/Person :as [:From :To]]}
  :FriendsSince :Date})
```

The preceding declaration renames `:Person1` as `:From` and `:Person2` as `:To`. 
It also keeps track of the date and time when the friendship was created.

```clojure
;; Creating a friendship

{:Social/Person {:Email? "abc@social.org"} :as [:P1]}
{:Social/Person {:Email? "xyz@social.org"}
 :-> [[{:Social/Friendship {:FriendsSince "2022-12-30"}} :P1]]}
 
 ;; or

{:Social/Friendship
 {:From "xyz@social.org"
  :To "abc@social.org"
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

By default, multiple edges can be created between the same nodes. This behavior can be overridden by the
`:one-n` and `:one-one` properties.

**Example**

```clojure
; :one-one
; Only one instance of R can be created with a particular
; combination of :A and :B
(relationship :R
 {:meta {:between [:A :B :one-one true]}})

; :one-n
; Only one instance of R can be created with an :A.
; There could be duplicate edges to the same instance of :B.
(relationship :R
 {:meta {:between [:A :B :one-n true]}})
```
