<template>
  <div>
    <empty-state>
      <template v-slot:icon-name>mdi-clipboard-list-outline</template>
      <template v-slot:title>Open board</template>
      <template v-slot:subtitle>A board holds one to several lists.</template>
      <template v-slot:content>
        <v-container fill-height>
          <v-row align="center" justify="center">
            <v-col md="4">
              <v-text-field
                name="name"
                label="Name"
                v-model="boardNameInput" />
            </v-col>
          </v-row>
        </v-container>
      </template>
      <template v-slot:buttons>
        <v-btn @click="onOpenBoardClick" color="primary">Open board</v-btn>
      </template>
    </empty-state>
  </div>
</template>

<script>
import EmptyState from './EmptyState.vue'

import Board from '@/models/Board'

export default {
  name: 'Home',
  components: {
    EmptyState
  },
  data() {
    return {
      boardNameInput: ''
    }
  },
  methods: {
    onOpenBoardClick: function() {
      const slug = Board.getSlugFromName(this.boardNameInput)
      this.$router.push(`board/${slug}`)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
