//Boilerplate for testing
var SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientId : 'fcecfc72172e4cd267473117a17cbd4d',
    clientSecret : 'a6338157c9bb5ac9c71924cb2940e1a7',
    redirectUri : 'http://www.example.com/callback'
});

spotifyApi.setAccessToken('BQBMLDCTCSmJsso9zDRHahdjChueNtp-4qHy8xZcchgNOUYUoIuIM-fSPEj76KHEqB1MrX9jC20HqbDfs89RPSxTDz5trjQ-YGc2Q3w241Msh6skNlQItqtJMDlwfRHOCq69GjTOPRJrcb78I2ggLQR4_ZPVIDhyckE9bliB9IEsu9iX_so6k116GcM_bT4XhGR5uB8NaJoU4P_cm2JoO5G1PpDE3GArBpGgGXUsO2ewDqoP0utRYctR0yYL3pZa3vG5EnCAYpEL3TulbaSTn-t8hFys01sO6zkLbFj5tdeDwTYg5OU')


// Create a new playlist, then grab the Id of that playlist and return it
// NB Returns asynchronously
function createPlaylist(userId, playlistName){
    spotifyApi.createPlaylist(userId, playlistName, { 'public' : false })
	.then(function(_) {
	    console.log('Created playlist!')
	    spotifyApi.getUserPlaylists(userId).
		then(function(playlists){
		    console.log(playlists.body.items[0].id)}
		    // return playlists.body.items[0].id;},
		    // set playlists.body.items[0].id to playlist id variable
		     function(err){
			 console.log('something went wrong in getting the ID');
		     })
	}, function(err) {
	    console.log('Something went wrong in creating a playlist!', err);
	});
}


//Testing with my userId and test playlist
var foo = createPlaylist('aqarias', 'testPlaylist')
console.log(foo)
