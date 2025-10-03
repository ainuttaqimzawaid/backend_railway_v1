const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const port = 5000;
const { decodeToken } = require('./middlewares');
// const productRouter = require('./app/product/routes');
const productRouter_V2 = require('./app/product_v2/routes');
const categoryRouter = require('./app/category/routes');
const tagRouter = require('./app/tag/routes');
const borrowingRouter = require('./app/borrowing/routes');
const queueRouter = require('./app/queue/routes');
const reviewRouter = require('./app/review/routes');
const authRouter = require('./app/auth/routes');
const path = require('path');


app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(decodeToken());
// app.use(('/api/v1'), productRouter);
app.use(('/api/v2'), productRouter_V2);
app.use(('/api/v2'), categoryRouter);
app.use(('/api/v2'), tagRouter);
app.use(('/api/v2'), borrowingRouter);
app.use(('/api/v2'), queueRouter);
app.use(('/api/v2'), reviewRouter);
app.use(('/auth'), authRouter);
app.use((req, res) => {
    res.status(404);
    res.send({
        status: 'failed',
        message: 'resource' + req.originalUrl + 'not found'
    })
})

module.exports = app;