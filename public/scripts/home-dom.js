'use strict'; 
// ----- utility function -----
function simplifyDate (date) {
    return new Date(date).toDateString();
}

// ----- generate one song unit html functions -----
function generateSongNav (song) {
    let username = 'user ' + song.addedBy.username;
    if (!username) {
        username = '';
    }
    return `<div class="media text-muted pt-3 border-bottom border-gray song-recomm-nav">
    <div class="container">
        <div class="row justify-content-around">
          <div class="col-auto mr-auto">
          <img class="shadow rounded user-img" alt="user image ${username}" src="${profileImgPath}/${song.addedBy.profilePicture}">
          <span class="no-wrap">${song.artist} - ${song.title}</span>
          </div>
          <div class="col-auto">
              <a class="icon-link margin" data-toggle="collapse" href="#youtube-plyer-${song._id}" role="button" aria-expanded="false" aria-controls="youtube-plyer"><img class="youtube-button" src="/images/icons/youtube.png"></a>
              <a class="btn btn-primary btn-sm margin" data-toggle="collapse" href="#comments-${song._id}" role="button" aria-expanded="false" aria-controls="songComments">Comments</a>
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

// shared function between song and set
function generateCommentsContainer (unit) {
    let tempUnitComments = [];
    for (let i = 0; i < unit.comments.length; i++) {
        if( unit.comments[i]) {
            tempUnitComments.push(generateComment(unit.comments[i] ));
        }
    }
    let unitComments = tempUnitComments.join('')
    return `<div class="text-muted pt-1">
    <div class="collapse" id="comments-${unit._id}">
      <div class="card card-body comments-container">
        ${unitComments}
      </div>
      <form class="form-horizontal commentForm" role="form"> 
          <div class="form-group">
              <label for="comment" class="col-sm-offset-2 control-label small"><strong>Comment</strong></label>
              <div class="col-sm-10">
                <input type="text" class="form-control" name="comment" id="comment">
                <input type="hidden" name="songId" value="${unit._id}">
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

function generateComment (comment) {
    let date = simplifyDate(comment.dateAdded);
    if (!comment.addedBy ){
        comment.addedBy = {};
        comment.addedBy.profilePicture = 'default-user-image.png'
    }
    return `<div class="media comment-unit" data-id="${comment._id}">
    <img class="align-self-start mr-3 user-img border-gray rounded" src="${profileImgPath}/${comment.addedBy.profilePicture}" alt="user profile thumbnail">
    <div class="media-body">
      <div class="comment-heading">
        <p class="small">${date}</p>
        <div class="comment-controls" aria-label="comment controls">
            <button type="button" class="btn btn-light btn-sm comment-update" aria-label="show update comment form">Update</button>
            <button type="button" class="btn btn-light btn-sm comment-delete" aria-label="delete comment">Delete</button>
        </div>
      </div>
      <p class="small ml-3 comment-text">${comment.comment}</p>
      <form class="edit-comment hidden input-group-sm" aria-label="update comment form" >
        <label for="editedComment" class="sr-only">Edited Comment</label>
        <input type="text" class="edit-comment-input form-control" id="editedComment" value="${comment.comment}" aria-label="updated comment">
        <button type="submit" class="btn btn-light btn-sm" aria-label="submit">Submit</button>
        <button type="button" class="btn btn-light btn-sm exit-comment-edit" aria-label="close">X</button>
      </form>
    </div>
  </div>`
}

function generateProfile (user) {
    return `
              <tbody>
                <tr>
                  <td>Username:</td>
                  <td>${user.username}</td>
                </tr>
                <tr>
                  <td>First Name</td>
                  <td>${user.firstName}</td>
                </tr>
                <tr>
                  <td>Last Name</td>
                  <td>${user.lastName}</td>
                </tr>
                <tr>
                  <td>Email: </td>
                  <td>${user.email}</td>
                </tr>
              </tbody>`
};

function generateProfileExp (user) {
    
    return `
     <tbody>
        <tr>
          <td>${user.experience.instr1}</td>
          <td>${user.experience.skill1}</td>
        </tr>
        <tr>
          <td>${user.experience.instr2}</td>
          <td>${user.experience.skill2}</td>
        </tr>
        <tr>
          <td>${user.experience.instr3}</td>
          <td>${user.experience.skill3}</td>
        </tr>
     </tbody>`
};

// ----- generate song unit block -----
function generateMainSongUnit (song) {
    if ( !song.addedBy ) {
        song.addedBy = {};
        song.addedBy.username = '';
        song.addedBy.profilePicture = 'default-user-image.png';
    }
    let mainSongUnit = `<div class="song-recomm-unit" data-id="${song._id}">` + 
        generateSongNav(song) + 
        generateSongInfo(song) + 
        generateSongYoutube(song) + 
        generateCommentsContainer(song)+'</div>';
    return mainSongUnit;
}

// ----- populate the DOM functions -----
function generateListOfSongs (songs) {
    return songs.map(generateMainSongUnit).join('');
}

function populatePage (data) {
    let string = generateListOfSongs(data);
    $('.song-recomm-main').html(`${string}`);
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
        watchCommentUpdateClick();
        watchCommentUpdateSubmit();
    })
}

$(onLoadHomeDom);