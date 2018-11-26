var express = require('express');
var router = express.Router();
var multer = require('multer');
var multerUpload = multer();
var db = require('../database');
var authGuard = require('./middlewares/authguard');

router.post('/restaurant/create', authGuard, multerUpload.single('photo'), function (req, res, next) {
  // server-side validation
  if (!req.body.name) {
    return res.json({
      'status': 'failed'
    });
  }
  const restaurant = req.body;
  restaurant.owner = req.session.username;
  if (req.file) {
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
