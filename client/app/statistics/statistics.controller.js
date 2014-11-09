'use strict';

angular.module('sigApp')
.controller('StatisticsCtrl',['$scope', 'Stats', function ($scope, Stats) {
  $scope.message = 'Hello';
  $scope.routes = [{
  	title: 'Route 1',
	  stats: {
	  	pctClient: 30,
	  	mrktTime: 20,
	  	dlvryTime: 50,
	  	nbPoints: 5
	  }
  }, {
  	title: 'Route 2',
  	stats: {
	  	pctClient: 30,
	  	mrktTime: 20,
	  	dlvryTime: 50,
	  	nbPoints: 5
	  }
  }, {
  	title: 'Route 3',
  	stats: {
	  	pctClient: 30,
	  	mrktTime: 20,
	  	dlvryTime: 50,
	  	nbPoints: 5
	  }
  }, {
  	title: 'Route 4',
  	stats: {
	  	pctClient: 30,
	  	mrktTime: 20,
	  	dlvryTime: 50,
	  	nbPoints: 5
	  }
  }, {
  	title: 'Route 5',
  	stats: {
	  	pctClient: 30,
	  	mrktTime: 20,
	  	dlvryTime: 50,
	  	nbPoints: 5
	  }
  }]
}]);
