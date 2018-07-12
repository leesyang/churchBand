'use strict';
// ----- add a new set -----
function updateSetList (res) {
    console.log(res)
};

function submitNewSet (endpoint, data) {
    return $.ajax ({
        method: 'POST',
        url: endpoint,
        data: data,
        cache: false,
        contentType: false,
        processData: false
    })
};

function watchNewSetSubmit () {
    $('#newSetForm').submit(function(event) {
        event.preventDefault();
        let formData = new FormData(this);
        submitNewSet(SETS_EP, formData)
         .done(updateSetList)
         .fail(evalError)
    })
};

// ----- get sets ----- 
let currentSets = []; // save current sets to memory

function addFilesPath (setFiles) {
    let path = 'media/';
    setFiles.map(function(file) {
        file.src = path + file.src;
    })
    return setFiles;
}

function generateSetsString (sets) {
    let setsArray = sets.map(set => {
        let date = simplifyDate(set.eventDate)
        return `<a class="dropdown-item dropdown-set" data-setId="${set._id}">${date} - ${set.eventType}</a>`
    })
    return setsArray.join('');   
}

function generateNewSetsList (sets) {
    console.log(sets)
    sets.map(set => {
        set.files = addFilesPath(set.files);
    })
    currentSets = sets;
    console.log(currentSets);
    let setsString = generateSetsString(sets)
    $('.dropdown-sets').html(setsString);
    watchSetClick();
}

function getListOfSets (endpoint) {
   return $.ajax ({
       method: 'GET',
       url: endpoint,
   })
}

function watchSetsGet () {
    $('#sets-link').click(function() {
        console.log('watch set get')
        getListOfSets(SETS_EP)
        .done(generateNewSetsList)
        .fail(evalError)
    })
}

// ----- stem tracks -----
let playlist = WaveformPlaylist.init({
    samplesPerPixel: 1000,
    waveHeight: 100,
    container: document.getElementById("playlist"),
    timescale: true,
    state: 'cursor',
    colors: {
      waveOutlineColor: '#E0EFF1'
    },
    controls: {
      show: true, //whether or not to include the track controls
      width: 200 //width of controls in pixels
    },
    zoomLevels: [500, 1000, 3000, 5000]
  });
  
function loadNewSet (files) {
    return playlist.load(files)
}

// ----- set comments -----
function submitNewSetComment (endpoint, data) {
    return $.ajax({
        method: 'POST',
        url: endpoint,
        contentType: 'application/json',
        data: JSON.stringify(data),
    })
    .fail(evalError)
}

function watchSetCommentSubmit () {
    $('.set-commentForm').submit(function(event){
        event.preventDefault();
        let formValues = objectifyForm(this);
        const commentsEp = SETS_EP+`/${formValues.setId}`+'/comments';
        submitNewSetComment(commentsEp, formValues)
        .done(updateSetComment)
        this.reset();
    })
}

function populateSetComments (set) {
    let commentsString = set.comments.map(comment => {
        return generateComment(comment)
    }).join('');
    $('.set-comments-container').html(commentsString);
    watchCommentDelete();
}

function updateSetComment (res) {
    console.log(res);
    let commentsArray = res.comments;
    let newComment = commentsArray[commentsArray.length - 1];
    let commentString = generateComment(newComment);
    $(commentString).appendTo($(`.set-comments-container`));
    watchCommentDelete(newComment._id);
}

// ----- load a set on click -----
function findSetObject (setId) {
    let set = currentSets.find(set => set._id == setId);
    return set;
}

function watchSetClick () {
    $('.dropdown-set').click(function() {
        let setId = $(this).attr('data-setId');
        let set = findSetObject(setId);
        ee.emit('clear');
        loadNewSet(set.files);
        $('.set-comments-container').empty();
        populateSetComments(set);
        $('.set-commentForm').find('#comments-setId').attr('value', `${setId}`)
    })
}

function onLoadSets () {
    $(watchNewSetSubmit );
    $(watchSetsGet);
    $(watchSetCommentSubmit);
}

$(onLoadSets);