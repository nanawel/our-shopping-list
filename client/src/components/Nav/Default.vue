<template>
  <div class="wrapper">
    <v-toolbar-title>
      <span><slot name="main-title">{{ $root.title }}</slot></span>
    </v-toolbar-title>
    <slot name="main-title-after"></slot>
    <v-spacer></v-spacer>
  </div>
</template>

<script>
export default {
  name: "Nav-Default"
}
</script>

<style lang="scss" scoped>
.wrapper {
  display: contents;  // Fix appbar display by forcing ignore
}
</style>
