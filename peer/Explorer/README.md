#Hyperledger Explorer
This is the initial release of the Hyperledger explorer which provides a User Interface to explore and examine the current state of the Hyperledger blockchain in a convenient and friendly manner. Similar to bitcoin explorers or any crypto-currency explorer, information such as transaction information, network activity, and search are available.

The explorer relies on the current gRPC rest APIs that are available. To run the explorer make sure that at least one validating peer is running.
>  cd $GOPATH/github.com/hyperledger/fabric/peer 

> peer node start 

After a validating peer is running, start up a http server to handle the REST APIs 

>  cd $GOPATH/github.com/hyperledger/fabric/core/rest 

> http-server -a 0.0.0.0 -p 5554 --cors 

By default the server runs on port 5554, if you wish to change that, you must edit the REST_ENDPOINT variable located in scripts.js

