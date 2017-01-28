var SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientId : 'fcecfc72172e4cd267473117a17cbd4d',
    clientSecret : 'a6338157c9bb5ac9c71924cb2940e1a7',
    redirectUri : 'http://www.example.com/callback'
});

spotifyApi.setAccessToken('BQAqbsMYn0w_CxdULL3xd1mm7urAgPCM0L3PZPNrC-BV2CTiDLVkk4akPYtBuJUERagNKi90xCC0ZNfttLmE-NP2DivRBe6U7UAojDLXnbqDEVJRDHq0MqZW2MGKjqpz6zPaMuQcQV79RMBxmyqD2p95QF9amL0PJTDJm1fi31DckLOup7YDzvpziSbDsBK67bCmQ6jAla0mrYqfiQsDlFIDwqrPteG3dPbKRSBmAoBINIr2NFcczxU-cPuQfEkF231IPYVCk_2YwflPY2_yzAoVDSYUmwv-W4FaiQnd-W-CTkv5lnQ')


function getRecommendations(seed_tracks){
    var argument = {min_energy: 0.4,
		    seed_artists: seed_tracks,
		    min_popularity: 50}
    var recommendations = spotifyApi.getRecommendations(argument)
    return recommendations
}



function updatePlaylist(songArray, userId, playlistId){   
    spotifyApi.addTracksToPlaylist(userId, playlistId, songArray).
	then(function(data) {console.log("Playlist updated!");},
	     function(err) {console.log("something went wrong in the playlist update");})	     
}

function recommendAndUpdate(userId, playlistId, seed_tracks){
    // Generate recommendations based on seed artists, then
    // add these songs to the playlist
    getRecommendations(seed_artists).
	then(function(recom)
	     {var songArray = recom.body.tracks.map(function(a) {return a.album.id});
	      updatePlaylist(songArray, playlistId);},
	     function(err) {
		 console.log('Something went wrong in getting recommendations', err);
	     });
}    


recommendAndUpdate('aqarias', 'myCoolPlaylist5', ['6mfK6Q2tzLMEchAr0e9Uzu',
				     '4DYFVNKZ1uixa6SQTvzQwJ'])


