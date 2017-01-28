var SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientId : 'fcecfc72172e4cd267473117a17cbd4d',
    clientSecret : 'a6338157c9bb5ac9c71924cb2940e1a7',
    redirectUri : 'http://www.example.com/callback'
});

spotifyApi.setAccessToken('BQAdw1raf2wIus9IOfR8OGIlkQf5_Q1Z7xzIPOeTPM6akX8xsP5iaX7o76cGdjsjBIQF6tMr_EJdnq5ZfOx-PLzmGsOSawbXMnAqTuC_1r0DNgVA7R8q5fwH3NJXP8D76IpU1tJutLCYM9tppes1o3fi8tVYne6CKW9hGO6vk6yLHk-x77wGJpuUsOwG7rF5D0m6ZmjV8AA0DerS4qvh6hxvnCNe9KuWkh7iR9vNXaqJB8ThqdxKEdqcoLyYpwaoEDYpdvPfSWrx2EHnVt74swBZHer37D34qXhboiv8ht-LEevZJjA')


// Given up to 5 seed track Ids, returns a promise of an object containing some
// recommended songs
function getRecommendations(seed_tracks){
    var argument = {min_energy: 0.4,
		    seed_tracks: seed_tracks,
		    min_popularity: 50}
    var recommendations = spotifyApi.getRecommendations(argument)
    return recommendations
}

// Given a userId (i.e. username), playlistID, array of songURIs,
// adds songs onto the specified playlist
function addToPlaylist(userId, playlistId, songArray, numSongsToAdd=10){   
    spotifyApi.addTracksToPlaylist(userId, playlistId, songArray).
	then(function(data) {console.log("Added songs to playlist!");},
	     function(err) {console.log("something went wrong in the playlist update", err);})	     
}

function updatePlaylist(userId, playlistId, songArray, numSongsToAdd=10){   
    spotifyApi.replaceTracksInPlaylist(userId, playlistId, songArray).
	then(function(data) {console.log("Playlist updated!");},
	     function(err) {console.log("something went wrong in the playlist update", err);})	     
}

// Given 5 seed track Ids, user and playlist Id,
// generate recommendations based on (max 5) seed tracks, then
// regenerate the playlist with these songs in it
function recommendAndUpdate(userId, playlistId, seed_tracks){
    getRecommendations(seed_tracks).
	then(function(recom)
	     {var songArray = recom.body.tracks.map(function(a) {return a.uri});
	      console.log(songArray)
	      updatePlaylist(userId, playlistId, songArray);},
	     function(err) {
		 console.log('Something went wrong in getting recommendations', err);
	     });
}

//  spotifyApi.getUserPlaylists('aqarias').then(function(data) {console.log(data.body.items);},
//  					    function(err) {console.log("something went wrong in the getting user", err);})	     



//Testing with my personal account
recommendAndUpdate('aqarias', '2TbuUMU7ZhEmI5qP0VMO0J', ['6IqbQelrOB6nTORNj4q2Ma',
							 '6IqbQelrOB6nTORNj4q2Ma' ])


