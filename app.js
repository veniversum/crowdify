var express = require('express'),
    serverConfig = require("./serverConfig.json"),
    SpotifyWebApi = require('spotify-web-api-node');
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    passport = require('passport'),
    swig = require('swig'),
    grabber = require('./pull_user_data'),
    generator = require('./music_skeleton'),
    schemas = require('./schemas'),
    SpotifyStrategy = require('passport-spotify').Strategy,
    mongoose = require('mongoose'),
    slug = require('slugify');


var consolidate = require('consolidate');

mongoose.Promise = global.Promise;
mongoose.connect(serverConfig.mongo.host + serverConfig.mongo.schema);


var attendee_scopes = ["user-top-read"],
    organizer_scopes = ["playlist-read-private", "playlist-modify-private", "user-top-read", "playlist-modify-public"];

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session. Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing. However, since this example does not
//   have a database of user records, the complete spotify profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the SpotifyStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and spotify
//   profile), and invoke a callback with a user object.
passport.use('spotify-attendee', new SpotifyStrategy(
  serverConfig["spotify-attendee"],
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      profile.accessToken = accessToken;
      schemas.User.update({username: profile.username}, {$set:{accessToken: accessToken,
      refreshToken: refreshToken}}, { upsert: true, new: true, setDefaultsOnInsert: true }, function(err){if (err) throw err;});
      return done(null, profile);
    });
  }));

passport.use('spotify-organizer', new SpotifyStrategy(
  serverConfig["spotify-organizer"],
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      var query = {username: profile.username},
      update = { username: profile.username,
        accessToken: accessToken,
        refreshToken: refreshToken},
      options = { upsert: true, new: true, setDefaultsOnInsert: true };
      schemas.User.update({username: profile.username}, {$set:{accessToken: accessToken,
      refreshToken: refreshToken}}, { upsert: true, new: true, setDefaultsOnInsert: true }, function(err){if (err) throw err;});
  // Find the document
      schemas.Organizer.findOneAndUpdate(query, update, options, function(error, result) {
          if (error) return;
      });
      profile.isOrganizer = true;
      profile.accessToken = accessToken;
      return done(null, profile);
    });
  }));

var app = express();

// Fixes bug https://github.com/tj/consolidate.js/pull/134
app.locals.cache = "memory";

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({ secret: 'keyboard cat' }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));

app.engine('html', consolidate.swig);

app.get('/', function(req, res){
  res.render('index.html', { user: req.user });
});

app.get('/event/:eventId', function(req, res){
  var Event = schemas.Event;
  Event.findOne({'name': req.params.eventId}, function(err, event){
    if (event) {
      req.session.event = req.params.eventId;
      schemas.Organizer.findOne({_id:event.organizer}, function(err, organizer) {
        if (req.isAuthenticated() && req.user.isOrganizer && organizer.username == req.user.username) {
          res.render('event.html', { user: req.user, slug: event.name, event: event.title, organizer: true });
        } else if (req.isAuthenticated()){
          schemas.User.findOne({username: req.user.username}, function(err, user){
            if (err) throw err;
            if (user.attendingEvents.id(event._id)) {
              res.render('success.html', { user: req.user, slug: event.name, event: event.title });
            } else {
              res.render('event.html', { user: req.user, slug: event.name, event: event.title });
            } 
          })
        } else {
          res.render('event.html', { user: req.user, slug: event.name, event: event.title }); 
        }
      });      
    } else {
      res.render('eventNotFound.html');
    }
  });

});

app.get('/createEvent', ensureIsOrganizer, function(req, res){
  res.render('createEvent.html', { user: req.user});
});

app.post('/createEvent', ensureIsOrganizer, function(req, res){
  console.log(req.body);
  var eventName = req.body.eventName;
  var sluggedName = slug(eventName);
  var organizerId = schemas.Organizer.findOne({"username": req.user.username}, function (err, organizer){
    if (err) throw err;
    var newEvent = new schemas.Event({"title" : eventName, "name": sluggedName, "organizer": organizer._id});
    newEvent.save(function(err) {
      if (err) throw err;
      generator.createPlaylist(req.user.accessToken, req.user.id, eventName, sluggedName)
      schemas.Event.findOne({name:sluggedName}, function(err, event) {
        if (event) {
          schemas.User.update({username: req.user.username}, {$push:{hostedEvents: event}}, function(err){if (err) throw err;});
        }
      });
      res.render('eventCreated.html', { eventName: eventName, sluggedName: sluggedName});
    });
  });
  // console.log("organizerId=", organizerId);
});

function ensureIsOrganizer(req, res, next){
  if (req.isAuthenticated() && req.user.isOrganizer) { return next(); }
  res.redirect('/login');
}

app.get('/account', ensureAuthenticated, function(req, res){
  schemas.User.findOne({username:req.user.id}, function(err, user) {
    var hostedEvents = [];
    var attendingEvents = [];
    if (user) {
      hostedEvents = user.hostedEvents.map(function(e){return [e.name, e.title]});
      attendingEvents = user.attendingEvents.map(function(e){return [e.name, e.title]});
    }
    var hasEvents = hostedEvents.length + attendingEvents.length;
    console.log(hasEvents); 
   res.render('account.html', { user: req.user, hostedEvents: hostedEvents, attendingEvents: attendingEvents, hasEvents: hasEvents});
  });
});

app.get('/generatePlaylist/:eventId', ensureAuthenticated, function(req, res){
  generator.recommendAndUpdate(req.user.accessToken, req.user.username, req.params.eventId);
  res.render('account.html', { user: req.user });
});

app.get('/success', ensureAuthenticated, function(req, res){
  res.render('success.html', { user: req.user , event: req.session.eventName || req.session.event});
});

app.get('/login', function(req, res){
  res.render('login.html', { user: req.user });
});

// GET /auth/spotify
//   Use passport.authenticate() as route middleware to authenticate the
//   request. The first step in spotify authentication will involve redirecting
//   the user to spotify.com. After authorization, spotify will redirect the user
//   back to this application at /auth/spotify/callback
app.get('/auth/spotify-attendee',
  passport.authenticate('spotify-attendee', {scope: attendee_scopes, showDialog: true}),
  function(req, res){
// The request will be redirected to spotify for authentication, so this
// function will not be called.
});

app.get('/auth/spotify-organizer',
  passport.authenticate('spotify-organizer', {scope: organizer_scopes}),
  function(req, res){
// The request will be redirected to spotify for authentication, so this
// function will not be called.
});

// GET /auth/spotify/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request. If authentication fails, the user will be redirected back to the
//   login page. Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.

app.get('/callback-attendee',
  passport.authenticate('spotify-attendee', { failureRedirect: '/login' }),
  function(req, res) {
    schemas.Event.findOne({name:req.session.event}, function(err, event) {
      if (event) {
        req.session.eventName = event.title;
        schemas.User.findOne({username: req.user.username}, function(err, user){
          if (err) throw err;
          if (user.attendingEvents.id(event._id)) {
            res.redirect('/event/'+req.session.event)
          } else {
            grabber.pullAttendeeData(req.user.accessToken, req.session.event);
            schemas.User.update({username: req.user.username}, {$push:{attendingEvents: event}}, function(err){if (err) throw err;});
            res.redirect('/event/'+req.session.event)
          } 
        })
      } else {
        res.render('eventNotFound.html');
      }
    });
});

app.get('/callback-organizer',
  passport.authenticate('spotify-organizer', { successRedirect: '/', failureRedirect: '/login' }),
  function(req, res) {
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// for heroku
app.listen(process.env.PORT || 8888);


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed. Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}
