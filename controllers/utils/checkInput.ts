export const checkAllInputs = (inputData:stringIndexed)=> {
    const keys:string[] = Object.keys(inputData);
  
    // 모든 속성들이 채워져 있는지 확인
    const allInputsValid = keys.every(key => inputData[key]);
    
    return allInputsValid;
  }

interface stringIndexed{
  [key:string]:any;
}