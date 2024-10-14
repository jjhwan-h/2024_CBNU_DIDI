import {transporter} from '../../configs/email';
import { ICandidate, ICandidates } from '../interfaces/ICandidate';
import { IMailOptions } from '../interfaces/IMailOptions';
import ntpClient from 'ntp-client';
import moment, { Moment } from 'moment-timezone';

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

export const getCurrentTime = (): Promise<Moment>=>{
  return new Promise((resolve, reject) => {
    ntpClient.getNetworkTime("pool.ntp.org", 123, (err, date) => {
      if (err) {
        console.error("NTP 서버에서 시간을 가져오는 데 실패했습니다.", err);
        reject(err);  // 에러 발생 시 Promise를 reject
        return;
      }
      
      let seoulTime = moment(date).tz("Asia/Seoul");
      seoulTime = seoulTime.set({minute:0, second: 0, millisecond: 0 });
      console.log("NTP 서버에서 받은 시간 (서울 시간):", seoulTime);
      resolve(seoulTime);  // 성공 시 Promise를 resolve
    });
  });
}
