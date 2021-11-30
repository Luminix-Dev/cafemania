import { Debug } from "../debug/debug";
import { Dish } from "../dish/dish";
import { Gameface } from "../gameface/gameface";
import { IPacketData_StoveBeginCookData, IPacketData_WorldData, PACKET_TYPE } from "../network/packet";
import { Player, PlayerType } from "../player/player";
import { PlayerClient, PlayerClientState } from "../player/playerClient";
import { PlayerWaiter } from "../player/playerWaiter";
import { PlayerTaskType, TaskPlayAnimation, TaskWalkToTile } from "../player/taskManager";
import { TileItemStove } from "../tileItem/items/tileItemStove";
import { IWorldSerializedData, World } from "./world";
import { WorldEvent } from "./worldEvents";

export class WorldSyncHelper {
    public static get world() { return this._world; }

    private static _world: World;

    public static setWorld(world: World) {
        this._world = world;

        world.events.on(WorldEvent.TILE_ITEM_STOVE_START_COOK, (stove: TileItemStove, dish: Dish) => {
            console.log("ev", stove, dish)

            const packetData: IPacketData_StoveBeginCookData = {
                stoveId: stove.id,
                dish: dish.id
            }

            Gameface.Instance.network.send(PACKET_TYPE.STOVE_BEGIN_COOK, packetData);
        })
    }

    public static processWorldData(worldData: IWorldSerializedData) {
        const world = this.world;
        const tileItemFactory = world.game.tileItemFactory;

        if(worldData.sidewalkSize)
            world.generateSideWalks(worldData.sidewalkSize);

        console.log(worldData)

        if(worldData.tiles.length > 0) {
            //Debug.log(`${}`);
        }

        worldData.tiles.map(tileData => {
            if(!world.tileMap.tileExists(tileData.x, tileData.y)) {
                world.tileMap.addTile(tileData.x, tileData.y);
            }
        });

        worldData.tiles.map(tileData => {
            const tile =  world.tileMap.getTile(tileData.x, tileData.y);

            for (const tileItemData of tileData.tileItems) {
                
                if(!tileItemFactory.hasTileItemCreated(tileItemData.id)) {
                    tileItemFactory.createTileItem(tileItemData.tileItemInfo, tileItemData.id);
                }

                const tileItem = tileItemFactory.getTileItem(tileItemData.id);

                if(!tileItem.isAtAnyTile) world.moveTileItemToTile(tileItem, tile.x, tile.y);

                if(tileItem.direction != tileItemData.direction) tileItem.setDirection(tileItemData.direction);

                if(tileItemData.data) {

                    tileItem.unserializeData(tileItemData.data);
                }
            }
        });

        worldData.players.map(playerData => {

            let player: Player | undefined;

            if(playerData.type == PlayerType.CLIENT) {
                if(!world.hasPlayer(playerData.id)) {
                    player = new PlayerClient(world);
                    player.id = playerData.id;
                    world.addPlayer(player);
                    player.setAtTileCoord(playerData.x, playerData.y);
                }
            }

            if(playerData.type == PlayerType.WAITER) {
                if(!world.hasPlayer(playerData.id)) {
                    player = new PlayerWaiter(world);
                    player.id = playerData.id;
                    world.addPlayer(player);
                    player.setAtTileCoord(playerData.x, playerData.y);
                }
            }

            player = world.getPlayer(playerData.id);

            if(player) {


                for (const taskData of playerData.tasks) {
                    

                    if(!player.taskManager.hasTask(taskData.taskId)) {
                        console.warn("add task")

                        if(taskData.taskType == PlayerTaskType.WALK_TO_TILE) {
                            const tile = player.world.tileMap.getTile(taskData.tileX!, taskData.tileY!);
                            
                            const task = new TaskWalkToTile(player, tile);
                            task.id = taskData.taskId;
                            player.taskManager.addTask(task);

                        }

                        if(taskData.taskType == PlayerTaskType.PLAY_ANIM) {
                            const task = new TaskPlayAnimation(player, taskData.anim!, taskData.time!);
                            task.id = taskData.taskId;
                            player.taskManager.addTask(task);
                        }
                    }
                    
                    
                }

                //player.clearMovements();
                //player.setAtTileCoord(playerData.x, playerData.y);

                /*
                if(player.type == PlayerType.CLIENT) {
                    (player as PlayerClient).data = playerData.data;
                }

                if(player.type == PlayerType.WAITER) {
                    (player as PlayerWaiter).data = playerData.data;
                }
                */

            }
        });
    }
}