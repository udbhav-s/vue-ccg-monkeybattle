<template>
  <div class="footer">
    <div>
      This site works best on a desktop screen. Made by
      <a href="https://github.com/udbhav-s">udbhav-s</a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "AppFooter",
});
</script>

<style>
.footer {
  background: var(--bg-secondary);
  padding: 1rem;
  text-align: center;
}

.footer a {
  text-decoration: underline;
}
</style>
