<template>
  <div class="board">
    <v-app-bar
      app
      color="teal lighten-3"
      hide-on-scroll>
      <v-app-bar-nav-icon @click.stop="sidebarMenu = !sidebarMenu"></v-app-bar-nav-icon>
      <router-view name="navigation"></router-view>
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
        <v-list-item to="boardHomeRoute">
          <v-list-item-icon>
            <v-icon>mdi-home</v-icon>
          </v-list-item-icon>
          <v-list-item-title v-text="boardModel.name || 'Home'"></v-list-item-title>
        </v-list-item>

        <template v-for="list in lists">
          <v-list-item
            :key="list._id"
            :to="`/list/${list._id}`">
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
        <router-view name="board"></router-view>
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
    currentBoardId: {
      get: function() {
        return this.$route.params.boardId
          ? this.$route.params.boardId
          : null;
      },
    },
    boardModel: {
      get: function() {
        return this.$store.state.list.currentBoard
      },
      set: function(val) {
        this.$store.commit('list/setCurrentBoard', { board: val })
      }
    },
    lists: {
      get: function () {
        return List.query()
          .where('boardId', this.currentBoardId)
          .orderBy("name")
          .get()
      }
    }
  },
  methods: {
    onRefreshClick: function() {
      this.$root.forceRefresh()
    }
  },
  mounted() {
    List.api().get("/lists")
  }
}
</script>

<style lang="scss" scoped>

</style>
