<template>
  <div>
    <v-main>
      <v-container>
        <div class="title-wrapper">
          <h1>{{ title }}</h1>
          <img src="@/assets/logo.svg" width="120" height="120" alt="OSL logo">
        </div>
        <EmptyStateComponent>
          <template v-slot:content>
            <v-container>
              <v-row align="center" justify="center">
                <v-col md="4">
                  <v-text-field
                    dense
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
            <v-container v-if="boardNameInput.length > 0">
              <v-row align="center" justify="center">
                <v-col md="4">
                  <v-btn @click="onOpenBoard"
                         color="primary">{{ $t('home.button.open-board') }}</v-btn>
                </v-col>
              </v-row>
            </v-container>
          </template>
          <template v-slot:footer>
            <v-container>
              <v-row v-if="allBoardsEnabled && allBoards.length"
                     align="center"
                     justify="center">
                <v-col md="4">
                  <v-subheader class="all-boards-title d-flex">
                    <span>{{ $t('home.boards.all-title', {count: allBoards.length})}}</span>
                    <v-icon @click="refreshAllBoards"
                            class="ml-auto">mdi-refresh-circle</v-icon>
                  </v-subheader>
                  <v-virtual-scroll :items="allBoards"
                                    item-height="56"
                                    max-height="30vh"
                                    class="elevation-4">
                    <template v-slot:default="{ item }">
                      <v-list-item :key="item._id"
                                   :to="{ name: 'board', params: { boardSlug: item.slug } }"
                                   v-touch-event:touchhold="() => onTouchHoldBoard(item)">
                        <v-list-item-avatar>
                          <v-icon>mdi-clipboard-list-outline</v-icon>
                        </v-list-item-avatar>
                        <v-list-item-content class="text-left">
                          <v-list-item-title v-text="item.name"></v-list-item-title>
                          <v-list-item-subtitle>
                            {{ $tc('home.boards.item.lists-count', item.lists.length, {count: item.lists.length})}}
                          </v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                  </v-virtual-scroll>
                </v-col>
              </v-row>

              <v-row v-if="lastBoardModel"
                     align="center"
                     justify="center">
                <v-col md="4">
                  <router-link :to="{name: 'board', params: {boardSlug: lastBoardModel.slug}}">
                    <span v-html="$t('home.reopen-last-board', {boardName: lastBoardModel.name})"></span>
                  </router-link>
                  <v-btn @click="onClearLastBoard"
                         icon
                         :aria-label="$t('close')">
                    <v-icon>mdi-close-circle-outline</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </template>
        </EmptyStateComponent>
      </v-container>
    </v-main>
  </div>
</template>

<script>
import EmptyStateComponent from './EmptyStateComponent.vue'

import Board from '@/models/Board'
import config from '@/config'

export default {
  name: 'HomeComponent',
  components: {
    EmptyStateComponent
  },
  data() {
    return {
      title: config.VUE_APP_TITLE || 'Our Shopping List',
      boardNameInput: '',
      boardsRetrievalErrorMessage: null
    }
  },
  computed: {
    lastBoardModel: {
      get: function () {
        return this.$store.state.board.lastBoard
      },
    },
    allBoardsEnabled: {
      get: function () {
        return !config.VUE_APP_SINGLEBOARD_MODE
          && config.VUE_APP_LIST_ALL_BOARDS_ENABLED
      }
    },
    allBoards: {
      get: function () {
        return Board.query()
          .with('lists')
          .orderBy('name')
          .get()
      }
    }
  },
  mounted() {
    this.$refs.boardNameInput.focus()
    this.refreshAllBoards()
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
    },
    onTouchHoldBoard: function(board) {
      if (config.VUE_APP_BOARD_DELETION_ENABLED) {
        if (confirm(this.$t('home.boards.confirm-deletion'))) {
          this.$repository.delete(board)
        }
      } else {
        this.$snackbar.msg(this.$t('home.boards.deletion-disabled'))
      }
      return false
    },
    refreshAllBoards: function () {
      const self = this
      if (this.allBoardsEnabled) {
        this.$repository.syncAll(Board)
          .then(() => {
            self.$logger.debug('ALL BOARDS', self.allBoards)
          })
          .catch((e) => {
            self.$logger.error(e)
          })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.title-wrapper {
  text-align: center;
  margin-top: 2rem;
}
</style>
