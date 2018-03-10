var rp = require('request-promise');
var models = require('../models');
var express = require('express');
var router = express.Router();
var app;
router.get('/:id/recommendations', getFilmRecommendations);

function getFilmRecommendations(req, res, next) {
  var id = req.params.id;
  var limit = req.params.limit || 10;
  var offset = req.params.offset || 1;

  app = req.app;
  fetchFilmByID(id)
    .then(parentFilm => {
      fetchFilmsMatchingGenre(parentFilm)
        .then(childFilms => {
          fetchFilmReviews(childFilms)
            .then(childFilmsWithReviews => {
              var recommendations = childFilms.map(f => f.dataValues);
              var averageRatings = getAverageRatings(childFilmsWithReviews);
              appendAverageRatings(recommendations, averageRatings);
              recommendations = recommendations.sort(r => r.id);
              recommendations = filterRecommendations(recommendations, parentFilm);
              recommendations = recommendations.slice(offset - 1, offset - 1 + limit);
              res.send({recommendations: recommendations});
            }).catch(res.send("There's been an error with the external API"));
        }).catch(res.send("Don't recognise that film"));
    });
};

function filterRecommendations(recommendations, parentFilm) {
  var parentReleaseDate = parentFilm.get({plain: true}).releaseDate;
  var parentReleaseYear = new Date(parentReleaseDate).getFullYear();
  recommendations = recommendations.filter(r => {
    var releaseYear = new Date(r.releaseDate).getFullYear();
    // Minimum of MIN_REVIEW_COUNT reviews
    return r.reviewCount > app.get('MIN_REVIEW_COUNT') &&
    // Average rating greater than MIN_RATING
    r.averageRating > app.get('MIN_RATING') &&
    // Released within RELEASED_WITHIN_YEARS
    Math.abs(releaseYear - parentReleaseYear) < app.get('RELEASED_WITHIN_YEARS');
  });
  return recommendations;
}

function appendAverageRatings(films, averageRatings) {
  for (i in films) {
    var film = films[i];
    var averageRating = averageRatings.find(r => r.id == film.id);
    film.averageRating = averageRating.averageRating;
    film.reviewCount = averageRating.reviewCount;
  }
}

function getAverageRatings(filmsWithReviews) {
  var averageRatings = [];
  for (i in filmsWithReviews) {
    var filmID = filmsWithReviews[i].film_id;
    var reviews = filmsWithReviews[i].reviews;
    var avgRatings = averageRating(reviews);
    averageRatings.push({id: filmID,
      averageRating: avgRatings,
      reviewCount: reviews.length});
  }
  return averageRatings;
}

function averageRating(reviews) {
  var avgRating = -1;
  if (reviews.length > 0) {
    var ratings = reviews.map(r => r.rating);
    avgRating = ratings.reduce((a, b) => a + b) / ratings.length;
  }
  return avgRating;
}

function fetchFilmByID(id) {
  return models.Film.findOne({
    attributes: ['title', 'genreID', 'releaseDate'],
    where: {
      id: id
    }});
}

function fetchFilmsByID(ids) {
  return models.Film.findAll({
    attributes: ['title', 'releaseDate', 'genreID'],
    where: {
      id: ids
    }
  });
}

function fetchFilmsMatchingGenre(film) {
  var genre_id = film.get({plain: true}).genreID;
  return fetchFilmsByGenre(genre_id);
}

function fetchFilmsByGenre(genre_id) {
  return models.Film.findAll({
    attributes: ['id', 'title', 'releaseDate', 'genreID'],
    where: {
      genre_id: genre_id
    }});
}

function getIDsFromFilms(films) {
  var filmIDs = []
    for (i in films) {
      var film_id = films[i].get({plain: true}).id;
      filmIDs.push(film_id);
    }
  return filmIDs;
}

function fetchFilmReviews(films) {
  var filmIDs = getIDsFromFilms(films);
  return fetchReviewsByFilmIDs(filmIDs)
}

function fetchReviewsByFilmIDs(filmIDs) {
  var uri = 'http://credentials-api.generalassemb.ly/4576f55f-c427-4cfc-a11c-5bfe914ca6c1';
  var ids = filmIDs.join(",");
  var options = {
    uri: uri,
    qs: {films: filmIDs.join(",")},
    json: true
  };
  return rp(options);
}

module.exports = router;
