const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const passport = require('passport');
const { forwardAuthenticated } = require('../config/authentication');

// Logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
    });
    req.flash('success_msg', 'You are logged out');
    res.redirect('/user/login');
});

router.get('/login', forwardAuthenticated, (req, res) => {
    res.render('authentication/login');
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/signup', forwardAuthenticated, (req, res) => {
    res.render('authentication/signup');
});

router.post('/signup', (req, res) => {
    const { username, email, password, confirm_password } = req.body;
    let errors = [];

    User.findOne({ username: username }).then((user) => {
        if (user) {
            errors.push({ msg: 'Username already taken' });
            res.render('authentication/signup', { errors, username, email });

        }
    }).catch((error) => console.log(error));

    User.findOne({ email: email }).then((user) => {
        if (user) {
            errors.push({ msg: 'Email already exists' });
            res.render('authentication/signup', { errors, username, email });
            
        }
    }).catch((error) => console.log(error));

    if (username.length < 3) {
        errors.push({ msg: 'Username must be at least 3 characters' });
        res.render('authentication/signup', {errors, username, email});

    } else if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
        res.render('authentication/signup', {errors, username, email});

    } else if (password != confirm_password) {
        errors.push({ msg: 'Passwords do not match' });
        res.render('authentication/signup', {errors, username, email});

    } else {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                console.log(err);
                errors.push({ msg: 'Problem generating hash' });
                res.render('authentication/signup', {errors, username, email});

            }
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    console.log(err);
                    errors.push({ msg: 'Problem hashing password' });
                    res.render('authentication/signup', {errors, username, email});

                }

                const user = new User({
                    username: username,
                    email: email,
                    password: hash
                });

                user.save()
                    .then(() => {
                        req.flash('success_msg', 'You can now log in');
                        res.redirect('/user/login');
                    })
                    .catch((err) => console.log(err));
            });
        });
    }
});

module.exports = router;