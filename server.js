const express = require('express');
const bodyParser = require('body-parser');

const cors = require('cors');

const PORT = 3000; //port at 3000
const api = require('./routes/api');
const app = express();
app.use(cors());

app.use(bodyParser.json());
app.use(express.json());

app.use('/super', api);
// app.get('/', api)

app.listen(PORT, function () {
  console.log('listening on port 3000');
})



// require('rootpath')();
// const express = require('express');
// const app = express();
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const errorHandler = require('_helpers/error-handler');

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(cors());

// // api routes
// app.use('/users', require('./users/users.controller'));

// // global error handler
// app.use(errorHandler);

// // start server
// const port = process.env.NODE_ENV === 'production' ? 80 : 4000;
// const server = app.listen(port, function () {
//     console.log('Server listening on port ' + port);
// });