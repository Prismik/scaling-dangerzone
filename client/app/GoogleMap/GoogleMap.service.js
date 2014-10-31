'use strict';

angular.module('sigApp')
  .factory('GoogleMap', function () {
    var map = null;
    var routePanel = null;
    var redMarkers = [];
    var blueMarkers = [];
    var infoWindows = [];

    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();

    var elevator = new google.maps.ElevationService();
    var chart = new google.visualization.ColumnChart(document.getElementById('chart'));
    var polyline;

    var mapOptions = {
        scrollwheel: false,
        zoom: 4,
        center: new google.maps.LatLng(40.0000, -98.0000),
        mapTypeId: 'terrain'
    }


    var initialize = function(mapDiv, routeDiv, cities, potential) {
      map = new google.maps.Map(mapDiv, mapOptions);
      routePanel = routeDiv;
      directionsDisplay.setMap(map);
      directionsDisplay.setOptions( { suppressMarkers: true } );  

      // Create a DIV and pass it the Route Calculation Control
      var routeControlDiv = document.createElement('div');
      var routeControl = new RouteControl(routeControlDiv, cities, potential);

      routeControlDiv.index = 1;
      map.controls[google.maps.ControlPosition.TOP_RIGHT].push(routeControlDiv);
    }

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

    var calcRoute = function (cities, potential) {
      var start = cities[0].lat + "," + cities[0].long;
      var end = cities[1].lat + "," + cities[1].long;
      var waypts = [];
      for (var i = 0; i < cities.length; i++) {
          waypts.push({ location:cities[i].lat + "," + cities[i].long, stopover:true });
      }

      var potWpts = [];
      var startLatlng = new google.maps.LatLng(cities[0].lat , cities[0].long);
      for (var i = 0; i < potential.length; i++) {
        var curLatLng = new google.maps.LatLng(potential[i].lat , potential[i].long);
        potWpts.push({ 
          potential: potential[i], 
          distance: google.maps.geometry.spherical.computeDistanceBetween(startLatlng, curLatLng)
        });
      }

      potWpts.sort(function(a,b) {
        return (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0);
      });
      for (var i = 0; i < potWpts.slice(0, 4).length; i++) {
        waypts.push({ location:potWpts[i].potential.lat + "," + potWpts[i].potential.long, stopover:true });
      }

      console.log (waypts);
      var request = {
          origin: start,
          destination: end,
          waypoints: waypts,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING
      };

      // Call the direction service and on OK status, print the travel steps
      directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
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
        console.log(status);
      });
    }

    var createBlueMarker = function(info) {
      var marker = new google.maps.Marker({
          icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          map: map,
          position: new google.maps.LatLng(info.lat, info.long),
          title: info.city,
          content: '<div class="infoWindowContent">' + info.desc + '</div>'
      });
      blueMarkers.push(marker);

      var infoWindow = new google.maps.InfoWindow({ content: feedClientInfo(info) });
      infoWindows.push(infoWindow);
      google.maps.event.addListener(marker, 'click', function() {
        for (var i = 0; i < infoWindows.length; i++) {
          infoWindows[i].close();
        }
        infoWindow.open(map,marker);
      });
    }
    
    var createRedMarker = function(info) {
      var marker = new google.maps.Marker({
          icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
          map: map,
          position: new google.maps.LatLng(info.lat, info.long),
          title: info.city,
          content: '<div class="infoWindowContent">' + info.desc + '</div>'
      });
      redMarkers.push(marker);

      var infoWindow = new google.maps.InfoWindow({ content: feedPotentialInfo(info) });
      infoWindows.push(infoWindow);
      google.maps.event.addListener(marker, 'click', function() {
        for (var i = 0; i < infoWindows.length; i++) {
          infoWindows[i].close();
        }
        infoWindow.open(map,marker);
      });
    }

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

    // Takes an array of ElevationResult objects, draws the path on the map
    // and plots the elevation profile on a Visualization API ColumnChart.
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

      // Display a polyline of the elevation path.
      var pathOptions = {
        path: elevationPath,
        strokeColor: '#0000CC',
        opacity: 0.4,
        map: map
      }
      polyline = new google.maps.Polyline(pathOptions);

      
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

    // Public API here
    return {
      initialize: initialize,
      calcRoute: calcRoute,
      createBlueMarker: createBlueMarker,
      createRedMarker: createRedMarker,
      map: map,
      redMarkers: redMarkers,
      blueMarkers: blueMarkers
    };
  });
