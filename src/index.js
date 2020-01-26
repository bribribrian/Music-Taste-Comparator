
const express = require('express');
const router = express.Router();
const spotifyAPI = require('../API/spotify_api');

router.get('/searcheduser', function (req, res) {
  spotifyAPI.getSearchedUser(req.query.username)
    .then(function({tracks, audioData, artistData}){
      audioData.then(data => {
          let searchedUserTracksAudioData = data.body.audio_features.map((audio_feature, idx) => {
            return Object.assign({}, audio_feature, tracks[idx].track);
          });
          artistData.then(data => {
            searchedUserTracksAudioData.forEach((track, idx) => {
            track.genres = data.body.artists[idx].genres
          });
            // let genreCollection = [];
            // tracks_audiodata.forEach(track_obj => {
            //   genreCollection = genreCollection.concat(track_obj.genres);
             
              let searchedUserGenreCollection = {};
              let searchedUserWordCount = {};
              searchedUserTracksAudioData.forEach(track_obj => {
                  track_obj.genres.forEach(genre => {
                      if(searchedUserGenreCollection[genre]){
                        searchedUserGenreCollection[genre].count++;
                      } else {
                        searchedUserGenreCollection[genre] = {genreName: genre, count: 1};
                      };
                      genre.split(' ').forEach(word => {
                        if(searchedUserWordCount[word]){
                            searchedUserWordCount[word].count++;
                        } else {
                            searchedUserWordCount[word] = {word: word, count: 1};
                        };
                    });
                  });
              });
              // genre_collection2 = Object.values(genre_collection2).map((obj, idx) => {
              //     obj.genreCode = idx;
              //     return obj;
              // }); 
            // })
            res.json({searchedUserTracksAudioData, searchedUserGenreCollection, searchedUserWordCount});

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
  const { currentUserWordCount } = req.session;
  res.render('main_page', {
    tracks_audiodata: tracks_audiodata,
    genre_collection: genres_collection,
    currentUserWordCount: currentUserWordCount
  })
});

module.exports = router;