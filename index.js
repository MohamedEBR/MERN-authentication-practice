const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors");
const bodyParser = require("body-parser");
require('dotenv').config();


//app
const app = express()

//db
mongoose
 .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('DB Connected'))


//middlewares
app.use(bodyParser.json());
app.use(cors());

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${port}`);
} )