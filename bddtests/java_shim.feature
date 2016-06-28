/*
Copyright DTCC 2016 All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

# Test Hyperledger Peers
#
# Tags that can be used and will affect test internals:
#
#  @doNotDecompose will NOT decompose the named compose_yaml after scenario ends.  Useful for setting up environment and reviewing after scenario.
#
#  @chaincodeImagesUpToDate use this if all scenarios chaincode images are up to date, and do NOT require building.  BE SURE!!!

#@chaincodeImagesUpToDate
Feature: Chaincode02 example

#@doNotDecompose
#    @wip
  Scenario: java SimpleSample chaincode example single peer
      Given we compose "docker-compose-1.yml"
      When requesting "/chain" from "vp0"
      Then I should get a JSON response with "height" = "1"
      	    When I deploy lang chaincode "core/chaincode/shim/java" of "JAVA" with ctor "init" to "vp0"
      		     | arg1 |  arg2 | arg3 | arg4 |
      		     |  a   |  100  |  b   |  200 |
      	    Then I should have received a chaincode name
      	    Then I wait up to "300" seconds for transaction to be committed to all peers

      	    When requesting "/chain" from "vp0"
      	    Then I should get a JSON response with "height" = "2"

              When I query chaincode "example2" function name "query" on "vp0":
                  |arg1|
                  |  a |
      	    Then I should get a JSON response with "OK" = "{u'Amount': u'100', u'Name': u'a'}"


              When I invoke chaincode "example2" function name "transfer" on "vp0"
      			|arg1|arg2|arg3|
      			| a  | b  | 10 |
      	    Then I should have received a transactionID
      	    Then I wait up to "25" seconds for transaction to be committed to all peers

      	    When requesting "/chain" from "vp0"
      	    Then I should get a JSON response with "height" = "3"

              When I query chaincode "example2" function name "query" on "vp0":
                  |arg1|
                  |  a |
      	    Then I should get a JSON response with "OK" = "{u'Amount': u'90', u'Name': u'a'}"

              When I query chaincode "example2" function name "query" on "vp0":
                  |arg1|
                  |  b |
      	    Then I should get a JSON response with "OK" = "{u'Amount': u'210', u'Name': u'b'}"
