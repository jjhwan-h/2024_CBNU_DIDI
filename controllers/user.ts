import { RequestHandler } from 'express';
import {checkAllInputs} from './utils/checkInput';
import faber from '../src/Faber';
import Email from '../models/email';

const join :RequestHandler=async (req,res,next)=>{ //VC발급
    
    if(checkAllInputs(req.body)){
        const {email, name} = req.body; 
        console.log(email,name)
        try{
            const exEmail = await Email.findOne({where:{email}}); //이메일 검증 확인

            if(exEmail && exEmail.isValid && !exEmail.isRegistered){
                await exEmail.update({isValid:false, isRegistered:true}); //다른 사람이 동일한 이메일로 가입하는 것을 방지
                const url = await faber.printConnectionInvite();
                res.write(url);
                await faber.setupConnection();
                await faber.issueCredential({email,name}); // p2p연결완료 시 VC발급(email, name, tel)
                return res.redirect('/?message=증명서 발급이 완료되었습니다. 요청을 승락해주세요.');
            }
            else{
            return res.redirect(`/?error=이메일 인증을 먼저 해주세요`);
            }
        }catch(error){
        console.error('Error:: While join:', error);
        return next(error);
        }
    }
    else{
        return res.redirect(`/?error=모든 입력을 완료해주세요`);
    }  
}

const logIn:RequestHandler=async (req,res,next)=>{
    console.log(req.body);

    res.end();
}

export {join,logIn}