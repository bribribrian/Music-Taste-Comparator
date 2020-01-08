
const express = require('express');
const router = express.Router();
const spotifyAPI = require('../API/spotify_api');


router.get('/searcheduser', function (req, res) {
  spotifyAPI.getSearchedUser(req.query.username)
    .then(function({tracks, audioData, artistData}){
      audioData.then(data => {
          let tracks_audiodata = data.body.audio_features.map((audio_feature, idx) => {
            return Object.assign({}, audio_feature, tracks[idx].track);
          });
          console.log(artistData);
          artistData.then(data => {
            tracks_audiodata.forEach((track, idx) => {
              track.genres = data.body.artists[idx].genres
            });
            res.json(tracks_audiodata)
          })
      });
      // console.log(audioData);
    })
    // .then(response => {
    //   res.json(response);
    // response.body.items.forEach(item => {
    //     console.log(item);
    // });
    
  // })
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
  const { tracks_audiodata } = req.session
  // const { track_attributes } = req.session
  // const { track_info } = req.session
  // const session_data = req.session
  res.render('visualization', {
    // session_data: session_data,
    // track_info: track_info,
    // track_attributes: track_attributes
    tracks_audiodata: tracks_audiodata
  })
  // console.log('HIIIIII')
  // console.log(req.session);
});

module.exports = router;