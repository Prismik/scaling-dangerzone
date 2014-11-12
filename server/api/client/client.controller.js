'use strict';

var _ = require('lodash');
var Client = require('./client.model');
var mongoose = require('mongoose');

// Get list of clients
exports.index = function(req, res) {
  Client.find(function (err, clients) {
    if(err) { return handleError(res, err); }
    return res.json(200, clients);
  });
};

// Get a single client
exports.show = function(req, res) {
  Client.findById(req.params.id, function (err, client) {
    if(err) { return handleError(res, err); }
    if(!client) { return res.send(404); }
    return res.json(client);
  });
};

exports.showMany = function(req, res) {
	var ids = req.params.ids.split(',');
	var many = [];
	console.log(req.params.ids);
	for(var i = 0; i != ids.length; ++i) {
		many.push(mongoose.Types.ObjectId(ids[i]));
	}
	console.log(many);
	Client.find({'_id': 
		{ $in: 
        many
    }
  	}, function (err, clients) {
    if(err) { return handleError(res, err); }
    if(!clients) { return res.send(404); }
    return res.json(clients);
  });
};

// Creates a new client in the DB.
exports.create = function(req, res) {
  Client.create(req.body, function(err, client) {
    if(err) { return handleError(res, err); }
    return res.json(201, client);
  });
};

// Updates an existing client in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Client.findById(req.params.id, function (err, client) {
    if (err) { return handleError(res, err); }
    if(!client) { return res.send(404); }
    var updated = _.merge(client, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, client);
    });
  });
};

// Deletes a client from the DB.
exports.destroy = function(req, res) {
  Client.findById(req.params.id, function (err, client) {
    if(err) { return handleError(res, err); }
    if(!client) { return res.send(404); }
    client.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
	console.log(err);
  return res.send(500, err);
}