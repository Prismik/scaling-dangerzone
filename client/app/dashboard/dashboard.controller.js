'use strict';

//Data
var cities = [
    {
        city : 'Toronto',
        desc : 'This is the best city in the world!',
        lat : 43.7000,
        long : -79.4000
    },
    {
        city : 'New York',
        desc : 'This city is aiiiiite!',
        lat : 40.6700,
        long : -73.9400
    },
    {
        city : 'Chicago',
        desc : 'This is the second best city in the world!',
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
        city : 'Las Vegas',
        desc : 'Sin City...\'nuff said!',
        lat : 36.0800,
        long : -115.1522
    }
]

angular.module('sigApp')
  .controller('DashboardCtrl', function ($scope) {
    $scope.message = 'Hello';
    var mapOptions = {
        zoom: 4,
        center: new google.maps.LatLng(40.0000, -98.0000),
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }

		$scope.directionsService = new google.maps.DirectionsService();
    $scope.directionsDisplay = new google.maps.DirectionsRenderer();
    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

    $scope.redMarkers = [];
    $scope.blueMarkers = [];
    
    $scope.directionsDisplay.setMap($scope.map);
    $scope.directionsDisplay.setOptions( { suppressMarkers: true } );
    var infoWindow = new google.maps.InfoWindow();
    
    var calcRoute = function () {
		  var start = cities[0].lat + "," + cities[0].long;
		  var end = "toronto, ont";
		  var waypts = [];
		  for (var i = 0; i < cities.length; i++) {
		      waypts.push({
		          location:cities[i].lat + "," + cities[i].long,
		          stopover:true});
		  }
		  for (var i = 0; i < potential.length; i++) {
		      waypts.push({
		          location:potential[i].lat + "," + potential[i].long,
		          stopover:true});
		  }

		  var request = {
		      origin: start,
		      destination: end,
		      waypoints: waypts,
		      optimizeWaypoints: true,
		      travelMode: google.maps.TravelMode.DRIVING
		  };

		  $scope.directionsService.route(request, function(response, status) {
		    if (status == google.maps.DirectionsStatus.OK) {
		      $scope.directionsDisplay.setDirections(response);
		      var route = response.routes[0];
		      var summaryPanel = document.getElementById('directions_panel');
		      summaryPanel.innerHTML = '';
		      // For each route, display summary information.
		      for (var i = 0; i < route.legs.length; i++) {
		        var routeSegment = i + 1;
		        summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment + '</b><br>';
		        summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
		        summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
		        summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
		      }
		    }
		  });
		}

   	var RouteControl = function(controlDiv) {

		  // Set CSS styles for the DIV containing the control
		  // Setting padding to 5 px will offset the control
		  // from the edge of the map.
		  controlDiv.style.padding = '5px';

		  // Set CSS for the control border.
		  var controlUI = document.createElement('div');
		  controlUI.style.backgroundColor = 'white';
		  controlUI.style.borderStyle = 'solid';
		  controlUI.style.borderWidth = '2px';
		  controlUI.style.cursor = 'pointer';
		  controlUI.style.textAlign = 'center';
		  controlUI.title = 'Click to set the map to Home';
		  controlDiv.appendChild(controlUI);

		  // Set CSS for the control interior.
		  var controlText = document.createElement('div');
		  controlText.style.fontFamily = 'Arial,sans-serif';
		  controlText.style.fontSize = '12px';
		  controlText.style.paddingLeft = '4px';
		  controlText.style.paddingRight = '4px';
		  controlText.innerHTML = '<strong>Calculate route</strong>';
		  controlUI.appendChild(controlText);

		  // Setup the click event listeners: simply set the map to Chicago.
		  google.maps.event.addDomListener(controlUI, 'click', function() {
		  	calcRoute();
		  });
		}

		// Create the DIV to hold the control and call the HomeControl() constructor
	  // passing in this DIV.
	  var routeControlDiv = document.createElement('div');
	  var routeControl = new RouteControl(routeControlDiv);

	  routeControlDiv.index = 1;
	  $scope.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(routeControlDiv);

    var feedClientInfo = function(info) {
    	var popup = '<form role="form" style="width: 400px">' +
        '<div class="row">' +
	        '<div class="col-md-6">' +
					  '<div class="form-group">' +
					    '<label for="title">Title</label>' +
					    '<input type="text" class="form-control" id="title" placeholder="Enter title...">' +
					  '</div>' +
					  '<select class="form-control">...</select>' +
					  '<div class="form-group">' +
					    '<label for="desc">Description</label>' +
					    '<br>' +
					    '<textarea class="form-control" style="resize: none;" id="desc" rows="5" cols="25">' +
					    '</textarea>' +
					 	'</div>' +
					'</div>' +
					'<div class="col-md-6">' +
						'<div class="form-group">' +
					    '<label for="article">Article</label>' +
					    '<input type="text" class="form-control" id="article" placeholder="Article...">' +
					  '</div>' +
					  '<div class="form-group">' +
					    '<label for="estimate">Estimated time</label>' +
					    '<input type="text" class="form-control" id="estimate" placeholder="Enter estimate...">' +
					  '</div>' +
				  	'<button type="submit" class="btn btn-default">Submit</button>' +
					'</div>' +
				'</div>' +
				'</form>';

				return popup;
    }

    var feedPotentialInfo = function(info) {
    	var popup = '<form role="form" style="width: 400px">' +
        '<div class="row">' +
	        '<div class="col-md-6">' +
					  '<div class="form-group">' +
					    '<label for="title">Title</label>' +
					    '<input type="text" class="form-control" id="title" placeholder="Enter title...">' +
					  '</div>' +
					  '<select class="form-control">Decision...</select>' +
					  '<div class="form-group">' +
					    '<label for="desc">Description</label>' +
					    '<br>' +
					    '<textarea class="form-control" style="resize: none;" id="desc" rows="5" cols="25">' +
					    '</textarea>' +
					 	'</div>' +
					'</div>' +
					'<div class="col-md-6">' +
						'<div class="form-group">' +
					    '<label for="agent">Marketing agent</label>' +
					    '<input type="text" class="form-control" id="agent" placeholder="Marketing agent...">' +
					  '</div>' +
					  '<div class="form-group">' +
					    '<label for="spent">Spent time</label>' +
					    '<input type="text" class="form-control" id="spent" placeholder="Enter spent time...">' +
					  '</div>' +
				  	'<button type="submit" class="btn btn-default">Submit</button>' +
					'</div>' +
				'</div>' +
				'</form>';

				return popup;
    }

    var createBlueMarker = function(info) {
        
        var marker = new google.maps.Marker({
        		icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            map: $scope.map,
            position: new google.maps.LatLng(info.lat, info.long),
            title: info.city
        });
        marker.content = '<div class="infoWindowContent">' + info.desc + '</div>';
        /*
        google.maps.event.addListener(marker, 'click', function(){
            infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
            infoWindow.open($scope.map, marker);
        });
        */
        $scope.blueMarkers.push(marker);

        
        var infowindow = new google.maps.InfoWindow({ content: feedClientInfo('data') });
        google.maps.event.addListener(marker, 'click', function() {
			    infowindow.open($scope.map,marker);
			  });
    }
    
    var createRedMarker = function(info) {
        
        var marker = new google.maps.Marker({
        		icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            map: $scope.map,
            position: new google.maps.LatLng(info.lat, info.long),
            title: info.city
        });
        marker.content = '<div class="infoWindowContent">' + info.desc + '</div>';
        /*
        google.maps.event.addListener(marker, 'click', function(){
            infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
            infoWindow.open($scope.map, marker);
        });
        */
        $scope.redMarkers.push(marker);

        
        var infowindow = new google.maps.InfoWindow({ content: feedPotentialInfo('data') });
        google.maps.event.addListener(marker, 'click', function() {
			    infowindow.open($scope.map,marker);
			  });
    }

    for (var i = 0; i < cities.length; i++){
        createBlueMarker(cities[i]);
    }
    for (var i = 0; i < potential.length; i++){
        createRedMarker(potential[i]);
    }

    $scope.openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
    }

  });