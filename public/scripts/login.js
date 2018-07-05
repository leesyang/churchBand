'use strict';
function redirectHome () {
    console.log('redirecting')
}

function evaluateServerResponse (res) {
    console.log(res);
    const responseJSON = res.responseJSON;
    if ( res.status === 422 && responseJSON.location ) {
        $(`input[name="${responseJSON.location}"]`).addClass('input-error').focus();
        showMsg(responseJSON.message);
    }
};

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
function submitLogin (formValues, callback) {
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

function onLoad () {
    watchSubmit();
};

$(onLoad);