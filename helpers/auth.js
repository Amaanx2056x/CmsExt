module.exports = {
  userAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect('/login')
    }
  },
  adminAuth: function (req, res, next) {
    if (req.user.isAdmin) {
      next();
    } else {
      res.redirect('/')
    }
  }
}