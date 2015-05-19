

var app = angular.module('app', ['cui']);

app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);

app.controller('AppCtrl', ['$scope','$http',function($scope,$http){
    $scope.click = function() {
      var url = "http://10.30.176.219:3000/labsInfo/getDomainName";
	  alert(url);
	  var a = "lala,ttt";
	  if(a.match('lala')){
		  alert("is start");
	  }
	   /*$http.post(url).success(function(data){
		   //alert("hello");
		   var str = JSON.stringify(data);
		   alert(str);
	   });*/
     
    };
	
	$scope.haha = function(str){
		var obj = {'aaa':str};
		alert(obj.aaa);
	}
	$scope.haha("wwww");
  
  }]);