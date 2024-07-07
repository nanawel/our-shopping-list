<template>
  <div>
    <empty-state-component>
      <template v-slot:icon-name>mdi-format-list-bulleted-type</template>
      <template v-slot:title>{{ $t('board-home-nav.title') }}</template>
      <template v-slot:subtitle>{{ $t('board-home-nav.subtitle') }}</template>
      <template v-slot:buttons>
        <v-btn name="Board/HomeComponent.new.button"
               :to="{name: 'newList'}"
               color="primary">{{ $t('board-home-nav.button') }}</v-btn>
      </template>
    </empty-state-component>
  </div>
</template>

<script>
import EmptyStateComponent from '@/components/EmptyStateComponent.vue'

export default {
  name: 'Board-HomeComponent',
  components: {
    EmptyStateComponent
  },
}
</script>

<style lang="scss" scoped>

</style>
