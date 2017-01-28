var SpotifyWebApi = require('spotify-web-api-node');
var mongoose = require('mongoose');

var spotifyApi = new SpotifyWebApi();

var accessToken = 'BQCFiZQSo-3aFAaNy9Y6nDckwkYpb6RkAla_hxjxJfAeOYyxWXVjjwFPfU2cXAzr4BdZ8R_qqEqEPmgPodhetE-hXNUI-KGnYmtSguyLbFdJuiHBlLAYmq51TnSJLhicg1KbuaSlJLSVNMufU_Qw';

spotifyApi.setAccessToken(accessToken);

spotifyApi.getMyTopTracks(limit=2)
  .then(function(data) {
    var songList = data.body.items.map(function(item) {return item.name});
    store_data(songList);
  }, function(err) {
    throw err;
  });

function store_data(songList) {
  mongoose.Promise = global.Promise;
  mongoose.connect('mongodb://127.0.0.1:27017/crowdify');
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
