   var app = angular.module('app', ['cui']);
	
    app.controller('AppCtrl', ['$scope','$http',function($scope,$http){
		//alert("hello");
	   $scope.person = {};
       $scope.getPeoples = function(){
		   var url = "/labsInfo/getDomainName";
		   $http.get(url).success(function(data){
			   //alert(JSON.stringify(data));
			   $scope.people = data;		   
		   })
	   };
	   $scope.getPeoples();
	   		   
	   $scope.showAllVMS = function(domainName){
		   var method = "POST";
		   var url = "/labsInfo/getVMSByDomainName";
		   var fromData = {'domainName':domainName};
		   var jsonData = JSON.stringify(fromData);
		   //alert(jsonData);
		   $http({
			   method:method,
			   url:url,	
			   data: jsonData,		   
			   headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		   }).success(function(data,status){
			   console.log("success");
			   //alert(data);
			   $scope.vms = data;
		   });		    
	   };
	   
	   var convertToTreeItems = function(vms){
		   //alert("hello");
		   var treeItems = [];
		   for(var i=0;i<vms.length;i++){
			   var vmName = vms[i].ComputerName
			   var item = {};
			   if(vmName.match('-DC')){
				   item.visible = "true";
			   }
			   item.label = vmName;
			   item.id = vmName;
			   
			   var childrens = [];			   
			   //var clientStr = String(vms[i].ClientName);
			   if(!vms[i].ClientName){
				   var activeState = {"label":'IsActive:false',"id":"child11"+Math.floor((Math.random() * 1000) + 1)};
				   var currentUser = {"label":'currentUser:none',"id":"child12"+Math.floor((Math.random() * 1000) + 1)};
			   }else{
				   var activeState = {"label":'IsActive:true',"id":"child11"+Math.floor((Math.random() * 1000) + 1)};
				   var currentUser = {"label":'currentUser:' + (vms[i].ClientName?vms[i].ClientName:""), "id":"child12"+Math.floor((Math.random() * 1000) + 1)};			    
			   }
			   childrens.push(activeState);
			   childrens.push(currentUser);
			   
			   var history = {};
			   history.label = "historyUsers";
			   history.id = "child13" +Math.floor((Math.random() * 1000) + 1);
			   //var historyChilds = [];
			   childrens.push(history);
			   getHistoryUsersByName(vmName,history);
			   item.children = childrens;
			   
			   treeItems.push(item);
			   
		   }
		   //alert(JSON.stringify(treeItems));
		   $scope.treeItems = treeItems;
		   
	   };
	   
	   var getHistoryUsersByName = function(vmName,node){
		   var vmNames = {"vmName":vmName};
		   var jsData = JSON.stringify(vmNames);
		   var body = {
			   method:"POST",
			   url:"/labsInfo/getHistoryUsersByName",
			   data:jsData,
			   headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		   };
		   $http(body).success(function(data,status){
			   //alert(JSON.stringify(data));
			   var historyUsers = data;
			   var childrens = [];
			  for(var i=0;i<historyUsers.length;i++){
				  var item = {};
				  item.label = historyUsers[i].ClientName + " | " + historyUsers[i].create_time;
				  item.id = historyUsers[i].ClientName + " | " + historyUsers[i].create_time;
				  childrens.push(item);
			  }
			  node.children = childrens;
		   });
	   } 	   
	}])
    .filter('propsFilter', function() {
        return function(items, props) {
          var out = [];

          if (angular.isArray(items)) {
            items.forEach(function(item) {
              var itemMatches = false;

              var keys = Object.keys(props);
              for (var i = 0; i < keys.length; i++) {
                var prop = keys[i];
                var text = props[prop].toLowerCase();
                if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                  itemMatches = true;
                  break;
                }
              }

              if (itemMatches) {
                out.push(item);
              }
            });
          } else {
            // Let the output be the input untouched
            out = items;
          }

          return out;
        }
      });

	  app.controller('aa',function($scope){
		 $scope.click = function(str){
			alert(str); 
		 };
	  });


/*

app.config(['$httpProvider',function($httpProvider){
		$httpProvider.defaults.useXDomain = true;
		//$httpProvider.defaults.withCredentials = true;
		delete $httpProvider.defaults.headers.common["X-Requested-With"];
		$httpProvider.defaults.headers.common["Accept"] = "application/json";
		$httpProvider.defaults.headers.common["Content-Type"] = "application/json";
	}]);
	
	*/
	
	/*$http.get(url).success(function(data){
			   //alert(JSON.stringify(data));
			   
		   })*/
		   
	 /*$http.defaults.headers.put = {   
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With'
        };
        $http.defaults.useXDomain = true;*/
		
	//headers :{'Access-Control-Allow-Origin': '*',"Access-Control-Allow-Methods":"GET, POST",'Content-Type': 'application/x-www-form-urlencoded'}
	//headers: {'Content-Type': 'application/x-www-form-urlencoded'}