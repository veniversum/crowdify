//Boilerplate for testing
var SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientId : 'fcecfc72172e4cd267473117a17cbd4d',
    clientSecret : 'a6338157c9bb5ac9c71924cb2940e1a7',
    redirectUri : 'http://www.example.com/callback'
});

spotifyApi.setAccessToken('BQAZYR7lutjeiEXWrpqXT0PZ-AQjpCjw6oTm-1zVqMhLykRgurp4Cf08VhoALuAATRQsy_thBcqlCpXIEazCuFwToLMB6KkYY04FJpdivHpaOFG3fqoSHlldY8EoQEyPVuCyM2W9PBaMwXzkMZw3f-tBkX8ELmoBp3dPiNyMP6iyEEA9Tel224k2T5PTF84irFo6KkVxQtpnxvZsy9nCh0L9luHRqFo1zO62TBe4Z5CiwHf0Pa7wk6ctm_9NHBoD6z9PdwLdU5y_9DZSk9PEnyC4l1-QnpvkoNaJKNDXDaqXcJu0bWw')


// Create a new playlist, then grab the Id of that playlist and return it
// Still not sure about this asynchronous stuff
function createPlaylist(userId, playlistName){
    spotifyApi.createPlaylist(userId, playlistName, { 'public' : false })
	.then(function(_) {
	    console.log('Created playlist!')
	    spotifyApi.getUserPlaylists(userId).
		then(function(playlists){
		    console.log(playlists.body.items[0].id)
		    return playlists.body.items[0].id;},
		     function(err){
			 console.log('something went wrong in getting the ID');
		     })
	}, function(err) {
	    console.log('Something went wrong in creating a playlist!', err);
	});
}


//Testing with my userId and test playlist
console.log(createPlaylist('aqarias', 'testPlaylist'))
