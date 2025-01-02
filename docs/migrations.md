# Agentlang Migrations
Agentlang provides a powerful migration feature to transfer or update entities and relationships between different versions of a model. It also supports incorporating changes to entity attributes or relationship schemas from existing data.

Migration requires access to both the old and new model versions. You can source the old model from either a local directory or a Git repo.  The basic command format is:

```
agent migrate MODEL-NAME [git/local] [branch/path]
```

### Migrating from a Local Directory

If the older model is stored locally, use the local option in the command. For example, if the model named library has an older version located in `../old_library` and the newer version is in the current directory, run:

```
agent migrate library local ../old_library
```

### Migrating from a Different Git Branch

When the older version of the model is on a different Git branch, specify the branch name. For example, if the library model's current branch is feat1 and the older version is on the main branch, run:

```
agent migrate library git main
```

## Auto Migration vs Manual Migration

### Database Table Naming Convention

Agentlang stores database tables for entities and relationships using the naming pattern `namespace__entity_version`. The `version` is derived from the `version` attribute in `model.al`.

For system-defined entities, the pattern includes the `agentlang-version`, either explicitly specified in `model.al` or inferred if "current" is specified.

### Automatic Migration

By default, the `migrate` command performs automatic migration by renaming tables.

For example, if migrating a `library` model from version `0.0.1` to `0.0.2` and no changes were made to the entities, the tables will automatically be renamed from `*_0_0_1` to `*_0_0_2`.

### Manual Migration

If certain entities or relationships are altered in the newer version, and you want to exclude them from automatic migration, specify them under `no-auto-migration` in `model.al`. You can list entire models, specific components, or individual entities and relationships.

For example:

```clojure
:no-auto-migration
#{:Library.Core/Person :Agentlang.Kernel.Identity}
```

Manual migrations are defined in the `:Agentlang.Kernel.Lang/Migrations` dataflow, which is executed when the `migrate` command is issued. This dataflow operates like any other but allows referencing entities by their versions using the `{:meta {:version ...}}` query syntax.


## Example Walkthrough: Schema Modification and Migration for a Model

Let us walk through a sample migration where we modify schema a bit and try to migrate a model called Factory.

### Old Schema

The old schema includes a single entity, `Shipment`, with the following schema:

```clojure
(entity
 :Shipment
 {:Price :Int
  :Quantity :Int
  :Country :String
  :CustomerFirstName :String
  :CustomerLastName :String}) 
```

### Updated Schema

The updated schema introduces new fields, renames existing ones, and merges the `CustomerFirstName` and `CustomerLastName` fields into a single `BuyerName` field:

```clojure
(entity
 :Shipment
 {:MinPrice {:type :Float :default 10}
  :MaxPrice :Float 
  :Amount :Int
  :BuyerName :String
  :Address :String
  :Verified {:type :Boolean :default true}})
```

### Configuration

To prevent the automatic migration of the `Shipment` entity, it is specified under `no-auto-migration` in `model.al`:

```clojure
{:name :Factory
 :version "0.0.2"
 :agentlang-version "current"
 :no-auto-migration #{:Factory/Customer}
 :components [:Factory]}
```

The older model and its configuration file (`model.al`) are located in the `dev` branch, while the updated model resides in the `feat1` branch.

### Migration Dataflow

The migration logic is defined in the newer model's `factory.al` file. The `concat-names` function is used to merge the first and last name fields:

```clojure
(defn concat-names [firstname lastname]
  (str firstname " " lastname))

(dataflow
 :Agentlang.Kernel.Lang/Migrations
 {:Factory/Shipment? {:meta {:version "0.0.1"}} :as :S}
 [:for-each :S
  {:Factory/Shipment
   {:MaxPrice :%.Price
    :Amount :%.Quantity
    :BuyerName (quote (factory/concat-names :%.CustomerFirstName :%.CustomerLastName))
    :Address :%.Country}}])
```

### Running & Testing Migrations

Switch to the `feat1` branch and execute the migration using the following command:

```clojure
agent migrate factory git dev
```

To see the migration in effect:

- Run the old model (version 0.0.1) and populate it with sample data.
- Switch to the updated model (version 0.0.2) and run the migration.
- Ensure the `:store` configuration in `config.edn` points to the same database for both versions.

Use the following `AppInit` dataflow to populate the old model with initial data. This dataflow is executed automatically when the old model is first run:

```clojure
(dataflow
 :Agentlang.Kernel.Lang/AppInit
 {:Factory/Customer {:Name "Dan Smith" :Age 34 :Gender "M"}}
 {:Factory/Customer {:Name "Anna Brad" :Age 28 :Gender "F"}}
 {:Factory/Customer {:Name "John Jones" :Age 45 :Gender "M"}}
 {:Factory/Customer {:Name "Elizabeth Li" :Age 39 :Gender "F"}}
 {:Factory/Customer {:Name "Sam Brown" :Age 31 :Gender "M"}})
```
## Migration Dataflows for Common Use Cases

As mentioned earlier, migration dataflows operate similarly to standard dataflows but include version-specific metadata. They are executed using the `migrate` command. Below are examples of dataflows addressing common scenarios where entities or relationships have been modified, requiring the migration of existing data.

### 1. Same attributes, different table names

#### Older schema:

```clojure
(entity
 :Customer
 {:Name :String
  :Age :Int
  :Gender {:oneof ["M" "F"]}})
```

#### Newer schema:

```clojure
(entity
 :Customer
 {:Name :String
  :Age :Int
  :Gender {:oneof ["M" "F"]}})

(entity
 :CustomerMale
 {:Name :String
  :Age :Int
  :Gender {:oneof ["M"]}})

(entity
 :Person
 {:Name :String
  :Age :Int
  :Gender {:oneof ["M" "F"]}})
```

#### Migrations dataflow:

```clojure
(dataflow
 :Agentlang.Kernel.Lang/Migrations
 {:Factory/Customer? {:meta {:version "0.0.1"}} :as :C}
 [:for-each :C
  {:Factory/Customer {:Name :%.Name :Age :%.Age :Gender :%.Gender}}]
 [:for-each :C
  {:Factory/Person {:Name :%.Name :Age :%.Age :Gender :%.Gender}}] 
 {:Factory/Customer {:Gender? "M" :meta {:version "0.0.1"}} :as :CM}
 [:for-each :CM
  {:Factory/CustomerMale {:Name :%.Name :Age :%.Age :Gender :%.Gender}}])
```

### 2. Attribute Changes in Entity

#### Older schema:

```clojure
(entity
 :Shipment
 {:Price :Int
  :Quantity :Int
  :Country :String
  :CustomerFirstName :String
  :CustomerLastName :String})
```

#### Newer schema:

```clojure
(entity
 :Shipment
 {:MinPrice {:type :Float :default 10}
  :MaxPrice :Float 
  :Amount :Int
  :BuyerName :String
  :Address :String
  :Verified {:type :Boolean :default true}})
```

#### Migrations dataflow:

```clojure

(defn concat-names [firstname lastname]
  (str firstname " " lastname))

(dataflow
 :Agentlang.Kernel.Lang/Migrations
 {:Factory/Shipment? {:meta {:version "0.0.1"}} :as :S}
 [:for-each :S
  {:Factory/Shipment
   {:MaxPrice :%.Price
    :Amount :%.Quantity
    :BuyerName (quote (factory/concat-names :%.CustomerFirstName :%.CustomerLastName))
    :Address :%.Country}}])
```

### 3. Removing Contains Relationship

#### Older schema:

```clojure
(entity
 :User
 {:Name :String})

(entity
 :Workspace
 {:Id :Identity
  :WorkspaceName :String})

(relationship
 :BelongsTo
 {:meta {:contains [:User :Workspace]}})
```

#### Newer schema:

```clojure
(entity
 :User
 {:Name :String})

(entity
 :Workspace
 {:Id :Identity
  :WorkspaceName :String
  :User :UUID})
```

#### Migrations dataflow:

```clojure
(dataflow
 :Agentlang.Kernel.Lang/Migrations
 {:Manager/User? {:meta {:version "0.0.1"}} :as :U}
 [:for-each :U
  {:Manager/User {:Name :%.Name}
   :as :U2}
  [:try
   {:Manager/Workspace? {:meta {:version "0.0.1"}}
    :-> [[:Manager/BelongsTo?
          {:Manager/User {:Name? :%.Name :meta {:version "0.0.1"}}}]]
    :as :W}
   :ok
   [:for-each :W
    {:Workspace
     {:Id :%.Id :WorkspaceName :%.WorkspaceName :User :U2.__Id__}}]
   :not-found {}]])
```

### 4. Introducing Contains Relationship

#### Older schema:

```clojure
(entity
 :User
 {:Name :String})

(entity
 :Workspace
 {:WorkspaceName :String
  :User :UUID})
```

#### Newer schema:

```clojure
(entity
 :User
 {:Name :String})

(entity
 :Workspace
 {:Id :Identity
  :WorkspaceName :String})

(relationship
 :BelongsTo
 {:meta {:contains [:User :Workspace]}})
```

#### Migrations dataflow:

```clojure
(dataflow
 :Agentlang.Kernel.Lang/Migrations
 {:App/User? {:meta {:version "0.0.1"}} :as :U}
 [:for-each :U
  {:App/User {:Name :%.Name}
   :as :U2}
  [:try
  {:App/Workspace {:User? :%.__Id__ :meta {:version "0.0.1"}} :as :W}  
   :ok
   [:for-each :W
    {:App/Workspace
     {:WorkspaceName :%.WorkspaceName}
     :-> [[{:App/BelongsTo {}} :U2]]}]
   :not-found {}]])
```

### 5. Converting Contains Relationship to Between Relationship

#### Older schema:

```clojure
(entity
 :User
 {:Name :String})

(entity
 :Workspace
 {:Id :Identity
  :WorkspaceName :String})

(relationship
 :BelongsTo
 {:meta {:contains [:User :Workspace]}})
```

#### Newer schema:

```clojure
(entity
 :User
 {:Name :String})

(entity
 :Workspace
 {:Id :Identity
  :WorkspaceName :String})

(relationship
 :BelongsTo
 {:meta {:between [:Manager/User :Manager/Workspace :as [:USER :WRKSPC]]}})
```

#### Migrations dataflow:

```clojure
(dataflow
 :Agentlang.Kernel.Lang/Migrations
 {:Manager/User? {:meta {:version "0.0.1"}} :as :U}
 [:for-each :U
  {:Manager/User {:Name :%.Name}
   :as :U2}
  [:try
   {:Manager/Workspace? {:meta {:version "0.0.1"}}
    :-> [[:Manager/BelongsTo?
          {:Manager/User {:Name? :%.Name :meta {:version "0.0.1"}}}]]
    :as :W}
   :ok
   [:for-each :W
    {:Manager/Workspace {:Id :%.Id :WorkspaceName :%.WorkspaceName} :as :W2}
    {:Manager/BelongsTo {:USER :U2.__Id__ :WRKSPC :W2.Id}}]
   :not-found {}]])
```

### 6. Joining Two Entities

#### Older schema:

```clojure
(entity
 :Manager/Customer
 {:Id {:type :Int :guid true}
  :Name :String})

(entity
 :Manager/Order
 {:Id {:type :Int :guid true}
  :CustomerId :Int
  :Date :Now})
```

#### Newer schema:

```clojure
(entity
 :Manager/CustomerOrder
 {:CustomerName :String
  :CustomerId :Int
  :OrderId :Int})
```

#### Migrations dataflow:

```clojure
(dataflow
 :Agentlang.Kernel.Lang/Migrations
 {:Manager/Order? {:meta {:version "0.0.1"}}
  :join [{:Manager/Customer {:Id? :Manager/Order.CustomerId :meta? {:version "0.0.1"}}}]
  :with-attributes {:CustomerName :Manager/Customer.Name
                    :CustomerId :Manager/Customer.Id
                    :OrderId :Manager/Order.Id}
  :as :F}
 [:for-each :F
  {:Manager/CustomerOrder
   {:CustomerName :%.CustomerName
    :CustomerId :%.CustomerId
    :OrderId :%.OrderId}}])
```
