var SpotifyWebApi = require('spotify-web-api-node');
var mongoose = require('mongoose');
var serverConfig = require('./serverConfig.json');

// Import schemas
var schemas = require('./schemas.js');

// This should be at the top of oauth.js
mongoose.Promise = global.Promise;
mongoose.connect(serverConfig.mongo.host + serverConfig.mongo.schema);
// -------------------------------------------------

function store_data(songList) {
  // List of songs from a user
   var songs = new schemas.Songs({songNames: songList});
   songs.save(function(err) {
     if (err) throw err;
     console.log(song.songNames);
     // console.log('Added a new song list');
   });

   mongoose.connection.close();
}

exports.pullAttendeeData = function(accessToken) {
  var spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(accessToken);

  spotifyApi.getMyTopTracks(limit=2)
    .then(function(data) {
      var songList = data.body.items.map(function(item) {return item.name});
      store_data(songList);
    }, function(err) {
      throw err;
    });
}
