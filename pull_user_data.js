var SpotifyWebApi = require('spotify-web-api-node'),
   mongoose = require('mongoose'),
   serverConfig = require('./serverConfig.json');
   
function store_data(songList) {
   mongoose.Promise = global.Promise;
   mongoose.connect(serverConfig.mongo.host + serverConfig.mongo.schema);
   var Schema = mongoose.Schema;
   var songsSchema = new Schema({
       songNames: [String]
   });

   var Song = mongoose.model('Song', songsSchema);

   var song = new Song({songNames: songList});

   song.save(function(err) {
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