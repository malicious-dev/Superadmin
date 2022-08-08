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



