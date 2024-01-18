var ADDRESS0 = "0x0000000000000000000000000000000000000000";
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

function collateralInDeliveryToken(callPut, strike, bound, tokens, decimals, decimals0, decimals1, rateDecimals) {
  BigNumber.config({ DECIMAL_PLACES: 0 });
  if (strike.gt(0)) {
    if (callPut == 0) {
      if (bound.eq(0) || bound.gt(strike)) {
        if (bound.lte(strike)) {
          return new BigNumber(shiftRightThenLeft(tokens, decimals0, decimals).toFixed(0));
        } else {
          return new BigNumber(shiftRightThenLeft(bound.sub(strike).mul(tokens).div(bound), decimals0, decimals).toFixed(0));
        }
      }
    } else {
      if (bound.lt(strike)) {
        return new BigNumber(shiftRightThenLeft(strike.sub(bound).mul(tokens), decimals1, decimals).shift(-rateDecimals).toFixed(0));
      }
    }
  }
  return null;
}


// function payoff(uint callPut, uint strike, uint bound, uint spot, uint tokens, uint decimalsData) internal pure returns (uint _payoff) {
//     (uint decimals, uint decimals0, uint decimals1, uint rateDecimals) = decimalsData.getAllDecimals();
//     if (callPut == 0) {
//         require(bound == 0 || bound > strike, "payoff: Call bound must = 0 or > strike");
//         if (spot > 0 && spot > strike) {
//             if (bound > strike && spot > bound) {
//                 return shiftRightThenLeft(bound.sub(strike).mul(tokens), decimals0, decimals).div(spot);
//             } else {
//                 return shiftRightThenLeft(spot.sub(strike).mul(tokens), decimals0, decimals).div(spot);
//             }
//         }
//     } else {
//         require(bound < strike, "payoff: Put bound must = 0 or < strike");
//         if (spot < strike) {
//              if (bound == 0 || (bound > 0 && spot >= bound)) {
//                  return shiftRightThenLeft(strike.sub(spot).mul(tokens), decimals1, decimals + rateDecimals);
//              } else {
//                  return shiftRightThenLeft(strike.sub(bound).mul(tokens), decimals1, decimals + rateDecimals);
//              }
//         }
//     }
// }

function payoffInDeliveryToken(callPut, strike, bound, spot, tokens, decimals, decimals0, decimals1, rateDecimals) {
  BigNumber.config({ DECIMAL_PLACES: 0 });
  var results = [];

  var collateral = collateralInDeliveryToken(callPut, strike, bound, tokens, decimals, decimals0, decimals1, rateDecimals);
  var payoff = null;
  if (callPut == 0) {
    if (bound.eq(0) || bound.gt(strike)) {
      if (spot.gt(0)) {
        if (spot.gt(strike)) {
          if (bound.gt(strike) && spot.gt(bound)) {
            payoff = shiftRightThenLeft(bound.sub(strike).mul(tokens), decimals0, decimals).div(spot);
          } else {
            payoff = shiftRightThenLeft(spot.sub(strike).mul(tokens), decimals0, decimals).div(spot);
          }
        } else {
          payoff = new BigNumber(0);
        }
      } else {
        payoff = new BigNumber(0);
      }
    }
  } else {
    if (bound.lt(strike)) {
      if (spot.lt(strike)) {
        if (bound.eq(0) || (bound.gt(0) && spot.gte(bound))) {
          payoff = shiftRightThenLeft(strike.sub(spot).mul(tokens), decimals1, parseInt(decimals) + rateDecimals);
        } else {
          payoff = shiftRightThenLeft(strike.sub(bound).mul(tokens), decimals1, parseInt(decimals) + rateDecimals);
        }
      } else {
        payoff = new BigNumber(0);
      }
    }
  }

  results.push(payoff);
  results.push(collateral == null || payoff == null ? null : collateral.sub(payoff));
  results.push(collateral);

  if (callPut == 0) {
    results.push(spot.eq(0) || payoff == null ? null : payoff.mul(spot).shift(-rateDecimals));
    results.push(spot.eq(0) || payoff == null || collateral == null ? null : collateral.sub(payoff).mul(spot).shift(-rateDecimals));
    results.push(spot.eq(0) || collateral == null ? null : collateral.mul(spot).shift(-rateDecimals));
  } else {
    results.push(spot.eq(0) || payoff == null ? null : payoff.shift(rateDecimals).div(spot));
    results.push(spot.eq(0) || payoff == null || collateral == null ? null : collateral.sub(payoff).shift(rateDecimals).div(spot));
    results.push(spot.eq(0) || collateral == null ? null : collateral.shift(rateDecimals).div(spot));
  }
  return results;
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
