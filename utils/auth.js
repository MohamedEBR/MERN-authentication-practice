const jwt = require('jsonwebtoken');

exports.createJwt = (email, userId, expiresIn) => {
    const payload = {
        email,
        userId,
        expiresIn
    }

    return jwt.sign(payload, process.env.TOKEN_SECRET, {
        expiresIn : expiresIn
    });
}