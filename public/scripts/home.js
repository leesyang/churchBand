'use strict';
// ----- constants: endpoints -----
const SONGS_EP = '/api/songs';

// ----- plyer settings -----
// Change "{}" to your options:
// https://github.com/sampotts/plyr/#options
//const player = new Plyr('#player', {});

// Expose player so it can be used from the console
//window.player = player;

//const players = Array.from(document.querySelectorAll('div.plyer')).map(p => { new Plyr(`#${p.nextElementSibling.id}`); console.log(p.nextElementSibling.id)})


// ----- utility functions -----
// -- turns form data into an object --
function objectifyForm(formInputs) {
    let formArray = $(formInputs).serializeArray();
    const returnObject = {};
    for (var i = 0; i < formArray.length; i++){
      returnObject[formArray[i]["name"]] = formArray[i]['value'];
    }
    return returnObject;
};

// ----- new song submit -----
let newSongSubmitted = {};

// -- DOM functions --


// -- ajax --
function submitNewSong (endpoint, data, callback) {
    $.ajax({
        method: 'POST',
        url: endpoint,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(data),
        success: callback,
    })
    .fail(evalError)
}

function evalError (err) {
    console.log(err);
}

function evalSubmitRes (res) {
    console.log(res);
    const responseJSON = res.responseJSON;
    if (responseJSON) {
        let errorMessage = responseJSON.message;
        showErrorMessage(errorMessage);
    }
    else {
        newSongSubmitted = res;
    }
}


function watchNewSongSubmit () {
    $('.newSongForm').submit(function(event) {
        event.preventDefault();
        let formValues = objectifyForm(this);
        if (formValues) {
            submitNewSong(SONGS_EP, formValues, evalSubmitRes)
        }
    })
}


// ----- new comment submit -----

function watchNewCommentSubmit () {
    $('.commentForm').submit(function(event) {
        event.preventDefault();
        let formValues = objectifyForm(this);
        if(formValues.message ){
        }
    })
}

// ---- end new comment submit ----



function onLoad () {
    watchNewSongSubmit();
    watchNewCommentSubmit();
}

$(onLoad)