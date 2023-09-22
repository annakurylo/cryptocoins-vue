import axios from "axios";

const API_KEY =
  "75876cf34cb116cac234ea5aeaa7c56cb3578a61ead4479177d93c71c3f51be3";

const COINLIST_URL = "https://min-api.cryptocompare.com/data/all/coinlist";
const WS_URL = `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`;

const socket = new WebSocket(WS_URL);

//колекция тикеров и функций которые она выполняет
const tickerHandlers = new Map(); // doge - () => {}

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

export const subcribeOnUpdates = (ticker, cb) => {
  const subscribers = tickerHandlers.get(ticker) || [];
  tickerHandlers.set(ticker, [...subscribers, cb]);

  if (socket.readyState === 0) {
    socket.addEventListener("open", function () {
      socket.send(
        JSON.stringify({
          action: "SubAdd",
          subs: [`5~CCCAGG~${ticker}~USD`],
        })
      );
    });
    return;
  }

  socket.send(
    JSON.stringify({
      action: "SubAdd",
      subs: [`5~CCCAGG~${ticker}~USD`],
    })
  );
};

export const unsubcribeFromUpdates = (ticker) => {
  tickerHandlers.delete(ticker);

  socket.send(
    JSON.stringify({
      action: "SubRemove",
      subs: [`5~CCCAGG~${ticker}~USD`],
    })
  );
};

socket.addEventListener("message", function (message) {
  const data = JSON.parse(message.data);
  if (data.FROMSYMBOL && data.PRICE) {
    tickerHandlers
      .get(data.FROMSYMBOL)
      .forEach((fn) => fn(data.FROMSYMBOL, data.PRICE));
  }
});

window.tickers = tickerHandlers;
