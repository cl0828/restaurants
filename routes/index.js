var express = require('express');
var router = express.Router();
var db = require('../database')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function (req, res, next) {
  res.render('loginform', { title: 'Login' });
});

router.post('/login', function (req, res, next) {
  db.find('users', req.body)
    .then(docs => {
      for (var doc of docs) {
        if (req.body.username === doc.username && req.body.password === doc.password) {
          req.session.authenticated = true;
          req.session.username = req.body.username;
          return res.redirect('/');
        }
      }
      res.send('Incorrect Username or Password')
    }).catch(err => next(err));
});

// post
router.get('/logout', function (req, res, next) {
  req.session = null;
  res.redirect('/');
});

router.get('/signup', function (req, res, next) {
  res.render('signupform', { title: 'Signup' });
});

router.post('/signup', function (req, res, next) {
  // TODO: handle existed username
  db.insert('users', req.body).then(result => {
    res.send('signed up!');
  }).catch(err => next(err));
});

router.get('/search', function (req, res, next) {
  db.find('restaurants', req.query)
    .then(docs => {
      res.render('search', { title: 'Search', docs: docs });
    }).catch(err => next(err));
});

router.get('/map', function (req, res, next) {
  res.render('map', {
    lat: req.query.lat, lon: req.query.lon, zoom: req.query.zoom
  });
});

module.exports = router;
