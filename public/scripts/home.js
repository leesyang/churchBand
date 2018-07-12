'use strict';
// ----- constants: endpoints -----
const SONGS_EP = '/api/songs';
const SETS_EP = '/api/sets';

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

// -- get songId / commentId from html --
function getSongId (child) {
    return $(child).closest('.song-recomm-unit').attr('data-id');
}

function getCommentId (child) {
    return $(child).closest('.comment-unit').attr('data-id')
}

// ----- error handling for ajax ----- //
function evalError (err) {
    console.log(err);
    const responseJSON = err.responseJSON;
    if (responseJSON) {
        showErrorMessage(responseJSON.message);
    }
    else {
        showErrorMessage(err.statusText);
    }
}

// ----- update profile ----- //
function submitUpdateProfile (endpoint, data) {
    return $.ajax ({
        method: 'PUT',
        url: endpoint,
        data: data,
        cache: false,
        contentType: false,
        processData: false
    })
}

function watchProfileSubmit () {
    $('#update-user').submit(function(event) {
        console.log('watch profile running');
        event.preventDefault();
        let formData = new FormData(this);
         const updateProfileEp = '/users';
         submitUpdateProfile(updateProfileEp, formData)
         .done(renderNewProfile)
         .fail(evalError);
    })
};

function renderNewProfile (user) {
    console.log(user);
    let profileString = generateProfile(user);
    let profileExpString = generateProfileExp(user);
    $('.table-user-info').html(profileString);
    $('.user-exp').html(profileExpString);
    $('.update-user-container').toggle('fast', function() {
        $('.profile-info').toggle();
    });
    $('.user-img-loggedin').attr('src', `/images/user_profile/${user.profilePicture}`);

}

function watchProfileEdit () {
    $('.btn-edit-profile').click(() => {
        $('.profile-info').toggle();
        $('.update-user-container').toggle();
    })
}

// ----- add a new song ----- //
function displayNewSong (res) {
    let song = res;
    let songUnit = generateMainSongUnit(song, song._id);
    $('.song-recomm-main').prepend(songUnit);
    $('.modal').modal('hide');
    watchYoutubeClick();
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
        $(this).trigger('reset');
    })
}

// ---- add a new comment to a song/set ----- //
function displayNewComment (res) {
    let commentsArray = res.comments;
    let newComment = commentsArray[commentsArray.length - 1];
    let commentString = generateComment(newComment);
    $(commentString).appendTo($(`#comments-${res._id}`).children('.comments-container'))
    .addClass(`.comment-delete-${newComment._id}`).css('display', 'none').show('normal', () => {
        watchCommentDelete(newComment._id);
        watchCommentUpdateClick(newComment._id)
        watchCommentUpdateSubmit(newComment._id);
    });
}

function submitNewComment (endpoint, data) {
    return $.ajax({
        method: 'POST',
        url: endpoint,
        contentType: 'application/json',
        data: JSON.stringify(data),
    })
    .fail(evalError)
}

function watchNewCommentSubmit () {
    $('.commentForm').submit(function(event) {
        event.preventDefault();
        let formValues = objectifyForm(this);
        const commentsEp = SONGS_EP+`/${formValues.songId}`+'/comments';
        if(formValues && formValues.comment) {
            submitNewComment(commentsEp, formValues, displayNewComment)
            .done(displayNewComment)
        }
        this.reset();
    })
}

// ---- delete a comment from a song --- //
function deleteComment (endpoint, data) {
    let commentObject = { "commentId": `${data}` };
    return $.ajax({
        method: 'DELETE',
        url: endpoint,
        contentType: 'application/json',
        data: JSON.stringify(commentObject),
    })
    .fail(evalError)
}

function getSetId (child) {
    return $(child).closest('.set-comments ').find('#comments-setId').attr('value')
}

function watchCommentDelete (id) {
    let target = (id) ? `.comment-delete-${id}` :  '.comment-delete';
    $(`${target}`).on('click', function() {
        let songId = getSongId(this);
        let commentId = getCommentId(this);
        let setId = getSetId(this);
        let commentsDelEp = (songId)? SONGS_EP+`/${songId}`+'/comments' : SETS_EP+`/${setId}`+'/comments';
        deleteComment(commentsDelEp, commentId)
        .then(() => {
            $(this).closest('.comment-unit').hide('normal', function() {$(this).remove()});
        })
    })
}

// ----- update a comment ----- //
function updateComment (endpoint, data) {
    return $.ajax({
        method: 'PUT',
        url: endpoint,
        contentType: 'application/json',
        data: JSON.stringify(data),
    })
    .fail(evalError)
}

function getNewestComment (array) {
    let sortedArray = array.sort(function(a,b) {
      let aDate = new Date (a.dateAdded);
      let bDate = new Date (b.dateAdded);
      return aDate - bDate;
    })
    return sortedArray[sortedArray.length - 1].comment;
  }

function watchCommentUpdateSubmit (id) {
    let target = (id) ? `#edit-comment-${id}` :  '.edit-comment';
    $(target).submit(function(event) {
        event.preventDefault();
        let commentText = $(this).closest('.comment-unit').find('.comment-text');
        let songId = getSongId(this);
        let setId = getSetId(this);
        let commentEp = (songId)? SONGS_EP+`/${songId}`+'/comments' : SETS_EP+`/${setId}`+'/comments';
        let commentObject = {
            comment: $(this).children('input').val(),
            commentId: getCommentId(this)
        }
        updateComment(commentEp, commentObject)
        .then((comments) => {
            let updatedText = getNewestComment(comments);
            commentText.html(updatedText);
            $(this).addClass('hidden');
            commentText.removeClass('hidden');
        })
    })
}

function watchComEditClose (text, input) {
    $('.exit-comment-edit').click(function() {
        text.removeClass('hidden');
        input.addClass('hidden');
    })
}

function watchCommentUpdateClick (id) {
    let target = (id)? `.comment-update-${id}` :  '.comment-update';
    $(target).on('click', function() {
        let comment = $(this).closest('.comment-unit').find('.comment-text');
        let updatedCommentInput = $(this).closest('.comment-unit').find('.edit-comment');
        comment.addClass('hidden');
        updatedCommentInput.removeClass('hidden');
        watchComEditClose(comment, updatedCommentInput)
    })
}

// ---- generate initial page -----
function populateSongRecomm (endpoint, callback) {
    return $.ajax({
        method: 'GET',
        url: endpoint,
    })
    .fail(evalError)
    .done(callback)
}

function showErrorMessage(errMsg) {
    $('.alert').html(errMsg);
    $('.alert').slideDown('slow', function(){
        $('.alert').delay(1000).slideUp();
    })
}

// ----- link and navigation -----
function watchSongsLink () {
    $('#songs-link').click(function(){
        $('.home-banner').html('<div class="top-spacer"></div><p class="lead">Lastest Song Recommendations</p>')
        .css({'background-image': 'url(../images/home-banner.jpg)'})
        .removeClass('invisible');
        $('.home-welcome').slideUp('slow');
        $('#set-review-container').css('display', 'none');
        $('#song-recomm-container').fadeIn('slow');
    })
}

function watchSetsLink () {
    $('#sets-link').click(function(){
        $('.home-banner').html('<div class="top-spacer"></div><p class="lead">Set Reviews</p>')
        .css({'background-image': 'url(../images/sets-banner.jpg)'})
        .removeClass('invisible');
        $('.home-welcome').slideUp('slow');
        $('#song-recomm-container').css('display', 'none');
        $('#set-review-container').fadeIn('slow');
    })
}

// -- side bar nav --
function openNav() {
    document.getElementById("mySidenav").style.width = "100%";
}
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function onLoadHome () {
    watchNewSongSubmit();
    watchProfileSubmit();
    watchProfileEdit();
    watchSongsLink();
    watchSetsLink();

}

$(onLoadHome)