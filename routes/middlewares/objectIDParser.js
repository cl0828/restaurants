const ObjectID = require('mongodb').ObjectID;

module.exports = function (req, res, next) {
  try {
    req.params._id = new ObjectID(req.params._id);
    next();
  } catch (e) {
    res.status(404).send('404 Not Found');
  }
};
