'use strict';
var models = require('../models');

module.exports = (sequelize, DataTypes) => {
  var Film = sequelize.define('Film', {
    title: {
      type: DataTypes.STRING,
      field: 'title'},
    releaseDate: {
      type: DataTypes.STRING,
      field: 'release_date'},
    genreID: {
      type: DataTypes.STRING,
      field: 'genre_id'}
  });

  Film.associate = function(models) {
    models.Film.hasOne(models.Genre);
  }
  
  return Film;
}
