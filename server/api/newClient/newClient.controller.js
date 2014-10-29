'use strict';

var _ = require('lodash');
var Newclient = require('./newClient.model');

// Get list of newClients
exports.index = function(req, res) {
  Newclient.find(function (err, newClients) {
    if(err) { return handleError(res, err); }
    return res.json(200, newClients);
  });
};

// Get a single newClient
exports.show = function(req, res) {
  Newclient.findById(req.params.id, function (err, newClient) {
    if(err) { return handleError(res, err); }
    if(!newClient) { return res.send(404); }
    return res.json(newClient);
  });
};

// Creates a new newClient in the DB.
exports.create = function(req, res) {
  Newclient.create(req.body, function(err, newClient) {
    if(err) { return handleError(res, err); }
    return res.json(201, newClient);
  });
};

// Updates an existing newClient in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Newclient.findById(req.params.id, function (err, newClient) {
    if (err) { return handleError(res, err); }
    if(!newClient) { return res.send(404); }
    var updated = _.merge(newClient, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, newClient);
    });
  });
};

// Deletes a newClient from the DB.
exports.destroy = function(req, res) {
  Newclient.findById(req.params.id, function (err, newClient) {
    if(err) { return handleError(res, err); }
    if(!newClient) { return res.send(404); }
    newClient.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}