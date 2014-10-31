'use strict';

//Data
var cities = [
    {
        city : 'Toronto',
        desc : 'This is the best city in the world!',
        article: 'Pizza',
        et: 'Half an hour',
        lat : 43.7000,
        long : -79.4000
    },
    {
        city : 'New York',
        desc : 'This city is aiiiiite!',
        article: 'Magic carpet',
        et: '1 hour',
        lat : 40.6700,
        long : -73.9400
    },
    {
        city : 'Chicago',
        desc : 'This is the second best city in the world!',
        article: 'Sun glasses',
        et: '20 minutes',
        lat : 41.8819,
        long : -87.6278
    }
];

var potential = [
    {
        city : 'Los Angeles',
        desc : 'This city is live!',
        lat : 34.0500,
        long : -118.2500
    },
    {
        city : 'Near Toronto',
        desc : 'This city is live!',
        lat : 43.7070,
        long : -79.3000
    },
    {
        city : 'Closer to Toronto',
        desc : 'This city is live!',
        lat : 41.7050,
        long : -79.4020
    },
    {
        city : 'Kinda close Toronto',
        desc : 'This city is live!',
        lat : 40.7000,
        long : -79.9000
    },
    {
        city : 'Fourth',
        desc : 'This city is live!',
        lat : 41.7000,
        long : -80.0000
    },
    {
        city : 'Las Vegas',
        desc : 'Sin City...\'nuff said!',
        lat : 36.0800,
        long : -115.1522
    }
]

angular.module('sigApp')
  .controller('DashboardCtrl', ['$scope', 'GoogleMap', function ($scope, GoogleMap) {
		GoogleMap.initialize(document.getElementById('map'), document.getElementById('route'), 
													cities, potential);
    for (var i = 0; i < cities.length; ++i){
      GoogleMap.createBlueMarker(cities[i]);
    }

    for (var j = 0; j < potential.length; ++j){
      GoogleMap.createRedMarker(potential[j]);
    }  
    $scope.redMarkers = GoogleMap.redMarkers;
    $scope.blueMarkers = GoogleMap.blueMarkers;
    $scope.openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
    }
    
		
  }]);