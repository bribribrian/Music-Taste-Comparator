const keys = require('../util/keys.js');
const SpotifyWebApi = require('spotify-web-api-node');
const stateKey = 'spotify_auth_state';
const redirect_uri = keys.redirect_uri;
const querystring = require('querystring');


const spotifyAPI = new SpotifyWebApi({
    clientId: keys.clientID,
    clientSecret: keys.clientSecret,
    redirectUri: redirect_uri
});


function randomString(length) {
    let result = '';
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charsLength = chars.length;
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charsLength));
    }
    return result;
}


module.exports.spotifyLogin = function (res) {
    let state = randomString(16);
    res.cookie(stateKey, state);
    let scope = 'user-top-read';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: keys.clientID,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        })
    );
}


module.exports.spotifyAuth = function (req, res) {
    spotifyAPI.authorizationCodeGrant(req.query.code).then(function (data) {
    spotifyAPI.setAccessToken(data.body.access_token);
    spotifyAPI.setRefreshToken(data.body.refresh_token);
    return spotifyAPI.getMe()
    }).then(function () {
        spotifyAPI
        .getMyTopTracks({ limit: 50 })
        .then(function (data){
            return {
                tracks: data.body.items,
                trackIds: data.body.items.map(track => {
                   return track.id
                }),
                artistIds: data.body.items.map(track => {
                    return track.artists[0].id
                })
            }
        })
        .then(function ({tracks, trackIds, artistIds}) {
            return {
                tracks,
                audioData: spotifyAPI.getAudioFeaturesForTracks(trackIds),
                artistData: spotifyAPI.getArtists(artistIds)
            }
        })
        .then(function ({tracks, audioData, artistData}) {
            audioData.then(data => {
                let tracks_audiodata = data.body.audio_features.map((audio_feature, idx) => {
                    return Object.assign({}, audio_feature, tracks[idx]);
                });
                artistData.then(data => {
                    tracks_audiodata.forEach((track, idx) => {
                        track.genres = data.body.artists[idx].genres
                    });
                    let genre_collection = {};
                    let currentUserWordCount = {};
                    tracks_audiodata.forEach(track_obj => {
                        track_obj.genres.forEach(genre => {
                            if(genre_collection[genre]){
                                genre_collection[genre].count++;
                            } else {
                                genre_collection[genre] = {genreName: genre, count: 1};
                            };
                            genre.split(' ').forEach(word => {
                                if(currentUserWordCount[word]){
                                    currentUserWordCount[word].count++;
                                } else {
                                    currentUserWordCount[word] = {word: word, count: 1};
                                };
                            });
                        });
                    });
                    // genre_collection = Object.values(genre_collection).map((obj, idx) => {
                    //     obj.genreCode = idx;
                    //     return obj;
                    // });

                    req.session.genres_collection = genre_collection;
                    req.session.tracks_audiodata = tracks_audiodata;
                    req.session.currentUserWordCount = currentUserWordCount;
                    res.redirect('/app');
                });
            });
        })
    }).catch(error => console.log(error));
}


module.exports.getSearchedUser = function (user_id) {
    return spotifyAPI.getUserPlaylists(user_id)
    .then(function (playlist_data) {        
        let playlistId;
        playlist_data.body.items.forEach(playlist => {
            if (playlist.name === "Your Top Songs 2019") {
                playlistId = playlist.id;
            }
        });
        return playlistId;
    })
    .then(function (playlist_id) {
        return spotifyAPI.getPlaylist(playlist_id)
    })
    .then(function (playlist) {
        const tracks = playlist.body.tracks.items.slice(0, 50);
        return {
            tracks,
            trackIds: tracks.map(track => {
                return track.track.id;
            }),
            artistIds: tracks.map(track => {
                return track.track.artists[0].id
            })
        }
    })
    .then(function({tracks, trackIds, artistIds}) {
        return {
            tracks,
            audioData: spotifyAPI.getAudioFeaturesForTracks(trackIds),
            artistData: spotifyAPI.getArtists(artistIds)
        }
    })
    .catch(error => console.log(error));
}