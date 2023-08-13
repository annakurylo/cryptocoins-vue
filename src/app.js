import axios from "axios";

const API_KEY =
  "c96718b4c204953b6dd304ddbebbaa9c9398ec61b0c530a25d5a1ac4237e9563";

const CRYPTOCOMPARE_URL = "https://min-api.cryptocompare.com/data/pricemulti";
const COINLIST_URL = "https://min-api.cryptocompare.com/data/all/coinlist";

export const getPricesOfTickers = (tickers) => {
  return fetch(
    CRYPTOCOMPARE_URL +
      "?" +
      new URLSearchParams({
        fsyms: tickers.join(","),
        tsyms: "USD",
        api_key: API_KEY,
      })
  )
    .then((response) => response.json())
    .then((cryptocurrencies) =>
      Object.fromEntries(
        Object.entries(cryptocurrencies).map((currency) => [
          currency[0],
          currency[1].USD,
        ])
      )
    );
};

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
