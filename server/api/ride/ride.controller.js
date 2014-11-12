'use strict';

var _ = require('lodash');
var Ride = require('./ride.model');

// Get list of rides
exports.index = function(req, res) {
  Ride.find(function (err, rides) {
    if(err) { return handleError(res, err); }
    return res.json(200, rides);
  });
};

// Get a single ride
exports.show = function(req, res) {
  Ride.findById(req.params.id, function (err, ride) {
    if(err) { return handleError(res, err); }
    if(!ride) { return res.send(404); }
    return res.json(ride);
  });
};

// Get a single ride by date
exports.showByDate = function(req, res) {
  Ride.findOne({date:req.params.date}, function (err, ride) {
    if(err) { return handleError(res, err); }
    if(!ride) { return res.send(404); }
    return res.json(ride);
  });
};

// Creates a new ride in the DB.
exports.create = function(req, res) {
  Ride.create(req.body, function(err, ride) {
    if(err) { return handleError(res, err); }
    return res.json(201, ride);
  });
};

// Updates an existing ride in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Ride.findById(req.params.id, function (err, ride) {
    if (err) { return handleError(res, err); }
    if(!ride) { return res.send(404); }
    var updated = _.merge(ride, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, ride);
    });
  });
};

// Deletes a ride from the DB.
exports.destroy = function(req, res) {
  Ride.findById(req.params.id, function (err, ride) {
    if(err) { return handleError(res, err); }
    if(!ride) { return res.send(404); }
    ride.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}