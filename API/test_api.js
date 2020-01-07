const request = require("request")
const user_id = 'bribrianbribri';
const token = "Bearer BQAHTQtJ6UWo5F1tf_qOYRpF3w-4vf3hsRl5ATOMDK8PaOVagEVaZ5JcSFn3tAphY4MyjFx4Lan-b3cYi-gZxzaJAyqmPO9Rg-u-gxX4KnLYEEZ6_I2JtR_8NrZFFPEmmEHbRVe8Alyb_tjIKd66RW8";
const playlist_url ="https://api.spotify.com/v1/users/"+user_id+"/playlists";

request({url:playlist_url, headers:{'Authorization':token}}, function(err, res){
    if(res){
        const playlist=JSON.parse(res.body);
        console.log(JSON.stringify(playlist.items, null, " "));
        const playlist_url = playlist.items[0].href;
        request({url:playlist_url, headers:{"Authorization":token}} , function(err, res){
            if (res){
                const playlist = JSON.parse(res.body);
                console.log("playlist: " + playlist.name);
                playlist.tracks.items.forEach(function(track){
                    console.log(track.track.name);
                });
            }
        })
    }
})