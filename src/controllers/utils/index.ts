import {transporter} from '../../configs/email';
import { ICandidate, ICandidates } from '../interfaces/ICandidate';
import { IMailOptions } from '../interfaces/IMailOptions';

export const hasOwnProperty=(obj:Object, prop:any) => {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

export const checkAllInputs = (inputData:stringIndexed)=> {
    const keys:string[] = Object.keys(inputData);
  
    // 모든 속성들이 채워져 있는지 확인
    const allInputsValid = keys.every(key => inputData[key]);
    
    return allInputsValid;
  }

interface stringIndexed{
  [key:string]:any;
}

export const decodeBase64 = (base64String: string = ''): string => {
    return Buffer.from(base64String, 'base64').toString('utf-8');
  }

export const sendMail = (mailOptions : IMailOptions) : boolean=>{
  transporter.sendMail(mailOptions,(err,response)=>{
    console.log(response);
    if(err) {
     console.log(err)
     transporter.close() //전송종료
     return false;
    } else {
     transporter.close() //전송종료
    }
    });
    return true;
}

export function hasEmptyValues(obj: ICandidates): boolean {
  for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
          const candidate = obj[key];
          for (const attr in candidate) {
              if (candidate.hasOwnProperty(attr)) {
                  const value = candidate[attr as keyof ICandidate];
                  if (value === "" || value === null || value === undefined) {
                      return true;
                  }
              }
          }
      }
  }
  return false;
}

export const fromBase64 = (base64:string) =>{
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
