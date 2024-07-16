
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