<template>
  <div id="game">
    <div v-if="game.state.stage === 'Pregame'">
      <div class="center-container">
        <h1 class="title">Loading data...</h1>
      </div>
    </div>

    <div v-if="game.state.stage === 'PickCards'">
      <div class="center-container pick-cards-container">
        <div>
          <div class="center-child">
            <h1 class="title">
              Opponent: {{ game.state.opponent.user.username }}
            </h1>
          </div>
          <div class="pick-cards">
            <div
              v-for="card in game.state.player.pickCards"
              :key="card.uid"
              class="pick-card"
            >
              <Card :card="card" />
            </div>
          </div>
          <div class="center-child">
            <template v-if="!game.state.player.cardsPicked">
              <button
                class="button"
                @click="acceptPickedCards"
                :disabled="game.state.player.cardsPicked"
              >
                Accept
              </button>
              <button
                class="button"
                @click="reshuffle()"
                :disabled="
                  game.state.player.allowedShuffles === 0 ||
                  game.state.player.cardsPicked
                "
              >
                Shuffle ({{ game.state.player.allowedShuffles }} remaining)
              </button>
            </template>
            <template v-else>Waiting for opponent...</template>
          </div>
        </div>
      </div>
    </div>

    <div v-if="game.state.stage === 'MainGame'" id="main-game">
      <div class="game-container">
        <Arrow
          v-if="
            selectedHandCard &&
            typeof handCardSelectedCoords.x === 'number' &&
            typeof handCardSelectedCoords.y === 'number'
          "
          :fromX="handCardSelectedCoords.x"
          :fromY="handCardSelectedCoords.y"
        />
        <Arrow
          v-if="
            selectedBoardCard &&
            typeof boardCardSelectedCoords.x === 'number' &&
            typeof boardCardSelectedCoords.y === 'number'
          "
          :fromX="boardCardSelectedCoords.x"
          :fromY="boardCardSelectedCoords.y"
        />
        <Arrow
          v-if="arrowCoords.length"
          :transition="true"
          :fromX="arrowCoords[arrowCoords.length - 1].from.x"
          :fromY="arrowCoords[arrowCoords.length - 1].from.y"
          :toX="arrowCoords[arrowCoords.length - 1].to.x"
          :toY="arrowCoords[arrowCoords.length - 1].to.y"
        />

        <div class="panel opponent-panel">
          <Monkey
            class="opponent-monkey"
            id="opponent-monkey"
            :monkey="game.state.opponent.monkey"
            :monkeyHealth="game.state.opponent.monkeyHealth"
            :healthTop="false"
            :turn="game.state.turn !== game.state.playerTurn"
            @mouseup="
              targetClicked(TargetTypes.EnemyMonkey, TargetTypes.EnemyMonkey)
            "
          />
          <div class="opponent-hand">
            <div
              v-for="i in game.state.opponent.handNum !== undefined
                ? game.state.opponent.handNum
                : game.state.opponent.hand.length"
              :key="i"
            >
              <div class="hand-card">
                <Card />
              </div>
            </div>
          </div>
          <div class="opponent-name">
            {{ game.state.opponent.user.username }}
          </div>
          <div class="stats">
            <div class="bananas title">
              <span>{{ game.state.opponent.bananas }}</span>
              <span class="banana">🍌</span>
            </div>
            <div class="deck-num">
              {{
                game.state.opponent.deckNum !== undefined
                  ? game.state.opponent.deckNum
                  : game.state.opponent.deck.length
              }}
              in deck
            </div>
          </div>
        </div>

        <div class="boards">
          <div class="opponent-board board">
            <transition-group name="scaleAnim">
              <Card
                v-for="card in game.state.opponent.board"
                :key="card.uid"
                :card="card"
                :debug="false"
                :onBoard="true"
                @mouseup="targetClicked(card, TargetTypes.EnemyCreature)"
                @mouseenter="setInfoPanel(InfoPanel.BoardCard, card)"
                @mouseleave="setInfoPanel(InfoPanel.Default)"
              />
            </transition-group>
          </div>

          <div class="timer-container">
            <div ref="timer" class="timer"></div>
          </div>

          <div class="player-board board">
            <transition-group name="scaleAnim">
              <Card
                v-for="card in game.state.player.board"
                :key="card.uid"
                :card="card"
                :debug="false"
                :onBoard="true"
                @mouseup="targetClicked(card, TargetTypes.FriendlyCreature)"
                @mousedown="boardCardPressed(card)"
                :ref="(comp) => setBoardSelectedElement(comp as any, card)"
                @mouseenter="setInfoPanel(InfoPanel.BoardCard, card)"
                @mouseleave="setInfoPanel(InfoPanel.Default)"
              />
            </transition-group>
          </div>
        </div>

        <div class="panel player-panel">
          <div class="stats">
            <button
              @click="doneTurn"
              :disabled="game.state.playerTurn !== game.state.turn"
              id="change-turn-button"
              class="button outlined"
            >
              {{
                game.state.playerTurn === game.state.turn
                  ? "Your Turn"
                  : "Opp. Turn"
              }}
            </button>
            <div class="bananas title">
              <span>{{ game.state.player.bananas }}</span>
              <span class="banana">🍌</span>
            </div>
            <div class="deck-num">
              {{
                game.state.player.deckNum !== undefined
                  ? game.state.player.deckNum
                  : game.state.player.deck.length
              }}
              in deck
            </div>
          </div>
          <div
            class="player-hand"
            :class="{ 'has-selected': selectedHandCard }"
          >
            <Card
              v-for="card in game.state.player.hand"
              :key="card.uid"
              :card="card"
              :debug="false"
              @click="playCard(card)"
              class="hand-card"
              :class="{ selected: card.handSelected }"
              :ref="(comp) => setHandSelectedElement(comp as any, card)"
              @mouseenter="setInfoPanel(InfoPanel.HandCard, card)"
              @mouseleave="setInfoPanel(InfoPanel.Default)"
            />
          </div>
          <Monkey
            class="player-monkey"
            id="player-monkey"
            :monkey="game.state.player.monkey"
            :monkeyHealth="game.state.player.monkeyHealth"
            :healthTop="true"
            :turn="game.state.turn === game.state.playerTurn"
          />
        </div>
      </div>

      <div class="info-panel-container">
        <div
          v-if="!showInfoPanel"
          @click="showInfoPanel = true"
          class="button outlined info-panel-button"
        >
          ?
        </div>
        <div class="info-panel" :class="showInfoPanel ? 'show' : ''">
          <button @click="showInfoPanel = false" class="button outlined">
            Close
          </button>
          <div v-if="infoPanelType === 'Default'">
            <h2>Info</h2>
            <strong>
              {{
                game.state.playerTurn === game.state.turn
                  ? "Your turn"
                  : "Opponent's turn"
              }}
            </strong>
            <p>
              Cards cost <strong>bananas</strong> to play (visible in the bottom
              bottom left corner). Attack the enemy's creatures and get their
              health down to 0! Make sure to play your turn before your time
              runs out (indicated by the yellow bar in the middle)
            </p>
            <p>
              <strong>Click</strong> on a card in your hand to play it on your
              board
            </p>
            <p>
              If you have a creature on your board, you can
              <strong>drag</strong> your mouse from it to select a target to
              attack
            </p>
            <p>Hover your mouse over any card to see more info about it</p>
          </div>
          <div
            v-if="
              (infoPanelType === 'HandCard' || infoPanelType === 'BoardCard') &&
              infoSelectedCard
            "
          >
            <h2>{{ infoSelectedCard.name }}</h2>
            <p>
              {{ infoSelectedCard.bananas }} 🍌
              <template v-if="infoSelectedCard.type === 'CREATURE'">
                {{ infoSelectedCard.attack }} 🔴
                {{ infoSelectedCard.health }} 🟢
              </template>
            </p>
            <p>{{ infoSelectedCard.description }}</p>
            <h3>Type: {{ infoSelectedCard.type }}</h3>
            <p>
              <template v-if="infoSelectedCard.type === 'CREATURE'">
                Creatures can attack other cards and the enemy monkey to reduce
                their health, and are destroyed once their own health is
                depleted
              </template>
              <template v-else>
                Spells are single-use cards that activate an effect
              </template>
            </p>
            <p v-if="infoSelectedCard.instant">
              This creature also has an instant effect that activates when it's
              played
            </p>
            <p
              v-if="
                infoSelectedCard.instant?.targets?.select ===
                TargetSelect.ByPlayer
              "
            >
              When playing this creature, you need to select a target for the
              instant effect (unless there are no valid targets available)
            </p>
            <p
              v-if="
                infoSelectedCard.spell?.targets?.select ===
                TargetSelect.ByPlayer
              "
            >
              You need to select a target for this spell (it cannot be played if
              there are no valid targets)
            </p>
            <div v-if="infoSelectedCard.type === 'CREATURE'">
              <h3>Modifiers</h3>
              <p v-if="infoSelectedCard.modifiers?.Blocker">
                Blocker - when a blocker is on the board, other creatures must
                target them and cannot attack other cards. Spells can bypass
                this.
              </p>
              <p v-if="infoSelectedCard.modifiers?.High">
                High - Creatures who are high won't always attack the selected
                target
              </p>
              <p v-if="infoSelectedCard.modifiers?.Monkeshield">
                Monkeshield - This gives a creature protection the first time
                they take damage
              </p>
              <p v-if="infoSelectedCard.modifiers?.Burn">
                Burn ({{ infoSelectedCard.modifiers?.Burn }}) - Creatures with
                Burn lose health at the end of each round
              </p>
              <p v-if="infoSelectedCard.modifiers?.Regen">
                Regen ({{ infoSelectedCard.modifiers?.Regen }}) - Creatures with
                Regen heal at the end of each round
              </p>
              <p v-if="infoSelectedCard.modifiers?.Camo">
                Camo - Creatures with camo cannot be targeted in attacks
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="game.state.stage === 'Ended'" class="game-modal">
      <div v-if="game.state.winner === game.state.player.user.id">
        <h1 class="title">Victory!</h1>
        <div v-if="game.state.gameData?.opponentDisconnected">
          Opponent disconnected
        </div>
      </div>
      <div v-else>
        <h1>Defeat</h1>
      </div>
      <div v-if="game.endInfo?.levelStats">
        <div>{{ game.endInfo.levelStats.xp }}xp</div>
        <div>Level {{ game.endInfo.levelStats.level }}</div>
      </div>
      <div>
        <router-link class="button" to="/dashboard">Dashboard</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { socket } from "@/services/game.service";
import { Card } from "@/types";
import {
  GameCardTypes,
  getValidTargets,
  TargetSelect,
  TargetTypes,
  gameConfig,
  GameStage,
  GameCard,
} from "monkeybattle-shared";
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  reactive,
  ref,
  watch,
} from "vue";
import { useClientGame, serverCallback } from "../../game/gameClient";
import { useAiGame } from "../../game/aiGameClient";
import CardComponent from "./Card.vue";
import Arrow from "./Arrow.vue";
import Monkey from "./Monkey.vue";
import { userStore } from "@/store";
import { deckService } from "@/services/deck.service";
import { useToast } from "vue-toastification";

type TargetOrCard = TargetTypes.EnemyMonkey | (GameCard & { uid: string });

type ElementCoords = {
  x?: number;
  y?: number;
};

enum InfoPanel {
  HandCard = "HandCard",
  BoardCard = "BoardCard",
  Default = "Default",
}

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default defineComponent({
  name: "Game",
  props: {
    ai: {
      type: Boolean,
    },
    deckId: {
      type: Number,
    },
  },
  components: {
    Card: CardComponent,
    Arrow,
    Monkey,
  },
  emits: ["notFound"],

  async setup(props, { emit }) {
    const toast = useToast();
    let selectedGameClient;

    // watch cannot be called after await
    // stop handles have to be returned and called manually to close watchers
    const stopHandles = [] as (() => void)[];

    onBeforeUnmount(() => {
      if (!game) return;

      if (game.state.stage !== GameStage.Ended) {
        const answer = window.confirm(
          "Are you sure you want to disconnect from the game?"
        );
        if (!answer) return false;
      }

      destroyGame();

      if (!props.ai) socket.disconnect();

      // close watchers
      stopHandles.forEach((h) => h());
    });

    // load game
    if (props.ai) {
      if (typeof props.deckId !== "number")
        throw new Error("Deck index not specified");

      const playerParam = {
        user: userStore.getters.user(),
        deck: await deckService.getDeckWithCards(props.deckId),
      };

      selectedGameClient = await useAiGame(playerParam);
    } else {
      try {
        selectedGameClient = await useClientGame();
      } catch (error) {
        emit("notFound");
        throw new Error("Game not found");
      }
    }

    // load game data from the selected client
    const {
      game,
      attack,
      eventEmitter,
      reshuffle,
      acceptPickedCards,
      doneTurn,
      playCreature,
      playSpell,
      ready,
      destroyGame,
    } = selectedGameClient;

    let timerAnimation: Animation;
    let timerSetup = false;
    const timer = ref<HTMLElement>();
    const timerHandler = () => {
      if (timer.value) {
        timerAnimation = timer.value.animate(
          [{ width: "100%" }, { width: "0%" }],
          {
            duration: gameConfig.turnTimeout,
          }
        );
      } else {
        watch(
          () => timer.value,
          (newVal) => {
            if (newVal && !timerSetup) {
              timerHandler();
              timerSetup = true;
            }
          }
        );
      }
    };

    // start timer when stage changes to main game
    eventEmitter.on("roundStart", (round: number) => {
      if (round === 0) timerHandler();
    });
    // reset timer on each turn change
    stopHandles.push(
      watch(
        () => game.state.turn,
        () => timerHandler()
      )
    );

    const arrowCoords = ref<
      {
        from: { x: number; y: number };
        to: { x: number; y: number };
      }[]
    >([]);

    const getTargetBoundsFromCardUid = (
      cardUid: string,
      target: TargetOrCard
    ) => {
      if (target === TargetTypes.EnemyMonkey) {
        let t;
        if (game.state.player.board.find((c) => c.uid === cardUid))
          t = document.getElementById("opponent-monkey");
        else t = document.getElementById("player-monkey");
        if (!t) throw new Error("Opponent monkey element not found");
        return t.getBoundingClientRect();
      } else {
        let t = document.getElementById(`card-${target.uid}`);
        if (!t) throw new Error("Attacked card not found");
        return t.getBoundingClientRect();
      }
    };

    // animations and timer adjust
    eventEmitter.on(
      "spellPlayed",
      async (data: { user: number; card: Card; target?: TargetOrCard }) => {
        if (!timerAnimation) return;
        timerAnimation.pause();

        // show spell on board
        if (game.state.player.user.id === data.user) {
          game.state.player.board.push(data.card);
        } else game.state.opponent.board.push(data.card);

        // wait for DOM update
        nextTick(async () => {
          if (data.target) {
            const from = document
              .getElementById(`card-${data.card.uid}`)
              ?.getBoundingClientRect();
            if (!from) throw new Error("Element not found");

            const to = getTargetBoundsFromCardUid(data.card.uid, data.target);

            arrowCoords.value.push({
              from: {
                x: from.x + from.width / 2,
                y: from.y + from.height / 2,
              },
              to: {
                x: to.x + to.width / 2,
                y: to.y + to.height / 2,
              },
            });
          }

          await sleep(gameConfig.playSpellDelay);

          arrowCoords.value.shift();

          game.state.player.board = game.state.player.board.filter(
            (c) => c.uid !== data.card.uid
          );
          game.state.opponent.board = game.state.opponent.board.filter(
            (c) => c.uid !== data.card.uid
          );
          timerAnimation.play();
        });
      }
    );

    eventEmitter.on(
      "creaturePlayed",
      async (data: { uid: string; target?: TargetOrCard }) => {
        if (!timerAnimation) return;
        timerAnimation.pause();

        nextTick(async () => {
          if (data.target) {
            const from = document
              .getElementById(`card-${data.uid}`)
              ?.getBoundingClientRect();
            if (!from) throw new Error("Element not found");

            const to = getTargetBoundsFromCardUid(data.uid, data.target);

            arrowCoords.value.push({
              from: {
                x: from.x + from.width / 2,
                y: from.y + from.height / 2,
              },
              to: {
                x: to.x + to.width / 2,
                y: to.y + to.height / 2,
              },
            });
          }

          await sleep(gameConfig.playCreatureDelay);

          arrowCoords.value.shift();
          timerAnimation.play();
        });
      }
    );

    // attack animation
    eventEmitter.on("creatureAttack", async (data) => {
      if (!timerAnimation) return;
      timerAnimation.pause();

      const attackingCard = document.getElementById(
        `card-${data.attackingUid}`
      );
      if (!attackingCard) throw new Error("Attacking card not found");
      const attackingCardBounds = attackingCard.getBoundingClientRect();

      let targetBounds = getTargetBoundsFromCardUid(
        data.attackingUid,
        data.attacked
      );

      let translateY = targetBounds.y - attackingCardBounds.y;
      if (translateY > 0) translateY += targetBounds.height / 2;
      else translateY -= targetBounds.height / 2;

      const translateX = targetBounds.x - attackingCardBounds.x;
      const angle = Math.atan2(translateY, translateX) + Math.PI / 2;

      attackingCard.animate(
        [
          { transform: "translate(0, 0)" },
          {
            transform: `translate(${translateX}px, ${translateY}px) rotate(${angle}rad)`,
          },
          { transform: "translate(0, 0)" },
        ],
        { duration: 500, easing: "ease-in-out" }
      );

      await sleep(gameConfig.attackDelay);
      timerAnimation.play();
    });

    const playCard = (card: Card) => {
      if (game.state.turn !== game.state.playerTurn)
        toast.error("Opponent turn, cannot play card!");
      else if (game.state.player.bananas < card.bananas)
        toast.error("Not enough bananas!");
      else if (!selectedHandCard.value) {
        if (
          card.type === GameCardTypes.CREATURE &&
          game.state.player.board.length < 6
        ) {
          if (
            card.instant &&
            card.instant.targets?.select === TargetSelect.ByPlayer
          ) {
            if (
              getValidTargets(
                card,
                card.instant.targets,
                game.state.player,
                game.state.opponent
              ).length > 0
            ) {
              card.handSelected = true;
            } else {
              playCreature(card.uid);
            }
          } else playCreature(card.uid);
        } else if (card.type === GameCardTypes.SPELL) {
          if (card.spell?.targets?.select === TargetSelect.ByPlayer) {
            if (
              getValidTargets(
                card,
                card.spell.targets,
                game.state.player,
                game.state.opponent
              ).length > 0
            ) {
              card.handSelected = true;
            } else {
              toast.error("Spell has no valid targets");
            }
          } else playSpell(card.uid);
        }
      } else {
        toast.error("Cannot play card!");
      }
    };

    const selectedHandCard = computed<Card | undefined>(() =>
      game.state.player.hand?.find((c) => c.handSelected)
    );
    const handCardSelectedCoords = reactive<ElementCoords>({});
    const setHandSelectedElement = (comp: { $el: HTMLElement }, card: Card) => {
      if (card.handSelected && comp) {
        const rect = comp.$el.getBoundingClientRect();
        handCardSelectedCoords.x = rect.left + rect.width / 2;
        handCardSelectedCoords.y = rect.top + rect.height / 2;
      }
    };

    const selectedBoardCard = computed<Card | undefined>(() =>
      game.state.player.board.find((c) => c.boardSelected)
    );
    const boardCardSelectedCoords = reactive<ElementCoords>({});
    const setBoardSelectedElement = (
      comp: { $el: HTMLElement },
      card: Card
    ) => {
      if (card.boardSelected && comp) {
        const rect = comp.$el.getBoundingClientRect();
        boardCardSelectedCoords.x = rect.left + rect.width / 2;
        boardCardSelectedCoords.y = rect.top + rect.height / 2;
      }
    };

    const boardCardPressed = (card: Card) => {
      if (
        game.state.turn === game.state.playerTurn &&
        !selectedBoardCard.value &&
        !selectedHandCard.value &&
        card.enabled &&
        !card.attackDisabled
      )
        card.boardSelected = true;
    };
    window.addEventListener("mouseup", () => {
      if (selectedBoardCard.value)
        selectedBoardCard.value.boardSelected = false;
      if (selectedHandCard.value) selectedHandCard.value.handSelected = false;
    });

    const targetClicked = (
      target: Card | TargetTypes.EnemyMonkey,
      type: TargetTypes
    ) => {
      const handCb: serverCallback = (res) => {
        if (selectedHandCard.value) selectedHandCard.value.handSelected = false;
        if (res.error) {
          toast.error(res.error);
        }
      };

      const boardCb: serverCallback = (res) => {
        if (res.error) {
          toast.error(res.error);
        } else console.log("Attack successful");
      };

      if (selectedHandCard.value) {
        if (selectedHandCard.value.instant) {
          if (selectedHandCard.value.instant.targets?.type.includes(type)) {
            playCreature(
              selectedHandCard.value.uid,
              target === TargetTypes.EnemyMonkey ? target : target.uid,
              handCb
            );
          } else {
            toast.error("Invalid target selected");
          }
        } else if (selectedHandCard.value.spell) {
          if (selectedHandCard.value.spell.targets?.type.includes(type)) {
            playSpell(
              selectedHandCard.value.uid,
              target === TargetTypes.EnemyMonkey ? target : target.uid,
              handCb
            );
          } else {
            toast.error("Invalid target selected");
          }
        }
      } else if (selectedBoardCard.value) {
        if (
          type !== TargetTypes.EnemyMonkey &&
          type !== TargetTypes.EnemyCreature
        ) {
          toast.error("Invalid target selected");
          return;
        }
        attack(
          selectedBoardCard.value.uid,
          target === TargetTypes.EnemyMonkey ? target : target.uid,
          boardCb
        );
      }
    };

    eventEmitter.on("warnIdle", () => {
      toast.error("Warning: you will be kicked for being idle");
    });

    eventEmitter.on("victory", () => {
      if (timerAnimation) timerAnimation.pause();
    });

    const infoPanelType = ref(InfoPanel.Default);
    const infoSelectedCard = ref<Card>();
    const showInfoPanel = ref(false);
    const setInfoPanel = (type: InfoPanel, card?: Card) => {
      infoPanelType.value = type;
      infoSelectedCard.value = card;
    };

    await ready();

    return {
      game,
      reshuffle,
      acceptPickedCards,
      playCard,
      doneTurn,
      selectedHandCard,
      arrowCoords,
      setHandSelectedElement,
      handCardSelectedCoords,
      selectedBoardCard,
      setBoardSelectedElement,
      boardCardSelectedCoords,
      boardCardPressed,
      targetClicked,
      timer,
      infoPanelType,
      infoSelectedCard,
      setInfoPanel,
      showInfoPanel,
      InfoPanel,
      TargetSelect,
      TargetTypes,
    };
  },
});
</script>

<style scoped>
body {
  overflow: hidden;
}

#game {
  width: 100%;
  height: 100vh;
}

#game #main-game {
  background: url("../../assets/images/background.svg");
  background-size: cover;
  background-position: center;
}

#game h1 {
  margin-top: 0;
}

#game .center-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin: auto 0;
}

.pick-cards {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  margin-bottom: 0.5rem;
}

.pick-cards-container .title {
  margin-bottom: 0.5rem;
}

.pick-cards-container button {
  margin: auto 1rem;
}

.game-container {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: stretch;
}

.info-panel-container {
  z-index: 3;
}
.info-panel {
  background: var(--bg-primary);
  z-index: 4;
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  transition: transform 0.5s;
  padding: 1rem;
  transform: translateX(100%);
  max-width: 30ch;
}
.info-panel-button {
  position: fixed;
  top: 20vh;
  right: 0;
  cursor: pointer;
}
.info-panel.show {
  transform: translateX(0%);
}

.game-modal {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  z-index: 10;
  background: rgba(0, 0, 0, 0.8);
}
.game-modal > * {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
.game-modal h1 {
  font-size: 3rem;
}

.pick-card {
  margin: 20px;
  max-width: 300px;
  font-size: 30px;
  flex: none;
}

#change-turn-button:active {
  transform: scale(0.9);
}

.panel {
  display: flex;
  flex-direction: row;
  position: relative;
}

.panel .stats {
  background: var(--bg-secondary);
  padding: 0.4rem;
  text-align: center;
}
.player-panel .stats {
  align-self: flex-end;
}
.opponent-panel .stats {
  align-self: flex-start;
}

.opponent-panel .opponent-name {
  width: 12ch;
  margin-top: 3px;
  align-self: flex-start;
  -webkit-text-stroke: 0.03em black;
}

.stats > span {
  margin-left: 0.6rem;
}
.stats .bananas {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: var(--yellow-primary);
  line-height: 1;
  padding-top: 0.3rem;
  text-align: center;
}
.stats .banana {
  margin-left: 0.3rem;
  font-size: 1.3rem;
}
.stats .button {
  padding: 0.2rem;
  margin-bottom: 0.4rem;
  min-width: 8ch;
}

.player-monkey {
  max-width: 190px;
  position: absolute;
  right: 0;
  bottom: 0;
}

.opponent-monkey {
  max-width: 190px;
  position: absolute;
  left: 0;
  top: 0;
}

.player-hand {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 190px;
}

.hand-card {
  max-width: 130px;
  font-size: 13px;
  margin-right: -69px;
  margin-bottom: -100px;
  transition: 0.3s;
  transition-property: transform;
}

.hand-card .card-face {
  animation: scaleGrow 0.7s ease forwards;
}

.boards .card {
  max-width: 150px;
  font-size: 15px;
  margin-left: 10px;
  margin-right: 10px;
  animation: flexGrow 0.3s ease forwards;
}
.boards .card.scaleAnim-leave-active {
  animation: none;
}

.player-hand:not(.has-selected) .hand-card:hover,
.player-hand .hand-card.selected {
  transform: scale(1.3) translateY(-120px);
  z-index: 2;
}

.player-hand .hand-card:not(:hover):not(.selected) {
  z-index: 0;
}

.opponent-hand {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: hidden;
}

.opponent-hand .hand-card {
  position: relative;
  bottom: 150px;
}

.boards {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: stretch;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.timer-container {
  width: 100%;
  height: 5px;
  background: var(--bg-secondary);
  margin-top: 1rem;
  margin-bottom: 1rem;
}
.timer {
  width: 100%;
  height: 5px;
  background: var(--yellow-primary);
}

.board {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
.opponent-board {
  flex: 1;
}
.player-board {
  flex: 1;
}
</style>
