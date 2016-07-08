const REST_ENDPOINT = 'http://127.0.0.1:5000';
const REST_ENDPOINT2 = 'http://127.0.0.1:5000/chain/blocks/';

var App = angular.module("explorer", []);



App.controller("HEADER", 
	function()
	{

	}
)
App.controller("NETWORK",
	function(){
		
	}
)


App.controller("SEARCH", 
	function($scope, $http)
	{
		$scope.response;


				// throwing in some JQuery 
				$(document).ready(function(){
				    $("#flip").click(function(){
				        $("#panel").slideToggle("1000");
				    });
				});

	    $scope.search = function(){
	    	// we first search using the UUID number
	    	$http.get(REST_ENDPOINT.concat("/transactions/").concat($scope.response))
	    	.success(function(data){
		    		$scope.info = data;
		    		$scope.message = "Transaction succesfully found";
		    		$scope.text1 = "Chaincode ID: " +$scope.info.chaincodeID;
		    		$scope.text2 = "UUID: " +$scope.info.uuid;
		    		$scope.text3 = "Seconds: " +$scope.info.timestamp.seconds;
		    		$scope.text4 = "Nanos: " +$scope.info.timestamp.nanos;
		    		$scope.text5 = null;
		    		$scope.text6 = null;
		    		alter2();

	    	}).error(function(data)
	    	{
	    		// if nothing is found via UUID, we search for a block number
	    		$http.get(REST_ENDPOINT.concat("/chain/blocks/").concat($scope.response))
	    		.success(function(data){
		    			$scope.info = data;
		    			$scope.message = "Block succsefully found";
		    			$scope.text1 =  "StateHash: " + $scope.info.stateHash;
		    			$scope.text2 =  "Previous Hash: " + $scope.info.previousBlockHash;
		    			$scope.text3 =  "Consensus Meta: " + $scope.info.consensusMetadata;
		    			$scope.text4 =  "Seconds: " + $scope.info.nonHashData.localLedgerCommitTimestamp.seconds;
		    			$scope.text5 =  "Nanos: " + $scope.info.nonHashData.localLedgerCommitTimestamp.nanos;


		    			$scope.text6 = null; // clear in to avoid displaying previous transaciton count if new block search has 0 
		    			$scope.text6 = 	"Transactions: " + $scope.info.transactions.length;
		    				if($scope.info.transactions.length != null){
	     						alter(); return false;
	     					} else {
	     						$scope.text6 = 0;	
	     						alter2(); return false;
	     					}

	    		}).error(function(data){
		    			$scope.message = "No data found";
		    			$scope.info = null;
		    			$scope.text1 = null;
		    			$scope.text2 = null;
		    			$scope.text3 = null;
		    			$scope.text4 = null;
		    			$scope.text5 = null;
		    			$scope.text6 = null;
		    			alter2();
	    		})	
	    	})

		};

		$scope.clear = function(){
			alter2();
			$scope.info = null;
			$scope.message = null;
			$scope.text1 = null;
		    $scope.text2 = null;
		    $scope.text3 = null;
		    $scope.text4 = null;
		    $scope.text5 = null;
		    $scope.text6 = null;
		    $scope.response = null;	
		}
	}
)


App.controller("NAVIGATION",
	function()
	{

	}
)

// http request to get 
App.factory('REST_SERVICE_HEIGHT', function($http){
	return{
		getData: function(){
			return $http.get(REST_ENDPOINT+ "/chain").then(function(result){
				return result.data;
			});
	}}
});

/* http request to retrieve information related to a specific block number found on the chain, chain_index is the block number that we wish to retrieve
Since each request comes back at a different time and out of order, the order with which we recieve the response cannot be tracked, array_location is thus passed in and is added
as metadata to keep track of the 0-9 index where the data should be added to the array in the BLOCKS_and_TRANSACTIONS controller that holds the final sorted result
*/
App.factory('REST_SERVICE_BLOCK', function($http) {
   return {
     getData: function(chain_index, array_location) {
     	// initially returns only a promise 
       return $http.get(REST_ENDPOINT +"/chain/blocks/"+ chain_index).then(function(result) {
       		
       		// add metadata 
       		result.data.location = array_location; // will always be 0-9 since the explorer displays the 10 most recent blocks
       		result.data.block_origin = chain_index; // can be any number from 0 to the current height of the chain 
           return result.data // retrieved data returned only after response from server is made 
       });
   }}
});

App.controller("CURRENT", 
	function($scope, REST_SERVICE_HEIGHT)
	{
		REST_SERVICE_HEIGHT.getData().then(function(data){
			$scope.info = data;
		});
	}
)

App.controller("BLOCKS_and_TRANSACTIONS", 
	function($scope, REST_SERVICE_BLOCK, REST_SERVICE_HEIGHT)
	{

				$(document).ready(function(){
				    $("#flip2").click(function(){
				        $("#panel2").slideToggle("1000");
				    });
				});
				
				$scope.range = [0,1,2,3,4,5,6,7,8,9];

				// controls number of rows to display in the 2 tables
			    $scope.row_amount = 5;
			    $scope.row_amount2 = 5;
			    // Used to update which block or transaction information should display once user chooses view or expand button from table
			    $scope.selected = 0;
			    $scope.selected2 = 0;



			    $scope.loader= {
			    	loading: true,
			    };


			    $scope.hideloader = function(){
			    	$scope.loader.loading = false;
			    }

				$scope.update = function(p){
					// the value p passed in is the current height, we go from p to (p-10) to get the 10 most recent blocks,
					var j = 0; 
					var count = 0; // number of responses from server 
						for(var i=p; i>(p-10); i--){
							// executes after getData resolves and the server retu
						  	 REST_SERVICE_BLOCK.getData(i,j).then(function(data) {
										   		$scope.info[data.location] = data;
										   		for(var k=0; k<data.transactions.length; k++){
										   			data.transactions[k].origin = data.block_origin;
										   		}
										   		var temp = data.block_origin;
										   		console.log(p-temp)
										   		$scope.trans2[p-temp] = data.transactions
										   		count++;

										   		// once all 10 GET requests are recieved, they will be but into one array that can then be easily displayed in the table
										   		if(count == 10){
										   			$scope.hideloader();
										   			$scope.trans = [];
													for(var i=0; i<$scope.trans2.length; i++){
													$scope.trans = $scope.trans.concat($scope.trans2[i]);
													}
										   		}
							  		 });
						j++;
					}	
				}

				// calls upon startup 
				REST_SERVICE_HEIGHT.getData().then(function(data){
						// will be used to keep track of 10 most recent blocks
						$scope.info = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
						// will be used to keep track of most recent transactions
			    		$scope.trans2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
						$scope.size = data.height;
			       		$scope.limit = 10;
			       		$scope.update(data.height-1);
				});

				// updates selected block number and displays form with transaction info based on selected block number
				$scope.ExecuteAll = function(x){
					$scope.selected = x;
					document.forms["change2"].submit();
				}

				$scope.ExecuteAll2 = function(x){
					$scope.selected2 = x;
					document.forms["change3"].submit();
				}

	}
)

App.controller("TRIGGER",
	function($scope){
		// 0 = not visible, 1= visible
		$scope.state = 0;

		// collapse and expand navigation menu in mobile view 
		$scope.activate = function(){
				alter5();
		}
	}
)


function alter(){
	document.getElementById("change").style.display = "block";
}
function alter2(){
	document.getElementById("change").style.display = "none";
}

function alter3(){
	document.getElementById("change2").style.display = "block";
}
function alter4(){
	document.getElementById("change2").style.display = "none";
}

function alter5(){

	// executed when user selectes menu
	x = document.getElementById('navigation').style.display;
	if(x =="none"){
		document.getElementById("navigation").style.display = "block";
	} else {
		document.getElementById("navigation").style.display = "none";
	}
}

function restore() {
	// used to keep navigation menu displayed horizontally if selection altered
	var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	if(width > 500 ){
		document.getElementById("navigation").style.display = "block";
	} else {
		document.getElementById("navigation").style.display = "none";
	} 
}

function hide(){
	// hides menu after an option is selected for small resolutions
	var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	if(width < 500){
		document.getElementById("navigation").style.display = "none";
	}
}


