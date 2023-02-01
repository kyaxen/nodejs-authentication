const router = require('express').Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/authentication');

router.get('/', forwardAuthenticated, (req, res) => {
    res.redirect('/user/login');
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.user.username });
});

module.exports = router;