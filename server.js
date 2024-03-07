var express = require('express');
var env = require('dotenv').config();
var ejs = require( 'ejs');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo'); // Update: Add session store

const jwt = require('jsonwebtoken')
const multer  = require('multer')



const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const CLIENT_ID = '705639256411-n2f9qumeospovv7tkhckbrm1siqtotf6.apps.googleusercontent.com'
const  CLIENT_SECRET = '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'
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN = '1//04k4QfMw8tpmYCgYIARAAGAQSNwF-L9Ir5s4w5-8szpUblGkmJpPNMH43cV3znORTz2QloRXSk7cm9IJT0YhbHZcJNYh30ZiAiXg'

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET,REDIRECT_URI)
oAuth2Client.setCredentials({refresh_token:REFRESH_TOKEN})




var server = require('http').Server(app); // Create HTTP server by wrapping the Express app
var io = require('socket.io')(server); // Attach Socket.IO to the server

app.use(express.static('public')); 







mongoose.connect('mongodb+srv://islam:islam@cluster0.2hi0w2s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true, // Use the new URL parser
  useUnifiedTopology: true, // Use the new Server Discovery and Monitoring engine
}).then(() => {
  console.log('MongoDB Connection Succeeded.');
}).catch((err) => {
  console.error('Error in DB connection:', err);
});

var db = mongoose.connection;

// Session middleware setup
app.use(session({
  secret: 'mahmoodGneam',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: 'mongodb+srv://islam:islam@cluster0.2hi0w2s.mongodb.net/Cluster0',
    cookie: { maxAge: null }
  })
}));



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/views'));

var index = require('./routes/index');
const SendmailTransport = require('nodemailer/lib/sendmail-transport');
const { error } = require('console');
app.use('/', index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});



app.get('/forgot-password', (req, res, next) => {

  res.render('forgot-password.ejs')
})


app.post('/forgot-password', (req, res, next) => { });


app.get('/reset-pasword', (req, res, next) => {})

app.post('/reset-pasword', (req, res, next) => {});



// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});





io.on('connection', function(socket) {
  socket.on('chat message', function(data) {
    // Expecting 'data' to be an object { message: "Hello", username: "User123" }
    io.emit('chat message', data); // Emit the entire data object, including the username
  });

  socket.on('disconnect', function() {
  });
});



const PORT = process.env.PORT || 3400;
server.listen(PORT, function () {
  console.log('Server is started on http://127.0.0.1:' + PORT);
});



