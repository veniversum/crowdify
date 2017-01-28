function createPlaylist(userId, playlistName){
    spotifyApi.createPlaylist(userId, playlistName, { 'public' : false })
	.then(function(data) {
	    console.log('Created playlist!');
	}, function(err) {
	    console.log('Something went wrong in creating a playlist!', err);
	});
}
