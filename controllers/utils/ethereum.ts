
// // 이더리움 주소 유효성 확인 함수
// export const isValidEthereumAddress=(address)=> {
//     // 주소가 40자의 hexadecimal인지 확인
//     if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
//         return false;
//     }

//     // 체크섬 확인
//     const cleanAddress = address.toLowerCase().replace('0x', '');
//     const addressHash = web3.utils.sha3(cleanAddress).slice(2); // sha3()는 web3.js 라이브러리에 포함된 함수입니다.
//     for (let i = 0; i < 40; i++) {
//         const addressChar = cleanAddress.charAt(i);
//         const hashChar = addressHash.charAt(i);
//         // 주소의 대소문자와 체크섬 비교
//         if ((parseInt(hashChar, 16) > 7 && addressChar.toUpperCase() !== addressChar) || 
//             (parseInt(hashChar, 16) <= 7 && addressChar.toLowerCase() !== addressChar)) {
//             return false;
//         }
//     }
//     return true;
// }