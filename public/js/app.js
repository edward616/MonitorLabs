   var app = angular.module('app', ['cui','appFilter']);
	
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
		   	if(domainName != undefined){
		   	   $scope.currentDN = domainName;
			   $scope.vms = [];
			   //$scope.available = "all";
			   var method = "POST";
			   var url = "/labsInfo/getVMSByDomainName";
			   var fromData = {'domainName':domainName};
			   var jsonData = JSON.stringify(fromData);
			   
			   $http({
				   method:method,
				   url:url,	
				   data: jsonData,		   
				   headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			   }).success(function(data,status){
				   console.log("success");			   
				   $scope.vms = data;
				   
			   });	
		   	} 
	   };
	   setInterval(function(){ $scope.$apply($scope.showAllVMS($scope.currentDN));},10000);

	   $scope.showPop = false;
	   $scope.showRemainUsers = function(vm){
		   $scope.isShowDownloadPop = false;
		   if($scope.showPop){
			   $scope.hideUsersPop();		   
			   if($scope.showPopComputerName == vm.ComputerName){
				   return;
			   }
		   }
		   $scope.showPopComputerName = vm.ComputerName;
		   var remainingUsers = vm.historyUsers;
		   $scope.remainingHistoryUsers = [];
		   $scope.showPop = true;
		   for(var i=1;i<remainingUsers.length;i++){
			   $scope.remainingHistoryUsers.push(remainingUsers[i])
		   }
	   };
	   $scope.hideUsersPop = function(){
		   $scope.showPop = false;
		   $scope.isShowDownloadPop = false;
	   };
	   
	   $scope.available = "all";
	   $scope.orderProp = "ComputerName";
	   
	   $scope.isShowDownloadPop = false;
	   $scope.showDownloadRDPPop = function(vm){
		   $scope.showPop = false;
		   if($scope.isShowDownloadPop){
			   $scope.hideUsersPop();
			   if($scope.downloadRDPFileCurrentCom == vm.ComputerName){
				   return;
			   }
		   }
		   $scope.downloadRDPFileCurrentCom = vm.ComputerName;
		   $scope.isShowDownloadPop = true;
	   };
	   $scope.hideDownloadPop = function(){
		   $scope.isShowDownloadPop = false;
	   };
	   
	   $scope.downloadRDPFile = function(vm){
		   var computerName = vm.ComputerName;
		   var domainName = vm.DomainName;
		   var fullName = computerName + "." + domainName;
		   var jsonObj = {'fullDomainName':fullName};
		   var jsonData = JSON.stringify(jsonObj);
		   var url = "/labsInfo/getRDPFileByFullName";
		   var method="POST";		   
		   $http({
			   method:method,
			   url:url,	
			   data: jsonData,		   
			   headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		   }).success(function(data,status){
			   console.log("success");
			   alert(data);
			   //alert(data);
			   var url = "/labsInfo/downloadRDPFile?fileName=" + data;
			   /*$http.get(url).success(function(data){
				   //alert(JSON.stringify(data));
					alert(data);
			   })*/
			   //$http.get(url);
			   //var blob = new Blob([data],{type:"application/rdp"});
			   //saveAs(blob, "xxxx.rdp");
			   //window.open(url);
			   var iframe = document.getElementById("downloadFrame");
			   iframe.src = url;
		   });		   
	   };
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
	  
	  app.directive('hideLogin', function($document){
  		return {
    		restrict: 'A',
    		link: function(scope, elem, attr, ctrl) {
      			elem.bind('click', function(e) {
        			e.stopPropagation();
      			});
      			$document.bind('click', function() {
        			scope.$apply(attr.hideLogin);
      			})
    		}
  		}
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