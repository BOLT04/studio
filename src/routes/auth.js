const router = require('express').Router();
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const config = require('../lib/config');
const pipeline = require('../lib/pipeline');
const users = require('../handlers/users');
const isAuthenticated = require('../middlewares/is-authenticated');

module.exports = router;

if (config.app.enable_auth) {
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });

  passport.use(new GitHubStrategy({
    clientID: config.github.client_id,
    clientSecret: config.github.client_secret,
    callbackURL: config.github.callback_url,
    scope: 'user:email',
  }, (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    users.createFromGithub({
      displayName: profile.displayName || profile.username,
      email: profile._json.email || (profile.emails[0] && profile.emails[0].value ? profile.emails[0].value : `${profile.username}@failed-emails.com`),
      username: profile.username,
      avatar: profile._json.avatar_url,
      company: profile._json.company,
    })
    .then((user) => {
      done(null, user);
    })
    .catch(done);
  }
  ));

  router.get('/signin', (req, res, next) => {
    if (req.user) return res.redirect('/');
    next(); // Handled by Next.js
  });

  router.post('/logout', isAuthenticated, (req, res, next) => {
    req.logOut();
    res.redirect('/');
  });

  router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

  router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/auth/signin' }),
    (req, res) => {
      pipeline.exec('auth:github', { req, res, config }).finally(() => {
        const redirectUrl = req.session.redirectUrl || null;
        req.session.redirectUrl = null;
        res.redirect(redirectUrl || '/');
      });
    });
  }