import axios from "axios";

const API_KEY =
  "75876cf34cb116cac234ea5aeaa7c56cb3578a61ead4479177d93c71c3f51be3";
const COINLIST_URL = "https://min-api.cryptocompare.com/data/all/coinlist";
const WS_URL = `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`;
const AGREGATE_INDEX = "5";

const socket = new WebSocket(WS_URL);

//колекция тикеров и функций которые она выполняет
const tickerHandlers = new Map();

export const getCoinlist = async () => {
  try {
    const response = await axios.get(COINLIST_URL, {
      params: { summary: true, api_key: API_KEY },
    });
    return Object.keys(response.data.Data);
  } catch (error) {
    console.log(error);
  }
};

//мы получаем цены тикером
//но наша ЗАДАЧА - получать ОБНОВЛЕНИЯ цен тикеров

function sendToWs(message) {
  const stringifiedMessage = JSON.stringify(message);
  if (socket.readyState === 1) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    function () {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

function subscribeToUpdatesOnWs(ticker) {
  sendToWs({ action: "SubAdd", subs: [`5~CCCAGG~${ticker}~USD`] });
}

function unsubscribeFromUpdatesOnWs(ticker) {
  sendToWs({ action: "SubRemove", subs: [`5~CCCAGG~${ticker}~USD`] });
}

export const subscribeOnUpdates = (ticker, cb) => {
  const subscribers = tickerHandlers.get(ticker) || [];
  tickerHandlers.set(ticker, [...subscribers, cb]);

  subscribeToUpdatesOnWs(ticker);
};

export const unsubscribeFromUpdates = (ticker) => {
  tickerHandlers.delete(ticker);

  unsubscribeFromUpdatesOnWs(ticker);
};

socket.addEventListener("message", function (message) {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: tickerPrice,
  } = JSON.parse(message.data);

  if (type !== AGREGATE_INDEX || !tickerPrice) return;
  tickerHandlers.get(currency).forEach((fn) => fn(currency, tickerPrice));
});

window.tickers = tickerHandlers;
