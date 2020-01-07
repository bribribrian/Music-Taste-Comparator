
const express = require('express');
const router = express.Router();
const spotifyAPI = require('../API/spotify_api');

router.get('/callback', function (req,res) {
  spotifyAPI.spotifyAuth(req, res)
});

router.get('/', function (req, res, next) {
  res.render('index', {
      title: 'Music Taste Comparator'
  });
});

router.get('/login', function (req, res) {
  debugger;
  spotifyAPI.spotifyLogin(req, res)
});

router.get('/app', function (req, res) {
  console.log(req.session);
  console.log('HIIIIII');
});

module.exports = router;