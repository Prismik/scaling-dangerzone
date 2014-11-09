'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ClientSchema = new Schema({
  name: String,
  address: String,
  description: String,
  estimatedTime: Number,
  article: String,
  lat: Number,
  lng: Number
});

module.exports = mongoose.model('Client', ClientSchema);