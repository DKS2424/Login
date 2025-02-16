const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next(); // User is authenticated, continue
    } else {
        res.redirect("/"); // Redirect to login if not authenticated
    }
};

module.exports = isAuthenticated;