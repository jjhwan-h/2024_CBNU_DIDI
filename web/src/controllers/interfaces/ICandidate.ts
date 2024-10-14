
export interface ICandidate {
    num:number;
    name: string;
    gender: string;
    age: string;
    desc: string;
    img:string;
    count:number;
    RoomId:number;
}

export interface ICandidates {
    [key: string]: ICandidate;
}

export type ICandidateAttr = "name" | "gender" | "age" | "desc" | "img" |"num";

