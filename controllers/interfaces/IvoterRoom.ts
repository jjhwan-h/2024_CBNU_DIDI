enum RoomCategory{
    RESIDENT="주민투표",
    POPULARITY="인기투표",
    PNC="찬반투표"
}
export interface IRoomData{
    name:string,
    category:RoomCategory,
    desc:string,
    s_date:Date,
    e_date:Date,
    img:string
}

export interface IVoter{
    name:string,
    email:string,
    tel:string,
}