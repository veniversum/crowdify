var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

var organizerSchema = new Schema({
    username:  String,
    accessToken: String,
    refreshToken: String,
    dateAdded: {type: Date, default: Date.now}
});

var eventSchema = new Schema({
    name: String,
    organizer: {type: ObjectId, ref: 'Organizer'},
    songNames: {type: ObjectId, ref: 'Songs'},
    songNames: [[String]],
    playlistId: String,
    dancing: {type: Boolean, default: false},
    energetic: {type: Boolean, default: false},
    positive: {type: Boolean, default: false},
    instrumental: {type: Boolean, default: false}
});

var songsSchema = new Schema({
    songNames: [String]
});

var Songs = mongoose.model('Song', songsSchema);
var Organizer = mongoose.model('Organizer', organizerSchema);
var Event = mongoose.model('Event', eventSchema);
var schemas = {"Organizer":Organizer, "Event":Event, "Songs":Songs};

module.exports = schemas;
