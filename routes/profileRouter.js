//DEPENDENCIES
const express=require('express');

//ROUTER CHE BISOGNA ESPORTARE
const router=express.Router();

//ATTIVA IL PUBLIC
router.use(express.static(__dirname + '/../public'));

function isLoggedIn(req,res,next){
    req.user ? next():res.redirect('/auth/google'); //UNATHORIZED STATUS
}

router.get('/',isLoggedIn,(req,res)=>{
    res.render('./profile',{user:req.user});
});



module.exports=router;