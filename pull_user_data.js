var SpotifyWebApi = require('spotify-web-api-node');
var mongoose = require('mongoose');
var serverConfig = require('./serverConfig.json');

// Import schemas
var schemas = require('./schemas.js');

// This should be at the top of oauth.js
// -------------------------------------------------

function store_data(songList, event) {
  // List of songs from a user
   schemas.Event.update({name:event}, {$push:{songNames:songList}}, function(err) {
     if (err) throw err;
   });
}

exports.pullAttendeeData = function(accessToken, event) {
  var spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(accessToken);
  spotifyApi.getMyTopTracks(limit=50)
    .then(function(data) {
      var songList = data.body.items.map(function(item) {return item.id});
      store_data(songList, event);
    }, function(err) {
      throw err;
    });
}
