/* ========================================================================= */
const ethers = require('ethers');
const { gasMultiplicate, waitGwei } = require('./ethers_helper');
const { logError, pause, SECOND, logInfo, logSuccess } = require('./helper');
/* ========================================================================= */
exports.mint = {

  0: {
    name: `Все активные и бесплатные минты`,
    ended: false
  },

  1: {
    name: `Ronke on a Sailing Ship [Price: 0 RON]`,
    mint: `0x00005ea00ac477b1030ce78506496e8c2de24bf5`,
    NFT: `0x2fb6FEB663c481E9854a251002C772FEad3974d6`,
    feeRecipient: `0x0000a26b00c1F0DF003000390027140000fAa719`,
    value: `0`,
    ended: false
  },

  2: {
    name: `Jin on a Sailing Ship [Price: 0 RON]`,
    mint: `0x00005ea00ac477b1030ce78506496e8c2de24bf5`,
    NFT: `0xc2f09694fcc9c9ddcbe54a72b1a3b14658d2f755`,
    feeRecipient: `0x0000a26b00c1F0DF003000390027140000fAa719`,
    value: `0`,
    ended: false
  },

  // STORY 
  mintFunctions: {
    name: `Выберите минт`,
    value: false,
    1: openSeaPublicMint,
    2: openSeaPublicMint
  }

};

/* ========================================================================= */
async function openSeaPublicMint(BOT, choice) {

  try {

    const ABI = require(`./OpenEditionERC721.json`);
    const contractNFT = new ethers.Contract(choice.NFT, ABI, BOT.wallets["RONIN"]);

    const mintABI = `["function mintPublic(address,address,address,uint256)"]`;
    const mintContract = new ethers.Contract(choice.mint, mintABI, BOT.wallets["RONIN"]);

    const balanceOf = await contractNFT.balanceOf(BOT.wallets["RONIN"].address);
    // console.log("balanceOf", balanceOf);
    if (balanceOf > 0) {
      return true;
    } else {
      // Ждем газ
      let gasIsNormal = await waitGwei(BOT, "RONIN");
      if (!gasIsNormal) return false;


      // Определяем сколько нужно газа на транзакцию
      const gasAmount = await mintContract["mintPublic"]
        .estimateGas(
          choice.NFT,
          choice.feeRecipient,
          BOT.wallets["RONIN"].address,
          1,
          BOT.tx_params["RONIN"]
        );

      BOT.tx_params["RONIN"].gasLimit = gasMultiplicate(gasAmount, BOT.configs["RONIN"].GAS_AMOUNT_MULTIPLICATOR);
      // console.log(gasAmount, BOT.tx_params["RONIN"].gasLimit);

      let tx = await mintContract["mintPublic"](
        choice.NFT,
        choice.feeRecipient,
        BOT.wallets["RONIN"].address,
        1,
        BOT.tx_params["RONIN"]
      );
      return tx;
    }
  } catch (error) {
    logError(`Ошибка при минте: ${error.message}`);
    return false;
  }
}   