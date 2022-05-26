const express = require('express');
const cors = require('cors');
require('dotenv').config()
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const apiRoutes = require('./src/modules/routes/routes');
const errorMiddleware = require('./src/modules/middlewares/error-middleware')
const app = express();
const path = require('path')


app.use('/media', express.static(path.join(__dirname, 'media')))
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(cookieParser())
app.use(cors({origin: '*'}));

const PORT = process.env.PORT || 8000
app.use('/', apiRoutes);
app.use(errorMiddleware)

const start = async () => {
  try {
    await mongoose.connect(process.env.URL, { useNewUrlParser: true, useUnifiedTopology: true });
    app.listen(PORT, () => {
      console.log(`app is listening on port ${PORT}`);
    });
  } catch (e) {
    console.log(e)
  }
}
start()

