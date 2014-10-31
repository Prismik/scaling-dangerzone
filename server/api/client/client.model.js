'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ClientSchema = new Schema({
  name: String,
  address: String,
  description: String,
  estimatedTime: Number,
  article: String
});

module.exports = mongoose.model('Client', ClientSchema);