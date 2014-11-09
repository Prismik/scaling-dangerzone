'use strict';

angular.module('sigApp')
.controller('DashboardCtrl', ['$scope', '$http', 'GoogleMap', 'Modal', function ($scope, $http, GoogleMap, Modal) {
  $http.get('/api/clients').success(function(clients) {  
  	$http.get('/api/newClients').success(function(newClients) {  
			GoogleMap.initialize(document.getElementById('map'), 
			  document.getElementById('route'), 
			  newClients, clients);

		  $scope.redMarkers = GoogleMap.redMarkers();
		  $scope.blueMarkers = GoogleMap.blueMarkers();
		});
  });

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
	        name : data.Name,
	        description : data.Description,
	        article: data.Article,
	        estimatedTime: 0,
	        address: data.Address,
	        lat: resp.lat(),
	        lng: resp.lng()
	      }

	      $http.post('/api/clients', newCity);
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
	        name : data.Name,
	        description : data.Description,
	        agent: data.Agent,
	        estimatedTime: 0,
	        address: data.Address,
	        lat: resp.lat(),
	        lng: resp.lng()
	      }

	      $http.post('/api/newClients', newCity);
	      GoogleMap.createRedMarker(newCity);
	    }
	    else {
	    	
	      // Invalid address
	    }
    });
  });
 }]);