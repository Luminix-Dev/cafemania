import { ServerListInfo } from "../server/server";
import { IWorldSerializedData } from "../world/world";

export enum PACKET_TYPE {
    WORLD_DATA,
    STOVE_BEGIN_COOK,
    CLIENT_REACH_DOOR,
    CLIENT_REACH_CHAIR,
    ENTER_WORLD,
    LEAVE_WORLD,
    SERVER_LIST,
    JOIN_SERVER,
    JOINED_SERVER
}

export interface IPacket {
    type: number
    data: any
}

export interface IPacketData_JoinServer {
    id: string
}

export interface IPacketData_WorldData {
    worldData: IWorldSerializedData
}

export interface IPacketData_ServerList {
    servers: ServerListInfo[]
}

export interface IPacketData_StoveBeginCookData {
    stoveId: string
    dish: string
}
