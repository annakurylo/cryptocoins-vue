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
              v-if="filterArrOfCoinList.length && ticker"
              class="searchTicker-hints"
            >
              <div
                v-for="(coin, idx) in filterArrOfCoinList"
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

    <div class="info">
      <div class="content">
        <template v-if="tickers.length">
          <div class="lineBlock"></div>
          <div class="ticketInfo-list">
            <div
              v-for="ticker in tickers"
              :key="ticker.price"
              class="ticketInfo-itemOfList"
              @click="addGraph(ticker)"
              :class="{
                tickerBorder: this.select === ticker,
              }"
            >
              <div class="ticketInfo-itemOfList__name">
                {{ ticker.name }} - USD
              </div>
              <div class="ticketInfo-itemOfList__price">{{ ticker.price }}</div>
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
                v-for="(price, indx) in normalizeGraph()"
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
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiPlus, mdiTrashCan, mdiWindowClose } from "@mdi/js";
import axios from "axios";
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
      add: mdiPlus,
      delete_: mdiTrashCan,
      close: mdiWindowClose,
    };
  },
  watch: {
    ticker() {
      this.validateTicker(this.ticker.toUpperCase());
    },
  },
  computed: {
    filterArrOfCoinList() {
      return this.coinList
        .filter((coin) => coin.includes(this.ticker.toUpperCase()))
        .slice(0, 4);
    },
  },

  methods: {
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
      let newTicker = {
        name: name,
        price: "-",
      };
      this.tickers.push(newTicker);

      setInterval(async () => {
        const response = await fetch(
          `https://min-api.cryptocompare.com/data/price?fsym=${newTicker.name}&tsyms=USD&extraParams=cryptoApp`
        );
        let dataCryptoPrice = await response.json();

        if (this.tickers.find((t) => t.name === newTicker.name)) {
          this.tickers.find((t) => t.name === newTicker.name).price =
            dataCryptoPrice.USD > 1
              ? dataCryptoPrice.USD.toFixed(2)
              : dataCryptoPrice.USD.toPrecision(2);
        }

        if (this.select?.name === newTicker.name) {
          this.graphPrice.push(dataCryptoPrice.USD);
        }
      }, 5000);

      this.ticker = "";
    },
    deleteTicker(ticker) {
      this.tickers = this.tickers.filter(
        (itemOfTickers) => itemOfTickers !== ticker
      );
      if (this.select === ticker) {
        this.select = null;
        this.graphPrice = [];
      }
    },
    deleteGraph() {
      this.select = null;
    },
    normalizeGraph() {
      let maxValue = Math.max(...this.graphPrice);
      console.log(maxValue);
      let minValue = Math.min(...this.graphPrice);
      console.log(minValue);

      return this.graphPrice.map(
        (p) => 5 + ((p - minValue) * 95) / (maxValue - minValue)
      );
    },
    addGraph(ticker) {
      this.select = ticker;
      this.graphPrice = [];
    },
  },

  created() {
    axios
      .get(`https://min-api.cryptocompare.com/data/all/coinlist?summary=true`)
      .then((response) => {
        this.coinList = Object.keys(response.data.Data);
      });
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
  //box-shadow: 1px 1px 2px 0 rgb(38, 42, 58);
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
  //height: 80%;
  width: 30px;
  background-color: rgb(213, 210, 210);
  align-self: end;
  //position: absolute;
}
.diagramBlock:not(last-child) {
  margin: 0 1px 0 0;
}
</style>
