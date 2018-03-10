'use strict';

module.exports = (sequelize, DataTypes) => {
  var Genre = sequelize.define('Genre', {
    name: {
      type: DataTypes.STRING,
      field: 'name'}}, {
        tableName: 'genres'
      });  
  return Genre;
}
