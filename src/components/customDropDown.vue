<template>
  <div class="drop-down">
    <div
      class="drop-down__header"
      @click="isMobile ? toggle() : null"
      @mouseenter="!isMobile && showSubmenu()"
      @mouseleave="!isMobile && hideSubmenu()"
    >
      <div class="drop-down__header-balance">
        <div class="drop-down__header-balance-item">
          {{ balance.account.toFixed(2) }} $
        </div>
        <div class="arrow" :class="{ expanded: visible }"></div>
      </div>
      <div class="btn" @click.stop>
        <div class="btn-text">
          <span>Каса</span>
        </div>
      </div>
      <div
        class="drop-down__submenu"
        :class="{ hidden: !visible, visible }"
        @click.stop
      >
        <div
          v-for="(cash, indx) in formattedBalance"
          :key="indx"
          class="drop-down__submenu-cash"
        >
          <div class="drop-down__submenu-cash-title">{{ cash.title }}:</div>
          <div class="drop-down__submenu-cash-money">{{ cash.money }} $</div>
        </div>
        <div class="drop-down__submenu-group">
          <button class="drop-down__submenu-group-btn" @click="openSettings">
            <div class="drop-down__submenu-group-btn-wrapper">
              <settings-icon :size="18"></settings-icon>
            </div>
          </button>
          <button
            class="drop-down__submenu-group-btn"
            :class="isDarkTheme ? 'dark' : 'light'"
            @click="switchTheme"
          >
            <div class="drop-down__submenu-group-btn-wrapper">
              <sun-icon v-if="isDarkTheme" :size="18"></sun-icon>
              <moon-icon v-else :size="18"></moon-icon>
            </div>
          </button>
          <button class="drop-down__submenu-group-btn" @click="turnVolume">
            <div class="drop-down__submenu-group-btn-wrapper">
              <volume-off-icon v-if="isVolumeOff" :size="18"></volume-off-icon>
              <volume-high-icon v-else :size="18"></volume-high-icon>
            </div>
          </button>
          <!-- <volume-off-icon @click="openSettings"></volume-off-icon> -->
          <button class="drop-down__submenu-group-btn" @click="turnVolume">
            <div class="drop-down__submenu-group-btn-wrapper">
              <exit-icon :size="18"></exit-icon>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SettingsIcon from "vue-material-design-icons/Cog.vue";
import MoonIcon from "vue-material-design-icons/MoonWaningCrescent.vue";
import SunIcon from "vue-material-design-icons/WhiteBalanceSunny.vue";
import VolumeHighIcon from "vue-material-design-icons/VolumeHigh.vue";
import VolumeOffIcon from "vue-material-design-icons/VolumeOff.vue";
import ExitIcon from "vue-material-design-icons/ExitToApp.vue";

export default {
  name: "custom-drop-down",
  components: {
    SettingsIcon,
    MoonIcon,
    SunIcon,
    VolumeHighIcon,
    VolumeOffIcon,
    ExitIcon,
  },
  data() {
    return {
      visible: false,
      isDarkTheme: false,
      isVolumeOff: false,
      isMobile: window.innerWidth <= 768,
    };
  },

  props: {
    balance: {
      type: Object,
      reqired: true,
    },
  },
  methods: {
    toggle() {
      this.visible = !this.visible;
    },
    showSubmenu() {
      this.visible = true;
    },
    hideSubmenu() {
      this.visible = false;
    },
    switchTheme() {
      this.isDarkTheme = !this.isDarkTheme;
    },
    turnVolume() {
      this.isVolumeOff = !this.isVolumeOff;
    },
    handleResize() {
      this.isMobile = window.innerWidth <= 768;
      if (!this.isMobile) {
        this.visible = false;
      }
    },
  },
  mounted() {
    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
  computed: {
    formattedBalance() {
      const titlesMap = {
        account: "На счету",
        withdrawal: "Для вывода",
        bonuses: "Бонусный баланс",
        left: "Осталось отыграть",
      };

      return Object.entries(this.balance).map(([key, value]) => ({
        title: titlesMap[key] || key,
        money: value.toFixed(2),
      }));
    },
  },
};
</script>

<style lang="scss" scopped>
.drop-down {
  &__header {
    height: 36px;
    //padding: 4px 4px 4px 4px;
    padding: 4px 4px 4px 16px;
    font-size: 11px;
    min-width: 160px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid #ffffff1a;
    background: #18191d;
    border-radius: 8px;
    display: grid;
    grid-auto-flow: column;
    align-items: center;
    gap: 8px;
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
      padding: 0px 0px 0px 16px;
    }

    &-balance {
      display: flex;
      gap: 10px;
      align-items: center;
      //justify-content: center;

      &-item {
        z-index: 1000;
        text-transform: uppercase;
        color: white;
      }
    }
  }

  &__submenu {
    position: absolute;
    top: 30px;
    left: -1px;
    background: #18191d;
    color: white;
    text-align: center;
    width: 80%;
    padding: 18px 0px 7px 0px;
    z-index: -2;
    cursor: pointer;
    border-bottom-right-radius: 12px;
    border-bottom-left-radius: 12px;
    border: 1px solid #ffffff1a;
    //min-height: 200px;
    border-top-width: 0;
    font-size: 14px;
    line-height: 16px;
    overflow: hidden;

    &-cash {
      padding: 2px 10px;
      line-height: 16px;

      &-title {
        color: #aaa7a8;
        font-size: 10px;
      }
      &-money {
        font-weight: 700;
        line-height: 20px;
      }
    }

    &-group {
      margin-top: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #ffffff1a;
      padding: 10px;
      transition: border-color 0.25s ease;

      &-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.25ss ease, color 0.25ss ease;
        color: #8c8c8c;

        &-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;

          & svg {
            display: flex;
            align-items: center;
          }
        }

        &:hover {
          color: white;
        }
        &.dark {
          color: #f1c40f;
          &:hover {
            color: #ba9100;
          }
        }
        &.light {
          transform: rotateZ(-25deg) translateY(0px);
          color: rgb(92, 168, 255);
          &:hover {
            color: rgb(45, 115, 196);
          }
        }
      }
    }
  }
}

.btn {
  background: #00ffff;
  color: #000000;
  border-radius: 8px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

  &-text {
    margin: 0 16px;
    font-size: 16px;
  }
}

.arrow {
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
  border-top: 4px solid white;
  transform: rotateZ(0deg) translateY(0.5px);
  transition: all 0.25s linear;
}
.expanded {
  transform: rotateZ(180deg) translateY(0.5px) !important;
}
.hidden {
  max-height: 0;
  opacity: 0;
  visibility: hidden;
  overflow: hidden;
  transition: max-height 0.25s ease, opacity 0.25s ease, visibility 0s 0.25s;
}
.visible {
  max-height: 200px;
  opacity: 1;
  visibility: visible;
  transition: max-height 0.25s ease, opacity 0.25s ease;
}
</style>
