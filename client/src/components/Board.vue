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
                  <v-img
                    class="app-logo"
                    :src="require('@/assets/logo.svg')"
                    width="40"
                    height="40"/>
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
        <v-list-item :to="{ name: 'board' }">
          <v-list-item-icon>
            <v-icon>mdi-clipboard-list-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-title v-text="boardModel.name || 'Home'"></v-list-item-title>
        </v-list-item>

        <template v-for="list in lists">
          <v-list-item
            :key="list._id"
            :to="{ name: 'boardList', params: { listId: list._id } }">
            <v-list-item-icon>
              <v-icon>mdi-format-list-bulleted-type</v-icon>
            </v-list-item-icon>
            <v-list-item-title v-text="list.name"></v-list-item-title>
          </v-list-item>
        </template>

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
import List from "@/models/List";

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
        return this.$store.state.board.currentBoard || {}
      },
    },
    lists: {
      get: function () {
        console.log('GET LISTS', this.boardModel._id)
        if (this.boardModel._id) {
          return List.query()
            .where('boardId', this.boardModel._id)
            .orderBy("name")
            .get()
        } else {
          return []
        }
      }
    }
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
