<template>
  <div class="board">
    <v-navigation-drawer
      app
      v-model="sidebarMenu"
      color="grey-lighten-4">
      <v-list dense>
        <v-list-item>
          <template v-slot:prepend>
            <v-icon @click.stop="sidebarMenu = !sidebarMenu">mdi-chevron-left</v-icon>
          </template>
          <div class="text-right align-self-start">
            <v-list-item-title>
              <v-row>
                <v-col class="col-sm-6">
                  <router-link :to="{name: 'home'}">
                    <v-img
                      class="app-logo"
                      :src="logoUrl"
                      width="40"
                      height="40"/>
                  </router-link>
                </v-col>
                <v-col class="col-sm-6">
                  <v-icon name="BoardComponent.force-refresh.button"
                          class="force-refresh-btn"
                          color="grey-darken-1"
                          @click="onRefreshClick"
                          size="40">mdi-refresh</v-icon>
                </v-col>
              </v-row>
            </v-list-item-title>
          </div>
        </v-list-item>
      </v-list>
      <v-list>
        <v-list-item :to="{ name: 'board' }"
                     :title="!isSingleBoardMode && boardModel ? boardModel.name : $t('menu-nav.item.new-list')"
                     exact>
          <template v-slot:prepend>
            <v-avatar>
              <v-icon v-if="!isSingleBoardMode && boardModel" >mdi-clipboard-list-outline</v-icon>
              <v-icon v-else>mdi-playlist-plus</v-icon>
            </v-avatar>
          </template>
          <template v-slot:append>
            <v-icon v-if="shouldShowBoardShareButton"
                    @click="onBoardShareButtonClick"
                    color="grey-darken-1"
                    size="small"
                    :aria-label="$t('share')">
              <v-icon>mdi-share-variant-outline</v-icon>
            </v-icon>
          </template>
        </v-list-item>

        <v-divider/>

        <div>
          <v-list-item
            v-for="list in lists"
            :key="list._id"
            :to="{ name: 'list', params: { listId: list._id } }"
            :title="list.name">
            <template v-slot:prepend>
              <v-avatar>
                <v-icon>mdi-format-list-bulleted-type</v-icon>
              </v-avatar>
            </template>
          </v-list-item>
        </div>

        <v-divider v-if="lists.length"/>

        <v-list-item :to="{ name: 'about' }"
                     :title="$t('menu-nav.item.about')"
                     class="about-item">
            <template v-slot:prepend>
              <v-avatar>
                <v-icon>mdi-information-variant</v-icon>
              </v-avatar>
            </template>
        </v-list-item>

        <v-list-item v-if="shouldShowDebugMenuItem"
                     :to="{ name: 'debug' }"
                     :title="$t('menu-nav.item.debug')"
                     class="debug-item">
            <template v-slot:prepend>
              <v-avatar>
                <v-icon>mdi-code-braces</v-icon>
              </v-avatar>
            </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      app
      color="teal-lighten-3"
      density="comfortable">
      <v-app-bar-nav-icon
        @click.stop="sidebarMenu = !sidebarMenu"
        :aria-label="$t('menu-nav.open')">
      </v-app-bar-nav-icon>
      <router-view name="boardNavigation" v-slot="{ Component }">
        <component :is="Component" :title="navTitle"/>
      </router-view>
    </v-app-bar>

    <v-main>
      <v-container
        id="router-view-container"
        fluid>
        <router-view name="boardContent"></router-view>
      </v-container>
    </v-main>
  </div>
</template>

<script setup>
import logoUrl from '@/assets/logo.svg'
</script>

<script>
import {useDisplay} from 'vuetify'

import config from '@/config'

import List from '@/models/List'
import {hardRefresh} from '@/service/refresh'
import {isSingleBoardMode} from '@/service/board-mode'

export default {
  name: 'BoardComponent',
  data: function() {
    return {
      // Default display policy for sidebar menu: shown on large, hidden on small
      sidebarMenu: useDisplay.mdAndUp
    }
  },
  computed: {
    navTitle: {
      get: function() {
        return this.$store.state?.list?.currentList
          ? ''
          : (config.VITE_TITLE || 'Our Shopping List')
      },
    },
    boardModel: {
      get: function() {
        return this.$store.state?.board?.currentBoard
      },
    },
    isSingleBoardMode: {
      get: function() {
        return isSingleBoardMode()
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
          || config.VITE_ENV === 'development'
      }
    },
    shouldShowDebugMenuItem: {
      get: function () {
        return config.VITE_ENV === 'development'
      }
    }
  },
  methods: {
    onRefreshClick() {
      hardRefresh()
    },
    onBoardShareButtonClick() {
      if (typeof window.navigator.share !== 'function') {
        alert('The share feature is not supported in this browser.')
        return
      }
      const boardUrl = this.$router.resolve({
        name: 'board',
        params: {boardSlug: this.$store.state?.board?.currentBoard.slug}
      }).href
      const prefix = this.$root.isSingleBoardMode
        ? ''
        : this.$store.state?.board?.currentBoard.name + ' | '
      const shareArg = {
        text: `${prefix}Our Shopping List`,
        url: boardUrl
      }
      this.$logger.debug('Sharing', shareArg)
      window.navigator.share(shareArg)
    }
  },
}
</script>

<style lang="scss" scoped>
#router-view-container {
  padding: 0 !important;
}
.about-item,
.debug-item {
  opacity: var(--v-medium-emphasis-opacity);
}
#ws-connection-status-indicator {
  position: absolute;
  right: 0px;
  top: 0px;
  z-index: 9999;
  width: .5rem;
  height: .5em;
  background-color: grey;
}
</style>
