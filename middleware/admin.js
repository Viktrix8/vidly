function admin(req, res, next) {
    // 401 Unauthorized
    // 403 Forbidden

    if (!req.user.isAdmin) return res.status(403).send("Access denied. You are not an admin.")

    next()
}

module.exports = admin