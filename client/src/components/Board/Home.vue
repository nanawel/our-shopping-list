<template>
  <div>
    <empty-state>
      <template v-slot:icon-name>mdi-format-list-bulleted-type</template>
      <template v-slot:title>{{ $t('board-home-nav.title') }}</template>
      <template v-slot:subtitle>{{ $t('board-home-nav.subtitle') }}</template>
      <template v-slot:buttons>
        <v-btn :to="{name: 'newList'}"
               color="primary">{{ $t('board-home-nav.button') }}</v-btn>
      </template>
    </empty-state>
  </div>
</template>

<script>
import EmptyState from '@/components/EmptyState.vue'

export default {
  name: 'Board-Home',
  components: {
    EmptyState
  },
}
</script>

<style lang="scss" scoped>

</style>
