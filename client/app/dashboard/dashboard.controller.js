'use strict';

//Data
var cities = [
  {
    city : 'Hamilton',
    desc : 'This is the best city in the world!',
    article: 'Pizza',
    et: 'Half an hour',
    lat : 43.243603,
    long : -79.889075
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
    agent: 'Francis',
    et: '',
    lat : 34.0500,
    long : -118.2500
  },
  {
    city : 'Near Toronto',
    desc : 'This city is live!',
    agent: 'Francis',
    et: '',
    lat : 43.7070,
    long : -79.3000
  },
  {
    city : 'Buffalo',
    desc : 'This city is live!',
    agent: 'Francis',
    et: '',
    lat : 42.886447,
    long : -78.878369
  },
  {
    city : 'Kinda close Toronto',
    desc : 'This city is live!',
    agent: 'Francis',
    et: '',
    lat : 40.7000,
    long : -79.9000
  },
  {
    city : 'Fourth',
    desc : 'This city is live!',
    agent: 'Francis',
    et: '',
    lat : 41.7000,
    long : -80.0000
  },
  {
    city : 'Las Vegas',
    desc : 'Sin City...\'nuff said!',
    agent: 'Francis',
    et: '',
    lat : 36.0800,
    long : -115.1522
  }
]

angular.module('sigApp')
.controller('DashboardCtrl', ['$scope', 'GoogleMap', 'Modal', function ($scope, GoogleMap, Modal) {
  GoogleMap.initialize(document.getElementById('map'), 
    document.getElementById('route'), 
    potential, cities);

  $scope.form = {
    Address: '',
    Description: '',
    Article: ''
  };
  $scope.redMarkers = GoogleMap.redMarkers();
  $scope.blueMarkers = GoogleMap.blueMarkers();
  $scope.isMarkerSelected = function(marker) {
    return GoogleMap.isMarkerSelected(marker);
  }
  $scope.openInfoWindow = function(e, selectedMarker) {
    GoogleMap.openInfoWindow(e, selectedMarker);
  }

  $scope.addClient = Modal.form.add(function() {
    var args = Array.prototype.slice.call(arguments);
    var data = args[0];
    GoogleMap.addrToLatLng(data.Address, function(resp) {
	    if (resp != null) {
	    	var newCity = {
	        city : 'city',
	        desc : data.Description,
	        article: data.Article,
	        et: ' ',
	        address: data.Address,
	        lat: resp.lat(),
	        long: resp.lng()
	      }
	      cities.push(newCity);

	      GoogleMap.createBlueMarker(newCity);
	    }
	    else {
	    	
	      // Invalid address
	    }
    });
  });

  $scope.addNewClient = Modal.form.add(function() {
  	var args = Array.prototype.slice.call(arguments);
    var data = args[0];
    GoogleMap.addrToLatLng(data.Address, function(resp) {
	    if (resp != null) {
	    	var newCity = {
	        city : 'city',
	        desc : data.Description,
	        agent: data.Agent,
	        et: ' ',
	        address: data.Address,
	        lat: resp.lat(),
	        long: resp.lng()
	      }
	      cities.push(newCity);

	      GoogleMap.createRedMarker(newCity);
	    }
	    else {
	    	
	      // Invalid address
	    }
    });
  });
 }]);