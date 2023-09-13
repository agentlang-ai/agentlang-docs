# Resolvers

Most Fractl applications interact with external systems. Resolvers provide a uniform abstraction for such interactions. Each resolver is just another Fractl model that is imported into the application like a library. A resolver exposes entities associated with the external system. Fractl applications interact with the external system by performing (CRUD) operations on these entities - such operations are converted into API calls to the external system by the resolver implementation.

