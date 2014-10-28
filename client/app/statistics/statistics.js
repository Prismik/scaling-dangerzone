'use strict';

angular.module('sigApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/statistics', {
        templateUrl: 'app/statistics/statistics.html',
        controller: 'StatisticsCtrl'
      });
  });
