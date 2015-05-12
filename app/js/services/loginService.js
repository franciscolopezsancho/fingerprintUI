'use strict'

app.factory('loginService',function($http,$location){
	return {
		login:function(user,scope){
			console.log('enter function service'+user)
		var $promise=$http.get('http://54.155.30.167:3000/test/fingerprintingUsers?query={"mail":"'+user.mail+'"}');//send data to user php
		$promise.then(function(msg){
			if(msg.data.length == 1 && msg.data[0].pass==user.pass){
				$location.path('/fingerprint')
			}
			else scope.msgTxt='error login';
		})
	}
}
});