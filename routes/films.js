var models = require('../models');
var express = require('express');
var router = express.Router();

router.get('/:id/recommendations', getFilmRecommendations);

function getFilmRecommendations(req, res, next) {
  var id = req.params.id;
  models.Film.findOne({
    attributes: ['genre_id'],
    where: {
        id: id
    }
  }).then(parentFilm => {
      var genre_id = parentFilm.get({plain: true}).genre_id;
      console.log(parentFilm);
      models.Film.findAll({
        attributes: ['id', 'title', 'releaseDate'],
        where: {
          genre_id: genre_id
        }
      }).then(childFilms => {
          res.status(200).json(childFilms);
      })
  });
};

module.exports = router;
