'use strict'; 
console.log('home-dom is working');
// ----- test data -----
let testData = [
    {
        "dateAdded": "2018-06-25T21:29:34.415Z",
        "_id": "5b31651847735f331415b84c",
        "addedBy": {
            "profilePicture": "/images/user_profile/image-1.png",
            "_id": "5b28143eea470329c0cf1375",
            "username": "ly"
        },
        "artist": "Hillsong",
        "title": "So Will I",
        "links": {
            "youtube": "https://www.youtube.com/watch?v=oLURTvUQoTM"
        },
        "theme": "Resurrection & Sacrifice",
        "releaseYear": "",
        "tempo": "Slow",
        "comments": [],
        "__v": 0
    },
    {
        "dateAdded": "2018-06-25T21:29:34.415Z",
        "_id": "5b31652047735f331415b84d",
        "addedBy": {
            "profilePicture": "/images/user_profile/image-1.png",
            "_id": "5b28143eea470329c0cf1375",
            "username": "ly"
        },
        "artist": "Hillsong",
        "title": "So Will I",
        "links": {
            "youtube": "https://www.youtube.com/watch?v=oLURTvUQoTM"
        },
        "theme": "Resurrection & Sacrifice",
        "releaseYear": "",
        "tempo": "Slow",
        "comments": [],
        "__v": 0
    }
]

// ----- generate one song unit html functions -----
function generateSongNav (song) {
    return `<div class="media text-muted pt-3 border-bottom border-gray song-recomm-nav">
    <div class="container">
        <div class="row">
          <div class="col-md-auto small">
              <img class="shadow rounded user-img" src="${song.addedBy.profilePicture}">
              <strong class="text-gray-dark">@${song.addedBy.username}</strong>
              <div class="user-img-spacer"></div>
          </div>
          <div class="col small">
              <strong>${song.artist}</strong> - <strong class="no-wrap">${song.title}</strong>
          </div>
          <div class="col col-md-auto no-wrap">
              <img class="icon-link margin youtube-button" data-toggle="collapse" href="#youtube-plyer-${song._id}" role="button" aria-expanded="false" aria-controls="youtube-plyer" src="/images/icons/youtube.png">
              <!-- <img class="icon-link margin" data-toggle="collapse" href="#spotify-player-${song._id}" role="button" aria-expanded="false" aria-controls="collapseExample" src="/images/icons/spotify.png"> -->
              <a class="btn btn-primary btn-sm margin" data-toggle="collapse" href="#songComments-${song._id}" role="button" aria-expanded="false" aria-controls="songComments">Comments</a>
              <a class="btn btn-secondary btn-sm margin" data-toggle="collapse" href="#songInfo-${song._id}" role="button" aria-expanded="false" aria-controls="songInfo">Song Info</a>
          </div>
        </div>
    </div>
</div>`
}

function generateSongInfo (song) {
    let album = song.album ? song.album : 'N/A';
    let releaseYear = song.releaseYear ? song.releaseYear : 'N/A';
    return `<div class="text-muted pt-1 centered song-recomm-songinfo">
    <div class="collapse" id="songInfo-${song._id}">
      <div class="card card-body">
          <div class="container">
              <div class="row">
                <div class="col small">
                  <p class="song-info">Date Added: </p>
                  <p class="song-info">Artist: ${song.artist}</p>
                  <p class="song-info">Title: ${song.title}</p>
                </div>
                <div class="col small">
                  <p class="song-info">Album: ${album}</p>
                  <p class="song-info">Release Year: ${releaseYear}</p>
                </div>
              </div>
          </div>
      </div>
    </div>
  </div>`
}


function generateSongYoutube (song) {
    return `<div class="text-muted pt-1 centered song-recomm-youtube">
    <div class="collapse" id="youtube-plyer-${song._id}">
      <div class="card card-body container-youtube">
            <div id="player-${song._id}" class="plyer" data-plyr-provider="youtube" data-plyr-embed-id="https://www.youtube.com/embed/p2IPg-qS-_w"></div>
      </div>
    </div>
</div>`
}

function generateSongCommentsContainer (song) {
    let tempSongComments = [];
    for (let i = 0; i < song.comments.length; i++) {
        if( song.comments[i]) {
            tempSongComments.push(generateSongComments(song.comments[i] ));
        }
    }
    let songComments = tempSongComments.join('')
    return `<div class="text-muted pt-1 song-recomm-comments">
    <div class="collapse" id="songComments-${song._id}">
      <div class="card card-body comments-container">
        ${songComments}
      </div>
      <form class="form-horizontal commentForm" role="form"> 
          <div class="form-group">
              <label for="comment" class="col-sm-offset-2 control-label small"><strong>Comment</strong></label>
              <div class="col-sm-10">
                <textarea class="form-control" name="comment" id="comment" rows="1"></textarea>
                <input type="hidden" name="songId" value="${song._id}">
              </div>
          </div>
          <div class="form-group">
              <div class="col-sm-offset-2 col-sm-10">                    
                  <button class="btn btn-secondary btn-circle btn-sm" type="submit" id="submitComment"><span class="glyphicon glyphicon-send"></span> Submit comment</button>
              </div>
          </div>            
      </form>
    </div>
  </div>`
}

function generateSongComments (comment) {
    return `<div class="media song-comment">
    <img class="align-self-start mr-3 ml-2 user-img border-gray rounded" src="${comment.addedBy.profilePicture}" id="${comment._id}" alt="user profile thumbnail">
    <div class="media-body">
      <h6>${comment.dateAdded}</h6>
      <p class="small ml-3">${comment.comment}</p>
    </div>
  </div>`
}

// ----- generate song unit block -----
function generateMainSongUnit (song) {
    let mainSongUnit = `<div class="song-recomm-unit" id="${song._id}">` + 
        generateSongNav(song) + 
        generateSongInfo(song) + 
        generateSongYoutube(song) + 
        generateSongCommentsContainer(song)+'</div>';
    return mainSongUnit;
}

// ----- populate the DOM functions -----
function generateListOfSongs (songs) {
    //generateYoutubePlyrIds(postId);
    return songs.map(generateMainSongUnit).join('');

}

function populatePage (data) {
    let string = generateListOfSongs(data);
    $('.song-recomm-main').html(`${string}`);
}

function watchYoutubeClick () {
    $('.youtube-button').click(function() {
        console.log('youtube click is running');
        let plyrId = $(this).closest('.song-recomm-unit').find('.plyer').attr('id');
        let player = new Plyr(`#${plyrId}`);
    })
}

// ---- initializing DOM song unit functions -----
function onLoad () {
    populateSongRecomm(SONGS_EP, populatePage)
    .then(function () {
        //generatePlyrs();
        watchNewCommentSubmit();
        watchYoutubeClick();
    })
}

$(onLoad);