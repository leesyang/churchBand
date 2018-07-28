'use strict';
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const shortid = require('shortid');

// ----- exports -----
const uploader = {};

// ----- configuring amazon web services ------
var s3 = new aws.S3({ /* ... */ })
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const myBucket = process.env.S3_BUCKET_NAME;

// ---- utility function -----
let uniqueId = shortid.generate();

// ----- amazon storage settings -----
const setStorageAws = multerS3({
  s3: s3,
  bucket: myBucket,
  acl: 'public-read',
  contentType: multerS3.AUTO_CONTENT_TYPE, 
  key: function (req, file, cb) {
    let ext = file.originalname.slice(-4);
    let eventDate = req.body.eventDate;
    cb(null, 'set-audio/' + eventDate + '-' + file.fieldname + '-' + uniqueId + ext)
  }
});

const profileStorageAws = multerS3({
  s3: s3,
  bucket: myBucket,
  acl: 'public-read',
  contentType: multerS3.AUTO_CONTENT_TYPE, 
  key: function (req, file, cb) {
    let ext = file.originalname.slice(-4);
    cb(null, 'user-profile-images/' + file.fieldname + '-' + Date.now() + ext);
  }
});

const newSetfields = [
  { name: 'vocals1' }, { name: 'vocals2' },
  { name: 'vocals3' }, { name: 'acGuitar' },
  { name: 'bass' }, { name: 'eg1' },
  { name: 'eg2' }, { name: 'keys' },
  { name: 'pad' }, { name: 'drumsOverhead'},
  { name: 'drumSnare' }, { name: 'drumKick'},
  { name: 'drumTom1' }, { name: 'drumTom2' },
  { name: 'drumTom3' }
];

const uploadPicAws = multer({ storage: profileStorageAws });
const uploadSetAws = multer({ storage: setStorageAws });

uploader.ProfilePic = uploadPicAws.single('userImg');
uploader.Set = uploadSetAws.fields(newSetfields);

module.exports = { uploader };