const passport=require('passport');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const GOOGLE_CLIENT_ID=process.env['GOOGLE_CLIENT_ID'];
const GOOGLE_CLIENT_SECRET=process.env['GOOGLE_CLIENT_SECRET'];

const Profile = require("../models/profile");

passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/google/callback",
    //CIO' CHE SUCCEDE QUANDO QUALCUNO FA UN LOGIN CORRETTO
    passReqToCallback   : true
  },
  async function (request, accessToken, refreshToken, profile, done) {
    console.log(profile);
    const userData = {
      googleId: profile.id,
      username: profile.email,
      name: profile.given_name,
      surname: profile.family_name,
      picture: profile.picture,
      authType: 'oauth'
    }
    await Profile.findOne({googleId: userData.googleId})
      .then(async (result) => {
        if (!result) {
          result = await Profile.create(userData);
        }
        return done(null, result);
      })
      .catch((err) => {
        console.error(err.message)
      });
  }     
));

passport.serializeUser(function(user,done){
    done(null,user);
});

passport.deserializeUser(async (user, done) => {
  await User.findOne({ googleId: user.googleId })
    .then((result) => {
      return done(null, result);
    })
    .catch((err) => {
      console.error(err.message);
    });
});

module.exports = passport;