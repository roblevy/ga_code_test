var models = require('../models');
var express = require('express');
var router = express.Router();

router.get('/:id/recommendations', getFilmRecommendations);

function getFilmRecommendations(req, res, next) {
  var id = req.params.id;
  console.log(id);
  models.Films.findOne({
    attributes: ['title'],
    where: {
        id: id
    }
  }).then(film => {
    //var message = film.get({plain: true}).title;
    message = film;
    res.status(200).json(message);
  });
}

module.exports = router;
