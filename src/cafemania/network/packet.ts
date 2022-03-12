import { IUserInfo } from "../client/user";
import { ServerListInfo } from "../server/server";
import { IWorldSerializedData } from "../world/world";

export enum PACKET_TYPE {
    WORLD_DATA,
    START_COOK,
    STOVE_TAKE_DISH,
    CLIENT_REACH_DOOR,
    CLIENT_REACH_CHAIR,
    ENTER_WORLD,
    LEAVE_WORLD,
    SERVER_LIST,
    JOIN_SERVER,
    JOIN_SERVER_STATUS,
    LEAVE_SERVER,
    JOINED_SERVER,
    REQUEST_SERVER_LIST,
    MOVE_PLAYER,
    SIGN_IN,
    SIGN_IN_RESULT,
    BUY_TILEITEM,
    MOVE_TILEITEM
}

export interface IPacket {
    type: number
    data: any
}

export interface IPacketData_JoinServer {
    id: string
}

export interface IPacketData_SignIn {
    id?: string
}

export interface IPacketData_SignInResult {
    success: boolean
    userInfo?: IUserInfo
}

export interface IPacketData_MovePlayer {
    x: number
    y: number
}

export interface IPacketData_WorldData {
    worldData: IWorldSerializedData
}

export interface IPacketData_JoinServerStatus {
    success: boolean
}


export interface IPacketData_ServerList {
    servers: ServerListInfo[]
}

export interface IPacketData_StartCook {
    stoveId: string
    dish: string
}

export interface IPacketData_StoveTakeDish {
    stoveId: string
}

export interface IPacketData_BuyTileItem {
    id: string
    x: number
    y: number
}

export interface IPacketData_MoveTileItem {
    id: string
    x: number
    y: number
}