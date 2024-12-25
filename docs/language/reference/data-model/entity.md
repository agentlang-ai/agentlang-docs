# Entity

An `entity` is a `record` whose instances are automatically persisted by Agentlang.

**Example**

```clojure
(entity :Acme.Inventory.CRM/Customer
 {:FirstName :String
  :LastName :String
  :ContactInfo :Acme.Inventory.CRM/Contact
  :CustomerSince :DateTime})
```

Note the type of the `:ContactInfo` attribute - when creating an instance of `:Customer`, a full `:Contact` object must be passed as its value. This instance will be persisted along with the customer.

```clojure
;; Creating an instance of `:Customer`
{:Acme.Inventory.CRM/Contact
 {:Street1 "432/78"
  :Street2 "Broadway"
  :City "NY"
  :State "NY"
  :Zip "10012"
  :Phone "(212)555-7788"
  :Email "c432@abc.com"}
 :as :C}

{Acme.Inventory.CRM/Customer
 {:FirstName "A"
  :LastName "Jay"
  :ContactInfo :C
  :CustomerSince "2023-02-01T13:49:10.916982"}}
```

In the above example, a `:Contact` instance is first created and assigned the *alias* `:C`. The second pattern creates a `:Customer` and assigns `:C` as its contact-info. (An *alias* is a placeholder for values created by patterns, similar to variables in other languages).

Another way to declare the `:Customer` entity is by making it a sub-type of `:Contact`. This is achieved by using the `:inherits` meta clause.

```clojure
(entity :Acme.Inventory.CRM/Customer
  {:meta {:inherits :Acme.Inventory.CRM/Contact}
   :FirstName :String
   :LastName :String
   :CustomerSince :DateTime})
```

The `:Customer` entity no longer requires a `:ContactInfo` attribute as it inherits the relevant attributes from `:Contact`. With this change, a new `:Customer` instance can be created with a single pattern,

```clojure
{Acme.Inventory.CRM/Customer
 {:FirstName "A"
  :LastName "Jay"
  :CustomerSince "2023-02-01T13:49:10.916982"
  :Street1 "432/78"
  :Street2 "Broadway"
  :City "NY"
  :State "NY"
  :Zip "10012"
  :Phone "(212)555-7788"
  :Email "c432@abc.com"}}
```
The customer can also be uniquely identified in the system by `:Email` because it inherits the `:guid` property, as declared in the parent-type, i.e `:Contact`,

```clojure
{:Acme.Inventory.CRM/Contact
 {:Street1 :String
  :Street2 :String
  :City :String
  :State :String
  :Zip :String
  :Phone :String
  :Email {:type :Email :guid true}}}
```

## Computed Attributes

An attribute specification can be an **expression**, so that its value is dynamically computed. An example is shown below:

```clojure
(entity :Acme.Inventory/Product
 {:SerialNo {:type :String :guid true}
  :Price :Decimal
  :Tax '(* :Price 0.015)})
```

When an instance of `:Product` is created, value of its `:Tax` will be automatically calculated.

The expression given in an entity-spec can only refer to the attributes in the entity itself. If the computation needs more context, the expression has to be moved to a dataflow, as demonstrated in the following code snippet:

```clojure
(entity :Acme.Inventory/Product
 {:SerialNo {:type :String :guid true}
  :Price :Decimal
  :Tax :Decimal})

(dataflow :Acme.Inventory/CreateProduct
 {:Acme.Inventory/Product
  {:SerialNo :Acme.Inventory/CreateProduct.SerialNo
   :Price :Acme.Inventory/CreateProduct.Price
   :Tax '(+ (* :Price 0.015) :Acme.Inventory/CreateProduct.FixedTax)}})
```

#### Expression Syntax

As we saw in the examples above, **expressions** have the general syntax - `(fn arg1 arg2 ...)`. `Fn` must be the name of a Clojure function. The arguments can be one of,

1. Numeric or string literals - e.g 122.33, "hello, world"
2. Keyword references - e.g :Price, :Acme.Inventory/CreateProduct.FixedTax

The keyword references must be either,

1. the name of an attribute of the entity-instance being defined.
2. a reference to an attribute of a record, entity or event in the current execution context.
