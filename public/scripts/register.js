'use strict';

function evaluateServerResponse (res) {
    console.log(res);
    const responseJSON = res.responseJSON;
    if (responseJSON) {
        let errorMessage = responseJSON.message;
        showMsg(errorMessage);
    }
    else {
        hideForm();
        showRedirectMsg();
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

// ----- ajax -----
function submitNewUser (formValues, callback) {
    $.ajax({
        method: 'POST',
        url: '/users',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(formValues),
        success: callback,
        statusCode: {
            500: callback({ responseJSON: { code: 500, message: 'Internal Server Error' }}),
            422: callback
        }
    })
}

// ----- handling form data -----
function objectifyForm(formArray) {
    const returnObject = {};
    for (var i = 0; i < formArray.length; i++){
      returnObject[formArray[i]["name"]] = formArray[i]['value'];
    }
    return returnObject;
};

function verifyPassword (formValues) {
    console.log(formValues);
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
        let formArray = $(this).serializeArray();
        let formValues = objectifyForm(formArray);
        let passwordMatch = verifyPassword(formValues);
        if (passwordMatch){
            submitNewUser(formValues, evaluateServerResponse);
        }
        else {
            showMsg('Passwords do not match.')
        }
    })
};

function onLoad () {
    console.log('onload working');
    watchSubmit();
};

$(onLoad);