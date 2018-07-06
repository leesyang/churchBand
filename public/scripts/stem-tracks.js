var playlist = WaveformPlaylist.init({
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

/* playlist.load([
  {
    "src": "media/set1/10_LeadVox.wav",
    "name": "Vocals",
    "gain": 0.75,
    "muted": false,
    "soloed": false
  },
  {
    "src": "media/set1/09_Piano.wav",
    "name": "Piano"
  },
  {
    "src": "media/set1/06_AcGtr.wav",
    "name": "Acoustic Guitar",
    "gain": 1
  },
  {
    "src": "media/set1/01_Kick.wav",
    "name": "Kick Drum"
  }
]).then(function() {
  //can do stuff with the playlist.
}); */

function onclick () {
  $('.playlist-toolbar').one('click', function () {
    return playlist.load([
      {
        "src": "media/set1/10_LeadVox.wav",
        "name": "Vocals",
        "gain": 0.75,
        "muted": false,
        "soloed": false
      },
      {
        "src": "media/set1/09_Piano.wav",
        "name": "Piano"
      },
      {
        "src": "media/set1/06_AcGtr.wav",
        "name": "Acoustic Guitar",
        "gain": 1
      },
      {
        "src": "media/set1/01_Kick.wav",
        "name": "Kick Drum"
      }
    ])
  })
}

onclick();