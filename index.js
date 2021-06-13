const fetch = require("node-fetch");
require("dotenv").config();
//1. Import coingecko-api
const CoinGecko = require("coingecko-api");
//2. Initiate the CoinGecko API Client
const CoinGeckoClient = new CoinGecko();
let coinList;

//TELEGRAM API
const TelegramBot = require("node-telegram-bot-api");
const token = process.env.TELEGRAM_API_KEY;
const bot = new TelegramBot(token, { polling: true });

// Matches "/echo [whatever]"
bot.onText(/\/stonks (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  if (msg) {
    const chatId = msg.chat.id;
    const resp = getTokenPrice(match[1])
      .then((message) => {
        bot.sendMessage(chatId, message);
      })
      .catch(console.error);
    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
  }
});

// bot.on("message", (msg) => {
//   const chatId = msg.chat.id;
//   const resp = getTokenPrice(msg.text)
//     .then((message) => {
//       bot.sendMessage(chatId, message);
//     })
//     .catch(console.error);
// });

const getMasterData = async () => {
  let response = await CoinGeckoClient.coins.list();
  coinList = response.data;
};

getMasterData();

const getTokenPrice = async (tokenSymbol) => {
  try {
    let TokenID = getTokenID(tokenSymbol);
    if (TokenID === -1) console.log("No token found");
    else {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${TokenID}&vs_currencies=usd%2Cinr`
      );
      const data = await response.json();
      let msg = `${TokenID} - USD : $ ${data[TokenID].usd} INR : Rs  ${data[TokenID].inr}`;
      return msg;
    }
  } catch (error) {
    console.log(error);
  }
};

const getTokenID = (tokenSymbol) => {
  let data = coinList.filter((elem) => elem.symbol === tokenSymbol);
  if (data) return data[0].id;
  else return -1;
};
