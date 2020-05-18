const block = require('./block');

class blockchain {
    constructor() {
        this.chain = [];
    }

    addBlock(data) {
        const index = this.chain.length;
        const prevHash = this.chain.length !== 0 ? this.chain[this.chain.length - 1] : 0;
        const blockItem = new block(index, data, prevHash);
        this.chain.push(blockItem);
    }

    chainIsValid() {
        for (let i = 0; i < this.chain.length; i++) {
            if (this.chain[i].hash !== this.chain[i].getHash()) {
                return false;
            }
            if (i > 0 && this.chain[i].prevHash !== this.chain[i - 1].hash) {
                return false;
            }
        }
        return true;
    }
}