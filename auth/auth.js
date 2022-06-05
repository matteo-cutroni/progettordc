const passport=require('passport');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

const GOOGLE_CLIENT_ID=process.env['GOOGLE_CLIENT_ID'];
const GOOGLE_CLIENT_SECRET=process.env['GOOGLE_CLIENT_SECRET'];

passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:80/google/callback",
    //CIO' CHE SUCCEDE QUANDO QUALCUNO FA UN LOGIN CORRETTO
    passReqToCallback   : true
  },
  async function (request, accessToken, refreshToken, profile, done) {
    const profileJson = profile._json;
    const userData = {
      username: profileJson.email,
      firstname: profileJson.given_name,
      lastname: profileJson.family_name,
      picture: profileJson.picture,
      authType: 'oauth'
    }
    console.log(profile);
    return done(null, profile);
  }
));

passport.serializeUser(function(user,done){
    done(null,user);
});

passport.deserializeUser(function(user,done){
    done(null,user);
});