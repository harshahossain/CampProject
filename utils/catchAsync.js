module.exports=func=>{
    return function(req,res,next){
        // fn(req,res,next).catch(e=>next(e)) 
        func(req,res,next).catch(next) 
    }
}
