const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
// const { BigNumber } = require("ethers");
const util = require('util');

describe("MagicalInternetMoney", function () {
  async function deployContractsFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const ERC5564Announcer = await ethers.getContractFactory("ERC5564Announcer");
    const ERC6538Registry = await ethers.getContractFactory("ERC6538Registry");
    const MagicalInternetMoney = await ethers.getContractFactory("MagicalInternetMoney");
    const ERC20Token = await ethers.getContractFactory("ERC20Token");
    const ERC721Token = await ethers.getContractFactory("ERC721Token");
    const erc5564Announcer = await ERC5564Announcer.deploy();
    const erc6538Registry = await ERC6538Registry.deploy();
    const magicalInternetMoney = await MagicalInternetMoney.deploy(erc5564Announcer);
    const erc20Token = await ERC20Token.deploy("ERC-20", "ERC-20 Token", 18, 1000000000000000000000000n);
    const erc721Token = await ERC721Token.deploy();

    const ownerBalance = await erc20Token.balanceOf(owner);
    console.log("ownerBalance: " + ownerBalance);

    const approveTx_1 = await erc20Token.approve(magicalInternetMoney, 123456789123456789n);
    const approveReceipt_1 = await approveTx_1.wait();

    const ownerAllowanceToMagicalInternetMoney = await erc20Token.allowance(owner, magicalInternetMoney);
    console.log("ownerAllowanceToMagicalInternetMoney: " + ownerAllowanceToMagicalInternetMoney);

    // const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    // const ONE_GWEI = 1_000_000_000;
    // const lockedAmount = ONE_GWEI;
    // const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;
    // const Lock = await ethers.getContractFactory("Lock");
    // const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

    return { erc5564Announcer, erc6538Registry, magicalInternetMoney, erc20Token, erc721Token, owner, otherAccount };
  }

  describe("Deployment", function () {

    it.skip("Test Announcer - ETH Transfer", async function () {
      const { erc5564Announcer, erc6538Registry, magicalInternetMoney, owner, otherAccount } = await loadFixture(deployContractsFixture);
      console.log("      owner: " + owner.address);
      const schemeId = 1;
      const recipient = otherAccount;
      const ephemeralPubKey = "0x1234";
      const viewTag = 0xff;
      const transferEthAndAnnounceTx_1 = await magicalInternetMoney.transferEthAndAnnounce(schemeId, recipient, ephemeralPubKey, viewTag, { value: 123456789123456789n });
      const transferEthAndAnnounceReceipt_1 = await transferEthAndAnnounceTx_1.wait();
      transferEthAndAnnounceReceipt_1.logs.forEach((log) => {
        console.log("      transferEthAndAnnounceReceipt_1:\n" + util.inspect(erc5564Announcer.interface.parseLog(log)).replace(/^/gm, " ".repeat(8)));
      });
    });

    it("Test Announcer - ETH & Tokens Transfer", async function () {
      const { erc5564Announcer, erc6538Registry, magicalInternetMoney, erc20Token, owner, otherAccount } = await loadFixture(deployContractsFixture);
      console.log("      owner: " + owner.address);
      const schemeId = 1;
      const recipient = otherAccount;
      const ephemeralPubKey = "0x1234";
      const viewTag = 0xff;
      const tokenInfos = [[false, erc20Token.target, 12345]];
      console.log("      tokenInfos: " + JSON.stringify(tokenInfos));
      const transferAndAnnounceTx_1 = await magicalInternetMoney.transferAndAnnounce(schemeId, recipient, ephemeralPubKey, viewTag, tokenInfos, { value: 123n });
      const transferAndAnnounceReceipt_1 = await transferAndAnnounceTx_1.wait();
      transferAndAnnounceReceipt_1.logs.forEach((log) => {
        if (log.address == erc5564Announcer.target) {
          console.log("      transferAndAnnounceReceipt_1 Announcer:\n" + util.inspect(erc5564Announcer.interface.parseLog(log)).replace(/^/gm, " ".repeat(8)));
        } else {
          console.log("      transferAndAnnounceReceipt_1 ERC-20:\n" + util.inspect(erc20Token.interface.parseLog(log)).replace(/^/gm, " ".repeat(8)));
        }
      });
    });

    it("Test Registry", async function () {
      const { erc5564Announcer, erc6538Registry, magicalInternetMoney, owner } = await loadFixture(deployContractsFixture);
      console.log("      owner: " + owner.address);
      const schemeId = 1;
      const stealthMetaAddress = "st:eth:0x039441d882d0cf33565dda9c752910f9bb13186555495c081e9d33e391518456c403ea8baab0486a7b4b6056d77e35a8f0b5534550fdfe53a69180885ea10fbecb96";
      const registerKeysTx_1 = await erc6538Registry.registerKeys(schemeId, ethers.hexlify(ethers.toUtf8Bytes(stealthMetaAddress)));
      const registerKeysReceipt_1 = await registerKeysTx_1.wait();
      registerKeysReceipt_1.logs.forEach((log) => {
        const parsedLog = erc6538Registry.interface.parseLog(log);
        console.log("      registerKeysReceipt_1:\n" + util.inspect(parsedLog).replace(/^/gm, " ".repeat(8)));
        const registrant = parsedLog.args[0];
        console.log("      registrant: " + registrant);
      });
    });


    // it.skip("Should set the right unlockTime", async function () {
    //   const { lock, unlockTime } = await loadFixture(deployContractsFixture);
    //   expect(await lock.unlockTime()).to.equal(unlockTime);
    // });
    // it.skip("Should set the right owner", async function () {
    //   const { lock, owner } = await loadFixture(deployContractsFixture);
    //   expect(await lock.owner()).to.equal(owner.address);
    // });
    // it.skip("Should receive and store the funds to lock", async function () {
    //   const { lock, lockedAmount } = await loadFixture(deployContractsFixture);
    //   expect(await ethers.provider.getBalance(lock.target)).to.equal(lockedAmount);
    // });
    // it.skip("Should fail if the unlockTime is not in the future", async function () {
    //   // We don't use the fixture here because we want a different deployment
    //   const latestTime = await time.latest();
    //   const Lock = await ethers.getContractFactory("Lock");
    //   await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith("Unlock time should be in the future");
    // });
  });

  // describe.skip("Withdrawals", function () {
  //   describe("Validations", function () {
  //     it("Should revert with the right error if called too soon", async function () {
  //       const { lock } = await loadFixture(deployContractsFixture);
  //       await expect(lock.withdraw()).to.be.revertedWith("You can't withdraw yet");
  //     });
  //     it("Should revert with the right error if called from another account", async function () {
  //       const { lock, unlockTime, otherAccount } = await loadFixture(deployContractsFixture);
  //       // We can increase the time in Hardhat Network
  //       await time.increaseTo(unlockTime);
  //       // We use lock.connect() to send a transaction from another account
  //       await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith("You aren't the owner");
  //     });
  //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
  //       const { lock, unlockTime } = await loadFixture(deployContractsFixture);
  //       // Transactions are sent using the first signer by default
  //       await time.increaseTo(unlockTime);
  //       await expect(lock.withdraw()).not.to.be.reverted;
  //     });
  //   });
  //   describe("Events", function () {
  //     it("Should emit an event on withdrawals", async function () {
  //       const { lock, unlockTime, lockedAmount } = await loadFixture(deployContractsFixture);
  //       await time.increaseTo(unlockTime);
  //       await expect(lock.withdraw()).to.emit(lock, "Withdrawal").withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
  //     });
  //   });
  //   describe("Transfers", function () {
  //     it("Should transfer the funds to the owner", async function () {
  //       const { lock, unlockTime, lockedAmount, owner } = await loadFixture(deployContractsFixture);
  //       await time.increaseTo(unlockTime);
  //       await expect(lock.withdraw()).to.changeEtherBalances([owner, lock], [lockedAmount, -lockedAmount]);
  //     });
  //   });
  // });
});
