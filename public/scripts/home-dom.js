'use strict'; 
// ----- utility function -----
function simplifyDate (date) {
    return new Date(date).toDateString();
}

// ----- generate one song unit html functions -----
function generateSongNav (song) {
    return `<div class="media text-muted pt-3 border-bottom border-gray song-recomm-nav">
    <div class="container">
        <div class="row">
          <div class="col-md-auto">
              <img class="shadow rounded user-img" src="${song.addedBy.profilePicture}">
              <span class="text-gray-dark user-name">@${song.addedBy.username}</span>
              <div class="user-img-spacer"></div>
          </div>
          <div class="col small">
              ${song.artist} - <span class="no-wrap">${song.title}</span>
          </div>
          <div class="col col-md-auto no-wrap">
              <a class="icon-link margin" data-toggle="collapse" href="#youtube-plyer-${song._id}" role="button" aria-expanded="false" aria-controls="youtube-plyer"><img class="youtube-button" src="/images/icons/youtube.png"></a>
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
    let date = simplifyDate(song.dateAdded);
    return `<div class="text-muted pt-1 centered song-recomm-songinfo">
    <div class="collapse" id="songInfo-${song._id}">
      <div class="card card-body">
          <div class="container">
              <div class="row">
                <div class="col small">
                  <p class="song-info"><strong>Date Added:</strong> ${date}</p>
                  <p class="song-info"><strong>Artist:</strong> ${song.artist}</p>
                  <p class="song-info"><strong>Title:</strong> ${song.title}</p>
                  <p class="song-info"><strong>Album:</strong> ${album}</p>
                </div>
                <div class="col small">
                  <p class="song-info"><strong>Release Year:</strong> ${releaseYear}</p>
                  <p class="song-info"><strong>Theme:</strong> ${song.theme}</p>
                  <p class="song-info"><strong>Tempo:</strong> ${song.tempo}</p>
                  <p class="song-info"><strong>Link:</strong> ${song.links.youtube}</p>
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
            <div id="player-${song._id}" class="plyer" data-plyr-provider="youtube" data-plyr-embed-id="${song.links.youtube}"></div>
      </div>
    </div>
</div>`
}

function generateSongCommentsContainer (song) {
    let tempSongComments = [];
    for (let i = 0; i < song.comments.length; i++) {
        if( song.comments[i]) {
            tempSongComments.push(generateSongComment(song.comments[i] ));
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
                <input type="text" class="form-control" name="comment" id="comment">
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

function generateSongComment (comment) {
    let date = simplifyDate(comment.dateAdded);
    return `<div class="media song-comment" id="${comment._id}">
    <img class="align-self-start mr-3 ml-2 user-img border-gray rounded" src="${comment.addedBy.profilePicture}" alt="user profile thumbnail">
    <div class="media-body">
      <h6>${date}</h6>
      <p class="small ml-3 comment-content">${comment.comment}</p>
    </div>
    <button type="button" class="btn btn-light btn-sm comment-delete comment-delete-${comment._id}">Delete</button>
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
    return songs.map(generateMainSongUnit).join('');
}

function populatePage (data) {
    console.log(data);
    let string = generateListOfSongs(data);
    $('.song-recomm-main').html(`${string}`);
    $('.loader').hide();
}

// ---- event listeners -----
function watchYoutubeClick () {
    $('.youtube-button').click(function() {
        let plyrId = $(this).closest('.song-recomm-unit').find('.plyer').attr('id');
        let player = new Plyr(`#${plyrId}`);
    })
}

// ---- initializing DOM song unit functions -----
function onLoadHomeDom () {
    populateSongRecomm(SONGS_EP, populatePage)
    .then(function () {
        watchNewCommentSubmit();
        watchYoutubeClick();
        watchCommentDelete();
    })
}

$(onLoadHomeDom);