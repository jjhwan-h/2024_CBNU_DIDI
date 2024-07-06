import faber from "../src/Faber"
import { RequestHandler } from 'express';


const sendProofRequest:RequestHandler = async (req,res,next) =>{

    if(!faber.listener.on){
        await faber.setupConnection(); 
        await faber.sendProofRequest();
        res.send("waiting for acceptance")
    }else{
        next(req.body);
    }
};

export{sendProofRequest};
