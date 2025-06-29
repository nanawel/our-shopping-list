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
              <v-row v-if="homeMessage" align="center" justify="center">
                <v-col md="4">
                  <v-alert icon="mdi-hand-wave-outline"
                           border="start"
                           border-color="teal-lighten-3"
                           elevation="1">
                    {{homeMessage}}
                  </v-alert>
                </v-col>
              </v-row>
              <v-row align="center" justify="center">
                <v-col md="4">
                  <v-text-field
                    dense
                    name="HomeComponent.board-name.textfield"
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
                  <v-btn name="HomeComponent.open-board.button"
                         @click="onOpenBoard"
                         color="primary">{{ $t('home.button.open-board') }}</v-btn>
                </v-col>
              </v-row>
            </v-container>
          </template>
          <template v-slot:footer>
            <v-container>
              <v-row id="boards-list"
                     v-if="allBoardsEnabled && allBoards.length"
                     align="center"
                     justify="center">
                <v-col md="4">
                  <div class="text-subtitle-2 text-medium-emphasis pb-2 d-flex">
                    <span>{{ $t('home.boards.all-title', {count: allBoards.length})}}</span>
                    <v-icon @click="refreshAllBoards"
                            class="ml-auto">mdi-refresh-circle</v-icon>
                  </div>
                  <v-virtual-scroll :items="allBoards"
                                    item-height="56"
                                    max-height="30vh"
                                    class="elevation-4">
                    <template v-slot:default="{ item }">
                      <v-list-item :key="item._id"
                                   :to="{ name: 'board', params: { boardSlug: item.slug } }"
                                   :title="item.name"
                                   :subtitle="$t('home.boards.item.lists-count', item.lists?.length, {count: item.lists?.length})">
                        <template v-slot:prepend>
                          <v-avatar color="teal-lighten-2">
                            <v-icon color="white">mdi-clipboard-list-outline</v-icon>
                          </v-avatar>
                        </template>
                        <template v-slot:append>
                          <v-btn name="HomeComponent.delete-board.button"
                                 v-if="boardDeletionEnabled"
                                 @click="(ev) => onDeleteBoard(ev, item)"
                                 color="grey-lighten-1"
                                 icon="mdi-delete"
                                 variant="text"
                          ></v-btn>
                        </template>
                      </v-list-item>
                    </template>
                  </v-virtual-scroll>
                </v-col>
              </v-row>

              <v-row v-if="lastBoardModel"
                     align="center"
                     justify="center">
                <v-col id="reopen-last-board-row"
                       class="d-flex justify-center"
                       md="4">
                  <router-link :to="{name: 'board', params: {boardSlug: lastBoardModel.slug}}">
                    <span v-html="$t('home.reopen-last-board', {boardName: lastBoardModel.name})"></span>
                  </router-link>
                  <v-icon @click="onClearLastBoard"
                          color="grey-darken-2"
                          :aria-label="$t('close')">mdi-close-circle-outline</v-icon>
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

import {isSingleBoardMode} from '@/service/board-mode'

import Board from '@/models/Board'
import config from '@/config'

export default {
  name: 'HomeComponent',
  components: {
    EmptyStateComponent
  },
  data() {
    return {
      title: config.VITE_APP_TITLE || 'Our Shopping List',
      boardNameInput: '',
      boardsRetrievalErrorMessage: null,
      homeMessage: config.VITE_APP_HOME_MESSAGE,
    }
  },
  computed: {
    lastBoardModel: {
      get: function () {
        return this.$store.state?.board.lastBoard
      },
    },
    allBoardsEnabled: {
      get: function () {
        return !isSingleBoardMode()
          && config.VITE_APP_LIST_ALL_BOARDS_ENABLED
      }
    },
    boardDeletionEnabled: {
      get: function () {
        return !!config.VITE_APP_BOARD_DELETION_ENABLED
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
    onDeleteBoard: function(ev, board) {
      ev.stopPropagation()
      ev.preventDefault()
      this.$logger.debug('About to delete', board)
      if (confirm(this.$t('home.boards.confirm-deletion'))) {
        this.$repository.delete(board)
          . then(() => {
            this.$snackbar.msg(this.$t('home.boards.deleted-successfully'))
          })
          .catch((e) => {
            this.$logger.error(e)
            this.$snackbar.msg(this.$t('errors.board.delete'))
          })
      } else {
        this.$logger.debug('Deletion has been canceled.')
      }
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
#boards-list {
  text-align: left;
}
#reopen-last-board-row > i {
  padding: 0 1.5rem;
}
</style>
