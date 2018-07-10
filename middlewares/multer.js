'use strict';
const multer = require('multer');
const shortid = require('shortid');

// ----- exports -----
const uploader = {};

// ---- utility function -----
let uniqueId = shortid.generate()

const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '../churchband/public/images/user_profile');
    },
    filename: function (req, file, cb) {
      let ext = file.originalname.slice(-4);
      cb(null, file.fieldname + '-' + Date.now() + ext);
    }
  });

const setStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let eventDate = req.body.eventDate;
    cb(null, `../churchband/media/`);
  },
  filename: function (req, file, cb) {
    let ext = file.originalname.slice(-4);
    let eventDate = req.body.eventDate;
    cb(null, eventDate + '-' + file.fieldname + '-' + uniqueId + ext)
  }
})

const newSetfields = [
  { name: 'vocals1' }, { name: 'vocals2' },
  { name: 'vocals3' }, { name: 'acGuitar' },
  { name: 'bass' }, { name: 'eg1' },
  { name: 'eg2' }, { name: 'keys' },
  { name: 'pad' }, { name: 'drumsOverhead'},
  { name: 'drumSnare' }, { name: 'drumKick'},
  { name: 'drumTom1' }, { name: 'drumTom2' },
  { name: 'drumTom3' }
]

const uploadPic = multer( { storage: profileStorage } );
const uploadSet = multer( { storage: setStorage });

uploader.ProfilePic = uploadPic.single('userImg');
uploader.Set = uploadSet.fields(newSetfields);

module.exports = { uploader };