<template>
  <div class="tabs">
    <div
      v-for="(tab, i) in tabs"
      :key="i"
      class="tab"
      :class="selectedIndex === i ? 'active' : ''"
      @click="$emit('update:selectedIndex', i)"
    >
      {{ tab.text }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

interface TabData {
  text: string;
  data?: unknown;
}

export default defineComponent({
  name: "Tabs",
  props: {
    tabs: {
      type: Array as PropType<TabData[]>,
      required: true,
    },
    selectedIndex: {
      type: Number,
      required: true,
    },
  },
  emits: ["update:selectedIndex"],
});
</script>

<style>
.tabs {
  display: flex;
  align-items: center;
}

.tabs .tab {
  padding: 0.5rem;
  color: var(--yellow-primary);
  cursor: pointer;
}
.tabs .tab:hover {
  background: rgba(255, 255, 255, 0.1);
}
.tabs .tab.active {
  background: rgba(255, 255, 255, 0.2);
}
</style>
