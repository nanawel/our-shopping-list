<template>
  <div id="app">
    <v-app>
      <v-app-bar
        app
        color="teal lighten-3"
        hide-on-scroll>
        <v-app-bar-nav-icon @click.stop="sidebarMenu = !sidebarMenu"></v-app-bar-nav-icon>
        <router-view name="navigation"></router-view>
        <!-- <v-toolbar-title>
          <span><slot name="main-title">{{ $root.title }}</slot></span>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <div>
          <v-checkbox
              color="white"
              hide-details
            ></v-checkbox>
        </div> -->
      </v-app-bar>

      <v-navigation-drawer
        app
        v-model="sidebarMenu"
        color="grey lighten-4"
        >
        <v-list dense>
          <v-list-item>
            <v-list-item-action>
              <v-icon @click.stop="sidebarMenu = !sidebarMenu">mdi-chevron-left</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-list>
          <v-list-item to="/">
            <v-list-item-icon>
              <v-icon>mdi-home</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Home</v-list-item-title>
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
        <v-container fluid>
          <router-view></router-view>
        </v-container>
      </v-main>

        <!-- Not used yet
          <v-footer app>
          </v-footer>
        -->

        <Snackbar></Snackbar>

        <v-overlay :value="showNotConnectedOverlay">
          <v-btn color="error">
            Not connected
          </v-btn>
        </v-overlay>
    </v-app>
  </div>
</template>

<script>
import Snackbar from './components/Snackbar.vue'
import List from "./models/List";

export default {
  name: "App",
  components: {
    Snackbar
  },
  data: () => ({
    sidebarMenu: true
  }),
  computed: {
    lists: {
      get: function () {
        return List.query()
          .orderBy("name")
          .get()
      }
    },
    showNotConnectedOverlay: {
      get: function() {
        return !this.$root.isOnline
      }
    }
  },
  mounted() {
    List.api().get("/lists")
  }
};
</script>

<style lang="scss" scoped>
</style>
