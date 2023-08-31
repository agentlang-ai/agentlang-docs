# Entity

An `entity` is a `record` whose instances are automatically persisted by fractl.

**Example**

```clojure
(entity :Acme.Inventory.CRM/Customer
 {:FirstName :Kernel/String
  :LastName :Kernel/String
  :ContactInfo :Acme.Inventory.CRM/Contact
  :CustomerSince :Kernel/DateTime})
```

Note the type of the `:ContactInfo` attribute - when creating an instance of `:Customer`,
a full `:Contact` object must be passed as its value. This instance will be persisted along with the
customer.

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

In the above example, a `:Contact` instance is first created and assigned to the *alias* `:C`.
The second pattern creates a `:Customer` and assigns `:C` as its contact-info. (An *alias* is a
placeholder for values created by patterns, similar to variables in other languages).

Another way to declare the `:Customer` entity is by making it a sub-type of `:Contact`. This is
achieved by using the `:inherits` meta clause.

```clojure
(entity :Acme.Inventory.CRM/Customer
  {:meta {:inherits :Acme.Inventory.CRM/Contact}
   :FirstName :Kernel/String
   :LastName :Kernel/String
   :CustomerSince :Kernel/DateTime})
```

The `:Customer` entity no longer requires a `:ContactInfo` attribute as it inherits the relevant attributes from
`:Contact`. With this change, a new `:Customer` instance can be created with a single pattern,

```clojure
{Acme.Inventory.CRM/Customer
 {:FirstName "A"
  :LastName "Jay"
  :ContactInfo :C
  :CustomerSince "2023-02-01T13:49:10.916982"
  :Street1 "432/78"
  :Street2 "Broadway"
  :City "NY"
  :State "NY"
  :Zip "10012"
  :Phone "(212)555-7788"
  :Email "c432@abc.com"}}
```
The customer can also be uniquely identified in the system by `:Email` because it inherits the `:identity` property,
as declared in the parent-type, i.e `:Contact`.