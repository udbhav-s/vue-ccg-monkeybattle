<template>
  <div
    class="card"
    :id="card && card.uid ? `card-${card.uid}` : ''"
    :class="{ 'card-disabled': onBoard && !card?.enabled }"
  >
    <div class="card-face">
      <template v-if="card">
        <img
          :src="
            require(`@/assets/images/cards/${
              card.type.toLowerCase()
            }Template.png`)
          "
          alt=""
        />
      </template>
      <template v-else>
        <img src="@/assets/images/cards/cardBack.png" alt="" />
      </template>
      <div v-if="card">
        <div class="overlay card-stat card-bananas">{{ card.bananas }}</div>
        <div v-if="card.attack" class="overlay card-stat card-attack">
          <transition name="slide" mode="out-in">
            <div :key="card.attack">
              {{ card.attack }}
            </div>
          </transition>
        </div>
        <div v-if="card.health" class="overlay card-stat card-health">
          <transition name="slide" mode="out-in">
            <div :key="card.health">
              {{ card.health }}
            </div>
          </transition>
        </div>
        <transition name="scaleAnim">
          <div v-if="showModifiers && onBoard" class="overlay card-modifiers">
            <transition-group name="scaleAnim">
              <div v-if="card.modifiers?.Blocker">
                <img src="@/assets/images/icons/Blocker.svg" />
              </div>
              <div v-if="card.modifiers?.Camo">
                <img src="@/assets/images/icons/Camo.svg" />
              </div>
              <div v-if="card.modifiers?.Disoriented">
                <img src="@/assets/images/icons/Disoriented.svg" />
              </div>
              <div v-if="card.modifiers?.Monkeshield">
                <img src="@/assets/images/icons/Monkeshield.svg" />
              </div>
              <div v-if="card.modifiers?.Burn" class="modifier-num">
                <img src="@/assets/images/icons/Burn.svg" />
                <div>{{ card.modifiers?.Burn }}</div>
              </div>
              <div v-if="card.modifiers?.Regen" class="modifier-num">
                <img src="@/assets/images/icons/Regen.svg" />
                <div>{{ card.modifiers?.Regen }}</div>
              </div>
            </transition-group>
          </div>
        </transition>
        <div v-if="card" class="overlay card-info">
          <h1 :class="card.name.length > 22 ? 'compact' : ''">
            {{ card.name }}
          </h1>
          <div v-if="card.description" class="card-desc">
            {{ card.description }}
          </div>
        </div>
        <div v-if="debug" class="overlay card-debug">
          {{ card }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { GameCard } from "monkeybattle-shared";
import { computed, defineComponent, PropType } from "vue";

export default defineComponent({
  name: "Card",
  props: {
    card: {
      type: Object as PropType<GameCard>,
      required: false,
    },
    onBoard: {
      type: Boolean,
      required: false,
    },
    debug: {
      type: Boolean,
      required: false,
    },
  },

  setup(props) {
    const showModifiers = computed(() => {
      if (!props.card || !props.card.modifiers) return false;
      else {
        let show = false;
        for (const key in props.card.modifiers) {
          if (props.card.modifiers[key]) show = true;
        }
        return show;
      }
    });

    const getSanitizedFilename = (s: string) =>
      s.replaceAll(/[^A-Za-z0-9]+/g, "");

    return { showModifiers, getSanitizedFilename };
  },
});
</script>

<style scoped>
/* NOTE - font size is passed as 10% of element width to the card container */
/* used to scale text elements based on container width */
.card {
  user-select: none;
}

/* .card-disabled {
  opacity: 0.5;
} */

.card-face {
  position: relative;
}

.card img {
  max-width: 100%;
  pointer-events: none;
}

.overlay {
  position: absolute;
  pointer-events: none;
  font-size: 1em;
  font-weight: bold;
  /* text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
    1px 1px 0 #000; */
}

.card .card-stat {
  font-size: 100%;
  color: white;
  -webkit-text-stroke: 1px black;
  text-align: center;
  display: inline-block;
}

.card-modifiers {
  top: 0;
  right: 0;
  padding: 0.2em;
  border-radius: 10%;
  background: var(--bg-tertiary);
  transform: translate(0.3em, -0.3em);
}

.card-modifiers > div {
  display: inline-block;
  margin: auto;
}

.card-modifiers > div:not(:last-child) {
  padding-right: 0.2em;
}

.card .card-modifiers img {
  width: 1.1em;
  margin: auto;
  margin-bottom: -0.2em;
}

.modifier-num {
  position: relative;
}
.modifier-num > div {
  position: absolute;
  top: 0;
  left: 0;
  font-size: 0.9em;
  transform: translateX(50%);
  -webkit-text-stroke: 1px black;
  margin: auto;
}

.card-bananas {
  top: 0;
  left: 0;
  transform: translate(1.4em, 0.5em);
}

.card-attack {
  top: 0;
  left: 0;
  transform: translate(2.65em, 6.2em);
}

.card-health {
  top: 0;
  left: 0;
  transform: translate(6.7em, 6.2em);
}

.card-info {
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  color: white;
}

.card-info h1 {
  font-size: 1em;
  padding-top: 2.5em;
}

.card-info h1.compact {
  padding-top: 13.2em;
  font-size: 0.6em;
}

.card-info .card-desc {
  padding-top: 7em;
  font-size: 0.6em;
  margin: auto;
  max-width: 13em;
  font-weight: lighter;
}

.card-debug {
  background: rgba(0, 0, 0, 0.5);
}
</style>
