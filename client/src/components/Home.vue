<template>
  <div>
    <div class="wrapper">
      <h1>Our Shopping List</h1>
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
                ref="boardNameInput"
                v-model="boardNameInput"
                @keydown.enter="onOpenBoard"/>
            </v-col>
          </v-row>
        </v-container>
      </template>
      <template v-slot:buttons>
        <v-btn v-if="boardNameInput.length > 0"
               @click="onOpenBoard"
               color="primary">Open board</v-btn>
      </template>
      <template v-slot:footer v-if="lastBoardModel">
        <router-link :to="{name: 'board', params: {boardSlug: lastBoardModel.slug}}">
          <span>Would you like to reopen <strong>{{ lastBoardModel.name }}</strong> instead?</span>
        </router-link>
        <v-btn @click="onClearLastBoard"
          icon><v-icon>mdi-close-circle-outline</v-icon></v-btn>
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
  computed: {
    lastBoardModel: {
      get: function () {
        return this.$store.state.board.lastBoard
      },
    },
  },
  mounted() {
    this.$refs.boardNameInput.focus()
  },
  methods: {
    onOpenBoard: function() {
      const slug = Board.getSlugFromName(this.boardNameInput)
      this.$router.push({name: 'board', params: {boardSlug: slug}})
    },
    onClearLastBoard: function() {
      this.$store.dispatch('board/reset')
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  text-align: center;
  margin-top: 2rem;
}
</style>
