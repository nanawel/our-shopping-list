<template>
  <div>
    <v-app v-cloak>
      <v-progress-linear
        id="global-top-progress-bar"
        :active="showGlobalProgressBar"
        absolute
        indeterminate
        />

      <router-view name="root"></router-view>

      <DialogComponent></DialogComponent>

      <SnackbarComponent></SnackbarComponent>

      <v-overlay
        v-model="showNotConnectedOverlay"
        class="align-center justify-center"
        persistent>
        <v-btn color="error">
          {{ $t('errors.overlay.not-connected') }}
        </v-btn>
      </v-overlay>
    </v-app>
  </div>
</template>

<script>
import DialogComponent from '@/components/DialogComponent.vue'
import SnackbarComponent from '@/components/SnackbarComponent.vue'

import eventBus from '@/service/event-bus'
import isOnline from '@/service/isonline'
import {store} from '@/service/store'

export default {
  name: 'App',
  components: {
    DialogComponent,
    SnackbarComponent
  },
  data() {
    return {
      isReloading: false
    }
  },
  created() {
    eventBus.$emit('app-created')
  },
  mounted() {
    eventBus.$emit('app-mounted')
  },
  computed: {
    showNotConnectedOverlay: {
      get: function() {
        return !isOnline.value
      }
    },
    showGlobalProgressBar: {
      get: function() {
        // Must use this syntax here because the module may not be available yet at startup
        return store.getters['loadingProgress/isLoadingInProgress']
      }
    }
  }
}
</script>

<!-- SCOPED STYLE -->
<style lang="scss" scoped>
#global-top-progress-bar {
  z-index: 100;
}
#router-view-container {
  padding: .5rem 0 0 0;
}
</style>

<!-- GLOBAL STYLE -->
<style lang="scss">
@import '~typeface-roboto/index.css';

.v-application--wrap {
  // GITHUB#9 BEGIN ## Fix for svh compatibility with old mobile browsers
  @supports (min-height: 100svh) {
    // Vuetify sets min-height to 100vh by default which is not what we want here (we want 100svh instead)
    min-height: 100svh !important;
  }
  @supports not (min-height: 100svh) {
    min-height: var(--x-vh) !important;
  }
  // GITHUB#9 END ## Fix for svh compatibility with old mobile browsers
}
</style>
