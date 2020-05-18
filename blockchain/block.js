const crypto = require('crypto');

class block {
    constructor(index, data, prevHash) {
        this.index = index;
        this.timestamp = Math.floor(Date.now() / 1000);
        this.data = data;
        this.prevHash = prevHash;
        this.hash = this.getHash();
    }

    getHash() {
        const encrypt = JSON.stringify(this.data) + this.prevHash + this.index + this.timestamp;
        const hash = crypto.createHmac('sha256', "Blockchain-make-by-Le-Minh-Duc").update(encrypt).digest('hex');
        return hash;
    }
}

module.exports = block;