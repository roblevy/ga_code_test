var rp = require('request-promise');
var models = require('../models');
var express = require('express');
var router = express.Router();

router.get('/:id/recommendations', getFilmRecommendations);

function getFilmRecommendations(req, res, next) {
  var id = req.params.id;
  fetchFilmByID(id)
    .then(parentFilm => {
      var genre_id = parentFilm.get({plain: true}).genre_id;
      fetchFilmsByGenre(genre_id)
        .then(childFilms => {
          var child_ids = []
          for (i in childFilms) {
            var child_id = childFilms[i].get({plain: true}).id;
            child_ids.push(child_id);
          }
          fetchReviewsByFilmIDs(child_ids)
            .then(response => {
              var average_reviews = handleReviewRequest(response);
              console.log(average_reviews);
              res.send(average_reviews);
            });
        })
    });
};

function handleReviewRequest(response) {
  var averageReviews = [];
  for (i in response) {
    var id = response[i].film_id;
    var reviews = response[i].reviews;
    console.log(response[i]);
    if (reviews.length > 0) {
      var ratings = reviews.map(x => x.rating);
      var avgRatings = ratings.reduce((a, b) => a + b) / ratings.length;
      averageReviews.push({id: id, averageRating: avgRatings});
    }
  }
  return averageReviews;
}

function fetchFilmByID(id) {
  return models.Film.findOne({
    attributes: ['genre_id'],
    where: {
      id: id
    }});
}

function fetchFilmsByGenre(genre_id) {
  return models.Film.findAll({
    attributes: ['id', 'title', 'releaseDate'],
    where: {
      genre_id: genre_id
    }});
}

function fetchReviewsByFilmIDs(film_ids) {
  var uri = 'http://credentials-api.generalassemb.ly/4576f55f-c427-4cfc-a11c-5bfe914ca6c1';
  var ids = film_ids.join(",");
  var options = {
    uri: uri,
    qs: {films: film_ids.join(",")},
    json: true
  };
  return rp(options).catch(err => {});
}

module.exports = router;
