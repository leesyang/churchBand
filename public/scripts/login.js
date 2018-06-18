'use strict';
function redirectHome () {
    console.log('redirecting')
}

function evaluateServerResponse (res) {
    console.log(res);
    const responseJSON = res.responseJSON;
    if (responseJSON) {
        let errorMessage = responseJSON.message;
        showMsg(errorMessage);
    }
    if (res.message === 'Successful login') {
        redirectHome();
    }
};


// ----- DOM Manipulation -----
function showMsg (message) {
    $('.alert').html(`${message}`).fadeTo(1000, 1, function(){
        $(this).fadeTo(1000, 0);
    })
};

// ----- Redirect -----
function redirectHome () {
    window.location.replace('/home');
}

// ----- ajax -----
function submitLogin (formValues, callback) {
    $.ajax({
        method: 'POST',
        url: '/auth/login',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(formValues),
        success: callback,
        statusCode: {
            500: callback/* callback({ responseJSON: { code: 500, message: 'Internal Server Error' }}) */,
            422: callback
        }
    })
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
        submitLogin(formValues, evaluateServerResponse);
    })
};

function onLoad () {
    watchSubmit();
};

$(onLoad);