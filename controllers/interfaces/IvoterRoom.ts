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
    img:string
}
export interface IRoom{
    [key : string] : string | RoomCategory | Date
}

export interface IVoter{
    name:string,
    email:string,
    tel:string,
}