import { ServerListInfo } from "../server/server";
import { IWorldSerializedData } from "../world/world";

export enum PACKET_TYPE {
    WORLD_DATA,
    START_COOK,
    CLIENT_REACH_DOOR,
    CLIENT_REACH_CHAIR,
    ENTER_WORLD,
    LEAVE_WORLD,
    SERVER_LIST,
    JOIN_SERVER,
    LEAVE_SERVER,
    JOINED_SERVER,
    REQUEST_SERVER_LIST,
    MOVE_PLAYER
}

export interface IPacket {
    type: number
    data: any
}

export interface IPacketData_JoinServer {
    id: string
}


export interface IPacketData_MovePlayer {
    x: number
    y: number
}

export interface IPacketData_WorldData {
    worldData: IWorldSerializedData
}

export interface IPacketData_ServerList {
    servers: ServerListInfo[]
}

export interface IPacketData_StartCook {
    stoveId: string
    dish: string
}
