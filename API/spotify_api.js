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
        result += characters.charAt(Math.floor(Math.random() * charsLength));
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
    return spotifyAPI.getMe();
    }).then(
        console.log(userData)
    ).catch(error => console.log(error));
};
