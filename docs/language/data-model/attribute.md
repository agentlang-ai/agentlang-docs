# Attribute

You may find that some attribute specifications repeat themselves in different records.
For instance, the specifications for phone numbers and zip codes could repeat for customers, suppliers and
probably other records. So having a reusable specification for these attributes is useful.
The `attribute` declaration can help us here.

**Example**

```clojure
(component :Acme.Inventory.Types)

(attribute :PhoneNumber
 {:type :Kernel/String
  :format "^(1\\s?)?(\\d{3}|\\(\\d{3}\\))[\\s\\-]?\\d{3}[\\s\\-]?\\d{4}$"})

(defn valid-zip? [s]
  (and (= 5 (count s))
       (<= 501 (Integer/parseInt s) 99950)))

(attribute :ZipCode
 {:type :Kernel/String
  :check valid-zip?})
```

With these new declarations, the `:Contact` record can be defined as:

```clojure
(record :Acme.Inventory.CRM/Contact
 {:Street1 :Kernel/String
  :Street2 {:type :Kernel/String
            :optional true}
  :City :Kernel/String
  :State {:oneof ["NY", "NJ", "MA"]}
  :Zip :Acme.Inventory.Types/ZipCode
  :Phone :Acme.Inventory.Types/PhoneNumber
  :Email :Kernel/Email})
```

## Attribute Spec

The attribute-specification normally consists of a type-name which may be drawn from a pool of basic type built-into fractl in its `:Kernel` component.
These built-in types are listed below:

```clojure
:Kernel/String - a string, literals are enclosed in `"`
:Kernel/Keyword - a keyword literal, may also be encoded as a string. (e.g `:abc` or `"abc"`)
:Kernel/Path - a path to a model element, e.g :Acme.Inventory.CRM
:Kernel/DateTime - a string that conforms to the ISO 8601 date-time format, e.g `"2023-01-31T15:57:14.428506"`
:Kernel/Date - a string that conforms to the ISO 8601 date format
:Kernel/Time - that conforms to the ISO 8601 time format
:Kernel/UUID - a UUID string, e.g `"123e4567-e89b-12d3-a456-426614174000"`
:Kernel/Int - a fixed precision integer, based on the architecture could be 32bit or 64bit
:Kernel/Int64 - an integer with 64bit precision
:Kernel/BigInteger - an arbitrary precision integer
:Kernel/Float - a 32bit floating-point number
:Kernel/Double - a 6bit floating-point number
:Kernel/Decimal - an arbitrary-precision signed decimal number
:Kernel/Boolean - `true` or `false`
:Kernel/Record - an instance of a type defined by `record`
:Kernel/Entity - an instance of a type defined by `entity`
:Kernel/Event - an instance of a type defined by `event`
:Kernel/Email - a valid email string
:Kernel/Map - a map literal enclosed by { }
:Kernel/Edn - an edn encoded object
:Kernel/Any - any of the above, no strict type check
```

An attribute specification can contain more information when expressed as a map. The syntax for this is:

```clojure
{property-1 property-spec-1
 ...
 property-N property-spec-N}
```

The keys *property-1*, etc are specific keywords. The meaning of the property-specifications depends on
the keyword. Valid property names are their settings are described below:

```
:check - a single-arg Clojure predicate for validating values assigned to the attribute
:unique - if `true`, fractl will ensure each instance of an entity will have a different value for this attribute
:immutable - if `true`, once assigned, the attribute's value will remain read-only
:optional - if `true`, attribute value is optional
:default - the default value of the attribute
:type - name of the attribute's type
:identity - if `true`, the attribute will be used by fractl to uniquely identify each instance of an entity
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
fractl will call the function and use the return value as the default. (The `:default` value is used when
no value is specified for the attribute while creating an instance).

Note that for `:ref` the value provided must exist at the other end of the path, otherwise fractl runtime will
throw an exception. This is similar to a foreign-key relationship in an RDBMS.

The `:indexed` property should be set for attributes on which look-queries are performed. Note that
`:identity` and `:unique` attributes are always indexed.

**Example**

```clojure
(record :Acme.Inventory.CRM/Contact
 {:Street1 :Kernel/String
  :Street2 {:type :Kernel/String
            :optional true}
  :City :Kernel/String
  :State {:oneof ["NY", "NJ", "MA"]}
  :Zip {:type :Kernel/String
        :check valid-zip?}
  :Phone {:type :Kernel/String
          ;; US phone number format, e.g (555)555-5555
          :format "^(1\\s?)?(\\d{3}|\\(\\d{3}\\))[\\s\\-]?\\d{3}[\\s\\-]?\\d{4}$"}
  :Email {:type :Kernel/Email :identity true}})

(defn valid-zip? [s]
  (and (= 5 (count s))
       (<= 501 (Integer/parseInt s) 99950)))
```

The above example shows a simple record for keeping track of customer contact details.
