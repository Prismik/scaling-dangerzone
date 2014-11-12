'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RideSchema = new Schema({
  date: String,
  user: String,
  selected: Schema.Types.Mixed,
  route: Schema.Types.Mixed
});

module.exports = mongoose.model('Ride', RideSchema);