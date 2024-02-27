<template>
    <v-toolbar-title>
      <span><slot name="main-title">{{ title }}</slot></span>
      <slot name="main-title-after"></slot>
    </v-toolbar-title>
</template>

<script>
export default {
  name: "Nav-DefaultComponent",
  props: {
    title: String
  }
}
</script>
