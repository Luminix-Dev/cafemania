export class Node {
    public readonly x: number;
    public readonly y: number;
    public walkable: boolean;
    public get id() { return Node.getId(this.x, this.y); }
    public cameFrom?: Node;

    constructor(x: number, y: number, walkable: boolean) {
        this.x = x;
        this.y = y;
        this.walkable = walkable;
    }

    public static getId(x: number, y: number) {
        return `${x}:${y}`
    }
}

export class PathFind {
    private _nodes = new Map<string, Node>();
    private _startNode: Node;
    private _endNode: Node;
    private _state = 0;
    private _frontier: Node[] = [];
    private _path: Node[] = [];

    public goToClosesetTileIfNotWalkable: boolean = true;
    public get frontier() { return this._frontier; }
    public get state() { return this._state; }
    public get path() { return this._path; }
    public get hasEnded() { return this.state == 2 || this.state == 3; }

    public addNode(x: number, y: number, walkable: boolean) {
        const node = new Node(x, y, walkable);
        this._nodes.set(node.id, node);
    }

    public getNode(x: number, y: number) {
        return this._nodes.get(Node.getId(x, y))!;
    }

    public hasNode(x: number, y: number) {
        return this._nodes.has(Node.getId(x, y));
    }

    public getNodes() {
        return Array.from(this._nodes.values());
    }

    public setStart(x: number, y: number) {
        this._startNode = this.getNode(x, y);
    }

    public setEnd(x: number, y: number) {
        this._endNode = this.getNode(x, y);
    }

    public process() {
        if(this.goToClosesetTileIfNotWalkable) {
            if(!this._endNode.walkable) {
                for (const neighbour of this.getNeighborsOfNode(this._endNode)) {
                    if(neighbour.walkable) {
                        this._endNode = neighbour;
                        break;
                    }
                }
            }
        }

        if(this._state == 0) {
            this._frontier = [this._startNode];
            this._state = 1;
        }

        if(this._state == 1) {
            this.processInitialSearch();
        }

        if(this._state == 2) {
            console.error("End node not found");
        }
    }

    private checkEndGoal(node: Node) {
        if(node == this._endNode) {
            this._state = 3;
            this.makePath();
            return true;
        }

        return false;
    }

    private makePath() {
        this._path = [];

        let node: Node | undefined = this._endNode;

        while(node != undefined) {
            this._path.push(node);

            node = node.cameFrom;
        }

        this._path = this._path.reverse();
    }

    private processInitialSearch() {
        const frontier = this._frontier;

        if(frontier.length == 0) {
            this._state = 2;
            return;
        }

        const current = frontier[0];

        if(this.checkEndGoal(current)) return;

        //console.log(`Processing ${current.id}`)

      

        for (const neighbour of this.getAvaliableNeighborsOfNode(current)) {
            
            if(frontier.includes(neighbour)) continue;
            if(neighbour.cameFrom) continue;

            if(neighbour != this._startNode)
                neighbour.cameFrom = current;

            if(this.checkEndGoal(neighbour)) return;

            frontier.push(neighbour);
        }

        for (const neighbour of this.getNeighborsOfNode(current)) {
            let isAtDiagonals = (Math.abs(neighbour.x - current.x) == 1 && Math.abs(neighbour.y - current.y) == 1)

            if(isAtDiagonals) continue;

            if(neighbour == this._endNode) {
                neighbour.cameFrom = current;
            }
            if(this.checkEndGoal(neighbour)) return;
        }

        this.removeNodeFromArray(current, frontier);

        

        //console.log(`${frontier.length} left`)
    }

    private getAvaliableNeighborsOfNode(node: Node) {
        const neighbours: Node[] = []
        const allNeighbours = this.getNeighborsOfNode(node);
        const posx = node.x
        const posy = node.y

        for (const neighbour of allNeighbours) {
            let isAtDiagonals = (Math.abs(neighbour.x - posx) == 1 && Math.abs(neighbour.y - posy) == 1)
            let canAddThisNeightbour = neighbour.walkable;

            if(isAtDiagonals) {
                let canWalkInThisDiagonal = neighbour.walkable

                //
                const diagonalNeighbours = this.getNeighborsOfNode(neighbour)

                for (const dn of diagonalNeighbours) {

                    let isInsideMainTest = false;
                    for (const a of allNeighbours) {
                        if(a.x == dn.x && a.y == dn.y) {
                            isInsideMainTest = true;
                            break
                        }
                    }

                    if(isInsideMainTest) {
                        if(!dn.walkable && neighbour.walkable) {
                            canWalkInThisDiagonal = false;
                        }
                    }
                    //console.log(`diagonal ${neighbour.x} ${neighbour.y}: test ${dn.x}, ${dn.y} ${isInsideMainTest} (${canWalkInThisDiagonal})`)
                }
                //console.log(`diagonal ${neighbour.x} ${neighbour.y}: (${canWalkInThisDiagonal})`)
                
                canAddThisNeightbour = canWalkInThisDiagonal
                //
            }

            if(canAddThisNeightbour) neighbours.push(neighbour)
        }

        return neighbours;
    }

    private getNeighborsOfNode(node: Node) {
        const neighbours: Node[] = []

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                let nx = node.x + x
                let ny = node.y + y

                if(this.hasNode(nx, ny)) {
                    const neighbour = this.getNode(nx, ny);
                    if(neighbour == node) continue;
                    neighbours.push(neighbour)
                }
            }
        }
        return neighbours
    }

    private removeNodeFromArray<T>(node: T, arr: T[]) {
        arr.splice(arr.indexOf(node), 1);
    }
}