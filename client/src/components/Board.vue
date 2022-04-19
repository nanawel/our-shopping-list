<template>
  <div class="board">
    <v-app-bar
      app
      color="teal lighten-3"
      hide-on-scroll>
      <v-app-bar-nav-icon @click.stop="sidebarMenu = !sidebarMenu"></v-app-bar-nav-icon>
      <router-view name="boardNavigation"></router-view>
    </v-app-bar>

    <v-navigation-drawer
      app
      v-model="sidebarMenu"
      color="grey lighten-4">
      <v-list dense>
        <v-list-item>
          <v-list-item-action>
            <v-icon @click.stop="sidebarMenu = !sidebarMenu">mdi-chevron-left</v-icon>
          </v-list-item-action>
          <v-list-item-content class="text-right align-self-start">
            <v-list-item-title>
              <v-row>
                <v-col class="col-sm-6">
                  <router-link :to="{name: 'home'}">
                    <v-img
                      class="app-logo"
                      :src="require('@/assets/logo.svg')"
                      width="40"
                      height="40"/>
                  </router-link>
                </v-col>
                <v-col class="col-sm-6">
                  <v-icon class="force-refresh-btn"
                          @click="onRefreshClick"
                          size="40">mdi-refresh</v-icon>
                </v-col>
              </v-row>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-list>
        <v-list-item :to="{ name: 'board' }"
                     exact-path>
          <v-list-item-icon>
            <v-icon v-if="!isSingleBoardMode && boardModel" >mdi-clipboard-list-outline</v-icon>
            <v-icon v-else>mdi-playlist-plus</v-icon>
          </v-list-item-icon>
          <v-list-item-title v-if="!isSingleBoardMode && boardModel" v-text="boardModel.name"></v-list-item-title>
          <v-list-item-title v-else>{{ $t('menu-nav.item.new-list') }}</v-list-item-title>
          <v-btn icon
            v-if="shouldShowBoardShareButton"
            @click="onBoardShareButtonClick">
            <v-icon>mdi-share-variant-outline</v-icon>
          </v-btn>
        </v-list-item>

        <v-divider/>

        <template v-for="list in lists">
          <v-list-item
            :key="list._id"
            :to="{ name: 'list', params: { listId: list._id } }">
            <v-list-item-icon>
              <v-icon>mdi-format-list-bulleted-type</v-icon>
            </v-list-item-icon>
            <v-list-item-title v-text="list.name"></v-list-item-title>
          </v-list-item>
        </template>

        <v-divider v-if="lists.length"/>

        <v-list-item to="/about">
          <v-list-item-icon>
            <v-icon>mdi-information-variant</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ $t('menu-nav.item.about') }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container
        id="router-view-container"
        fluid>
        <router-view name="boardContent"></router-view>
      </v-container>
    </v-main>
  </div>
</template>

<script>
import List from "@/models/List"
import store from "@/store";

export default {
  name: "Board",
  data: () => ({
    sidebarMenu: true
  }),
  computed: {
    boardModel: {
      get: function() {
        return this.$store.state.board.currentBoard
      },
    },
    isSingleBoardMode: {
      get: function() {
        return this.$root.isSingleBoardMode
      }
    },
    lists: {
      get: function () {
        return List.query()
          .where('boardId', this.boardModel ? this.boardModel._id : null)
          .orderBy('name')
          .get()
      }
    },
    shouldShowBoardShareButton: {
      get: function () {
        return typeof window.navigator.share === 'function'
      }
    }
  },
  created() {
    const self = this

    this.$ws.on('connect', () => {
      self.checkSync()
    })
  },
  mounted() {
    this.checkSync()

    this.$on('repository_save::before', function (model) {
      if (model instanceof List
        && store.state.board.currentBoardId
      ) {
        // Set current board as list's owner
        model.boardId = store.state.board.currentBoardId
      }
    })
  },
  methods: {
    onRefreshClick() {
      this.$root.forceRefresh()
    },
    checkSync() {
      const self = this
      if (this.boardModel) {
        console.log('BOARD.checkSync()', this.boardModel._id)
        this.$repository.checkSync(self.boardModel)
          .then((isSync) => {
            if (!isSync) {
              self.$repository.sync(self.boardModel)
            }
          })
      }
    },
    onBoardShareButtonClick() {
      const boardUrl = this.$router.resolve({
        name: 'board',
        params: {boardSlug: this.$store.state.board.currentBoard.slug}
      }).href;
      const shareArg = {
        text: `${this.$store.state.board.currentBoard.name} | Our Shopping List`,
        url: boardUrl
      };
      console.log('Sharing', shareArg);
      window.navigator.share(shareArg);
    }
  },
}
</script>

<style lang="scss" scoped>

</style>
