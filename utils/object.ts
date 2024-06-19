// 유틸리티 함수 정의
export function hasOwnProperty(obj:Object, prop:any) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}