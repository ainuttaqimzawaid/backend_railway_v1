const router = require('express').Router()
const connection = require('../../config/mysql')

router.get('/product', (req, res) => {
    const { search } = req.query;
    let exec = {};
    if (search) {
        exec = {
            sql: 'SELECT * FROM users WHERE name LIKE ?',
            values: [`%${search}%`]
        }
    } else {
        exec = {
            sql: 'SELECT * FROM users'
        }
    }
    connection.query(exec, _response(res));
})




const _response = (res) => {
    return (error, result) => {
        if (error) {
            res.send({
                status: 'failed',
                Response: error
            });
        } else {

            res.send({
                status: 'success',
                Response: result,
            });
        }
    }
};

module.exports = router;