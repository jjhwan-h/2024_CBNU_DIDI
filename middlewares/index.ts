import faber from "../src/Faber"
import { RequestHandler } from 'express';
import qrcode from 'qrcode';

const connection:RequestHandler = async(req,res,next)=>{
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    const url = await faber.printConnectionInvite();
    const qr = await qrcode.toDataURL(url);
    res.write(`data:${JSON.stringify({url,qr})}\n\n`);
    await faber.setupConnection();
    
    console.log("waiting...")
    next();
}

const sendProofRequest:RequestHandler = async (req,res,next) =>{
    await faber.sendProofRequest();
    res.write("data:{message:waiting for acceptance}\n\n");
    next();
};

const isLoggedIn:RequestHandler = (req,res,next)=>{
    if (req.isAuthenticated()) {
        next();
      } else {
        res.status(403).send('로그인 필요');
      }
};

const isNotLoggedIn:RequestHandler = (req,res,next)=>{
    if (!req.isAuthenticated()) {
        next();
      } else {
        const message = encodeURIComponent('로그인한 상태입니다.');
        res.redirect(`/vote-rooms?error=${message}`);
      }
}


export{sendProofRequest,connection, isNotLoggedIn, isLoggedIn};
