const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('node:dns');

// Force IPv4 for DNS resolution to fix Render/Nodemailer issues
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const allowedOrigin = process.env.CORS_ORIGIN;


const app = express();
const port = process.env.PORT || 5000;

// CORS configuration for cross-origin requests
app.use(express.json());

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));

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
const userRouter = require('./routes/userRoutes');

console.log("inside index.js",);

app.use('/api', helloRouter);
app.use('/api/auth', authRouter);
app.use('/api/reports', reportRouter);
app.use('/api/bins', binRouter);
app.use('/api/users', userRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
