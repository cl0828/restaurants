var express = require('express');
var router = express.Router();
var multer = require('multer');
var multerUpload = multer();
var db = require('../database');
var authGuard = require('./middlewares/authguard');
var objectIDParser = require('./middlewares/objectIDParser');

router.get('/create', authGuard, function (req, res, next) {
  res.render('restaurants/create', { title: 'Create restaurant' });
});

router.post('/create', authGuard, multerUpload.single('photo'), function (req, res, next) {
  // server-side validation
  if (!req.body.name) {
    return res.send('name is mandatory');
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
      // redirect to created link
      res.redirect(result.insertedId);
    })
    .catch(err => next(err));
});

router.get('/:_id', objectIDParser, function (req, res, next) {
  db.find('restaurants', req.params)
    .then(docs => {
      // handle non-exist
      if (docs.length <= 0) {
        res.status(404).send('404 Not Found');
      } else {
        res.render('restaurants/show', { restaurant: docs[0] });
      }
    }).catch(err => next(err));
});

router.get('/:_id/edit', authGuard, objectIDParser, function (req, res, next) {
  db.find('restaurants', req.params)
    .then(docs => {
      if (docs.length <= 0) {
        res.status(404).send('404 Not Found');
      } else {
        const restaurant = docs[0];
        // check if owner
        if (req.session.username !== restaurant.owner) {
          res.status(403).send('403 Forbidden');
        } else {
          // not yet handle showing file
          res.render('restaurants/edit', { restaurant: restaurant });
        }
      }
    }).catch(err => next(err));
});

router.post('/:_id/edit', authGuard, multerUpload.single('photo'), objectIDParser, function (req, res, next) {
  if (!req.body.name) {
    return res.send('name is mandatory');
  }
  db.find('restaurants', req.params)
    .then(docs => {
      if (docs.length <= 0) {
        res.status(404).send('404 Not Found');
      } else {
        const restaurant = docs[0];
        if (req.session.username !== restaurant.owner) {
          res.status(403).send('403 Forbidden');
        } else {
          const restaurantNew = req.body;
          if (req.file) {
            restaurantNew.photo = {};
            restaurantNew.photo.base64 = req.file.buffer.toString('base64');
            restaurantNew.photo.mimetype = req.file.mimetype;
          }
          db.update('restaurants', req.params, { $set: restaurantNew })
            .then(result => {
              res.redirect('./');
            });
        }
      }
    }).catch(err => next(err));
});

router.get('/:_id/rate', authGuard, function (req, res, next) {
  res.render('restaurants/rate', { _id: req.params._id });
});

router.post('/:_id/rate', authGuard, objectIDParser, function (req, res, next) {
  const criteria = {};
  criteria['_id'] = req.params._id;
  criteria['grades.username'] = req.session.username;

  // check if this user rated
  db.find('restaurants', criteria)
    .then(result => {
      if (result.length > 0) {
        res.send('Already rated');
      } else {
        db.update('restaurants', { _id: req.params._id }, {
          $push: {
            grades: { username: req.session.username, score: req.body.score }
          }
        }).then(result => {
          res.redirect('./');
        });
      }
    }).catch(err => next(err));
});

router.get('/:_id/delete', authGuard, objectIDParser, function (req, res, next) {
  db.find('restaurants', req.params)
    .then(docs => {
      if (docs.length <= 0) {
        res.status(404).send('404 Not Found');
      } else {
        const restaurant = docs[0];
        if (req.session.username !== restaurant.owner) {
          res.status(403).send('403 Forbidden');
        } else {
          db.delete('restaurants', req.params)
            .then(result => {
              res.redirect('./');
            });
        }
      }
    }).catch(err => next(err));
});

module.exports = router;
