
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
          artistData.then(data => {
            tracks_audiodata.forEach((track, idx) => {
              track.genres = data.body.artists[idx].genres
            });
            let genreCollection = [];
            tracks_audiodata.forEach(track_obj => {
              genreCollection = genreCollection.concat(track_obj.genres);
            })
            res.json({tracks_audiodata, genreCollection});
            
          })
      });
    })
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
  spotifyAPI.spotifyLogin(res)
});


router.get('/app', function (req, res) {
  const { genres_collection } = req.session;
  const { tracks_audiodata } = req.session;
  res.render('visualization', {
    tracks_audiodata: tracks_audiodata,
    genre_collection: genres_collection
  })
});

module.exports = router;