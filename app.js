const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const momentTZ = require('moment-timezone');
const crypto = require('crypto');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

// === CLASS MÔ TẢ CẤU TRÚC 1 GIAO DỊCH ===
class transaction {
  constructor(sender, receiver, value) {
    this.sender = sender;
    this.receiver = receiver;
    this.value = value;
  }
}

// === CLASS MÔ TẢ CẤU TRÚC 1 BLOCK
class block {
  constructor(index, transactionList, prevHash) {
    this.index = index;
    this.timestamp = momentTZ.tz('Asia/Bangkok').unix();
    this.transactionList = transactionList;
    this.prevHash = prevHash;
    this.autoIncrease = 0;
    this.hash = this.getHash();
  }

  getHash() {
    const encrypt = JSON.stringify(this.transactionList) + this.prevHash + this.index + this.timestamp + this.autoIncrease;
    const hash = crypto.createHmac('sha256', "Blockchain-make-by-Le-Minh-Duc").update(encrypt).digest('hex');
    return hash;
  }

  mine(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.autoIncrease++;
      this.hash = this.getHash()
    }
    console.log("Mining is done: " + this.hash);
  }
}

// === CLASS MÔ TẢ CẤU TRÚC 1 BLOCKCHAIN
class blockchain {
  constructor() {
    this.chain = [];
    this.difficulty = 1;
    this.chain.push(new block(0, [], '0'));
    this.suspendedTransaction = []; //Là mảng các giao dịch mới thêm vào mảng Blockchain và chưa được Hash xong.
    this.bonus = 1000; //Là phần thưởng dành cho các miner (người đào hash) cho việc thêm mới thành công mảng GiaoDichTamHoan vào Blockchain.
  }

  mineEmoney(myWallet) {
    const index = this.chain.length;
    const suspendedTransaction = this.suspendedTransaction;
    const prevHash = this.chain.length !== 0 ? this.chain[this.chain.length - 1].hash : 0;
    const difficulty = this.difficulty;

    let blockItem = new block(index, suspendedTransaction, prevHash);
    blockItem.mine(difficulty);
    this.chain.push(blockItem);

    this.suspendedTransaction = [new transaction(null, myWallet, this.bonus)];
  }

  createTransaction(newTransaction) {
    this.suspendedTransaction.push(newTransaction);
  }

  checkMoneyInWallet(myWallet) {
    let moneyInWallet = 0;
    this.chain.map(block => {
      block.transactionList.map(transaction => {
        if (transaction.sender === myWallet) {
          moneyInWallet -= transaction.value;
        }
        if (transaction.receiver === myWallet) {
          moneyInWallet += transaction.value;
        }
      })
    });
    return moneyInWallet;
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

const MyCoin = new blockchain();

MyCoin.createTransaction(new transaction('A', 'B', 5000));
MyCoin.createTransaction(new transaction('B', 'C', 3000));

console.log("Bắt đầu đào tiền ảo...");

console.log("Lần 1");
MyCoin.mineEmoney('vi');
console.log(JSON.stringify(MyCoin, true, 2));
console.log("Số tiền trong ví: " + MyCoin.checkMoneyInWallet("vi"));


console.log("Lần 2");
MyCoin.mineEmoney('vi');
console.log(JSON.stringify(MyCoin, true, 2));
console.log("Số tiền trong ví: " + MyCoin.checkMoneyInWallet("vi"));

console.log("Lần 3");
MyCoin.mineEmoney('vi');
console.log(JSON.stringify(MyCoin, true, 2));
console.log("Số tiền trong ví: " + MyCoin.checkMoneyInWallet("vi"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;