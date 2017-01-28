var SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientId : 'fcecfc72172e4cd267473117a17cbd4d',
    clientSecret : 'a6338157c9bb5ac9c71924cb2940e1a7',
    redirectUri : 'http://www.example.com/callback'
});

spotifyApi.setAccessToken('BQAdw1raf2wIus9IOfR8OGIlkQf5_Q1Z7xzIPOeTPM6akX8xsP5iaX7o76cGdjsjBIQF6tMr_EJdnq5ZfOx-PLzmGsOSawbXMnAqTuC_1r0DNgVA7R8q5fwH3NJXP8D76IpU1tJutLCYM9tppes1o3fi8tVYne6CKW9hGO6vk6yLHk-x77wGJpuUsOwG7rF5D0m6ZmjV8AA0DerS4qvh6hxvnCNe9KuWkh7iR9vNXaqJB8ThqdxKEdqcoLyYpwaoEDYpdvPfSWrx2EHnVt74swBZHer37D34qXhboiv8ht-LEevZJjA')


function getRecommendations(seed_tracks){
    var argument = {min_energy: 0.4,
		    seed_artists: seed_tracks,
		    min_popularity: 50}
    var recommendations = spotifyApi.getRecommendations(argument)
    return recommendations
}



function updatePlaylist(userId, playlistId, songArray){   
    spotifyApi.addTracksToPlaylist(userId, playlistId, songArray).
	then(function(data) {console.log("Playlist updated!");},
	     function(err) {console.log("something went wrong in the playlist update", err);})	     
}

function recommendAndUpdate(userId, playlistId, seed_tracks){
    // Generate recommendations based on seed tracks, then
    // add these songs to the playlist
    getRecommendations(seed_tracks).
	then(function(recom)
	     {var songArray = recom.body.tracks.map(function(a) {return a.uri});
	      updatePlaylist(userId, playlistId, songArray);},
	     function(err) {
		 console.log('Something went wrong in getting recommendations', err);
	     });
}

// spotifyApi.getUserPlaylists('aqarias').then(function(data) {console.log(data.body.items);},
//  					    function(err) {console.log("something went wrong in the getting user", err);})	     


recommendAndUpdate('aqarias', '2TbuUMU7ZhEmI5qP0VMO0J', ['6mfK6Q2tzLMEchAr0e9Uzu',
				     '4DYFVNKZ1uixa6SQTvzQwJ'])


