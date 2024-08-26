# Resolvers

Most Agentlang applications interact with external systems. Resolvers provide a uniform abstraction for managing such interactions. Each resolver is just another Agentlang model that is imported into the application like a library. A resolver exposes entities associated with the external system. Agentlang applications interact with the external system by performing (CRUD) operations on these entities - such operations are converted into API calls to the external system by the resolver implementation.

**Note** To understand and implement resolvers, you'll need a basic working knowledge of the [Clojure](https://clojure.org) programming language.

Let's look at the implementation of a simple resolver. We have an entity, which we would like to be stored in an external
service. We would like to bypass Agentlang's local storage-layer completely - create, update, delete and queries on the entity is
completely off-loaded to the external service. In the sample code that follows, the external service is represented by a Clojure
`atom` and the external-service's API is represented by `assoc`/`dissoc` operations on the atom.

```clojure
(component :Acme)

(entity :Acme/ExternalUser
 {:Email {:type :Email :guid true}
  :DateCreated :Now})

;; Represents the external user-storage.
(def db (atom {}))

;; Create/Update a user in the external store.
(defn upsert [inst]
  (println (str "upserting " (:Email inst)))
  (swap! db assoc (:Email inst) inst)
  inst)

(def
  ext-user-resolver
  (agentlang.resolver.core/make-resolver
   :ext.user.resolver ; a unique name for the resolver.
   {:create upsert
    :update upsert
    :delete (fn [inst]
	          (println (str "deleting " (:Email inst)))
              (swap! db dissoc (:Email inst))
              inst)
    :query (fn [[entity-name query]]
             ;; Handle queries of the form [:= :Email "email"].
             (let [[opr attr value] (:where query)]
               (when (and (= opr :=) (= attr :Email))
			     (println (str "looking up " value))
                 (when-let [inst (get @db value)]
                   ;; Successful queries always return a sequence of instances.
                   [inst]))))}))

(agentlang.resolver.registry/override-resolver :Acme/ExternalUser ext-user-resolver)
```

Basically a resolver consists of a map of CRUD and query functions. The `agentlang.resolver.registry/override-resolver`
function hands-over the complete responsibility of managing the instances of the `:ExternalUser` entity to the
new resolver. If you want instances of the entity to be persisted in the local store as well, call the
`agentlang.resolver.registry/compose-resolver` function instead.

## Testing the Resolver

Use the following HTTP requests to test the resolver.

1. Create an external-user:

```shell
curl --header "Content-Type: application/json" --request POST \
--data '{"Acme/ExternalUser": {"Email": "mat@acme.com"}}' \
http://localhost:8080/api/Acme/ExternalUser
```

2. Query the user:

```shell
curl --header "Content-Type: application/json" \
http://localhost:8080/api/Acme/ExternalUser/mat@acme.com
```

3. Delete the user:

```shell
curl --header "Content-Type: application/json" --request DELETE \
http://localhost:8080/api/Acme/ExternalUser/mat@acme.com
```

With each CRUD operation, you should see the appropriate log-statement from the resolver in the console.
If you inspect the Agentlang database, you should see that no local records are being created for `:ExternalUser`.

## Custom Event Handling

In addition to handling CRUD for entities, resolvers can also handle event-instances. For this the resolver has to
be provided a handler for the `:eval` method. Let's look at an example:

```clojure
(event :Acme/ExternalEvent {:Z :Int})

(record :Acme/ExternalResult {:Value :Int})

(dataflow
 :Acme/TriggerExternalEvent
 {:Acme/ExternalEvent
  {:Z :Acme/TriggerExternalEvent.Z}})

(def
  ext-event-resolver
  (agentlang.resolver.core/make-resolver
   :ext.event.resolver
   {:eval (fn [event-inst]
            {:Acme/ExternalResult
             {:Value (* (:Z event-inst) 100)}})}))

(agentlang.resolver.registry/override-resolver :Acme/ExternalEvent ext-event-resolver)
```

You can trigger the external-event as,

```shell
curl --header "Content-Type: application/json" --request POST\
--data '{"Acme/TriggerExternalEvent": {"Z": 20}}'\
http://localhost:8080/api/Acme/TriggerExternalEvent
```

You should get the result as computed by the resolver's `:eval` method:

```clojure
{"Acme/ExternalResult":
 {"Value": 2000}}
```
