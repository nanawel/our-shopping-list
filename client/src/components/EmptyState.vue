<template>
  <div class="empty-state">
    <v-icon class="icon" size="8em" color="teal lighten-3">
      <slot name="icon-name"></slot>
    </v-icon>
    <h1>
      <slot name="title">TITLE</slot>
    </h1>
    <div class="subtitle text--secondary">
      <slot name="subtitle">Subtitle</slot>
    </div>
    <div class="content">
      <slot name="content"></slot>
    </div>
    <div class="btn-wrapper">
      <slot name="buttons"></slot>
    </div>
    <div class="footer">
      <slot name="footer"></slot>
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
.subtitle {
  margin-bottom: 2rem;
}
.btn-wrapper {
  margin-bottom: 1em;
}
</style>
