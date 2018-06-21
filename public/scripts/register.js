'use strict';

function evaluateServerResponse (res) {
    console.log(res);
    const responseJSON = res.responseJSON;
    if ( res.status === 422 && responseJSON.location ) {
        $(`input[name="${responseJSON.location}"]`).addClass('input-error').focus();
        showMsg(responseJSON.message);
    }
};

// ----- DOM Manipulation -----
function showMsg (message) {
    $('.alert').html(`${message}`).fadeTo(1000, 0.9, function(){
        $(this).fadeTo(1000, 0);
    })
};

function showRedirectMsg () {
    $('.container-feedback').hide().html('<div class="alert alert-primary"><a href="/">Go to Login</a></div>').fadeIn(1000);
};

function hideForm () {
    $('.form-signup').hide();
};

function showLogin () {
    hideForm();
    showRedirectMsg()
}

// ----- ajax -----
function submitNewUser (formValues) {
    $.ajax({
        method: 'POST',
        url: '/users',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(formValues),
        success: showLogin,
    })
    .fail(evaluateServerResponse)
}

// ----- handling form data -----
function objectifyForm(formArray) {
    let formArray = $(this).serializeArray();
    const returnObject = {};
    for (var i = 0; i < formArray.length; i++){
      returnObject[formArray[i]["name"]] = formArray[i]['value'];
    }
    return returnObject;
};

function verifyPassword (formValues) {
    if ( formValues.password === formValues.confirmPassword) {
        return true;
    }
    else {
        return false;
    }
};

function watchSubmit () {
    $('.form-signup').submit(function(event){
        event.preventDefault();
        let formValues = objectifyForm(this);
        let passwordMatch = verifyPassword(formValues);
        if (passwordMatch){
            submitNewUser(formValues);
        }
        else {
            showMsg('Passwords do not match.')
        }
    })
};

function onLoad () {
    watchSubmit();
};

$(onLoad);