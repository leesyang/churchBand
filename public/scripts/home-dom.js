'use strict'; 
console.log('home-dom is working');
// ----- test data -----
let testData = [{
    "dateAdded": "2018-06-20T23:55:20.880Z",
    "_id": "5ba17fdc5438d8ef09ee",
    "addedBy": {
        "profilePicture": "/images/user_profile/image-1.png",
        "_id": "5b28143eea470329c0cf1375",
        "username": "ly"
    },
    "artist": "Hillsong",
    "title": "So Will I",
    "links": {
        "youtube": "https://www.youtube.com/embed/p2IPg-qS-_w"
    },
    "theme": "Resurrection & Sacrifice",
    "releaseYear": "",
    "tempo": "Slow",
    "comments": [
        {
            "dateAdded": "2018-06-21T17:44:54.533Z",
            "_id": "5b2c04a02947563ec01736bd",
            "addedBy": {
                "profilePicture": "/images/user_profile/image-2.png",
                "_id": "5b28144eea470329c0cf1376",
                "username": "ly2"
            },
            "comment": "added by ly2!"
        }
    ],
    "__v": 0
},
{
    "dateAdded": "2018-06-20T23:55:20.880Z",
    "_id": "5b2a9a17fdc5438d8ef09ee",
    "addedBy": {
        "profilePicture": "/images/user_profile/image-1.png",
        "_id": "5b28143eea470329c0cf1375",
        "username": "username"
    },
    "artist": "Hillsong",
    "title": "So Will I",
    "links": {
        "youtube": "https://www.youtube.com/embed/p2IPg-qS-_w"
    },
    "theme": "Resurrection & Sacrifice",
    "releaseYear": "",
    "tempo": "Slow",
    "comments": [
        {
            "dateAdded": "2018-06-21T17:44:54.533Z",
            "_id": "5c04a02947563ec01736bd",
            "addedBy": {
                "profilePicture": "/images/user_profile/image-2.png",
                "_id": "5b28144eea470329c0cf1376",
                "username": "ly2"
            },
            "comment": "added by ly2!"
        },
        {
            "dateAdded": "2018-06-21T17:44:54.533Z",
            "_id": "5b2c04a02947563ec01736bd",
            "addedBy": {
                "profilePicture": "/images/user_profile/image-2.png",
                "_id": "5b28144eea470329c0cf1376",
                "username": "ly2"
            },
            "comment": "added by ly2!"
        }
    ],
    "__v": 0
}];

// ----- generate one song unit html functions -----
function generateSongUnit (song) {
    return `<div class="song-recomm-unit" id="${song._id}"></div>`
}

function generateSongNav (song, postId) {
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
              <img class="icon-link margin" data-toggle="collapse" href="#youtube-plyer-${postId}" role="button" aria-expanded="false" aria-controls="youtube-plyer" src="/images/icons/youtube.png">
              <!-- <img class="icon-link margin" data-toggle="collapse" href="#spotify-player-${postId}" role="button" aria-expanded="false" aria-controls="collapseExample" src="/images/icons/spotify.png"> -->
              <a class="btn btn-primary btn-sm margin" data-toggle="collapse" href="#songComments-${postId}" role="button" aria-expanded="false" aria-controls="songComments">Comments</a>
              <a class="btn btn-secondary btn-sm margin" data-toggle="collapse" href="#songInfo-${postId}" role="button" aria-expanded="false" aria-controls="songInfo">Song Info</a>
          </div>
        </div>
    </div>
</div>`
}

function generateSongInfo (song, postId) {
    let album = song.album ? song.album : 'N/A';
    let releaseYear = song.releaseYear ? song.releaseYear : 'N/A';
    return `<div class="media text-muted pt-1 centered song-recomm-songinfo">
    <div class="collapse" id="songInfo-${postId}">
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

function generateSongYoutube (song, postId) {
    return `<div class="text-muted pt-1 centered song-recomm-youtube">
    <div class="collapse" id="youtube-plyer-${postId}">
      <div class="card card-body container-youtube">
        <div class="plyer"></div>
            <div id="player-${postId}" data-plyr-provider="youtube" data-plyr-embed-id="https://www.youtube.com/embed/p2IPg-qS-_w"></div>
        </div>
      </div>
    </div>`
}

function generateSongCommentsContainer (song, postId) {
    let tempSongComments = [];
    for (let i = 0; i < song.comments.length; i++) {
        if( song.comments[i]) {
            tempSongComments.push(generateSongComments(song.comments[i] ));
        }
    }
    let songComments = tempSongComments.join('')
    return `<div class="text-muted pt-1 song-recomm-comments">
    <div class="collapse" id="songComments-${postId}">
      <div class="card card-body comments-container">
        ${songComments}
      </div>
      <form class="form-horizontal" id="commentForm" role="form"> 
          <div class="form-group">
              <label for="comment" class="col-sm-2 control-label small">Comment</label>
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
    <img class="align-self-start mr-3 profile-img border-gray rounded" src="${comment.addedBy.profilePicture}" id="${comment._id}" alt="user profile thumbnail">
    <div class="media-body">
      <h6 class="mt-0">${comment.dateAdded}</h6>
      <p class="small">${comment.comment}</p>
    </div>
  </div>`
}

// ----- generate instances of youtube plyr per song unit functions -----
let youtubePlyrIds = [];

function generateYoutubePlyrIds (postId) {
    youtubePlyrIds.push(`#player-${postId}`);
}

function generatePlyrsArray (youtubePlyrIds) {
    let playersArray = [];
    const players = youtubePlyrIds.map(id => {
        playersArray.push(new Plyr(`${id}`))
    })
    return players
}
function generatePlyrs () {
    const players = generatePlyrsArray(youtubePlyrIds);
    console.log(document.querySelectorAll('#player-5ba17f'));
    console.log($('#player-5ba17f'));
    return players;
}

// ----- generate song unit block -----
function generateMainSongUnit (song, postId) {
    let mainSongUnit = generateSongUnit(song, postId) + 
        generateSongNav(song, postId) + 
        generateSongInfo(song, postId) + 
        generateSongYoutube(song, postId) + 
        generateSongCommentsContainer(song, postId);
    return mainSongUnit;
}

window.player = player;

// ----- populate the DOM functions -----
function generateListOfSongs (songs) {
    let listOfSongString = [];
    for (let i = 0; i < songs.length; i++) {
        let postId = songs[i]._id.slice(0,6);
        generateYoutubePlyrIds(postId);
        listOfSongString.push(generateMainSongUnit(songs[i], postId));
    }
    return listOfSongString.join('');
}

function populatePage (data) {
    let string = generateListOfSongs(data);
    $('.song-recomm-main').append(`${string}`);
    generatePlyrs();
}

// ---- initializing DOM song unit functions -----
function onLoad () {
    populatePage(testData);
}

$(onLoad);