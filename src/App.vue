<template>
  <div class="wrapper">
    <div class="search">
      <div class="content">
        <div class="searchTicker">
          <div class="searchTicker-title">Тикер</div>
          <div class="searchTicker-content">
            <input
              v-model="ticker"
              type="text"
              class="searchTicker-input"
              placeholder="Например DOGE"
              @keyup.enter="addTicker(ticker)"
            />
            <div
              v-if="filteredArrOfCoinList.length && ticker"
              class="searchTicker-hints"
            >
              <div
                v-for="(coin, idx) in filteredArrOfCoinList"
                :key="idx"
                @click="addTicker(coin)"
              >
                {{ coin }}
              </div>
            </div>
            <div
              v-for="(error, idx) in inputTickerError"
              :key="idx"
              class="searchTicker-validation"
            >
              {{ error }}
            </div>
          </div>
          <div>
            <button
              class="searchTicker-button"
              @click.enter="addTicker(ticker)"
            >
              <svg-icon type="mdi" :path="add" class="icon"></svg-icon>
              <div class="stButton-text">Добавить</div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="filters">
      <div class="content">
        <div class="lineBlock"></div>
        <div class="filters__content">
          <div class="filters__search">
            <div class="filters__search-title">Поиск тикера</div>
            <div class="filters__search-area">
              <input
                v-model="filter"
                type="text"
                class="filters__search-input"
                placeholder="Например DOGE"
              />
            </div>
          </div>
          <div class="filters__pagination">
            <button
              class="filters__pagination-btn"
              @click="prevPage"
              :disabled="page <= 1"
            >
              Назад
            </button>
            <button
              class="filters__pagination-btn"
              @click="nextPage"
              :disabled="page >= pageCount"
            >
              Вперед
            </button>
          </div>
        </div>
        <div class="lineBlock"></div>
      </div>
    </div>

    <div class="info">
      <div class="content">
        <template v-if="tickers.length && paginatedTickers.length">
          <div class="ticketInfo-list">
            <div
              v-for="ticker in tickers"
              :key="ticker.name"
              class="ticketInfo-itemOfList"
              @click="addGraph(ticker)"
              :class="{
                tickerBorder: this.select?.name === ticker.name,
              }"
            >
              <div class="ticketInfo-itemOfList__name">
                {{ ticker.name }} - USD
              </div>
              <div class="ticketInfo-itemOfList__price">
                {{ formatPriceOfTicker(ticker.price) }}
              </div>
              <div>
                <button
                  class="ticketInfo-itemOfList__button-delete"
                  @click.stop="deleteTicker(ticker)"
                >
                  <svg-icon type="mdi" :path="delete_" class="icon"></svg-icon>
                  <div class="stButton-text">Удалить</div>
                </button>
              </div>
            </div>
          </div>
          <div class="lineBlock"></div>
        </template>
      </div>
    </div>

    <div v-if="this.select" class="grahp">
      <div class="content">
        <div class="graphSpace">
          <div class="graphTitle">{{ this.select.name }} - USD</div>
          <div @click="deleteGraph" class="iconClose">
            <svg-icon type="mdi" :path="close"></svg-icon>
          </div>
          <div class="spaceOfGraph">
            <div class="verticalBlock"></div>
            <div class="horizontalBlock"></div>
            <div class="space">
              <div
                v-for="(price, indx) in normalizedGraph"
                :key="indx"
                class="diagramBlock"
                :style="{ height: price + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//избавление от ЗАВИСИМЫХ ДАННЫХ
//рефакторинг watch: избавление от одинакого кода в filter() i page(), работа с массивами
//исправление ошибок: при удалении всех тикеров на n странице -> вернутся на n-1 страницу

//исправление API запроса: теперь на сервер мы отпраляем один запрос в created, логика запроса вынесена в api.js

import SvgIcon from "@jamescoyle/vue-icon";
import { mdiPlus, mdiTrashCan, mdiWindowClose } from "@mdi/js";

import { subscribeOnUpdates, getCoinlist, unsubscribeFromUpdates } from "./app";

export default {
  name: "my-component",
  components: {
    SvgIcon,
  },

  data() {
    return {
      ticker: "",
      tickers: [],
      select: null,
      graphPrice: [],
      coinList: [],
      inputTickerError: [],
      filter: "",
      size: 6,
      page: 1,
      add: mdiPlus,
      delete_: mdiTrashCan,
      close: mdiWindowClose,
    };
  },
  watch: {
    ticker() {
      this.validateTicker(this.ticker.toUpperCase());
    },
    filter() {
      this.page = 1;
    },
    getFilterAndPageOptions(v) {
      let url = new URL(window.location.href);
      url.searchParams.set("filter", `${v.filter}`);
      url.searchParams.set("page", `${v.page}`);
      history.pushState(null, null, url.href);
    },
    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page--;
      }
    },
    tickers: {
      handler() {
        localStorage.setItem(
          "tickers",
          JSON.stringify(
            this.tickers.map((ticker) => {
              return {
                name: ticker.name,
                price: "-",
              };
            })
          )
        );

        if (!this.tickers.length) {
          localStorage.removeItem("tickers");
        }
      },
      deep: true,
    },
  },
  computed: {
    normalizedGraph() {
      const maxValue = Math.max(...this.graphPrice);
      const minValue = Math.min(...this.graphPrice);

      return this.graphPrice.map((p) => {
        return maxValue === minValue
          ? 50
          : 5 + ((p - minValue) * 95) / (maxValue - minValue);
      });
    },
    filteredArrOfCoinList() {
      return this.coinList
        .filter((coin) => coin.includes(this.ticker.toUpperCase()))
        .slice(0, 4);
    },

    filteredTickers() {
      return this.tickers.filter((ticker) =>
        ticker.name.includes(this.filter.toUpperCase())
      );
    },

    paginatedTickers() {
      const start = (this.page - 1) * this.size;
      const end = start + this.size;
      return this.filteredTickers.slice(start, end);
    },
    pageCount() {
      return Math.ceil(this.filteredTickers.length / this.size);
    },
    getFilterAndPageOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },
  },

  methods: {
    prevPage() {
      this.page--;
    },
    nextPage() {
      this.page++;
    },
    validateTicker(name) {
      this.inputTickerError = [];
      if (this.tickers.find((t) => t.name === name)) {
        this.inputTickerError.push("Такой тикер уже добавлен");
      } else if (!this.coinList.includes(name) && name) {
        this.inputTickerError.push("Такого тикера не существует");
      } else if (!name) {
        return false;
      }

      if (!this.inputTickerError.length) {
        return true;
      }
    },
    addTicker(name) {
      name = name.toUpperCase();
      if (this.validateTicker(name)) {
        this.getTicker(name);
      }
    },
    getTicker(name) {
      this.filter = "";

      let newTicker = {
        name: name,
        price: "-",
      };
      this.tickers.push(newTicker);

      subscribeOnUpdates(newTicker.name, (name, price) => {
        this.getUpdatedPricesOfTickers(name, price);
      });

      this.ticker = "";
    },
    getUpdatedPricesOfTickers(tickerName, newPrice) {
      this.tickers = this.tickers.map((ticker) => {
        if (
          this.select &&
          ticker.name === tickerName &&
          this.select.name === tickerName &&
          ticker.price !== "-"
        ) {
          this.graphPrice.push(newPrice);
        }
        if (ticker.name === tickerName) {
          return { name: ticker.name, price: newPrice };
        }
        return ticker;
      });
    },

    formatPriceOfTicker(price) {
      return price === "-"
        ? price
        : price > 1
        ? price.toFixed(2)
        : price.toPrecision(2);
    },
    findTickerByName(name) {
      return this.tickers.find((t) => t.name === name);
    },
    deleteTicker(ticker) {
      this.tickers = this.tickers.filter(
        (itemOfTickers) => itemOfTickers !== ticker
      );

      unsubscribeFromUpdates(ticker.name);

      if (this.select?.name === ticker.name) {
        this.select = null;
        this.graphPrice = [];
      }
    },
    addGraph(ticker) {
      this.select = ticker;
      this.graphPrice = [];
    },
    deleteGraph() {
      this.select = null;
      this.graphPrice = [];
    },
  },

  async created() {
    const cryptoData = localStorage.getItem("tickers");
    if (cryptoData) {
      this.tickers = JSON.parse(cryptoData);

      this.tickers.forEach((ticker) => {
        subscribeOnUpdates(ticker.name, (name, price) => {
          this.getUpdatedPricesOfTickers(name, price);
        });
      });
    }

    let url = new URL(window.location.href);
    let params = new URLSearchParams(url.search);

    for (const [key, value] of params.entries()) {
      if (key === "filter" && value) {
        this.filter = value;
      }
      if (key === "page") this.page = value;
    }

    this.coinList = await getCoinlist();
  },
};
</script>

<style lang="scss" scopped>
.wrapper {
}
.search {
  margin: 25px 0 0 0;
}
.searchTicker {
  display: flex;
  flex-direction: column;
  gap: 15px;
  color: rgb(38, 42, 58);
}
.content {
  max-width: 1100px;
  margin: 0 auto;
}
.searchTicker-title {
  font-weight: 700;
}
.searchTicker-input {
  padding: 10px 15px;
  box-shadow: 1px 2px 1px rgb(224, 224, 224);
  border: none;
  min-width: 200px;
  outline: none;
}
.searchTicker-input:focus {
  border: 2px solid rgb(76, 79, 90);
}
.searchTicker-content {
  display: flex;
  flex-direction: column;
  align-self: flex-start;
}
.searchTicker-hints {
  display: inline-flex;
  gap: 15px;
  align-items: center;
  font-size: 14px;
  box-shadow: 0px 1px 0px rgb(224, 224, 224);
  padding: 10px;
}
.searchTicker-hints div {
  background-color: rgb(224, 224, 224);
  color: rgb(38, 42, 58);
  font-weight: 550;
  padding: 2px 5px;
  border-radius: 40%;
  cursor: pointer;
}
.searchTicker-hints div:hover {
  background-color: rgb(196, 196, 196);
}
.searchTicker-validation {
  color: rgb(244, 0, 0);
}
.searchTicker-button {
  display: flex;
  align-items: center;
  border-radius: 25px;
  padding: 10px 25px;
  color: white;
  background-color: rgb(38, 42, 58);
  border: none;
}
.searchTicker-button:hover {
  box-shadow: 1px 1px 1px 1px rgb(96, 96, 96);
  background-color: rgb(44, 44, 44);
}
.stButton-text {
  margin: 0 0 0 5px;
}

.filters {
  margin: 25px 0 0 0;

  &__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__search {
    padding: 35px 0;
    display: flex;
    align-items: center;
    gap: 15px;

    &-title {
      font-weight: 700;
    }

    &-area {
    }

    &-input {
      padding: 10px 15px;
      box-shadow: 0 0 0 0.1rem rgba(158, 158, 158, 0.25);
      border: none;
      min-width: 200px;
      outline: none;
    }
    &-input:focus {
      box-shadow: none;
      border: 2px solid rgb(76, 79, 90);
    }
  }

  &__pagination {
    display: flex;
    gap: 5px;

    &-btn {
      border-radius: 5px;
      padding: 5px 15px;
      color: rgb(38, 42, 58);
      background-color: rgb(228, 224, 224);
      border: none;
      box-shadow: 0 0 0 0.1rem rgba(158, 158, 158, 0.25);
    }

    &-btn:hover {
      box-shadow: 1px 1px 1px 1px rgb(96, 96, 96);
      background-color: rgb(213, 210, 210);
    }

    &-btn:disabled {
      color: rgba(38, 42, 58, 0.408);
      background-color: rgba(228, 224, 224, 0.403);
    }

    &-btn:hover:disabled {
      box-shadow: 0 0 0 0.1rem rgba(158, 158, 158, 0.25);
    }
  }
}

.info {
  margin: 35px 0 0 0;
}
.lineBlock {
  width: 100%;
  height: 1px;
  background-color: rgb(38, 42, 58);
}
.ticketInfo-list {
  padding: 20px 0;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-items: center;
  gap: 50px 20px;
}
.ticketInfo-itemOfList {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgb(38, 42, 58);
  box-shadow: 0px 1px 1px rgb(224, 224, 224);
  padding: 20px 10px;
}
.tickerBorder {
  border: 2px solid rgb(96, 96, 96);
  border-radius: 5px;
}
.ticketInfo-itemOfList__name {
  color: rgb(96, 96, 96);
  margin: 0 0 15px 0;
}
.ticketInfo-itemOfList__price {
  font-weight: 700;
  font-size: 24px;
  margin: 0 0 30px 0;
}
.ticketInfo-itemOfList__button-delete {
  display: flex;
  align-items: center;
  border-radius: 5px;
  padding: 10px 25px;
  color: rgb(38, 42, 58);
  background-color: rgb(228, 224, 224);
  border: none;
}
.ticketInfo-itemOfList__button-delete:hover {
  box-shadow: 1px 1px 1px 1px rgb(96, 96, 96);
  background-color: rgb(213, 210, 210);
}
.stButton-text {
  margin: 0 0 0 5px;
}

.grahp {
  margin: 35px 0;
}
.graphTitle {
  margin-bottom: 15px;
  font-weight: 700;
}
.graphSpace {
  position: relative;
}
.spaceOfGraph {
  position: relative;
}
.space {
  width: 100%;
  height: 100%;
  position: absolute;
  bottom: 5px;
  left: 5px;
  display: flex;
}
.iconClose {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 5;
}
.verticalBlock {
  width: 2px;
  height: 300px;
  background-color: rgb(38, 42, 58);
}
.horizontalBlock {
  width: 100%;
  height: 2px;
  background-color: rgb(38, 42, 58);
}
.diagramBlock {
  width: 30px;
  background-color: rgb(213, 210, 210);
  align-self: end;
}
.diagramBlock:not(last-child) {
  margin: 0 1px 0 0;
}
</style>
