<template>
  <div class="empty-state">
    <v-icon size="8em" color="teal lighten-3">
      <slot name="icon-name">mdi-format-list-bulleted-type</slot>
    </v-icon>
    <h1>
      <slot name="title">TITLE</slot>
    </h1>
    <span class="text--secondary">
      <slot name="subtitle">Subtitle</slot>
    </span>
    <div class="btn-wrapper">
      <slot name="buttons"></slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'EmptyState'
  }
</script>

<style lang="scss" scoped>
.empty-state {
  text-align: center;
}
.btn-wrapper {
  margin: 2em;
}
</style>