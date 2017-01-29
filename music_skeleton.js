var SpotifyWebApi = require('spotify-web-api-node'),
  serverConfig = require('./serverConfig.json'),
  schemas = require('./schemas'),
  mongoose = require('mongoose');

// credentials are optional
exports.recommendAndUpdate = function(accessToken, userId, eventId,
  dancing=false, energetic=false, positive=false, instrumental=false) {
  var spotifyApi = new SpotifyWebApi(serverConfig.oauth);
  spotifyApi.setAccessToken(accessToken);
  recommendAndUpdate(userId, eventId, spotifyApi,
                     dancing, energetic, positive, instrumental);
}

exports.createPlaylist = function(accessToken, userId, eventName, sluggedName){
  var spotifyApi = new SpotifyWebApi(serverConfig.oauth);
  spotifyApi.setAccessToken(accessToken);
  spotifyApi.createPlaylist(userId, eventName + ' Crowdify', { 'public' : true })
	.then(function(data) {
      schemas.Event.update({"name": sluggedName}, {$set : {"playlistId": data.body.id}},
                 function (err) {
                     if (err) throw err;
                 });
	    console.log('Created playlist!');
	}, function(err) {
	    console.log('Something went wrong in creating a playlist!', err);
	});
}



// Given 5 seed track Ids, user and playlist Id,
// generate recommendations based on (max 5) seed tracks, then
// regenerate the playlist with these songs in it
function recommendAndUpdate (userId, eventId, spotifyApi,
                             dancing, energetic, positive, instrumental){
  schemas.Event.findOne({name: eventId}, function(err, event){
    seed_tracks = [].concat.apply([], event.songNames);
    console.log(seed_tracks);
    var seeds = generateSeeds(seed_tracks);
    updatePlaylist(userId, event.playlistId, [], spotifyApi);
    // console.log("seeds= ", seeds);
    var start=0;
    for (var i=0; i<seed_tracks.length/5; ++i) {
      getRecommendations(seeds.slice(start, start+5), spotifyApi,
                         dancing, energetic, positive, instrumental)
        .then(function(recom) {
          var songUris = recom.body.tracks.map(function(a) {return a.uri});
          console.log(songUris);
          addToPlaylist(userId, event.playlistId, songUris, spotifyApi);
        },
       function(err) {
           console.log('Something went wrong in getting recommendations', err);
       });
      start += 5;
    }
   });
}

// Given up to 5 seed track Ids, returns a promise of an object containing some
// recommended songs
function getRecommendations(seed_tracks, spotifyApi,
                            dancing, energetic, positive, instrumental) {

    var argument = {min_energy: 0.4,
		    seed_tracks: seed_tracks,
		    min_danceability: 0.0,
		    min_valence: 0.0,
		    min_instrumentalness: 0.0,
		    min_popularity: 50}
    if (dancing) {
      argument.min_danceability = 0.8
    }
    if (energetic) {
      argument.min_energy = 0.85
    }
    if (positive) {
      argument.min_valence = 0.9
    }
    if (instrumental) {
      argument.min_instrumentalness = 0.9
    }

    var recommendations = spotifyApi.getRecommendations(argument);
    return recommendations;
}

// Given a userId (i.e. username), playlistID, array of songURIs,
// adds songs onto the specified playlist
function addToPlaylist(userId, playlistId, songUris, spotifyApi){   
    spotifyApi.addTracksToPlaylist(userId, playlistId, songUris).
  then(function(data) {console.log("Added songs to playlist!");},
       function(err) {console.log("something went wrong in the playlist update", err);})	     
}

function updatePlaylist(userId, playlistId, songUris, spotifyApi){   
    spotifyApi.replaceTracksInPlaylist(userId, playlistId, songUris).
  then(function(data) {console.log("Playlist updated!");},
       function(err) {console.log("something went wrong in the playlist update", err);})	     
}

function getFromDb(fn0){
  var Song = schemas.Songs;

  // console.log("e");
  function setSL(list) {
    userSongsList = list;
  }
  function foo(fn) {
     Song.find({}, function(err, songs) {
      if (err) throw err;
      // console.log(songs[0].songNames);
      userSongsList = songs.map(function(item) {return item.songNames});
      fn(userSongsList[0]);
    });
  }
  foo(function(userSongsList) {
    mongoose.connection.close();
    fn0(userSongsList);
  });
}

// getFromDb(function(myvar) {
//     var seeds = generateSeeds(myvar)    
//     console.log(myvar);
// });

function countOccurences(songList) {
  var songCount = songList.reduce(function (acc, curr) {
      if (typeof acc[curr] == 'undefined') {
        acc[curr] = 1;
      } else {
        acc[curr] += 1;
      }

      return acc;
  }, {});
  return songCount
}

// Generates a large array of seeds, take 5 at at time
function generateSeeds(songList, topN=20) {
    var songCount = countOccurences(songList);
    var keys = Object.keys(songCount)
    var pairs = []
    for (var i=0; i<keys.length; ++i) {
      pairs.push([keys[i], songCount[keys[i]]])
    }
    pairs.sort(function(a, b){return 0.5 - Math.random()});
    var sortedPairs = pairs.sort(function(a,b) {return b[1]-a[1]})
    sortedPairs = sortedPairs.slice(0,topN)
    var sortedSongs = sortedPairs.map(function(x) {return x[0]})

    return sortedSongs
}
