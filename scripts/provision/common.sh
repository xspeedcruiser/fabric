#!/bin/bash

# Add any logic that is common to both the peer and docker environments here

apt-get update -qq

# Used by CHAINTOOL and java chaincode build
add-apt-repository ppa:openjdk-r/ppa -y
apt-get update && apt-get install openjdk-8-jdk -y
