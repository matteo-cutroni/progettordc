const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const GOOGLE_CLIENT_ID = process.env['GOOGLE_CLIENT_ID'];
const GOOGLE_CLIENT_SECRET = process.env['GOOGLE_CLIENT_SECRET'];

const Profile = require("../models/profile");

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/google/callback",
    //CIO' CHE SUCCEDE QUANDO QUALCUNO FA UN LOGIN CORRETTO
    passReqToCallback: true
  },
  async function (request, accessToken, refreshToken, profile, done) {
    console.log("REFRESH TOKEN: " + refreshToken);
    const userData = {
      googleId: profile.id,
      mail: profile.email,
      name: profile.given_name,
      surname: profile.family_name,
      picture: profile.picture,
      accessToken: accessToken,
      refreshToken: refreshToken,
      authType: 'oauth',
    }
    console.log("\n\nLogged User: \n"+ JSON.stringify((userData),null,4));
    await Profile.findOne({googleId: userData.googleId})
      .then(async (result) => {
        if (!result) {
          result = await Profile.create(userData);
          console.log("\nNuovi Dati caricati nel database\n");
          console.log("\nRisultato: " + result);
        } else {
          console.log("\nUtente già registrato nel database\n");
          //UPDATE accessToken
          await Profile.findOneAndUpdate({ googleId: userData.googleId }, { $set: { 'accessToken': accessToken, 'refreshToken' : refreshToken } }, {new:true, upsert:true});
        }
        return done(null, result);
      })
      .catch((err) => {
        console.error(err.message)
      });
  }     
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(async(user, done) => {
    await Profile.findOne({ googleId: user.googleId })
        .then((result) => {
            return done(null, result);
        })
        .catch((err) => {
            console.error(err.message);
        });
});

module.exports = passport;