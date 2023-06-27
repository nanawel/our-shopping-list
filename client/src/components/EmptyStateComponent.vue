<template>
  <div class="empty-state">
    <v-icon class="icon" size="8em" color="teal lighten-3">
      <slot name="icon-name"></slot>
    </v-icon>
    <h1>
      <slot name="title"></slot>
    </h1>
    <div class="subtitle text--secondary">
      <slot name="subtitle"></slot>
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
    name: 'EmptyStateComponent'
  }
</script>

<style lang="scss" scoped>
.empty-state {
  text-align: center;
  padding: 1rem;
}
.subtitle:last-child {
  margin-bottom: 2rem;
}
.content {
  padding: .5rem;
}
.btn-wrapper:last-child {
  margin-bottom: 1em;
}
</style>
