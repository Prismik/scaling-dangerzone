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

    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

    $scope.markers = [];
    
    var infoWindow = new google.maps.InfoWindow();
    
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
        $scope.markers.push(marker);

        
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
        $scope.markers.push(marker);

        
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