import { IWorldSerializedData } from "../world/world";

export enum PACKET_TYPE {
    WORLD_DATA,
    STOVE_BEGIN_COOK,
    CLIENT_REACH_DOOR,
    CLIENT_REACH_CHAIR,
    ENTER_WORLD
}

export interface IPacket {
    type: number
    data: any
}

export interface IPacketData_WorldData {
    worldData: IWorldSerializedData
}

export interface IPacketData_StoveBeginCookData {
    stoveId: string
    dish: string
}
