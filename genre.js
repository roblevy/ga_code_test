'use strict';

module.exports = (sequelize, DataTypes) => {
  var Genres = sequelize.define('Genres', {
    name: {
      type: DataTypes.STRING,
      field: 'name'}});  
  }
  return Genres;
}
