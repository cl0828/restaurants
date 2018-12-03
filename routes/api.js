var express = require('express');
var router = express.Router();
var multer = require('multer');
var multerUpload = multer();
var db = require('../database');

router.post('/restaurant/create', multerUpload.single('photo'), function (req, res, next) {
  // server-side validation
  if (!req.body.name || !req.body.api_key) {
    return res.json({
      'status': 'failed'
    });
  }
  db.find('users', { 'api_key': req.body.api_key })
    .then(docs => {
      delete req.body.api_key;
      const user = docs[0];
      const restaurant = req.body;
      restaurant.owner = user.username;
      if (req.file && req.file.mimetype.indexOf('image') >= 0) {
        restaurant.photo = {};
        restaurant.photo.base64 = req.file.buffer.toString('base64');
        restaurant.photo.mimetype = req.file.mimetype;
      }
      db.insert('restaurants', restaurant)
        .then(result => {
          res.json({
            'status': 'ok',
            '_id': result.insertedId
          });
        });
    })
    .catch(err => {
      res.json({
        'status': 'failed'
      });
    });
});

router.get('/restaurant/read/:name/:value', function (req, res, next) {
  const criteria = {};
  criteria[req.params.name] = req.params.value;
  db.find('restaurants', criteria)
    .then(docs => {
      if (docs.length <= 0) {
        res.json({});
      } else {
        res.json(docs);
      }
    }).catch(err => next(err));
});

module.exports = router;
