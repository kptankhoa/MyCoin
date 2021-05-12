module.exports = function (req, res, next) {
    const user = req.session.user;
    if (user) {
        next();
    } else {
        res.json({
            'error_message': 'user not found'
        })
    }
}
