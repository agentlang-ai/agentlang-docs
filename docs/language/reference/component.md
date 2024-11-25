# Component

A Fractl model consist of multiple components. A component captures the entities and business logic
relevant to a significant concept in the model. For example, the model for an inventory application
may have different components for warehouses, suppliers and customers.

**Example** 

```clojure
(component :Acme.Inventory.CRM)
```

The above declaration adds a new component `:CRM` to the model `:Acme.Inventory`. The component may have
a specification map for which the valid keys are `:clj-import` and `:refer`. The value of `:clj-import` must be a vector of
namespace import specifications for Clojure or Java.

**Example**

```clojure
(component :Acme.Inventory.CRM
 {:clj-import '[(:require [fractl.lang.datetime :as dt]
                          [clojure.java.io :as io])
                (:use [fractl.util])]})
```

The value of `:refer` must be a vector of component names that the current component is dependent on.

**Example**

```clojure
(component :Acme.Inventory.CRM
 {:refer [:Acme.Core :Acme.Accounts]})
```
