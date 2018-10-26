'use strict';
function redirectHome () {
    console.log('redirecting')
}

function evaluateServerResponse (res) {
    console.log(res);
    const responseJSON = res.responseJSON;
    if ( res.status === 422 && responseJSON.location ) {
        $(`input[name="${responseJSON.location}"]`).addClass('input-error').focus().val('');
        showMsg(responseJSON.message);
    }
};

// ----- Preload Site Banner Images -----
const siteImages = [
    'https://s3-us-west-1.amazonaws.com/churchband/site-images/home-welcome-bg.jpg',
    'https://s3-us-west-1.amazonaws.com/churchband/site-images/sets-banner.jpg',
    'https://s3-us-west-1.amazonaws.com/churchband/site-images/home-banner.jpg' ]
const newImages = [];
for( let i = 0; i < siteImages.length; i++ ) {
    newImages[i] = new Image();
    newImages[i].src = siteImages[i];
}

// ----- DOM manipulation -----
function showMsg (message) {
    $('.alert').html(`${message}`).fadeTo(1000, 1, function(){
        $(this).fadeTo(1000, 0);
    })
};

// ----- redirect -----
function redirectHome () {
    window.location.replace('/home');
}

// ----- ajax -----
function submitLogin(formValues, callback) {
    return $.ajax({
        method: 'POST',
        url: '/auth/login',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(formValues),
    })
    .fail(evaluateServerResponse)
    .done(callback || redirectHome)
};

function demoLogin() {
    const demoUserInfo = {
        username: 'demouser',
        password: 'password123'
    }
    return $.ajax({
        method: 'POST',
        url: '/auth/login',
        contentType: 'application/json',
        data: JSON.stringify(demoUserInfo)
    })
    .fail(console.log)
    .done(redirectHome)
}

// ----- handling form data -----
function objectifyForm (formArray) {
    const returnObject = {};
    for (var i = 0; i < formArray.length; i++){
      returnObject[formArray[i]["name"]] = formArray[i]['value'];
    }
    return returnObject;
};

// ---- watch for form submit -----
function watchSubmit () {
    $('.form-signin').submit(function(event){
        event.preventDefault();
        let formArray = $(this).serializeArray();
        let formValues = objectifyForm(formArray);
        submitLogin(formValues)
    })
};

// ---- watch demo submit ----
function watchDemoSubmit() {
    $('.demo-login').click(function(e) {
        e.preventDefault();
        demoLogin();
    })
}

function onLoad () {
    watchSubmit();
    watchDemoSubmit();
};

$(onLoad);