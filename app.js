const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const port = 5000
const productRouter = require('./app/product/routes')
const productRouter_V2 = require('./app/product_v2/routes')


app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(('/api/v1'), productRouter);
app.use(('/api/v2'), productRouter_V2);
app.use((req, res) => {
    res.status(404);
    res.send({
        status: 'failed',
        message: 'resource' + req.originalUrl + 'not found'
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})