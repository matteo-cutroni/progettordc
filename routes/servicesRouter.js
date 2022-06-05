//DEPENDENCIES
const express=require('express');

//ROUTER CHE BISOGNA ESPORTARE
const router=express.Router();

//ATTIVA IL PUBLIC
router.use(express.static(__dirname + '/../public'));

router.get('/',(req,res)=>{
    res.send('HELLO SERVICES!');
});


module.exports=router;