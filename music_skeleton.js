var SpotifyWebApi = require('spotify-web-api-node'),
  serverConfig = require('./serverConfig.json'),
  schemas = require('./schemas'),
  mongoose = require('mongoose');

// credentials are optional
exports.recommendAndUpdate = function(accessToken, userId, playlistId) {
  console.log(accessToken);
  var spotifyApi = new SpotifyWebApi(serverConfig.oauth);
  spotifyApi.setAccessToken(accessToken);

  recommendAndUpdate(userId, playlistId, spotifyApi);
}


// Given 5 seed track Ids, user and playlist Id,
// generate recommendations based on (max 5) seed tracks, then
// regenerate the playlist with these songs in it
function recommendAndUpdate (userId, playlistId, spotifyApi){
  getFromDb(function(seed_tracks) {
    var seeds = generateSeeds(seed_tracks);
    console.log("seeds= ", seeds);    
    getRecommendations(seeds, spotifyApi).
      then(function(recom)
     {var songUris = recom.body.tracks.map(function(a) {return a.uri});
      console.log(songUris);
      updatePlaylist(userId, playlistId, songUris, spotifyApi);},
     function(err) {
         console.log('Something went wrong in getting recommendations', err);
     });
   });
 }

// Given up to 5 seed track Ids, returns a promise of an object containing some
// recommended songs
function getRecommendations(seed_tracks, spotifyApi){
    var argument = {min_energy: 0.4,
        seed_tracks: seed_tracks,
        min_popularity: 50}
    var recommendations = spotifyApi.getRecommendations(argument);
    return recommendations;
}

// Given a userId (i.e. username), playlistID, array of songURIs,
// adds songs onto the specified playlist
function addToPlaylist(userId, playlistId, songUris, numSongsToAdd=10, spotifyApi){   
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



// default option: Given a list of top songs for each user, 
// generate five seed songs by choosing the first which alphabetically overlap
function generateSeeds(songList){
    var sortedList = songList.sort()
    var seedList = []
    var j = 0
    for (var i=1; i < sortedList.length; i++){
	if (sortedList[i] == sortedList[i-1]
	    && seedList.length < 5
	    && (seedList[j-1] != sortedList[i])){
	    
	    seedList.push(sortedList[i])
	    j = j + 1
	}
    }
    if (seedList.length == 5){
	return seedList
    }
    else{ 
      return songList.slice(0,5)
    }
}



//  spotifyApi.getUserPlaylists('aqarias').then(function(data) {console.log(data.body.items);},
//  					    function(err) {console.log("something went wrong in the getting user", err);})	     



//Testing with my personal account
// recommendAndUpdate('aqarias', '4Kw8l8lv4fckoEswSX0Uw6', generateSeeds(['6IqbQelrOB6nTORNj4q2Ma',
// 								       '6IqbQelrOB6nTORNj4q2Ma',
// 								       '6IqbQelrOB6nTORNj4q2Ma',
// 								       '6IqbQelrOB6nTORNj4q2Ma', 
// 								       '3FeMpPPhGRKieT8zmlJDQz',
// 								       '7CSj1zTMJxSz7bnHxgGsSF',
// 								       '54MeG5FCVXStJTyNvRu9zN',
// 								       '54MeG5FCVXStJTyNvRu9zN',
// 								       '5ntbENj4mD1JanFRqWztSr',
// 								       '5ntbENj4mD1JanFRqWztSr',
// 								       '6vssRuMO2JuX0twM6Nei5H',
// 								       '6vssRuMO2JuX0twM6Nei5H',
// 								       '2QSuNcQxqFfokvbS7SInHG',
// 								       '2QSuNcQxqFfokvbS7SInHG',
// 								      ]))

//Pick top overlapping song choices
console.log(generateSeeds(['6IqbQelrOB6nTORNj4q2Ma',
			    '6IqbQelrOB6nTORNj4q2Ma',
			    '6IqbQelrOB6nTORNj4q2Ma',
			    '6IqbQelrOB6nTORNj4q2Ma', 
			    '3FeMpPPhGRKieT8zmlJDQz',
			    '7CSj1zTMJxSz7bnHxgGsSF',
			    '54MeG5FCVXStJTyNvRu9zN',
			    '54MeG5FCVXStJTyNvRu9zN',
			    '5ntbENj4mD1JanFRqWztSr',
			    '5ntbENj4mD1JanFRqWztSr',
			    '6vssRuMO2JuX0twM6Nei5H',
			    '6vssRuMO2JuX0twM6Nei5H',
			    '2QSuNcQxqFfokvbS7SInHG',
			    '2QSuNcQxqFfokvbS7SInHG',
			  ]))
