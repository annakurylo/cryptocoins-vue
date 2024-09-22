import axios from "axios";

const API_KEY =
  "75876cf34cb116cac234ea5aeaa7c56cb3578a61ead4479177d93c71c3f51be3";
const COINLIST_URL = "https://min-api.cryptocompare.com/data/all/coinlist";
const WS_URL = `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`;
const AGREGATE_INDEX = "5";

const tickerHandlers = new Map();

const socket = new WebSocket(WS_URL);

const bc = new BroadcastChannel("multitab-forws");

let multiTabs = false;

//создать мультиоконность

window.addEventListener("load", function () {
  const tabs = localStorage.getItem("tabs");

  if (!tabs && window.name === "") {
    multiTabs = true;
    localStorage.setItem("tabs", String(multiTabs));
    window.name = "";
  } else {
    multiTabs = Number(tabs);
    window.name = "DauhgterName";
  }
});

bc.addEventListener("message", (event) => {
  const { FROMSYMBOL: currency, PRICE: tickerPrice } = event.data;
  updatePriceOfTickers(currency, tickerPrice);
});

//колекция тикеров и функций которые она выполняет

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
  if (window.name === "DaughterPage") return;
  sendToWs({ action: "SubAdd", subs: [`5~CCCAGG~${ticker}~USD`] });
}

function unsubscribeFromUpdatesOnWs(ticker) {
  if (window.name === "DaughterPage") return;
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

function updatePriceOfTickers(currency, price) {
  tickerHandlers.get(currency).forEach((fn) => fn(currency, price));
}

socket.addEventListener("message", function (message) {
  if (window.name === "DaughterPage") return;

  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: tickerPrice,
  } = JSON.parse(message.data);

  if (type !== AGREGATE_INDEX || !tickerPrice) return;
  bc.postMessage({ FROMSYMBOL: currency, PRICE: tickerPrice });
  updatePriceOfTickers(currency, tickerPrice);
});

window.tickers = tickerHandlers;
