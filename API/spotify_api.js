const keys = require('../util/keys.js');
const SpotifyWebApi = require('spotify-web-api-node');
const stateKey = 'spotify_auth_state';
const redirect_uri = 'http://localhost:8080/callback';
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
    // console.log(res)
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
    let track_info = [];
    let track_attributes = [];
    spotifyAPI.authorizationCodeGrant(req.query.code).then(function (data) {
    spotifyAPI.setAccessToken(data.body.access_token);
    spotifyAPI.setRefreshToken(data.body.refresh_token);
    return spotifyAPI.getMe()
    }).then(function () {
        spotifyAPI
        .getMyTopTracks({ limit: 5 })
        .then(function (data) {
            // console.log(data.body.items);
            return data.body.items.map(track => {
            // data.body.items.forEach(track => {
                track_info.push({ [track.id]: [track.name, track.artists[0].name]})
                console.log(track_info);
                // console.log(data.body.items);
                return track.id
            })
        })
        .then(function (trackIds) {
            return spotifyAPI.getAudioFeaturesForTracks(trackIds)
        })
        .then(function (data) {
            // console.log(data)
            // console.log(data.body.audio_features)
            data.body.audio_features.forEach((track, idx) => {
                song_name = track_info[idx][track.id][0]
                artist_name = track_info[idx][track.id][1]
                    track_attributes.push({
                    "title": song_name,
                    "artist": artist_name,
                    "idx": idx,
                    "energy": track.energy,
                    "track_id": track.id
                })
            // console.log(track_attributes)
            })

    // }).then( function (data) {
        req.session.track_info = track_info
        req.session.track_attributes = track_attributes
        // req.session.session_data = data
        // console.log(req.session)
        // console.log(data)
        res.redirect('/app')
        })
    }).catch(error => console.log(error));
}

module.exports.getSearchedUser = function (req, res) {
    spotifyAPI
}
