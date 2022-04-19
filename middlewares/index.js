const checkIfAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next()
    } else {
        req.flash("error_messages", "To access this page, please sign in.");
        res.redirect('/users/login');
    }
}

module.exports = {
    checkIfAuthenticated
}