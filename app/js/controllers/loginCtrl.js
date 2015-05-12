'use strict';

app.controller('loginCtrl',function($scope,loginService){

	$scope.user =''
	$scope.msgTxt =''

	$scope.login=function(user){
		loginService.login(user,$scope);
	}
});