<template>
  <div id="app">
    <v-app v-cloak>
      <v-progress-linear
        id="global-top-progress-bar"
        :active="showGlobalProgressBar"
        absolute
        indeterminate
        />

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
                      :src="require('./assets/logo.svg')"
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
        <v-container
          id="router-view-container"
          fluid>
          <router-view></router-view>
        </v-container>
      </v-main>

        <!-- Not used yet
          <v-footer app>
          </v-footer>
        -->

        <Snackbar></Snackbar>

        <v-overlay
          :value="showNotConnectedOverlay">
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
      get: function() {
        return List.query()
          .orderBy("name")
          .get()
      }
    },
    showNotConnectedOverlay: {
      get: function() {
        return !this.$root.isOnline
      }
    },
    showGlobalProgressBar: {
      get: function() {
        // Must use this syntax here because the module may not be available yet at startup
        return this.$store.getters['loadingProgress/isLoadingInProgress']
      }
    }
  },
  mounted() {
    List.api().get("/lists")
  },
  methods: {
    onRefreshClick: function() {
      document.location.reload();
    }
  }
};
</script>

<style lang="scss" scoped>
#global-top-progress-bar {
  z-index: 100;
}
#router-view-container {
  padding: .5rem 0 0 0;
}
</style>

<style lang="scss">
html, body {
  overflow: hidden;
}
</style>
