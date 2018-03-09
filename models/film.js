'use strict';

module.exports = (sequelize, DataTypes) => {
  var Films = sequelize.define('Films', {
    title: {
      type: DataTypes.STRING,
      field: 'title'}});
  
  return Films;
}
