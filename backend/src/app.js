require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routes);

const PORT = process.env.PORT || 4000;
const { initDB } = require('./models');

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server '${process.env.npm_package_name}' running on port ${PORT}`);
  });
});