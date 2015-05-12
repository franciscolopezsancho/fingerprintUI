'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('loginApp', [
  'ngRoute'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login',{templateUrl: '/partials/login.html',controller:'loginCtrl'});
  $routeProvider.when('/fingerprint',{templateUrl: '/partials/fingerprint.html'});
  $routeProvider.otherwise({redirectTo: '/login'});
}]);
