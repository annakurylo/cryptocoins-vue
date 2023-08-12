const API_KEY =
  "c96718b4c204953b6dd304ddbebbaa9c9398ec61b0c530a25d5a1ac4237e9563";

const CRYPTOCOMPARE_URL = "https://min-api.cryptocompare.com/data/price";

export const getPricesOfTickers = (tickers) => {
  return fetch(
    CRYPTOCOMPARE_URL +
      "?" +
      new URLSearchParams({
        fsym: "USD",
        tsyms: tickers.join(","),
        api_key: API_KEY,
      })
  )
    .then((response) => response.json())
    .then((cryptocurrencies) =>
      Object.fromEntries(
        Object.entries(cryptocurrencies).map((currency) => [
          currency[0],
          1 / currency[1],
        ])
      )
    );
};
