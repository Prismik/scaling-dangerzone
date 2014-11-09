'use strict';

angular.module('sigApp')
  .factory('GoogleMap', function ($rootScope, $http, $route) {
    var firstStore = new google.maps.LatLng(43.7000 , -79.4000);
    var secondStore = new google.maps.LatLng(40.7000 , -79.9000);
    var map = null;
    var routePanel = null;
    var redMarkers;
    var blueMarkers;
    var infoWindows;

    var selectedMarkers;
    var previousMarker = null;

    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var geocoder;

    var elevator = new google.maps.ElevationService();
    var chart = new google.visualization.ColumnChart(document.getElementById('chart'));
    var polyline;

    var mapOptions = {
        scrollwheel: false,
        zoom: 4,
        center: new google.maps.LatLng(40.0000, -98.0000),
        mapTypeId: 'terrain'
    }

    /*
    * Initialize required data for the google maps object, along with
    * the markers, elevation device, directions device and any Google API
    * components.
    */
    var initialize = function(mapDiv, routeDiv, potential, cities) {
      redMarkers = [];
      blueMarkers = [];
      infoWindows = [];
      selectedMarkers = [];
      previousMarker = null;

      map = new google.maps.Map(mapDiv, mapOptions);
      routePanel = routeDiv;
      directionsDisplay.setMap(map);
      directionsDisplay.setOptions( { suppressMarkers: true } );  
      geocoder = new google.maps.Geocoder();

      // Create a DIV and pass it the Route Calculation Control
      var routeControlDiv = document.createElement('div');
      var routeControl = new RouteControl(routeControlDiv, selectedMarkers, potential);

      routeControlDiv.index = 1;
      map.controls[google.maps.ControlPosition.TOP_RIGHT].push(routeControlDiv);
    
      for (var i = 0; i < cities.length; ++i){
        createBlueMarker(cities[i]);
      }

      for (var j = 0; j < potential.length; ++j){
        createRedMarker(potential[j]);
      }  
    }

    /*
		* Creates the control required to calculate the optimal route.
		* This button will be set on the google Maps.
		*/
    var RouteControl = function(controlDiv, cities, potential) {
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
        calcRoute(cities, potential);
      });
    }

    /*
    * Prepares a direction request and returns it in a json with the Google API Format.
    * @start: The start point for the route
    * @end: The end point for the route
    * @cities: The clients list for the deliveries
    * @potential: The potential clients list.
    */
    var prepareRequest = function(start, end, cities, potential) {
      var waypts = [];
      for (var i = 0; i < cities.length; i++) {
          waypts.push({ location:cities[i].info.lat + "," + cities[i].info.lng, stopover:true });
      }

      var potWpts = [];
      for (var i = 0; i < potential.length; i++) {
        var curLatLng = new google.maps.LatLng(potential[i].lat , potential[i].lng);
        potWpts.push({ 
          potential: potential[i], 
          distance: google.maps.geometry.spherical.computeDistanceBetween(secondStore, curLatLng)
        });
      }

      potWpts.sort(function(a,b) {
        return (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0);
      });
      for (var i = 0; i < potWpts.slice(0, 4).length; i++) {
        waypts.push({ location:potWpts[i].potential.lat + "," + potWpts[i].potential.lng, stopover:true });
      }

      return {
          origin: start,
          destination: end,
          waypoints: waypts,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING
      };
    }

    /*
    * Prints the route summary in the proper DIV.
    * @reponse: The directions response from a google directions request.
    */
    var printRouteSummary = function(response) {
      directionsDisplay.setDirections(response);
      var route = response.routes[0];
      
      var summary = '<h2>Direction steps</h2><br><table class="table">';
      var step = 1;
      var lats = [];
      // For each route, display summary information.
      for (var i = 0; i < route.legs.length; i++) {
        var myRoute = route.legs[i];
        for (var j = 0; j < myRoute.steps.length; j++) {
          lats.push(new google.maps.LatLng(myRoute.steps[j].start_location.lat(), myRoute.steps[j].start_location.lng()));
          summary += '<tr>' + 
            '<td>'+step.toString()+'</td>' +
            '<td>'+myRoute.steps[j].instructions+'</td>' +
            '<td>'+myRoute.steps[j].distance.value+' m</td>' +
          '</tr>';
          ++step;
        }
      }

      var pathRequest = {
        'path': lats,
        'samples': 256
      }

      elevator.getElevationAlongPath(pathRequest, plotElevation);

      summary += '</table>'
      routePanel.innerHTML = summary;
    }

    /*
    * Translates an address to a LatLng object using the google Geocoder
    * @callback: The callback function
    * @address: The address to translate to lattitude/longitude
    * @remarks: Returns null if status is not OK.
    */
    var addrToLatLng = function (address, callback) {
      geocoder.geocode( { 'address': address }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          callback(results[0].geometry.location);
        } else {
          callback(null);
        }
      });
    }

    /*
    * Selects the optimal route between both provided as a directions request
    * @requestA: The first request
    * @requestB: The second request
    */
    var selectOptimalRoute = function(requestA, requestB) {
      var totalA = 0;
      var totalB = 0;
      directionsService.route(requestA, function(responseA, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          var route = responseA.routes[0];
          for (var i = 0; i < route.legs.length; i++) {
            totalA += route.legs[i].distance.value;
          }

          directionsService.route(requestB, function(responseB, status) {
            if (status == google.maps.DirectionsStatus.OK) {
              var route = responseB.routes[0];
              for (var i = 0; i < route.legs.length; i++) {
                totalB += route.legs[i].distance.value;
              }

              if (totalA < totalB)
                printRouteSummary(responseA);
              else 
                printRouteSummary(responseB);
            }
          });
        }
      });
    }

    /*
    * Calculates the optimal route from a set list of clients.
    * @cities: The clients list for the delivery
    * @potential: The potential clients list
    */
    var calcRoute = function (cities, potential) {
      for (var i = 0; i < infoWindows.length; i++) {
        infoWindows[i].close();
      }
      var start = firstStore.lat() + "," + firstStore.lng();
      var end = secondStore.lat() + "," + secondStore.lng();
      var requestA = prepareRequest(start, end, cities, potential);
      var requestB = prepareRequest(end, start, cities, potential);

      selectOptimalRoute(requestA, requestB);
    }

    /*
    * Creates a blue marker that is related to a delivery client. The
    * marker will hold all the client information and so will be used
    * for data updates.
    * @info: The client info
    */
    var createBlueMarker = function(info) {
      var infoWindow = new google.maps.InfoWindow({ content: feedClientInfo(info) });
      infoWindows.push(infoWindow);

      var marker = new google.maps.Marker({
          icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          map: map,
          position: new google.maps.LatLng(info.lat, info.lng),
          title: info.name,
          content: '<div class="infoWindowContent">' + info.description + '</div>',
          infoWindow: infoWindow,
          info: info
      });
      blueMarkers.push(marker);
      
      google.maps.event.addListener(infoWindow, 'domready', function() {
			    document.getElementById(info.name + '-form').addEventListener("submit", function(e) {
			        e.preventDefault();
			        var client = {
			        	name: document.getElementById('name').value,
			        	description: document.getElementById('description').value,
			        	article: document.getElementById('article').value,
			        	estimatedTime: document.getElementById('estimate').value
			        };
			        $http.put('/api/clients/' + info._id, client);
			        $route.reload();
			    });
			});
      google.maps.event.addListener(marker, 'click', function() {
        for (var i = 0; i < infoWindows.length; i++) {
          infoWindows[i].close();
        }
        infoWindow.open(map,marker);
      });
    }
    
    /*
    * Creates a red marker that is related to a new potential client. The
    * marker will hold all the potential client information and so will be used
    * for data updates.
    * @info: The potential client info
    */
    var createRedMarker = function(info) {
      var infoWindow = new google.maps.InfoWindow({ content: feedPotentialInfo(info) });
      infoWindows.push(infoWindow);

      var marker = new google.maps.Marker({
          icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
          map: map,
          position: new google.maps.LatLng(info.lat, info.lng),
          title: info.name,
          content: '<div class="infoWindowContent">' + info.description + '</div>',
          infoWindow: infoWindow,
          info: info
      });
      redMarkers.push(marker);
      
      google.maps.event.addListener(infoWindow, 'domready', function() {
			    document.getElementById(info.name + '-form').addEventListener("submit", function(e) {
			        e.preventDefault();
			        var client = {
			        	name: document.getElementById('name').value,
			        	agent: document.getElementById('agent').value,
			        	description: document.getElementById('description').value,
			        	decision: document.getElementById('decision').value,
			        	estimatedTime: document.getElementById('spent').value
			        };
			        $http.put('/api/newClients/' + info._id, client);
			        $route.reload();
			    });
			});
      google.maps.event.addListener(marker, 'click', function() {
        for (var i = 0; i < infoWindows.length; i++) {
          infoWindows[i].close();
        }
        infoWindow.open(map,marker);
      });
    }

    /*
    * Feeds the client info into the google maps markers
    * @info: The clients info
    */
    var feedClientInfo = function(info) {
      var popup = '<form role="form" style="width: 400px" id="' + info.name + '-form">' +
        '<div class="row">' +
          '<div class="col-md-6">' +
            '<div class="form-group">' +
              '<label for="name">Title</label>' +
              '<input type="text" class="form-control" id="name" ' +
                     'placeholder="Enter title..." value="' + info.name + '">' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="description">Description</label>' +
              '<br>' +
              '<textarea class="form-control" style="resize: none;" id="description" rows="5" cols="25">' +
              info.description +
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
                     'placeholder="Enter estimate..." value="' + info.estimatedTime + '">' +
            '</div>' +
            '<button type="submit" class="btn btn-default">Submit</button>' +
          '</div>' +
        '</div>' +
        '</form>';

      return popup;
    }

    var test = function() {
  		console.log('test');
  	}
    /*
    * Feeds the client info into the google maps markers
    * @info: The clients info
    */
    var feedPotentialInfo = function(info) {
      var popup = '<form role="form" style="width: 400px" id="' + info.name + '-form">' +
        '<div class="row">' +
          '<div class="col-md-6">' +
            '<div class="form-group">' +
              '<label for="name">Title</label>' +
              '<input type="text" class="form-control" id="name" value="' + info.name +'" placeholder="Enter title...">' +
            '</div>' +
            '<select class="form-control" id="decision">' +
						  '<option value="acc">Accepted</option>' +
						  '<option value="ref">Refused</option>' +
						  '<option value="wait">Waiting</option>' +
            '</select>' +
            '<div class="form-group">' +
              '<label for="description">Description</label>' +
              '<br>' +
              '<textarea class="form-control" style="resize: none;" id="description" rows="5" cols="25">' +
              info.description +
              '</textarea>' +
            '</div>' +
          '</div>' +
          '<div class="col-md-6">' +
            '<div class="form-group">' +
              '<label for="agent">Marketing agent</label>' +
              '<input type="text" class="form-control" id="agent" value="' + info.agent +'" placeholder="Marketing agent...">' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="spent">Spent time</label>' +
              '<input type="text" class="form-control" id="spent" value="' + info.estimatedTime + '" placeholder="Enter spent time...">' +
            '</div>' +
            '<button type="submit" class="btn btn-default">Submit</button>' +
          '</div>' +
        '</div>' +
        '</form>';

      return popup;
    }

    /*
    * Takes an array of ElevationResult objects, draws the path on the map
    * and plots the elevation profile on a Visualization API ColumnChart.
    * @results: The results from the elevation API
    * @status: The status of the request, wether it worked or not
    */
    var plotElevation = function(results, status) {
      if (status != google.maps.ElevationStatus.OK) {
        return;
      }
      var elevations = results;
      // Extract the elevation samples from the returned results
      // and store them in an array of LatLngs.
      var elevationPath = [];
      for (var i = 0; i < results.length; i++) {
        elevationPath.push(elevations[i].location);
      }
      
      var data = new google.visualization.DataTable();
      // Extract the data from which to populate the chart.
      // Because the samples are equidistant, the 'Sample'
      // column here does double duty as distance along the
      // X axis.
      data.addColumn('string', 'Sample');
      data.addColumn('number', 'Elevation');
      for (var i = 0; i < results.length; i++) {
        data.addRow(['', elevations[i].elevation]);
      }

      // Draw the chart using the data within its DIV.
      document.getElementById('chart').style.display = 'block';
      chart.draw(data, {
        height: 150,
        legend: 'none',
        titleY: 'Elevation (m)',
        title: 'Elevation Chart',
        titleTextStyle: {
          fontSize: 20,
          bold: true
        }
      });
    }

    /*
    * Opens an info window at the location of a given marker, showing it's 
    * embeded data as well.
    * @e: The event
    * @selectedMarket: The marker for which to show the info window.
    */
    var openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        selectedMarker.infoWindow.close();

        previousMarker = selectedMarker;
        if (selectedMarkers.indexOf(selectedMarker) > -1)
            selectedMarkers.splice(selectedMarkers.indexOf(selectedMarker), 1);
        else {
            selectedMarkers.push(selectedMarker);
            google.maps.event.trigger(selectedMarker, 'click');
        }
    }

    /*
    * Determines wether a marker is selected or not
    * @market: The marker to test
    */
    var isMarkerSelected = function(marker) {
      return selectedMarkers.indexOf(marker) > -1;
    }

    // Public API here
    return {
      initialize: initialize,
      calcRoute: calcRoute,
      createBlueMarker: createBlueMarker,
      createRedMarker: createRedMarker,
      map: map,
      redMarkers: function(){ return redMarkers; },
      blueMarkers: function(){ return blueMarkers; },
      openInfoWindow: openInfoWindow,
      isMarkerSelected: isMarkerSelected,
      addrToLatLng: addrToLatLng,
      test: test
    };
  });
