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
