<template>
  <div>
    <empty-state>
      <template v-slot:icon-name>mdi-format-list-bulleted-type</template>
      <template v-slot:title>Create a shopping list</template>
      <template v-slot:subtitle>You will then be able to share it with relatives and work with it.</template>
      <template v-slot:buttons>
        <v-btn @click="onCreateListClick" color="primary">Create a list</v-btn>
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
  methods: {
    onCreateListClick: function() {
      this.$router.push('list/new')
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
