'use strict';

angular.module('sigApp')
  .factory('Stats', function ($rootScope) {
  	var elevator = new google.maps.ElevationService();
  	var chart = new google.visualization.ColumnChart(document.getElementById('chart'));;
    var polyline;
    var initialize = function() {
      
    }

    /*
    * Generate required data for the statistics
    * of a given route.
    * @route: The given route to make statistics about.
    */
    var generate = function(route) {
    	generateChart(route);
    	return generateData(route);
    }

    /*
    * Generate data concerning a route.
    * @record: The route.
    */
    var generateData = function(record) {
    	var nbSteps = 0;
    	var seconds = 0;
    	for (var i = 0; i < record.route.length; i++) {
        var myRoute = record.route[i];
        seconds += myRoute.duration;
        for (var j = 0; j < myRoute.steps.length; j++) {
          nbSteps++;
        }
      }

      return { 
      	steps: nbSteps,
      	time: convertSecondsToTime(seconds)
      }
    }

    /*
    * Generate an elevation chart for the route.
    * @record: The route.
    */
    var generateChart = function(record) {
      var lats = [];
      // For each route, display summary information.
      for (var i = 0; i < record.route.length; i++) {
        var myRoute = record.route[i];
        for (var j = 0; j < myRoute.steps.length; j++) {
          lats.push(new google.maps.LatLng(myRoute.steps[j].lat, myRoute.steps[j].lng));
        }
      }

      var pathRequest = {
        'path': lats,
        'samples': 256
      }

      elevator.getElevationAlongPath(pathRequest, plotElevation);
    }

    /*
    * Converts an amount of seconds to a time format.
    * @sec: The amount of seconds.
    */
    var convertSecondsToTime = function(sec) {
	    var hours   = Math.floor(sec / 3600);
	    var minutes = Math.floor((sec - (hours * 3600)) / 60);
	    var seconds = sec - (hours * 3600) - (minutes * 60);

	    if (hours   < 10) {hours   = "0"+hours;}
	    if (minutes < 10) {minutes = "0"+minutes;}
	    if (seconds < 10) {seconds = "0"+seconds;}
	    var time    = hours+':'+minutes+':'+seconds;
	    return time;
    }

   /*
    * Takes an array of ElevationResult objects, draws the path on the map
    * and plots the elevation profile on a Visualization API ColumnChart.
    * @results: The results from the elevation API
    * @status: The status of the request, wether it worked or not
    */
    var plotElevation = function(results, status) {
      if (status != google.maps.ElevationStatus.OK)
        return;
      
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
    // Public API here
    return {
      initialize: initialize,
      generate: generate
    };
  });
