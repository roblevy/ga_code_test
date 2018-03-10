const sqlite = require('sqlite'),
      Sequelize = require('sequelize'),
      request = require('request'),
      express = require('express'),
      app = express(),
      index = require('./routes/index');
      films = require('./routes/films');
const { PORT=3001, NODE_ENV='development', DB_PATH='./db/database.db' } = process.env;

// START SERVER
Promise.resolve()
  .then(() => app.listen(PORT, () => console.log(`App listening on port ${PORT}`)))
  .catch((err) => { if (NODE_ENV === 'development') console.error(err.stack); });

// ROUTES
app.use('/', index);
app.use('/films', films);

app.set('MIN_REVIEW_COUNT', 5);
app.set('MIN_RATING', 4.0);
app.set('RELEASED_WITHIN_YEARS', 15);
module.exports = app;
