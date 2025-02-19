const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const port = 5000
const productRouter = require('./app/product/routes')


app.use(morgan('dev'));
app.use(cors());
app.use(('/api/v1'), productRouter);
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