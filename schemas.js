var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var organizerSchema = new Schema({
    username:  String,
    accessToken: String,
    refreshToken: String,
    dateAdded: {type: Date, default: Date.now}
});

var eventSchema = new Schema({
    name: String,
    organizer: {type: ObjectId, ref: 'User'}
});

var Organizer = mongoose.model('Organizer', organizerSchema);
var Event = mongoose.model('Event', eventSchema);
var schemas = {"Organizer":Organizer, "Event":Event};
module.exports = schemas;