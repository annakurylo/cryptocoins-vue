import axios from "axios";

const API_KEY =
  "c96718b4c204953b6dd304ddbebbaa9c9398ec61b0c530a25d5a1ac4237e9563";

const CRYPTOCOMPARE_URL = "https://min-api.cryptocompare.com/data/pricemulti";
const COINLIST_URL = "https://min-api.cryptocompare.com/data/all/coinlist";

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

const loadPricesOfTickers = () => {
  if (!tickerHandlers.size) return;

  fetch(
    CRYPTOCOMPARE_URL +
      "?" +
      new URLSearchParams({
        fsyms: Array.from(tickerHandlers.keys()).join(","),
        tsyms: "USD",
        api_key: API_KEY,
      })
  )
    .then((response) => response.json())
    .then((cryptocurrencies) =>
      Object.fromEntries(
        Object.entries(cryptocurrencies).map(([currency, price]) => [
          currency,
          price.USD,
        ])
      )
    )
    .then((updatedPrices) => {
      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        tickerHandlers.get(currency).forEach((fn) => fn(currency, newPrice));
      });
    });
};

// const getUpdatedPricesOfTickers = (updatedPrices) => {
//   if (!updatedPrices) return;
//   Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
//     tickerHandlers.get(currency).forEach((fn) => fn(currency, newPrice));
//   });
// };

//мы получаем цены тикером
//но наша ЗАДАЧА - получать ОБНОВЛЕНИЯ цен тикеров

export const subcribeOnUpdates = (ticker, cb) => {
  const subscribers = tickerHandlers.get(ticker) || [];
  tickerHandlers.set(ticker, [...subscribers, cb]);
};

export const unsubcribeFromUpdates = (ticker) => {
  tickerHandlers.delete(ticker);
};

// setInterval(async () => {
//   const updatedPrices = await loadPricesOfTickers();
//   getUpdatedPricesOfTickers(updatedPrices);
// }, 50000000);

setInterval(loadPricesOfTickers, 50000000);

window.tickers = tickerHandlers;
