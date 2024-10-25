# Attribute

You may find that some attribute specifications repeat themselves in different records. For instance, the specifications for phone number and zip code could repeat for customers, suppliers and other records. So having a reusable specification for these attributes can become handy. The `attribute` construct can help us here.

**Example**

```clojure
(component :Acme.Inventory.Types)

(attribute :PhoneNumber
 {:type :String
  :format "^(1\\s?)?(\\d{3}|\\(\\d{3}\\))[\\s\\-]?\\d{3}[\\s\\-]?\\d{4}$"})

(defn valid-zip? [s]
  (and (= 5 (count s))
       (<= 501 (Integer/parseInt s) 99950)))

(attribute :ZipCode
 {:type :String
  :check valid-zip?})
```

With these new declarations, the `:Contact` record can be defined as:

```clojure
(record :Acme.Inventory.CRM/Contact
 {:Street1 :String
  :Street2 {:type :String
            :optional true}
  :City :String
  :State {:oneof ["NY", "NJ", "MA"]}
  :Zip :Acme.Inventory.Types/ZipCode
  :Phone :Acme.Inventory.Types/PhoneNumber
  :Email :Email})
```

## Attribute Spec

The attribute-specification normally consists of a type-name which may be drawn from a pool of basic types built-into Agentlang. These built-in types are listed below:

```clojure
:String - a string literal enclosed in double-quotes
:Keyword - a keyword literal, may also be encoded as a string. (e.g `:abc` or `"abc"`)
:Path - a path to a model element, e.g :Acme.Inventory.CRM
:DateTime - a string that conforms to the ISO 8601 date-time format, e.g `"2023-01-31T15:57:14.428506"`
:Date - a string that conforms to the ISO 8601 date format
:Time - that conforms to the ISO 8601 time format
:Now - :DateTime that defaults to the current date-time value
:UUID - a UUID string, e.g `"123e4567-e89b-12d3-a456-426614174000"`
:Identity - :UUID with a default value
:Int - a fixed precision integer, based on the architecture could be 32bit or 64bit
:Int64 - an integer with 64bit precision
:BigInteger - an arbitrary precision integer
:Float - a 32bit floating-point number
:Double - a 6bit floating-point number
:Decimal - an arbitrary-precision signed decimal number
:Boolean - `true` or `false`
:Record - an instance of a type defined by `record`
:Entity - an instance of a type defined by `entity`
:Event - an instance of a type defined by `event`
:Email - a valid email string
:Map - a map literal enclosed by { }
:Edn - an edn encoded object
:Any - any of the above, no strict type check
```

An attribute specification can contain more information when expressed as a map. The syntax for this is:

```clojure
{property-1 property-spec-1
 ...
 property-N property-spec-N}
```

The keys *property-1*, etc are specific keywords. The meaning of the property-specifications depends on
the keyword. Valid property names and their settings are described below:

```
:check - a single-arg Clojure predicate for validating values assigned to the attribute
:unique - if `true`, Agentlang will ensure each instance of an entity will have a different value for this attribute
:immutable - if `true`, once assigned, the attribute's value will remain read-only
:optional - if `true`, attribute value is optional
:default - the default value of the attribute
:type - name of the attribute's type
:guid - if `true`, the attribute will be used by Agentlang to uniquely identify each instance of an entity
:expr - a Clojure expression that will be evaluated to compute the attribute's value
:format - a regex pattern for validating an attribute of type :Kernel/String
:listof - only a list (a Clojure vector) of the specified type can be assigned to the attribute
:setof - only a Clojure set of the specified type can be assigned to the attribute
:oneof - a list of valid values for the attribute
:indexed - if `true`, the backend store will index the attribute for fast lookup
:write-only - if `true`, the attribute's values will not be returned by lookups and queries
:type-in-store - a string that specifies the storage type for the attribute, e.g `VARCHAR (80)`
:ref - a path to an attribute in another entity, e.g `:Acme.Inventory.CRM/Customer.Id`.
:writer - a Clojure function that accepts the value of the attribute and returns its textual representation
:secure-hash - a Clojure function to hash the value of the attribute
```

The `:default` option could be a literal (string, number etc) or a no-arg function. If it's a function,
Agentlang will call the function and use the return value as the default. (The `:default` value is used when
no value is specified for the attribute while creating an instance).

Note that for `:ref` the value provided must exist at the other end of the path, otherwise Agentlang runtime will
throw an exception. This is similar to a foreign-key relationship in an RDBMS.

The `:indexed` property should be set for attributes on which queries are performed. Note that
`:guid` and `:unique` attributes are indexed by default.

**Example**

```clojure
(record :Acme.Inventory.CRM/Contact
 {:Street1 :String
  :Street2 {:type :String
            :optional true}
  :City :String
  :State {:oneof ["NY", "NJ", "MA"]}
  :Zip {:type :String
        :check valid-zip?}
  :Phone {:type :String
          ;; US phone number format, e.g (555)555-5555
          :format "^(1\\s?)?(\\d{3}|\\(\\d{3}\\))[\\s\\-]?\\d{3}[\\s\\-]?\\d{4}$"}
  :Email {:type :Email :guid true}})

(defn valid-zip? [s]
  (and (= 5 (count s))
       (<= 501 (Integer/parseInt s) 99950)))
```

### Extended Attributes for Relationships

Consider the following model of a relationship between Employees:

```clojure
(entity :Acme/Department
 {:No {:type :Int :guid true}})

(entity :Acme/Employee
 {:Id {:type :Int :guid true}
  :Name :String})

(relationship :Acme/DepartmentEmployee
 {:meta {:contains [:Acme/Department :Acme/Employee]}})
```

Now we can create a department and add employees under it using separate API calls to `POST :Acme/Department` and `POST :Acme/Employee`. Sometimes it's more convenient to create the parent (department) and the related children (employees) together, in a single shot. This can be achieved by extending `:Department` with an optional attribute that can take a vector of employee information. Such an attribute can be defined as:

```clojure
(attribute :Acme/Employees
 {:extend :Acme/Department
  :type :Acme/Employee
  :relationship :Acme/DepartmentEmployee})
```

This will allow the creation of a department with a list of employee-instances as:

```shell
POST api/Acme/Department

{"Acme/Department": {"No": 101, "Employees": [{"Id": 1, "Name": "sam"}, {"Id": 2, "Name": "Joe"}]}}
```

Such extension attributes can be defined for both `:contains` and `:between` relationships. The extended-attribute definition can also accept an optional `:order` property, which specifies the order in which the attributes needs to be evaluated. For example, the following extensions makes sure that the `:A` attribute is set before `:B`:

```clojure
(attribute :A
 {:extend :Entity1
  :type :Entity2
  :relationships :Relationhip1
  :order 0})

(attribute :B
 {:extend :Entity1
  :type :Entity3
  :relationships :Relationhip2
  :order 1})
```

The value of the attribute with the lowest `order` will be processed first. This will be required resolve any dependency issues between instances created for different extended attributes.
