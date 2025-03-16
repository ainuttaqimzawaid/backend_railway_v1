const { getToken, policyFor } = require("../utils");


const jwt = require('jsonwebtoken');
const { Op, Sequelize } = require('sequelize');
const Users = require('../app/user/model'); // Sesuaikan dengan struktur proyek Anda
const config = require('../config/config'); // Pastikan file konfigurasi benar

function decodeToken() {
    return async function (req, res, next) {
        try {
            let token = getToken(req);

            if (!token) return next();

            console.log('haloooooooooooooooo' + token)
            req.user = jwt.verify(token, config.secretKey);

            // Cari user dengan token yang cocok
            let user = await Users.findOne({
                where: Sequelize.literal(`JSON_CONTAINS(token, token)`)
            });

            if (!user) {
                return res.json({
                    error: 1,
                    message: 'Token Expired'
                });
            }
        } catch (err) {
            if (err && err.name === 'JsonWebTokenError') {
                return res.json({
                    error: 1,
                    message: err.message
                });
            }
            next(err);
        }

        return next();
    };
}

//middleware untuk hak akses
function police_check(action, subject) {
    return function (req, res, next) {
        let policy = policyFor(req.user);
        if (!policy.can(action, subject)) {
            return res.json({
                error: 1,
                message: `You are not allowed to ${'action'} ${subject}`
            });
        }
        next();
    }
};

module.exports = {
    decodeToken,
    police_check
};