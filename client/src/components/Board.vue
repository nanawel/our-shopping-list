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
            <v-icon>mdi-clipboard-list-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-title v-if="boardModel" v-text="boardModel.name"></v-list-item-title>
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
          <v-list-item-title>About</v-list-item-title>
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
  components: {
  },
  data: () => ({
    sidebarMenu: true
  }),
  computed: {
    boardModel: {
      get: function() {
        return this.$store.state.board.currentBoard
      },
    },
    lists: {
      get: function () {
        return List.query()
          .where('boardId', this.boardModel ? this.boardModel._id : null)
          .orderBy("name")
          .get()
      }
    }
  },
  created() {
    const self = this

    this.$ws.on('connect', () => {
      if (self.boardModel) {
        self.$ws.emit('join-board', self.boardModel._id)
        self.$repository.checkSync(self.boardModel)
          .then((isSync) => {
            if (!isSync) {
              self.$repository.sync(self.boardModel)
            }
          })
      }
    })
  },
  mounted() {
    if (this.boardModel) {
      this.$repository.checkSync(this.boardModel)
    }

    this.$on('repository_save::before', function (model) {
      console.log('BEFORE beforeCreate', JSON.stringify(model));
      if (model instanceof List
        && store.state.board.currentBoardId
      ) {
        // Set current board as list's owner
        model.boardId = store.state.board.currentBoardId
      }
      console.log('AFTER beforeCreate', JSON.stringify(model));
    })
  },
  methods: {
    onRefreshClick: function() {
      this.$root.forceRefresh()
    }
  },
}
</script>

<style lang="scss" scoped>

</style>
