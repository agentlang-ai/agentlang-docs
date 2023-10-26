# Dataflow Patterns

## Create

The `create` pattern creates a new instance of a record or an entity. The syntax of a create pattern is,

```clojure
{:RecordName
 {:Attr1 value1
  :Attr2 value2
  ...
  :AttrN valueN}
 :-> [relationship]
 :as alias}
```

The values assigned to attributes could be a,
 1. literal string, number, boolean, map
 2. list of any of (1)
 3. path to a local binding (an instance or an attribute)
 4. function call expression

A function call expression takes the form of a quoted-list, as in

```clojure
'(fn-name arg1 arg2 ... argN)
```

The arguments could be,

 1. a literal or,
 2. a list of literals or,
 3. a path to a local binding (an instance, an attribute or an alias)

**Example**

```clojure
(dataflow :Acme.Inventory.Sales/PlaceOrder
  {:Acme.Inventory.Sales/Order
   {:Product :Acme.Inventory.Sales/PlaceOrder.Product
    :Date '(fractl.lang.datetime/now)
    :Customer :Acme.Inventory.Sales/PlaceOrder.Customer
	:TaxRate 0.1
	:TotalPrice '(compute-price :Acme.Inventory.Sales/PlaceOrder.ItemPrice :TaxRate)}})

(defn compute-price [item-price sales-tax-rate]
 (+ item-price (* item-price sales-tax-rate)))
```

The dataflow attached to the `:Acme.Inventory.Sales/PlaceOrder` event has a single create-pattern
for creating a new instance of the entity `:Acme.Inventory.Sales/Order`.

Notice the arguments passed to the `compute-price` function call. The first path is a fully-qualified
reference to the `:ItemPrice` attribute of the `:PlaceOrder` event. The next argument is a reference
to a local attribute of `:Order`, so it need not be fully-qualified.

This dataflow can be triggered by a pattern that creates an instance of the `:Acme.Inventory.Sales/PlaceOrder`
event,

```clojure
{:Acme.Inventory.Sales/PlaceOrder
 {:Product "p001"
  :Customer "ABC"
  :ItemPrice 789.22}}
```

If a relationship is created by the optional `:->` key, it must have the following syntax:

```clojure
[[relationship-create-pattern other-node] ...]
```

`relationship-create-pattern` is just a create-pattern that creates a new instance of the relationship.
`other-node` must be one of,

 1. a query pattern
 2. a create or update pattern
 3. a path or alias to a local instance

**Example**

```clojure
{:Department
 {:No? "101"} :as [:D]}

{:Employee
 {:EmpNo "001"
  :Name "KK"}
:-> [[:WorksFor :D]]}
```

## Query

A `query` pattern is also expressed as a map, but is used to lookup existing instances of entities from
the persistent storage. The basic syntax of the query pattern is:

```clojure
{:EntityName
 {:Attr1? query1
  :Attr2? query2
  ...
  :Attr3? query3}
 :-> [relationship-query]
 :as alias}
```
The query value could be either a:

 1. literal
 2. function call expression
 3. logical or comparison expression of the form `[:operator arg1 arg2 ... argN]`

The logical operators supported are `:and` and `:or`. A comparison operation must be one of
`:=`, `:>`, `:<`, `:>=`, `:<=` and `:like`. The comparison operators maybe applied to both numeric and string values.

**Example**

```clojure
;; Find customer by email
{:Customer
 {:Email? "abc@acme.com"}}

;; Find employees belonging a department 101
;; and whose salaries are between 2000 and 3500
{:Employee
 {:Department? 101
  :Salary? [:and [:> 2000] [:< 3500]]}}
  
;; Find all customer whose first-name starts with `"Sa"`:
{:Customer
 {:FirstName? [:like "Sa%"]}}
```

It's possible to do query and update in a single pattern. For example, the following pattern
gives a salary-raise to all employees in department 101:

```clojure
{:Employee
 {:Department? 101
  :Salary '(+ :Salary (* 0.2 :Salary))}}
```

If the query has to happen in the context of a relationship, a relationship-query must be provided via the `:->` keyword.
This query must have the form:

```clojure
[relationship-query-pattern other-node-query-pattern]
```

An example is shown below:

```clojure
;; Load all employees whose salary is greater-than 1000 and who
;; are in a `:WorksFor` relationship with the department 101.
{:Employee
 {:Salary? [:> 1000]}
 :-> [[:WorksFor? {:Department {:No? 101}}]]}
```

The shorthand-query `:EntityName?` will return all instances of an entity.
The shorthand maybe extended to a map that include more complex data-query patterns attached to the
`:where` keyword. For example, the following query will return all employees from department 101
ordered by their salary:

```clojure
{:Employee?
 {:where [:= :Department 101]
  :order-by [:Salary]}}
```

Here's another query that will return the number of employees in the department:

```clojure
{:Employee?
 {:where [:= :Department 101]
  :count :EmpNo}}
```

The aggregate operators supported by this form of query are `:count`, `:sum`, `:avg` (average),
`:min`, and `:max`.

**Also see** the documentation on [Destructuring](../../concepts/declarative-dataflow#destructuring).

## Delete

The `delete` expression deletes one or more entity-instances based on a simple lookup criteria.

**Example**

```clojure
[:delete :Employee {:Salary 1500} :as :DeletedEmployees]
```

The above expression will delete all employees whose salary is 1500. The deleted instances are returned by the command.

## Match

Conditional pattern evaluation is made possible by the `:match` expression, which has the syntax,

```clojure
[:match value
 case1 pattern1
 case2 pattern2
 ...
 caseN patternN
 default-pattern
 :as alias]
```

The match `value` must be either a,

 1. literal
 2. path to a local record, attribute or alias
 3. any valid dataflow pattern
 4. sequence of 1-3 enclosed in `[]`

The `value` is compared to each of the `case` for equality. The `pattern` attached to the first
matching case will be evaluated and the result will become the value of the `match` expression.
If none of the cases match, the `default-pattern` will be evaluated. If the `default-pattern` is
not provided, `match` will return `false`.

**Example**

```clojure
[:match :Employee.Email
 "abc@acme.com" {:SalaryIncrement {:Percentage 0.5} ...}
 "xyz@acme.com" {:SalaryDecrement {:Percentage 0.2} ...}
 {:SalaryIncrement {:Percentage 0.3} ...}]
```

There's a second form or `:match` that can act as an `if-else` construct in traditional languages.
The syntax is,

```clojure
[:match
 condition1 pattern1
 condition2 pattern2
 ...
 conditionN patternN
 default-pattern
 :as alias]
```

The `condition` should be a logical expression of the form,

```clojure
[:operator arg1 arg2 ... argN]
```

The `:operator` could be one of `:=`, `:>`, `:<`, `:>=`, `:<=`, `:like`, `:between`, `:in`.
Comparison expressions could be combined using the logical operators `:not`, `:and` and `:or`.

**Example**

```clojure
{:Employee {:EmpNo "001"} :as :E}
[:match
 [:< :E.Salary 1000] {:SalaryIncrement {:Percentage 0.6 ...}}
 [:between 2000 3000 :E.Salary] {:SalaryIncrement {:Percentage 0.1 ...}}
 [:in [2450 1145 2293] :E.Salary] {:SalaryIncrement {:Percentage 0.2 ...}}
 [:like :E.Email "abc%"] {:SalaryIncrement {:Percentage 0.3 ...}} ; email starts-with "abc"?
 {:SalaryIncrement {:Percentage 0.5 ...}}]
```

## for-each

A sequence of values can be processed using the `:for-each` expression. The format of `:for-each` is,

```clojure
[:for-each source-pattern body ... :as alias]
```

`source-pattern` should return a sequence of values - usually this will be a query-pattern or an alias
bound to a query-pattern. `body` is one or more patterns evaluated for each element in the source. If the elements
consists of entity or record instances, `body` can refer to the current element by the name of the record or
by using the special alias `:%`.

**Example**

```clojure
;; Give salary increment to all employees
[:for-each :Employee?
 {:SalaryIncrement
  {:Percentage 0.2
   :BaseSalary :Employee.Salary
   :EmpNo :Employee.EmpNo}}]

;; using the :% alias
[:for-each :Employee?
 {:SalaryIncrement
  {:Percentage 0.2
   :BaseSalary :%.Salary
   :EmpNo :%.EmpNo}}]
```

The result of the `:for-each` will be the value returned by the last pattern evaluated in its body.

## try

The `:try` expression allows the evaluation of the dataflow to continue even after an error condition.
By default, if any pattern returns a non-success result will terminate the dataflow. `:try` provides a way to
handle non-success result and allow the dataflow to take corrective action.

The syntax of `:try` is,

```clojure
[:try
 pattern
 :result-tag1 handler-pattern1
 :result-tag2 handler-pattern2
 ...
 :as alias]
```

`pattern` is evaluated and `result-tag` is set to one of,

 1. `:ok` - pattern evaluation succeeded
 2. `:not-found` - a query failed to find result
 3. `:declined` - the evaluator refused to run the pattern
 4. `:error` - the evaluation resulted in an error

The `handler-pattern` attached to the tag is evaluated to produce the final result.
If the handler for a tag is not specified, the result of `pattern` is returned, which
if not an `:ok` result, will cause the termination of the dataflow.

**Example**

```clojure
[:try
 {:Employee {:Empno? "001"}}
 :not-found {:Result {:Message "employee not found"}}]
```

A single handler maybe attached to a single tag as shown below:

```clojure
[:try
 {:Employee {:Empno? "001"}}
 [:error :not-found] {:Result {:Message "employee not found or there was an error"}}]
```

## eval

The `:eval` expression can be used to invoke a Clojure function and bind the result to an alias.
The syntax of this expression is,

```clojure
[:eval '(f arg1 arg2 ... argN) :check type-or-predicate :as alias]
```

The arguments passed to the function should be one of,

 1. a literal or a sequence of literals
 2. a path to a local instance, attribute or alias

`type-or-predicate` must be either the name of a Fractl type or a single-argument function.
If it's a type-name, the value returned by `f` should be an instance of the same type. If it's
a function, it should return `true` for the value returned by `f`. Otherwise, `:eval` will terminate the
dataflow, by returning an error.

**Example**

```clojure
[:eval '(compute-tax :Employee.Salary) :check double? :as :Tax]

[:eval '(update-employee-salary :Employee) :check :Employee :as :UpdatedEmp]
```
