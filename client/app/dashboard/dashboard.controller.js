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
        city : 'Las Vegas',
        desc : 'Sin City...\'nuff said!',
        lat : 36.0800,
        long : -115.1522
    }
]

angular.module('sigApp')
  .controller('DashboardCtrl', function ($scope) {
  	var infoWindows = [];
    var mapOptions = {
    		scrollwheel: false,
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
    
    var calcRoute = function () {
		  var start = cities[0].lat + "," + cities[0].long;
		  var end = "toronto, ont"; // TODO how to decide of the end location ?
		  var waypts = [];
		  for (var i = 0; i < cities.length; i++) {
		      waypts.push({ location:cities[i].lat + "," + cities[i].long,
		          stopover:true });
		  }

		  for (var i = 0; i < potential.length; i++) {
		      waypts.push({ location:potential[i].lat + "," + potential[i].long,
		          stopover:true });
		  }

		  var request = {
		      origin: start,
		      destination: end,
		      waypoints: waypts,
		      optimizeWaypoints: true,
		      travelMode: google.maps.TravelMode.DRIVING
		  };

		  // Call the direction service and on OK status, print the travel steps
		  $scope.directionsService.route(request, function(response, status) {
		    if (status == google.maps.DirectionsStatus.OK) {
		      $scope.directionsDisplay.setDirections(response);
		      var route = response.routes[0];
		      var summaryPanel = document.getElementById('route');
		      var summary = '<h2>Direction steps</h2><br><table class="table">';
		      var step = 1;
		      // For each route, display summary information.
		      for (var i = 0; i < route.legs.length; i++) {
		      	var myRoute = route.legs[i];
		      	console.log(myRoute);
					  for (var j = 0; j < myRoute.steps.length; j++) {
				     
			        summary += '<tr>' + 
			        	'<td>'+step.toString()+'</td>' +
			        	'<td>'+myRoute.steps[j].instructions+'</td>' +
			        	'<td>'+myRoute.steps[j].distance.value+' m</td>' +
			        '</tr>';
			        ++step;
					  }
		      }

		      summary += '</table>'
		      summaryPanel.innerHTML = summary;
		    }
		  });
		}

   	var RouteControl = function(controlDiv) {
		  // Set CSS styles for the DIV containing the control
		  // Setting padding to 5 px will offset the control
		  // from the edge of the map.
		  controlDiv.style.padding = '5px';

		  // Set CSS for the control border.
		  var ui = document.createElement('div');
		  ui.style.backgroundColor = 'white';
		  ui.style.borderStyle = 'solid';
		  ui.style.borderWidth = '2px';
		  ui.style.cursor = 'pointer';
		  ui.style.textAlign = 'center';
		  ui.title = 'Click to set the map to Home';
		  controlDiv.appendChild(ui);

		  // Set CSS for the control interior.
		  var text = document.createElement('div');
		  text.style.fontFamily = 'Arial,sans-serif';
		  text.style.fontSize = '12px';
		  text.style.paddingLeft = '4px';
		  text.style.paddingRight = '4px';
		  text.innerHTML = '<strong>Calculate route</strong>';
		  ui.appendChild(text);

		  google.maps.event.addDomListener(ui, 'click', function() {
		  	calcRoute();
		  });
		}

		// Create a DIV and pass it the Route Calculation Control
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
					    '<input type="text" class="form-control" id="title" ' +
					    			 'placeholder="Enter title..." value="' + info.city + '">' +
					  '</div>' +
					  '<select class="form-control">...</select>' +
					  '<div class="form-group">' +
					    '<label for="desc">Description</label>' +
					    '<br>' +
					    '<textarea class="form-control" style="resize: none;" id="desc" rows="5" cols="25">' +
					    info.desc +
					    '</textarea>' +
					 	'</div>' +
					'</div>' +
					'<div class="col-md-6">' +
						'<div class="form-group">' +
					    '<label for="article">Article</label>' +
					    '<input type="text" class="form-control" id="article" ' +
					    			 'placeholder="Article..." value="' + info.article + '">' +
					  '</div>' +
					  '<div class="form-group">' +
					    '<label for="estimate">Estimated time</label>' +
					    '<input type="text" class="form-control" id="estimate" ' +
					    			 'placeholder="Enter estimate..." value="' + info.et + '">' +
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
            title: info.city,
            content: '<div class="infoWindowContent">' + info.desc + '</div>'
        });
        $scope.blueMarkers.push(marker);

        var infoWindow = new google.maps.InfoWindow({ content: feedClientInfo(info) });
        infoWindows.push(infoWindow);
        google.maps.event.addListener(marker, 'click', function() {
        	for (var i = 0; i < infoWindows.length; i++) {
			      infoWindows[i].close();
			    }
			    infoWindow.open($scope.map,marker);
			  });
    }
    
    var createRedMarker = function(info) {
        var marker = new google.maps.Marker({
        		icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            map: $scope.map,
            position: new google.maps.LatLng(info.lat, info.long),
            title: info.city,
            content: '<div class="infoWindowContent">' + info.desc + '</div>'
        });
        $scope.redMarkers.push(marker);
        
        var infoWindow = new google.maps.InfoWindow({ content: feedPotentialInfo(info) });
        infoWindows.push(infoWindow);
        google.maps.event.addListener(marker, 'click', function() {
        	for (var i = 0; i < infoWindows.length; i++) {
			      infoWindows[i].close();
			    }
			    infoWindow.open($scope.map,marker);
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