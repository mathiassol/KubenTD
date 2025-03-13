class ObjectPool {
    constructor(createFunc, resetFunc, size = 10) {
        this.createFunc = createFunc;
        this.resetFunc = resetFunc;
        this.pool = [];
        for (let i = 0; i < size; i++) {
            this.pool.push(this.createFunc());
        }
    }

    acquire() {
        return this.pool.length > 0 ? this.pool.pop() : this.createFunc();
    }

    release(obj) {
        this.resetFunc(obj);
        this.pool.push(obj);
    }
}

export { ObjectPool };