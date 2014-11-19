'use strict';

angular.module('sigApp')
.controller('StatisticsCtrl',['$scope', 'Stats', '$http', function ($scope, Stats, $http) {
  $http.get('/api/rides').success(function(rides) {  
  	$scope.routes = rides;
	});

	$scope.generateStats = function(event, route) {
		$scope.stat = Stats.generate(route);
	}
}]);
