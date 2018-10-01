'use strict';
// ----- add a new set -----
function updateSetList (res) {
    $('.sets-loader-form').toggleClass('hidden');
    $('#newSetInput').modal('hide');
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
        $('#newSetForm').addClass('hidden');
        let formData = new FormData(this);
        $('.sets-loader-form').toggleClass('hidden');
        submitNewSet(SETS_EP, formData)
         .done(updateSetList)
         .fail(evalError)
    })
};

// ----- get sets ----- 
let currentSets = []; // save current sets to memory

function addFilesPath (setFiles) {
    setFiles.map(function(file) {
        file.src = setAudioPath + '/' + file.src;
    })
    return setFiles;
}

function sortSetsNewest (array) {
    let sortedArray = array.sort(function(a,b) {
      let aDate = new Date (a.eventDate);
      let bDate = new Date (b.eventDate);
      return bDate - aDate;
    })
    return sortedArray;
}

function generateSetsString (sets) {
    let setsArray = sortSetsNewest(sets).map(set => {
        let date = simplifyDate(set.eventDate)
        return `<a class="dropdown-item dropdown-set" href="#" data-setId="${set._id}">${date} - ${set.eventType} - ${set.setPart}</a>`
    })
    return setsArray.join('');   
}

function generateNewSetsList (sets) {
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
    $('#sets-link, .refresh-sets').click(function() {
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
    zoomLevels: [500, 1000, 3000, 5000],
  });
  
function loadNewSet (files) {
    return playlist.load(files)
}

// ----- set comments ----- //
function submitNewSetComment (endpoint, data) {
    return $.ajax({
        method: 'POST',
        url: endpoint,
        contentType: 'application/json',
        data: JSON.stringify(data),
    })
    .fail(evalError)
}

function updateSetComment (res) {
    let commentsArray = res.comments;
    let newComment = commentsArray[commentsArray.length - 1];
    let commentString = generateComment(newComment);
    $(commentString).appendTo($(`.set-comments-container`));
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

// ----- generate set comments ------ //
function populateSetComments (set) {
    let commentsString = set.comments.map(comment => {
        return generateComment(comment)
    }).join('');
    $('.set-comments-container').html(commentsString);
}

// ----- load a set on click ----- //
function findSetObject (setId) {
    let set = currentSets.find(set => set._id == setId);
    return set;
}

function watchSetClick () {
    $('.dropdown-set').click(function() {
        let setId = $(this).attr('data-setId');
        let set = findSetObject(setId);
        ee.emit('clear');
        $('.sets-loader').toggleClass('hidden').addClass('inline-block');
        loadNewSet(set.files)
        .then(() => {
            $('.sets-loader').toggleClass('hidden').removeClass('inline-block');
            $('.set-comments-container').empty();
            $('.set-comments').removeClass('hidden');
            populateSetComments(set);
            $('.set-commentForm').find('#comments-setId').attr('value', `${setId}`)
        })
        .catch(err => {
            console.log(err.statusText);
        })
    })
}

function onLoadSets () {
    $(watchNewSetSubmit );
    $(watchSetsGet);
    $(watchSetCommentSubmit);
}

$(onLoadSets);