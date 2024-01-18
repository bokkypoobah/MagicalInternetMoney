function getTxHashesByBlocks(account, accounts, accountsInfo, processFilters) {
  const txHashesByBlocks = {};
  const txsList = processFilters.processTransactions && processFilters.processTransactions.split(/[, \t\n]+/).filter(t => (t.length == 66 && t.substring(0, 2) == '0x')) || null;
  let txsLookup = null;
  if (txsList) {
    txsLookup = {};
    for (const t of txsList) {
      txsLookup[t] = true;
    }
  }
  for (const [txHash, blockNumber] of Object.entries(accounts[account].transactions)) {
    let include = true;
    if (txsLookup) {
      if (!(txHash in txsLookup)) {
        include = false;
      }
    }
    if (include) {
      if (!(blockNumber in txHashesByBlocks)) {
        txHashesByBlocks[blockNumber] = {};
      }
      if (!(txHash in txHashesByBlocks[blockNumber])) {
        txHashesByBlocks[blockNumber][txHash] = blockNumber;
      }
    }
  }
  for (const [txHash, traceIds] of Object.entries(accounts[account].internalTransactions)) {
    for (const [traceId, tx] of Object.entries(traceIds)) {
      let include = true;
      if (txsLookup) {
        if (!(txHash in txsLookup)) {
          include = false;
        }
      }
      if (include) {
        if (!(tx.blockNumber in txHashesByBlocks)) {
          txHashesByBlocks[tx.blockNumber] = {};
        }
        if (!(txHash in txHashesByBlocks[tx.blockNumber])) {
          txHashesByBlocks[tx.blockNumber][txHash] = tx.blockNumber;
        }
      }
    }
  }
  for (const [txHash, blockNumber] of Object.entries(accounts[account].events)) {
    let include = true;
    if (txsLookup) {
      if (!(txHash in txsLookup)) {
        include = false;
      }
    }
    if (include) {
      if (!(blockNumber in txHashesByBlocks)) {
        txHashesByBlocks[blockNumber] = {};
      }
      if (!(txHash in txHashesByBlocks[blockNumber])) {
        txHashesByBlocks[blockNumber][txHash] = blockNumber;
      }
    }
  }
  const results = {};
  let blocksProcessed = 0;
  const fb = processFilters.firstBlock && processFilters.firstBlock.toString().length > 0 && parseInt(processFilters.firstBlock) || null;
  const lb = processFilters.lastBlock && processFilters.lastBlock.toString().length > 0 && parseInt(processFilters.lastBlock) || null;
  for (const [blockNumber, txHashes] of Object.entries(txHashesByBlocks)) {
    if ((!fb || parseInt(blockNumber) >= fb) && (!lb || parseInt(blockNumber) <= lb)) {
      if (!(blockNumber in results)) {
        results[blockNumber] = {};
      }
      for (const [index, txHash] of Object.keys(txHashes).entries()) {
        if (!(txHash in results[blockNumber])) {
          results[blockNumber][txHash] = blockNumber;
        }
      }
    }
    blocksProcessed++;
  }
  return results;
}
