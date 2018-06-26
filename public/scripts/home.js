'use strict';
// ----- constants: endpoints -----
const SONGS_EP = '/api/songs';

// ----- utility functions -----
// -- converts form data into object --
function objectifyForm(formInputs) {
    let formArray = $(formInputs).serializeArray();
    const returnObject = {};
    for (var i = 0; i < formArray.length; i++){
      returnObject[formArray[i]["name"]] = formArray[i]['value'];
    }
    return returnObject;
};

// ------- error handling for ajax -------
function evalError (err) {
    console.log(err);
    const responseJSON = res.responseJSON;
    if (responseJSON) {
        let errorMessage = responseJSON.message;
        showErrorMessage(errorMessage);
    }
}

// ----- add a new song -----
function displayNewSong (res) {
    let song = res;
    let songUnit = generateMainSongUnit(song, song._id);
    $('.song-recomm-main').prepend(songUnit);
}

function submitNewSong (endpoint, data, callback) {
    return $.ajax({
        method: 'POST',
        url: endpoint,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(data),
    })
    .done(callback)
    .fail(evalError)
}

function watchNewSongSubmit () {
    $('.newSongForm').submit(function(event) {
        event.preventDefault();
        let formValues = objectifyForm(this);
        if (formValues) {
            submitNewSong(SONGS_EP, formValues, displayNewSong)
        }
    })
}


// ---- add a new comment to a song -----
function displayNewComment (res) {
    let song = res;
    let songId = res._id;
    console.log(song);
    let commentsArray = song.comments.map(comment => { 
        return generateSongComments(comment)
    });
    let commentsString = commentsArray.join('');
    $(`#songComments-${songId}`).children('.comments-container').html(commentsString);
}

function submitNewComment (endpoint, data, callback) {
    return $.ajax({
        method: 'POST',
        url: endpoint,
        contentType: 'application/json',
        data: JSON.stringify(data),
    })
    .done(callback)
    .fail(evalError)
}

function watchNewCommentSubmit () {
    $('.commentForm').submit(function(event) {
        event.preventDefault();
        let formValues = objectifyForm(this);
        const commentsEp = SONGS_EP+`/${formValues.songId}`+'/comments';
        if(formValues && formValues.comment) {
            submitNewComment(commentsEp, formValues, displayNewComment)
        }
        this.reset();
    })
}

// ---- onload -----
function populateSongRecomm (endpoint, callback) {
    return $.ajax({
        method: 'GET',
        url: endpoint,
    })
    .fail(evalError)
    .done(callback)
}


function onLoad () {
    watchNewSongSubmit();
    watchNewSongSubmit();
}

$(onLoad)