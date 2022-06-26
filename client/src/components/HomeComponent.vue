<template>
  <div>
    <div class="wrapper">
      <h1>{{ $t('app-name') }}</h1>
      <img src="@/assets/logo.svg" width="120" height="120" alt="OSL logo">
    </div>
    <EmptyStateComponent>
      <template v-slot:title>{{ $t('home.title') }}</template>
      <template v-slot:subtitle>{{ $t('home.subtitle') }}</template>
      <template v-slot:content>
        <v-container fill-height>
          <v-row align="center" justify="center">
            <v-col md="4">
              <v-text-field
                name="name"
                :label="$t('home.input.board-name')"
                autocomplete="osl-board-name"
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
               color="primary">{{ $t('home.button.open-board') }}</v-btn>
      </template>
      <template v-slot:footer v-if="lastBoardModel">
        <router-link :to="{name: 'board', params: {boardSlug: lastBoardModel.slug}}">
          <span v-html="$t('home.reopen-last-board', {boardName: lastBoardModel.name})"></span>
        </router-link>
        <v-btn @click="onClearLastBoard"
               icon
               :aria-label="$t('close')">
          <v-icon>mdi-close-circle-outline</v-icon>
        </v-btn>
      </template>
    </EmptyStateComponent>
  </div>
</template>

<script>
import EmptyStateComponent from './EmptyStateComponent.vue'

import Board from '@/models/Board'

export default {
  name: 'HomeComponent',
  components: {
    EmptyStateComponent
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
      if (!slug.length) {
        this.$snackbar.msg(this.$t('errors.board.invalid-name'))
        this.boardNameInput = ''
      } else {
        this.$router.push({name: 'board', params: {boardSlug: slug}})
      }
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
