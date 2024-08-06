enum RoomCategory{
    RESIDENT="주민투표",
    POPULARITY="인기투표",
    PNC="찬반투표"
}

export interface IRoomData{
    name:string,
    category:RoomCategory,
    desc:string,
    sDate:Date,
    eDate:Date,
    img:string,
    creator:number,
    voterCount:number
}
export interface IRoom{
    [key : string] : string | RoomCategory | Date | number
}

export interface IVoter{
    name:string,
    email:string,
    tel:string,
}