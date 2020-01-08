
const express = require('express');
const router = express.Router();
const spotifyAPI = require('../API/spotify_api');


router.get('/searcheduser', function (req, res) {
  spotifyAPI.getSearchedUser(req, res)
});

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
  spotifyAPI.spotifyLogin(res)
});

router.get('/app', function (req, res) {
  const { track_attributes } = req.session
  const { track_info } = req.session
  // const session_data = req.session
  res.render('visualization', {
    // session_data: session_data,
    track_info: track_info,
    track_attributes: track_attributes
  })
  // console.log('HIIIIII')
  // console.log(req.session);
});

module.exports = router;