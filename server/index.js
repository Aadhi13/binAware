const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri);

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

const helloRouter = require('./routes/helloRoute');
const authRouter = require('./routes/authRoutes');
const reportRouter = require('./routes/reportRoutes');
const binRouter = require('./routes/binRoutes');

app.use('/', helloRouter);
app.use('/api/auth', authRouter);
app.use('/api/reports', reportRouter);
app.use('/api/bins', binRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
