var models = require('../models');
var express = require('express');
var router = express.Router();

router.get('/:id/recommendations', getFilmRecommendations);

function getFilmRecommendations(req, res, next) {
  var id = req.params.id;
  models.Films.findOne({
    attributes: ['title'],
    limit: 2
  }).then(film => {
    var message = film.get({plain: true}).title;
    res.status(200).json(message);
  });
}

module.exports = router;
