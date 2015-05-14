'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('loginApp', [
  'ngRoute','config','firebase'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login',{templateUrl: '/partials/login.html',controller:'loginCtrl'});
  $routeProvider.when('/fingerprint',{templateUrl: '/partials/fingerprint.html',controller:'fingerprintCtrl'});
  $routeProvider.otherwise({redirectTo: '/login'});
}]);
