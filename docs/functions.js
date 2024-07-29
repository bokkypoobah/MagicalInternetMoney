var ADDRESS0 = "0x0000000000000000000000000000000000000000";
var STEALTHMETAADDRESS0 = "st:eth:0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
const ADDRESS_ETHEREUMS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const SECP256K1_N = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141";

var MILLISPERDAY = 60 * 60 * 24 * 1000;
var DEFAULTEXPIRYUTCHOUR = 8;
var DEFAULTEXPIRYUTCDAYOFWEEK = 5; // Friday moment.js
var DEFAULTTYPE = 0xff;
var DEFAULTDECIMAL = 0xff;

function formatNumber(n) {
    return n == null ? "" : n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var logLevel = 1;
// 0 = NONE, 1 = INFO (default), 2 = DEBUG
function setLogLevel(_logLevel) {
  logLevel = _logLevel;
}

function logDebug(s, t) {
  if (logLevel > 1) {
    console.log(new Date().toLocaleTimeString() + " DEBUG " + s + ":" + t);
  }
}

function logInfo(s, t) {
  if (logLevel > 0) {
    console.log(new Date().toLocaleTimeString() + " INFO " + s + ":" + t);
  }
}

function logError(s, t) {
  console.error(new Date().toLocaleTimeString() + " ERROR " + s + ":" + t);
}

function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

// https://stackoverflow.com/questions/33702838/how-to-append-bytes-multi-bytes-and-buffer-to-arraybuffer-in-javascript
function concatTypedArrays(a, b) { // a, b TypedArray of same type
    var c = new (a.constructor)(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
}
function concatBuffers(a, b) {
    return concatTypedArrays(
        new Uint8Array(a.buffer || a),
        new Uint8Array(b.buffer || b)
    ).buffer;
}
function concatBytesOld(ui8a, byte) {
    var b = new Uint8Array(1);
    b[0] = byte;
    return concatTypedArrays(ui8a, b);
}

function concatByte(ui8a, byte) {
    var view = new Uint8Array(ui8a);
    var result = new Uint8Array(view.length + 1);
    var i;
    for (i = 0; i < view.length; i++) {
      result[i] = view[i];
    }
    result[view.length] = byte;
    return result;
}

function concatBytes(ui8a, ui8b) {
    var viewa = new Uint8Array(ui8a);
    var viewb = new Uint8Array(ui8b);
    var result = new Uint8Array(viewa.length + viewb.length);
    var i;
    var offset = 0;
    for (i = 0; i < viewa.length; i++) {
      result[offset++] = viewa[i];
    }
    for (i = 0; i < viewb.length; i++) {
      result[offset++] = viewb[i];
    }
    return result;
}

function ethereumSignedMessageHashOfText(text) {
  var hashOfText = keccak256.array(text);
  return ethereumSignedMessageHashOfHash(hashOfText);
}

function ethereumSignedMessageHashOfHash(hash) {
  // https://github.com/emn178/js-sha3
  var data = new Uint8Array("");
  var data1 = concatByte(data, 0x19);
  var ethereumSignedMessageBytes = new TextEncoder("utf-8").encode("Ethereum Signed Message:\n32");
  var data2 = concatBytes(data1, ethereumSignedMessageBytes);
  var data3 = concatBytes(data2, hash);
  return "0x" + toHexString(keccak256.array(data3));
}

function parseToText(item) {
  if (item == null) {
    return "(null)";
  } else if (Array.isArray(item)) {
    return JSON.stringify(item);
  } else if (typeof item === "object") {
    return JSON.stringify(item);
  } else {
    return item;
  }
}

// function escapeJSON(j) {
//
// }

// https://stackoverflow.com/questions/14438187/javascript-filereader-parsing-long-file-in-chunks
// with my addition of the finalised variable in the callback
function parseFile(file, callback) {
    var fileSize   = file.size;
    var chunkSize  = 64 * 1024; // bytes
    // var chunkSize  = 1; // bytes
    var offset     = 0;
    var self       = this; // we need a reference to the current object
    var chunkReaderBlock = null;

    var readEventHandler = function(evt) {
        if (evt.target.error == null) {
            offset += evt.target.result.byteLength;
            callback(evt.target.result, offset <= chunkSize, false); // callback for handling read chunk
        } else {
            console.log("Read error: " + evt.target.error);
            return;
        }
        if (offset >= fileSize) {
            callback("", false, true);
            return;
        }

        // of to the next chunk
        chunkReaderBlock(offset, chunkSize, file);
    }

    chunkReaderBlock = function(_offset, length, _file) {
        var r = new FileReader();
        var blob = _file.slice(_offset, length + _offset);
        r.onload = readEventHandler;
        r.readAsArrayBuffer(blob);
    }

    // now let's start the read with the first block
    chunkReaderBlock(offset, chunkSize, file);
}

// baseUrl: http://x.y.z/media/list
// filter : { a: 1, b: 2, c: 3 }
// fields: [ "a", "b", "c" ]
function buildFilterUrl(baseUrl, filter, fields) {
  var url = baseUrl;
  var separator = "?";
  fields.forEach(function(f) {
    if (filter[f] !== undefined && filter[f] !== null && filter[f] !== "") {
      url = url + separator + f + "=" + filter[f];
      separator = "&";
    }
  })
  return encodeURI(url);
}


function getTermFromSeconds(term) {
  if (term > 0) {
    var secs = parseInt(term);
    var mins = parseInt(secs / 60);
    secs = secs % 60;
    var hours = parseInt(mins / 60);
    mins = mins % 60;
    var days = parseInt(hours / 24);
    hours = hours % 24;
    var s = "";
    if (days > 0) {
      s += days + "d ";
    }
    if (hours > 0) {
      s += hours + "h ";
    }
    if (mins > 0) {
      s += mins + "m ";
    }
    if (secs > 0) {
      s += secs + "s";
    }
    return s;
  } else {
    return "";
  }
}


// -----------------------------------------------------------------------------
// Next 2 functions
//
// callPut, decimals0 and rateDecimals must be parseInt(...)-ed
// strike, bound, spot and baseTokens must be BigNumber()s, converted to the
// appropriate decimals
// -----------------------------------------------------------------------------

// function shiftRightThenLeft(uint amount, uint right, uint left) internal pure returns (uint _result) {
//     if (right == left) {
//         return amount;
//     } else if (right > left) {
//         return amount.mul(10 ** (right - left));
//     } else {
//         return amount.div(10 ** (left - right));
//     }
// }
function shiftRightThenLeft(amount, right, left) {
  if (right == left) {
    return amount;
  } else if (right > left) {
    return amount.shift(right - left);
  } else {
    return amount.shift(-(left - right));
  }
}

// https://ourcodeworld.com/articles/read/278/how-to-split-an-array-into-chunks-of-the-same-size-easily-in-javascript
function chunkArray(myArray, chunk_size) {
  var results = [];
  while (myArray.length) {
    results.push(myArray.splice(0, chunk_size));
  }
  return results;
}

const generateRange = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

const now = () => moment().format("HH:mm:ss");

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

const delay = ms => new Promise(res => setTimeout(res, ms));

function getExchangeRate(date, exchangeRates) {
  for (let lookback = 0; lookback < 10; lookback++) {
    const searchDate = moment(date).subtract(lookback, 'days').format("YYYYMMDD");
    if (searchDate in exchangeRates) {
      return { date: searchDate, rate: exchangeRates[searchDate] };
    }
  }
  return { date: null, rate: null };
}

const imageUrlToBase64 = async url => {
  const response = await fetch(url);
  if (response.ok) {
    const blob = await response.blob();
    return new Promise((onSuccess, onError) => {
      try {
        const reader = new FileReader() ;
        reader.onload = function(){ onSuccess(this.result) } ;
        reader.readAsDataURL(blob) ;
      } catch(e) {
        onError(e);
      }
    });
  } else {
    return null;
  }
};

// https://stackoverflow.com/questions/36280818/how-to-convert-file-to-base64-in-javascript/36281449#36281449
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});

function getTimeDiff(ts) {
  if (ts > 0) {
    var secs = parseInt(new Date() / 1000 - ts);
    var mins = parseInt(secs / 60);
    secs = secs % 60;
    var hours = parseInt(mins / 60);
    mins = mins % 60;
    var days = parseInt(hours / 24);
    hours = hours % 24;
    var s = "";
    if (days > 0) {
      s += days + "d ";
    }
    if (hours > 0) {
      s += hours + "h ";
    }
    if (mins > 0) {
      s += mins + "m ";
    }
    if (secs > 0) {
      s += secs + "s";
    }
    return "-" + s;
  } else {
    return "";
  }
}

const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    })
  );

function parseReservoirTokenData(info) {
  // console.log("info: " + JSON.stringify(info, null, 2));
  const result = {};
  const token = info.token;
  const market = info.market;
  result.chainId = token.chainId;
  result.contract = ethers.utils.getAddress(token.contract);
  result.type = token.kind;
  result.tokenId = token.tokenId;
  try {
    result.owner = ethers.utils.getAddress(token.owner);
  } catch (e) {
    console.log("parseReservoirTokenData - ERROR: name: " + name + ", owner: " + token.owner + ", error: " + e.message + " info: " + JSON.stringify(info, null, 2));
    result.owner = ADDRESS0;
  }
  result.slug = token.collection && token.collection.slug || null;
  result.collectionSymbol = token.collection && token.collection.symbol || null;
  result.collectionName = token.collection && token.collection.name || null;
  result.name = token.name;
  result.description = token.description;
  // if (token.image == null && token.metadata && token.metadata.tokenURI) {
  //   result.image = token.metadata.tokenURI;
  // } else {
    result.image = token.image;
  // }
  result.attributes = [];
  if (token.attributes) {
    for (const attribute of token.attributes) {
      result.attributes.push({ trait_type: attribute.key, value: attribute.value });
    }
  }
  // const createdRecord = token.attributes.filter(e => e.key == "Created Date");
  // result.created = createdRecord.length == 1 && createdRecord[0].value && parseInt(createdRecord[0].value) || null;
  // if (result.contract == ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS) {
  //   const registrationRecord = token.attributes.filter(e => e.key == "Registration Date");
  //   result.registration = registrationRecord.length == 1 && registrationRecord[0].value && parseInt(registrationRecord[0].value) || null;
  // } else {
  //   result.registration = result.created;
  // }
  // if (result.contract == ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS) {
  //   const expiryRecord = token.attributes.filter(e => e.key == "Expiration Date");
  //   result.expiry = expiryRecord.length == 1 && expiryRecord[0].value && parseInt(expiryRecord[0].value) || null;
  // } else {
  //   const expiryRecord = token.attributes.filter(e => e.key == "Namewrapper Expiry Date");
  //   result.expiry = expiryRecord.length == 1 && expiryRecord[0].value && parseInt(expiryRecord[0].value) || null;
  // }
  // const characterSetRecord = token.attributes.filter(e => e.key == "Character Set");
  // result.characterSet = characterSetRecord.length == 1 && characterSetRecord[0].value || null;
  // const lengthRecord = token.attributes.filter(e => e.key == "Length");
  // result.length = lengthRecord.length == 1 && lengthRecord[0].value && parseInt(lengthRecord[0].value) || null;
  // const segmentLengthRecord = token.attributes.filter(e => e.key == "Segment Length");
  // result.segmentLength = segmentLengthRecord.length == 1 && segmentLengthRecord[0].value && parseInt(segmentLengthRecord[0].value) || null;
  const lastSaleTimestamp = token.lastSale && token.lastSale.timestamp || null;
  const lastSaleCurrency = token.lastSale && token.lastSale.price && token.lastSale.price.currency && token.lastSale.price.currency.symbol || null;
  const lastSaleAmount = token.lastSale && token.lastSale.price && token.lastSale.price.amount && token.lastSale.price.amount.native || null;
  const lastSaleAmountUSD = token.lastSale && token.lastSale.price && token.lastSale.price.amount && token.lastSale.price.amount.usd || null;
  if (lastSaleAmount) {
    result.lastSale = {
      timestamp: lastSaleTimestamp,
      currency: lastSaleCurrency,
      amount: lastSaleAmount,
      amountUSD: lastSaleAmountUSD,
    };
  } else {
    result.lastSale = null;
  }
  const priceExpiry = market.floorAsk && market.floorAsk.validUntil && parseInt(market.floorAsk.validUntil) || null;
  const priceSource = market.floorAsk && market.floorAsk.source && market.floorAsk.source.domain || null;
  const priceCurrency = market.floorAsk && market.floorAsk.price && market.floorAsk.price.currency && market.floorAsk.price.currency.symbol || null;
  const priceAmount = market.floorAsk && market.floorAsk.price && market.floorAsk.price.amount && market.floorAsk.price.amount.native || null;
  const priceAmountUSD = market.floorAsk && market.floorAsk.price && market.floorAsk.price.amount && market.floorAsk.price.amount.usd || null;
  if (priceAmount) {
    result.price = {
      source: priceSource,
      expiry: priceExpiry,
      currency: priceCurrency,
      amount: priceAmount,
      amountUSD: priceAmountUSD,
    };
  } else {
    result.price = null;
  }
  const topBidCurrency = market.topBid && market.topBid.price && market.topBid.price.currency && market.topBid.price.currency.symbol || null;
  const topBidAmount = market.topBid && market.topBid.price && market.topBid.price.amount && market.topBid.price.amount.native || null;
  const topBidAmountUSD = market.topBid && market.topBid.price && market.topBid.price.amount && market.topBid.price.amount.usd || null;
  const topBidNetAmount = market.topBid && market.topBid.price && market.topBid.price.netAmount && market.topBid.price.netAmount.native || null;
  const topBidNetAmountUSD = market.topBid && market.topBid.price && market.topBid.price.netAmount && market.topBid.price.netAmount.usd || null;
  if (topBidNetAmount) {
    result.topBid = {
      currency: topBidCurrency,
      amount: topBidAmount,
      amountUSD: topBidAmountUSD,
      netAmount: topBidNetAmount,
      netAmountUSD: topBidNetAmountUSD,
    };
  } else {
    result.topBid = null;
  }
  // console.log("result: " + JSON.stringify(result, null, 2));
  return result;
}

// scientific.collections.eth
//           1         2         3         4         5
// 012345678901234567890123456789012345678901234567890123456789
// 0x0a736369656e74696669630b636f6c6c656374696f6e730365746800
//
//   0a                                                                 10
//     736369656e7469666963                                             scientific
//                         0b                                           11
//                           636f6c6c656374696f6e73                     collections
//                                                 03                   3
//                                                   657468             eth
//                                                         00           0
// const results = decodeNameWrapperBytes("0x0a736369656e74696669630b636f6c6c656374696f6e730365746800");
// console.log("results: " + JSON.stringify(results)); // results: ["scientific","collections","eth"]
function decodeNameWrapperBytes(b) {
  let start = 4;
  let len = ethers.BigNumber.from("0x" + b.substring(2, 4));
  const parts = [];
  while (len > 0) {
    const str = b.substring(start, start + len * 2);
    let strUtf8 = ethers.utils.toUtf8String("0x" + str);
    parts.push(strUtf8);
    const s = b.substring(start + len * 2, start + len * 2 + 2);
    const newStart = start + len * 2 + 2;
    len = ethers.BigNumber.from("0x" + b.substring(start + len * 2, start + len * 2 + 2));
    start = newStart;
  }
  return parts;
}


// ENS: Old ETH Registrar Controller 1 @ 0xF0AD5cAd05e10572EfcEB849f6Ff0c68f9700455 deployed Apr-30-2019 03:54:13 AM +UTC
// ENS: Old ETH Registrar Controller 2 @ 0xB22c1C159d12461EA124b0deb4b5b93020E6Ad16 deployed Nov-04-2019 12:43:55 AM +UTC
// ENS: Old ETH Registrar Controller @ 0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5 deployed Jan-30-2020 12:56:38 AM +UTC
// ENS: ETH Registrar Controller @ 0x253553366Da8546fC250F225fe3d25d0C782303b deployed Mar-28-2023 11:44:59 AM +UTC

const VALID_ENS_CONTRACTS = {
  "0xF0AD5cAd05e10572EfcEB849f6Ff0c68f9700455": "ENS: Old ETH Registrar Controller 1",
  "0xB22c1C159d12461EA124b0deb4b5b93020E6Ad16": "ENS: Old ETH Registrar Controller 2",
  "0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5": "ENS: Old ETH Registrar Controller",
  "0x253553366Da8546fC250F225fe3d25d0C782303b": "ENS: ETH Registrar Controller",
  "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401": "ENS: Name Wrapper",
  "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85": "ENS: Base Registrar Implementation",
  "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e": "ENS: Registry with Fallback",
  "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63": "ENS: Public Resolver",
  "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41": "ENS: Public Resolver 2",
  "0x226159d592E2b063810a10Ebf6dcbADA94Ed68b8": "ENS: Old Public Resolver 2",
  "0x314159265dD8dbb310642f98f50C066173C1259b": "ENS: Eth Name Service",
  "0xFaC7BEA255a6990f749363002136aF6556b31e04": "ENS: Old ENS Token",
};

function processENSEventLogs(logs) {
  // console.log("processENSEventLogs - logs: " + JSON.stringify(logs, null, 2));
  const erc721Interface = new ethers.utils.Interface(ERC721ABI);
  const erc1155Interface = new ethers.utils.Interface(ERC1155ABI);
  // const oldETHRegistarController1Interface = new ethers.utils.Interface(ENS_OLDETHREGISTRARCONTROLLER1_ABI);
  // const oldETHRegistarController2Interface = new ethers.utils.Interface(ENS_OLDETHREGISTRARCONTROLLER2_ABI);
  const ethBaseRegistarImplementationInterface = new ethers.utils.Interface(ENS_BASEREGISTRARIMPLEMENTATION_ABI);
  const oldETHRegistarControllerInterface = new ethers.utils.Interface(ENS_OLDETHREGISTRARCONTROLLER_ABI);
  // const ethRegistarControllerInterface = new ethers.utils.Interface(ENS_ETHREGISTRARCONTROLLER_ABI);
  const nameWrapperInterface = new ethers.utils.Interface(ENS_NAMEWRAPPER_ABI);
  const registryWithFallbackInterface = new ethers.utils.Interface(ENS_REGISTRYWITHFALLBACK_ABI);
  const publicResolverInterface = new ethers.utils.Interface(ENS_PUBLICRESOLVER_ABI);
  const publicResolver2Interface = new ethers.utils.Interface(ENS_PUBLICRESOLVER2_ABI);

  const records = [];
  for (const log of logs) {
    if (!log.removed) {
      const contract = log.address;
      let eventRecord = null;
      if (contract in VALID_ENS_CONTRACTS) {
        if (log.topics[0] == "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef") {
          // Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
          const logData = ethBaseRegistarImplementationInterface.parseLog(log);
          const [from, to, tokenId] = logData.args;
          eventRecord = { type: "Transfer", from, to, tokenId: tokenId.toString() };

        } else if (log.topics[0] == "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62") {
          // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
          const logData = erc1155Interface.parseLog(log);
          const [operator, from, to, id, value] = logData.args;
          tokenId = ethers.BigNumber.from(id).toString();
          eventRecord = { type: "TransferSingle", operator, from, to, tokenId, value: value.toString(), eventType: "erc1155" };
        } else if (log.topics[0] == "0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb") {
          // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
          const logData = erc1155Interface.parseLog(log);
          const [operator, from, to, ids, values] = logData.args;
          const tokenIds = ids.map(e => ethers.BigNumber.from(e).toString());
          eventRecord = { type: "TransferBatch", operator, from, to, tokenIds, values: values.map(e => e.toString()), eventType: "erc1155" };

        } else if (log.topics[0] == "0xb3d987963d01b2f68493b4bdb130988f157ea43070d4ad840fee0466ed9370d9") {
          // NameRegistered (index_topic_1 uint256 id, index_topic_2 address owner, uint256 expires)
          const logData = ethBaseRegistarImplementationInterface.parseLog(log);
          const [labelhash, owner, expires] = logData.args;
          eventRecord = { type: "NameRegistered", labelhash: labelhash.toHexString(), owner, expires: parseInt(expires) };
        } else if (log.topics[0] == "0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f") {
          // ERC-721 NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires)
          const logData = oldETHRegistarControllerInterface.parseLog(log);
          const [name, label, owner, cost, expires] = logData.args;
          eventRecord = { type: "NameRegistered", label: name, labelhash: label, owner, cost: cost.toString(), expires: parseInt(expires) };
        } else if (log.topics[0] == "0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae") {
          // ERC-721 NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
          const logData = oldETHRegistarControllerInterface.parseLog(log);
          const [name, label, cost, expiry] = logData.args;
          if (ethers.utils.isValidName(name)) {
            eventRecord = { type: "NameRenewed", label: name, cost: cost.toString(), expiry: parseInt(expiry) };
          }
        } else if (log.topics[0] == "0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340") {
          // ERC-1155 NameWrapped (index_topic_1 bytes32 node, bytes name, address owner, uint32 fuses, uint64 expiry)
          const logData = nameWrapperInterface.parseLog(log);
          const [node, name, owner, fuses, expiry] = logData.args;
          let parts = decodeNameWrapperBytes(name);
          let nameString = parts.join(".");
          let label = null;
          if (parts.length >= 2 && parts[parts.length - 1] == "eth" && ethers.utils.isValidName(nameString)) {
            label = parts.join(".").replace(/\.eth$/, '');
          }
          // const subdomain = parts.length >= 3 && parts[parts.length - 3] || null;
          if (ethers.utils.isValidName(label)) {
            eventRecord = { type: "NameWrapped", label, owner, fuses, expiry: parseInt(expiry) };
            // if (subdomain) {
            //   console.log("With subdomain: " + nameString + " & " + JSON.stringify(eventRecord, null, 2));
            // }
          }
        } else if (log.topics[0] == "0xee2ba1195c65bcf218a83d874335c6bf9d9067b4c672f3c3bf16cf40de7586c4") {
          // ERC-1155 NameUnwrapped (index_topic_1 bytes32 node, address owner)
          const logData = nameWrapperInterface.parseLog(log);
          const [node, owner] = logData.args;
          eventRecord = { type: "NameUnwrapped", node, owner };

        } else if (log.topics[0] == "0x335721b01866dc23fbee8b6b2c7b1e14d6f05c28cd35a2c934239f94095602a0") {
          // NewResolver (index_topic_1 bytes32 node, address resolver)
          const logData = registryWithFallbackInterface.parseLog(log);
          const [node, resolver] = logData.args;
          eventRecord = { type: "NewResolver", node, resolver };
        } else if (log.topics[0] == "0xce0457fe73731f824cc272376169235128c118b49d344817417c6d108d155e82") {
          // NewOwner (index_topic_1 bytes32 node, index_topic_2 bytes32 label, address owner)
          const logData = registryWithFallbackInterface.parseLog(log);
          const [node, label, owner] = logData.args;
          eventRecord = { type: "NewOwner", node, label, owner };

        } else if (log.topics[0] == "0xb7d29e911041e8d9b843369e890bcb72c9388692ba48b65ac54e7214c4c348f7") {
          // NameChanged (index_topic_1 bytes32 node, string name)
          const logData = publicResolverInterface.parseLog(log);
          const [node, name] = logData.args;
          eventRecord = { type: "NameChanged", node, name };
        } else if (log.topics[0] == "0x52d7d861f09ab3d26239d492e8968629f95e9e318cf0b73bfddc441522a15fd2") {
          // AddrChanged (index_topic_1 bytes32 node, address a)
          const logData = publicResolverInterface.parseLog(log);
          const [node, a] = logData.args;
          eventRecord = { type: "AddrChanged", node, a };
        } else if (log.topics[0] == "0x65412581168e88a1e60c6459d7f44ae83ad0832e670826c05a4e2476b57af752") {
          // AddressChanged (index_topic_1 bytes32 node, uint256 coinType, bytes newAddress)
          const logData = publicResolverInterface.parseLog(log);
          const [node, coinType, newAddress] = logData.args;
          eventRecord = { type: "AddressChanged", node, coinType: coinType.toString(), newAddress };
        } else if (log.topics[0] == "0xd8c9334b1a9c2f9da342a0a2b32629c1a229b6445dad78947f674b44444a7550") {
          // TextChanged (index_topic_1 bytes32 node, index_topic_2 string indexedKey, string key)
          const logData = publicResolver2Interface.parseLog(log);
          const [node, indexedKey, key] = logData.args;
          eventRecord = { type: "TextChanged", node, indexedKey: indexedKey.hash, key };
        } else if (log.topics[0] == "0x448bc014f1536726cf8d54ff3d6481ed3cbc683c2591ca204274009afa09b1a1") {
          // TextChanged (index_topic_1 bytes32 node, index_topic_2 string indexedKey, string key, string value)
          const logData = publicResolverInterface.parseLog(log);
          const [node, indexedKey, key, value] = logData.args;
          eventRecord = { type: "TextChanged", node, indexedKey: indexedKey.hash, key, value };
        } else if (log.topics[0] == "0xe379c1624ed7e714cc0937528a32359d69d5281337765313dba4e081b72d7578") {
          // ContenthashChanged (index_topic_1 bytes32 node, bytes hash)
          const logData = publicResolverInterface.parseLog(log);
          const [node, hash] = logData.args;
          eventRecord = { type: "ContenthashChanged", node, hash };

        } else {
          console.log("processENSEventLogs - VALID CONTRACT UNHANDLED log: " + JSON.stringify(log));
        }
        if (eventRecord) {
          records.push( {
            chainId: log.chainId,
            blockNumber: parseInt(log.blockNumber),
            logIndex: parseInt(log.logIndex),
            txIndex: parseInt(log.transactionIndex),
            txHash: log.transactionHash,
            contract,
            ...eventRecord,
          });
        }
      } else {
        console.log("processENSEventLogs - INVALID CONTRACT log: " + JSON.stringify(log));
      }
    }
  }
  // console.log("processENSEventLogs - records: " + JSON.stringify(records, null, 2));
  return records;
}
