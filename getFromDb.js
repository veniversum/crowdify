function getFromDb(fn0){
  var mongoose = require('mongoose');
  serverConfig = require('./serverConfig.json');

  mongoose.connect(serverConfig.mongo.host + serverConfig.mongo.schema);
  mongoose.Promise = global.Promise;
  serverConfig = require('./serverConfig.json');
  var Schema = mongoose.Schema;
  var songsSchema = new Schema({
      songNames: [String]
  });

  var Song = mongoose.model('Song', songsSchema);

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

getFromDb(function(myvar) {
  // your code here
  console.log(myvar);
});

