'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NewclientSchema = new Schema({
  name: String,
  address: String,
  description: String,
  estimatedTime: Number,
  agent: String,
  decision: String,
  lat: Number,
  lng: Number
});

module.exports = mongoose.model('Newclient', NewclientSchema);