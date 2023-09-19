# Event

An `event` is a record used to trigger dataflows. Events can be injected into the system by external clients
and can also be created by patterns in a dataflow. When an event instance enters the system, 
the dataflow attached to that event is evaluated. The event-instance will be replaced by the result of this
evaluation. We will learn more about event-based patterns in the [dataflow](dataflow) section.
