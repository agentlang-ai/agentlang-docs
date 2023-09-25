# Record

A `record` is the basic composite data-structure that can be defined in a component.
A record consists of smaller data-elements known as attributes. The specification of a record
will be a map chiefly concerned with defining the types and constraints applicable to each attribute.
The record definition may also contain a `:meta` section that capture some meta-data about the record.

The syntax of record specification is shown below:

```clojure
{attr-1 attr-spec-1
 attr-2 attr-spec-2
 ...
 attr-N attr-spec-N
 :meta {...}}
```

A concrete example of a record definition is shown below:

```clojure
;; A record for keeping track of customer contact details.

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
  :Email {:type :Email :identity true}})

(defn valid-zip? [s]
  (and (= 5 (count s))
       (<= 501 (Integer/parseInt s) 99950)))
```
