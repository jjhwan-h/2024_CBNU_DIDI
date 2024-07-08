import faber from "../src/Faber"
import { RequestHandler } from 'express';
import qrcode from 'qrcode';

const sendProofRequest:RequestHandler = async (req,res,next) =>{
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    const url = await faber.printConnectionInvite();
    const qr = await qrcode.toDataURL(url);
        res.write(`id:1\n`);
        res.write(`data:${JSON.stringify({url,qr})}\n\n`);
    await faber.setupConnection(); 
    await faber.sendProofRequest();
    res.write("waiting for acceptance");
};

export{sendProofRequest};
