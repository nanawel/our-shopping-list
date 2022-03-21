<template>
  <div>
    <div class="logo-container">
      <img src="@/assets/logo.svg" width="120" height="120" alt="OSL logo">
    </div>
    <empty-state>
      <template v-slot:title>Open board</template>
      <template v-slot:subtitle>A board holds one to several lists.</template>
      <template v-slot:content>
        <v-container fill-height>
          <v-row align="center" justify="center">
            <v-col md="4">
              <v-text-field
                name="name"
                label="Name"
                v-model="boardNameInput"
                @keydown.enter="onOpenBoard"/>
            </v-col>
          </v-row>
        </v-container>
      </template>
      <template v-slot:buttons>
        <v-btn @click="onOpenBoard" color="primary">Open board</v-btn>
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
    onOpenBoard: function() {
      const slug = Board.getSlugFromName(this.boardNameInput)
      this.$router.push({name: 'board', params: {boardSlug: slug}})
    }
  }
}
</script>

<style lang="scss" scoped>
.logo-container {
  text-align: center;
  margin-top: 2rem;
}
</style>
