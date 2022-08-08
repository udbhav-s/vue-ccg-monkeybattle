<template>
  <svg
    v-if="typeof to.x === 'number' && typeof to.y === 'number'"
    :viewBox="`0 0 ${windowSize.width} ${windowSize.height}`"
    :class="[transition ? 'arrow-transition' : '']"
    version="1.1"
    id="svg995"
    inkscape:version="1.1 (c68e22c387, 2021-05-23)"
    sodipodi:docname="arrow2.svg"
    xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
    xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:svg="http://www.w3.org/2000/svg"
  >
    <defs id="defs992">
      <linearGradient
        inkscape:collect="always"
        xlink:href="#linearGradient1985"
        id="linearGradient1987"
        x1="1467"
        y1="523"
        x2="1336"
        y2="248"
        gradientUnits="userSpaceOnUse"
        gradientTransform="matrix(0.17174648,0,0,0.16377863,-195.35919,-17.025524)"
      />
      <linearGradient inkscape:collect="always" id="linearGradient1985">
        <stop
          style="stop-color: #ff2a2a; stop-opacity: 1"
          offset="0"
          id="stop1981"
        />
        <stop
          style="stop-color: #ff5959; stop-opacity: 1"
          offset="1"
          id="stop1983"
        />
      </linearGradient>
    </defs>
    <g inkscape:label="Layer 1" inkscape:groupmode="layer" id="layer1">
      <g
        id="arrow"
        inkscape:label="arrow"
        :transform="`rotate(${angle} ${to.x} ${to.y}) translate(${to.x} ${to.y})`"
      >
        <rect
          style="
            fill: #ff2a2a;
            fill-opacity: 1;
            stroke: #000000;
            stroke-width: 1.6396;
            stroke-linecap: round;
            stroke-linejoin: round;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
          id="arrow-body"
          width="38.738945"
          :transform="`translate(${-dimensions.arrowBodyWidth / 2} 0)`"
          :height="Math.max(height - dimensions.arrowBodyOffset, 0)"
          :x="0"
          :y="dimensions.arrowBodyOffset"
          ry="11.789049"
          inkscape:label="arrow-body"
        />
        <path
          id="arrow-head"
          style="
            fill: url(#linearGradient1987);
            fill-opacity: 1;
            stroke: #000000;
            stroke-width: 1.62591;
            stroke-linecap: round;
            stroke-linejoin: round;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;
          "
          :transform="`translate(${-dimensions.arrowWidth / 2} 0)`"
          d="M 44.999989,0.8129119 0.81285882,52.013892 H 25.506771 V 83.207007 H 64.493219 V 52.013892 h 24.69392 z"
          inkscape:label="arrow-head"
        />
      </g>
    </g>
  </svg>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, watch } from "vue";

export default defineComponent({
  name: "Arrow",
  props: {
    fromX: {
      type: Number,
      required: true,
    },
    fromY: {
      type: Number,
      required: true,
    },
    toX: {
      type: Number,
    },
    toY: {
      type: Number,
    },
    transition: {
      type: Boolean,
      required: false,
    },
  },

  setup(props) {
    const to = reactive<{ x?: number; y?: number }>({});
    const windowSize = reactive({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    const dimensions = {
      arrowBodyWidth: 38.738945,
      arrowBodyOffset: 88.907135,
      arrowWidth: 90,
    };

    const angle = computed(() => {
      if (!(typeof to.x === "number" && typeof to.y === "number")) return 0;
      let a = Math.atan2(to.y - props.fromY, to.x - props.fromX);
      return (a * 180) / Math.PI + 90;
    });

    const height = computed(() =>
      typeof to.x === "number" && typeof to.y === "number"
        ? Math.sqrt(
            Math.pow(to.y - props.fromY, 2) + Math.pow(to.x - props.fromX, 2)
          )
        : 0
    );

    const handler = (e: MouseEvent) => {
      to.x = e.pageX;
      to.y = e.pageY;
    };

    const assignToCoords = () => {
      window.removeEventListener("mousemove", handler);
      if (typeof props.toX === "number" && typeof props.toY === "number") {
        to.x = props.toX;
        to.y = props.toY;
      } else window.addEventListener("mousemove", handler);
    };
    watch([() => props.toX, () => props.toY], assignToCoords);
    assignToCoords();

    window.addEventListener("resize", () => {
      windowSize.width = window.innerWidth;
      windowSize.height = window.innerHeight;
    });

    return {
      to,
      windowSize,
      dimensions,
      angle,
      height,
    };
  },
});
</script>

<style scoped>
svg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
}

@keyframes arrow-transition {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.arrow-transition {
  animation: arrow-transition 0.7s ease-in;
}
</style>
