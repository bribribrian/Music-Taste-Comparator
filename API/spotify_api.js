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
            // show_dialog: true
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

let examplePlaylistObj =  {
            "data": [
                {
                    "attributes": {
                        "artwork": {
                            "bgColor": "161d16",
                            "height": 1080,
                            "isMosaic": true,
                            "textColor1": "ffffff",
                            "textColor2": "e3aa71",
                            "textColor3": "d0d1d0",
                            "textColor4": "ba8e5f",
                            "url": "https://example.mzstatic.com/image/thumb/Features71/v4/49/f0/f6/49f0f636-cefe-0fba-a6a1-01321374e768/source/{w}x{h}cc.jpeg",
                            "width": 4320
                        },
                        "curatorName": "Apple Music R&B",
                        "description": {
                            "short": "The songs that cemented her iconic status.",
                            "standard": "Few female artists have reached the top of the charts as frequently as Janet Jackson. We've assembled all of her number one hits for a chart-topping collection which confirms her status as the true Queen of pop-R&B."
                        },
                        "lastModifiedDate": "2015-04-11T16:15:51Z",
                        "name": "Janet Jackson: No.1 Songs",
                        "playParams": {
                            "id": "pl.acc464c750b94302b8806e5fcbe56e17",
                            "kind": "playlist"
                        },
                        "playlistType": "editorial",
                        "url": "https://itunes.apple.com/us/playlist/janet-jackson-no-1-songs/pl.acc464c750b94302b8806e5fcbe56e17"
                    },
                    "href": "/v1/catalog/us/playlists/pl.acc464c750b94302b8806e5fcbe56e17",
                    "id": "pl.acc464c750b94302b8806e5fcbe56e17",
                    "relationships": {
                        "curator": {
                            "data": [
                                {
                                    "href": "/v1/catalog/us/apple-curators/976439551",
                                    "id": "976439551",
                                    "type": "apple-curators"
                                }
                            ],
                            "href": "/v1/catalog/us/playlists/pl.acc464c750b94302b8806e5fcbe56e17/curator"
                        },
                        "tracks": {
                            "data": [
                                {
                                    "attributes": {
                                        "artistName": "Janet Jackson",
                                        "artwork": {
                                            "bgColor": "9c3526",
                                            "height": 1404,
                                            "textColor1": "ffffe5",
                                            "textColor2": "ffc79f",
                                            "textColor3": "ebd6be",
                                            "textColor4": "eba986",
                                            "url": "https://example.mzstatic.com/image/thumb/Music4/v4/77/50/11/7750111a-af31-7dc1-4f2f-e1cc855f394d/source/{w}x{h}bb.jpeg",
                                            "width": 1404
                                        },
                                        "discNumber": 1,
                                        "durationInMillis": 301200,
                                        "genreNames": [
                                            "Rock",
                                            "Music",
                                            "R&B/Soul",
                                            "Contemporary R&B",
                                            "Pop",
                                            "Adult Contemporary",
                                            "Dance",
                                            "Electronic"
                                        ],
                                        "isrc": "USVI29700014",
                                        "name": "Together Again",
                                        "playParams": {
                                            "id": "723390870",
                                            "kind": "song"
                                        },
                                        "previews": [
                                            {
                                                "url": "https://example.itunes.apple.com/apple-assets-us-std-000001/Music7/v4/31/db/d5/31dbd582-cf23-08f5-1394-c28316f0cde2/mzaf_2035383873021370206.plus.aac.p.m4a"
                                            }
                                        ],
                                        "releaseDate": "1997-10-07",
                                        "trackNumber": 11,
                                        "url": "https://itunes.apple.com/us/album/together-again/723390477?i=723390870"
                                    },
                                    "href": "/v1/catalog/us/songs/723390870",
                                    "id": "723390870",
                                    "type": "songs"
                                },
                                {
                                    "attributes": {
                                        "artistName": "Janet Jackson",
                                        "artwork": {
                                            "bgColor": "ffffff",
                                            "height": 1404,
                                            "textColor1": "050404",
                                            "textColor2": "452c22",
                                            "textColor3": "373636",
                                            "textColor4": "6a564e",
                                            "url": "https://example.mzstatic.com/image/thumb/Music/v4/30/75/33/30753397-86e8-5b3a-e48b-85fb785c4124/source/{w}x{h}bb.jpeg",
                                            "width": 1404
                                        },
                                        "discNumber": 1,
                                        "durationInMillis": 330027,
                                        "genreNames": [
                                            "Pop",
                                            "Music",
                                            "Rock",
                                            "Electronic",
                                            "R&B/Soul",
                                            "Contemporary R&B",
                                            "Adult Contemporary",
                                            "Dance",
                                            "Pop/Rock"
                                        ],
                                        "isrc": "USVI20100057",
                                        "name": "All for You",
                                        "playParams": {
                                            "id": "724885384",
                                            "kind": "song"
                                        },
                                        "previews": [
                                            {
                                                "url": "https://example.itunes.apple.com/apple-assets-us-std-000001/Music2/v4/69/03/c1/6903c1d7-32c9-85cd-d301-5d4bb4e07125/mzaf_4441152766436868823.plus.aac.p.m4a"
                                            }
                                        ],
                                        "releaseDate": "2001-03-13",
                                        "trackNumber": 3,
                                        "url": "https://itunes.apple.com/us/album/all-for-you/724885014?i=724885384"
                                    },
                                    "href": "/v1/catalog/us/songs/724885384",
                                    "id": "724885384",
                                    "type": "songs"
                                },
                                {
                                    "attributes": {
                                        "artistName": "Janet Jackson",
                                        "artwork": {
                                            "bgColor": "ffffff",
                                            "height": 1404,
                                            "textColor1": "050404",
                                            "textColor2": "452c22",
                                            "textColor3": "373636",
                                            "textColor4": "6a564e",
                                            "url": "https://example.mzstatic.com/image/thumb/Music/v4/30/75/33/30753397-86e8-5b3a-e48b-85fb785c4124/source/{w}x{h}bb.jpeg",
                                            "width": 1404
                                        },
                                        "discNumber": 1,
                                        "durationInMillis": 264973,
                                        "genreNames": [
                                            "Pop",
                                            "Music",
                                            "Rock",
                                            "Electronic",
                                            "R&B/Soul",
                                            "Contemporary R&B",
                                            "Adult Contemporary",
                                            "Dance",
                                            "Pop/Rock"
                                        ],
                                        "isrc": "US58L1869409",
                                        "name": "Doesn't Really Matter",
                                        "playParams": {
                                            "id": "724885790",
                                            "kind": "song"
                                        },
                                        "previews": [
                                            {
                                                "url": "https://example.itunes.apple.com/apple-assets-us-std-000001/Music1/v4/25/51/98/255198f2-02d9-0d8a-183f-9cacee118b2e/mzaf_1901656142812658216.plus.aac.p.m4a"
                                            }
                                        ],
                                        "releaseDate": "2001-04-24",
                                        "trackNumber": 17,
                                        "url": "https://itunes.apple.com/us/album/doesnt-really-matter/724885014?i=724885790"
                                    },
                                    "href": "/v1/catalog/us/songs/724885790",
                                    "id": "724885790",
                                    "type": "songs"
                                }
                            ],
                            "href": "/v1/catalog/us/playlists/pl.acc464c750b94302b8806e5fcbe56e17/tracks"
                        }
                    },
                    "type": "playlists"
                }
            ]
        }

    
// const options = {
//     url: `https://api.music.apple.com/v1/catalog/us/playlists/${appleMusicPlaylistID}`,
//     method: 'GET',
//     headers: {
//         Authorization: 'Bearer ' + appleMusicDevToken,
//         // 'Accept': 'application/json',
//         'Content-Type': 'application/json'
//     }
// };

// axios(options)
//   .then(response => {
//     console.log(response.status);
// });








module.exports.getPlaylistWithIsrc = function (playlist_id, playlist_id2) {
    // let isrcObj1 = {};
    // let isrcObj2 = {};
    // let appleTestObj = {};
    // console.log(examplePlaylistObj.data[0].relationships.tracks.data);
    // examplePlaylistObj.data[0].relationships.tracks.data.forEach(track => {
    //     appleTestObj[track.attributes.isrc] = track.attributes.isrc;
    // })
    // console.log(appleTestObj);
    async function getPlaylistTracksInfo(playlistIdNumber) {
        const getsPlaylist = async(playlistIdNumber) => {
            let tracksObj = {};
            spotifyAPI.getPlaylist(playlistIdNumber)
            .then(function (playlist) {
                playlist.body.tracks.items.forEach(track => {
                    tracksObj[track.track.external_ids.isrc] = track.track.external_ids.isrc;
                });
                // console.log(tracksObj);
                return Promise.resolve(tracksObj);
            })
            .catch(error => console.log(error))
            .then(res => {return res})
        };
        let result = await getsPlaylist(playlist_id);
        return Promise.all([result]);
    };

    // return spotifyAPI.getPlaylist(playlist_id)
    // .then(function (playlist) {
    //     playlist.body.tracks.items.forEach(track => {
    //         isrcObj1[track.track.external_ids.isrc] = track.track.external_ids.isrc;
    //     });
    //     // console.log(isrcObj1);
    // })
    // .then(function () {
    //     spotifyAPI.getPlaylist(playlist_id2)
    //     .then(function (playlist) {
    //         playlist.body.tracks.items.forEach(track => {
    //         isrcObj2[track.track.external_ids.isrc] = track.track.external_ids.isrc;
    //     });
    //     // console.log(isrcObj2);
    //     })
    //     .then(function () {
    //         let count = 0;
    //         Object.keys(isrcObj1).forEach(key => {
    //             // if (isrcObj2[key]) {
    //             if (appleTestObj[key]) {
    //                 count += 1;
    //             }
    //         })
    //         // console.log(count);
    //     })
    // });
//    Promise.all([getPlaylistTracksInfo(playlist_id)])
//    .then(returnData => {console.log(returnData)});
    console.log("before return value")
    // console.log(getPlaylistTracksInfo(playlist_id));
    return getPlaylistTracksInfo(playlist_id);


}





const tracksInCommon = (spotifyPlaylistId, applePlaylistId) => {
    let spotifyIsrcObj = {};
    let appleMusicIsrcObj = {};

    return spotifyAPI.getPlaylist(spotifyPlaylistId)
    .then(function (playlist) {
        playlist.body.tracks.items.forEach(trackItem => {
            spotifyIsrcObj[trackItem.track.external_ids.isrc] = trackItem.track.external_ids.isrc;
        });
    })
    .then(function () { 
        const appleGetOptions = {
            url: `https://api.music.apple.com/v1/catalog/us/playlists/${applePlaylistId}`,
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + appleMusicDevToken
            }
        };
        axios(appleGetOptions)
        .then(function (playlist) {
            playlist.data[0].relationships.tracks.data.forEach(track => {
                appleMusicIsrcObj[track.attributes.isrc] = track.attributes.isrc;
            });
        })
        .then(function () {
            let count = 0;
            Object.keys(spotifyIsrcObj).forEach(key => {
                if (appleMusicIsrcObj[key]) {
                    count += 1;
                };
            });
            return count;
        });
    });
};




module.exports.getPlaylistWithIsrc2 = async function (playlist_id, playlist_id2) {
        
        let count = 0;
        let tracksObj1 = {};
        let tracksObj2 = {};
        
        await spotifyAPI.getPlaylist(playlist_id)
            .then(function (playlist) {
                playlist.body.tracks.items.forEach(track => {
                    tracksObj1[track.track.external_ids.isrc] = track.track.external_ids.isrc;
                });
            })
            .catch(error => console.log(error));
       


        await spotifyAPI.getPlaylist(playlist_id2)
            .then(function (playlist) {
                playlist.body.tracks.items.forEach(track => {
                    tracksObj2[track.track.external_ids.isrc] = track.track.external_ids.isrc;
                });
            })
            .catch(error => console.log(error))
        


        const counterFunc = (obj1, obj2) => {
            Object.keys(obj1).forEach(key => {
                if (obj2[key]) {
                    count += 1;
                };
            });
        };
       
        counterFunc(tracksObj1, tracksObj2);
        return count;

};




async function tracksInCommon(spotifyPlaylistId, applePlaylistId) {
        
    let count = 0;
    let spotifyIsrcObj = {};
    let appleMusicIsrcObj = {};
    
    await spotifyAPI.getPlaylist(spotifyPlaylistId)
        .then(function (playlist) {
            playlist.body.tracks.items.forEach(trackItem => {
                spotifyIsrcObj[trackItem.track.external_ids.isrc] = trackItem.track.external_ids.isrc;
            });
        })
        .catch(error => console.log(error));
   

        const appleGetOptions = {
            url: `https://api.music.apple.com/v1/catalog/us/playlists/${applePlaylistId}`,
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + appleMusicDevToken
            }
        };

    await axios(appleGetOptions)
            .then(function (playlist) {
                playlist.data[0].relationships.tracks.data.forEach(track => {
                    appleMusicIsrcObj[track.attributes.isrc] = track.attributes.isrc;
                });
            })


    const counterFunc = (obj1, obj2) => {
        Object.keys(obj1).forEach(key => {
            if (obj2[key]) {
                count += 1;
            };
        });
    };
   
    counterFunc(spotifyIsrcObj, appleMusicIsrcObj);
    return count;

};