<template>
  <div>
    <empty-state>
      <template v-slot:icon-name>mdi-format-list-bulleted-type</template>
      <template v-slot:title>Create a shopping list</template>
      <template v-slot:subtitle>You will then be able to share it with relatives and work with it.</template>
      <template v-slot:buttons>
        <v-btn @click="$router.push('list/new')" color="primary">Create a list</v-btn>
      </template>
    </empty-state>
  </div>
  
</template>

<script>
import EmptyState from './EmptyState.vue'

export default {
  name: 'Home',
  components: {
    EmptyState
  },
}
</script>

<style lang="scss" scoped>

</style>