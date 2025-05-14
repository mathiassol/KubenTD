class SpatialGrid {
    constructor(cellSize = 20) {
        this.cellSize = cellSize;
        this.grid = new Map();
    }

    // Get grid cell key from position
    getKey(x, z) {
        const gridX = Math.floor(x / this.cellSize);
        const gridZ = Math.floor(z / this.cellSize);
        return `${gridX},${gridZ}`;
    }

    // Add entity to grid
    add(entity) {
        const key = this.getKey(entity.position.x, entity.position.z);
        if (!this.grid.has(key)) {
            this.grid.set(key, new Set());
        }
        this.grid.get(key).add(entity);
    }

    // Remove entity from grid
    remove(entity) {
        const key = this.getKey(entity.position.x, entity.position.z);
        const cell = this.grid.get(key);
        if (cell) {
            cell.delete(entity);
            if (cell.size === 0) {
                this.grid.delete(key);
            }
        }
    }

    // Get nearby entities
    getNearby(position, range) {
        const nearby = new Set();
        const startX = Math.floor((position.x - range) / this.cellSize);
        const endX = Math.floor((position.x + range) / this.cellSize);
        const startZ = Math.floor((position.z - range) / this.cellSize);
        const endZ = Math.floor((position.z + range) / this.cellSize);

        for (let x = startX; x <= endX; x++) {
            for (let z = startZ; z <= endZ; z++) {
                const key = `${x},${z}`;
                const cell = this.grid.get(key);
                if (cell) {
                    for (const entity of cell) {
                        nearby.add(entity);
                    }
                }
            }
        }
        return nearby;
    }

    // Update entity position
    update(entity) {
        this.remove(entity);
        this.add(entity);
    }
}

export default SpatialGrid;