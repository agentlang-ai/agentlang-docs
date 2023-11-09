# Lang

The `:Fractl.Kernel.Lang` component defines the core-attribute types that can be used in Fractl. These types are listed below:

	* `:String` - texts of arbitrary length, enclosed in double-quotes
    * `:Keyword` - symbolic constants prefixed by a `:`. E.g - :left, :blue. Keywords may not contain spaces.
	* `:Path` - fully qualified name of a Fractl data-type, encoded as a keyword. E.g - :Acme.Erp/Employee.
    * `:DateTime` - date-time strings, usually in the format `2011-12-03T10:15:30`.
	* `:Date` - strings with only the date part of a `:DateTime`.
    * `:Time` - strings with only the time part of a `:DateTime`.
	* `:UUID` - universally unique identifiers as described in [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122)
    * `:Int` - 32-bit signed two's complement integers.
	* `:Int64` - 64-bit two's complement integers.
    * `:BigInteger` - integers of arbitrary precision.
	* `:Float` - single-precision 32-bit IEEE 754 floating point values.
    * `:Double` - double-precision 64-bit IEEE 754 floating point values.
    * `:Decimal` - arbitrary precision decimal values.
	* `:Boolean` - true or false.
    * `:Record` - instances of a record.
	* `:Entity` - instances of an entity.
    * `:Event` - instances of an event.
	* `:Email` - strings encoded as email addresses.
	* `:Password` - strings that are encrypted on storage.
    * `:Map` - a map of key-value pairs, e.g - `{:name "joe" :age 12}`.
	* `:Edn` - edn encoded data, e.g - `[{:name "joe" :age 12} {:name "rachel" :age 9}]`.
	* `:Any` - no type check enforced, could be any of the above types.
    * `:Identity` - UUIDs with a default.
	* `:Now` - date-time values with a default.
