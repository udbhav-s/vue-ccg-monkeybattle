<template>
  <div class="container about-game">
    <h1 class="title">Game rules</h1>
    <h2>Overview</h2>
    <p>
      MonkeyBattle works similarly to other card games such as Hearthstone -
      each round, you get some bananas which you can use to play cards from your
      deck that are randomly drawn into your hand. The cards are either
      creatures, which are played on the board and have attack and health but
      can only be used in the next turn or spells, which are single use cards
      with immediate effects. The ultimate goal is to attack the opponent's
      Monkey until it is at 0 health and you win the game. Your monkey takes
      damage each turn if you run out of cards in your deck.
    </p>

    <p>
      During a game you can also select the "?" icon on the right to get more info
    </p>

    <h2>Special card properties</h2>
    <div class="specials">
      <div>
        Blocker ✋ - when a blocker is on the board, other creatures must target
        them and cannot attack other cards. Spells can bypass this.
      </div>
      <div>
        High 🌿 - Creatures who are high won't always attack your selected
        target
      </div>
      <div>
        Monkeshield 🛡️ - This gives a creature protection the first time they
        take damage
      </div>
      <div>
        Burn 😨 - Creatures with Burn lose health at the end of each round
      </div>
      <div>Camo 🙈 - Creatures with camo cannot be targeted in attacks</div>
      <div>
        Instant - An immediately usable effect a creature has on being played
      </div>
    </div>
    <h2>Classes</h2>
    <p>
      Apart from a base set of neutral cards, there are three classes of cards
      which can only be added to a deck if they match the class of the Monkey.
      They are divided into Memes, Movies, and Festive.
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "About",
});
</script>

<style scoped>
h1 {
  text-align: center;
  color: var(--yellow-primary);
  margin-top: 2rem;
}

.about-game {
  max-width: 1000px;
}

h1,
h2,
p,
img,
div {
  margin-bottom: 1rem;
}
</style>
