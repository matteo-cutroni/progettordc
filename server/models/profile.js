const mongoose= require('mongoose');

const profileSchema= new mongoose.Schema({
    name:{
        type: String,
        required:true
    },
    surname:{
        type: String,
        required:true
    },
    bornOn:{
        type: Date,
        default: Date.now
    },
    ruolo:{
        type:String
    }
});

//ATTIVATA OGNI VOLTA (PRIMA DELLA VALIDAZIONE)
/*articleSchema.pre('validate',function(next){
    if (this.title){
        this.slug=slugify(this.title,{
            lower:true, //lowercase
            strict:true //forza lo slugify a levare tutti i caratteri che non possono andare nell'url
        });
    }

    next();
});*/

module.exports= mongoose.model('Profile',profileSchema);