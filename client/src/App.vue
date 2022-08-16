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
        :value="showNotConnectedOverlay">
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

export default {
  name: 'App',
  components: {
    DialogComponent,
    SnackbarComponent
  },
  data: () => ({
  }),
  created() {
    eventBus.$emit('app-created')
  },
  mounted() {
    eventBus.$emit('app-mounted')
  },
  computed: {
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
  }
}
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
@import '~typeface-roboto/index.css';

html, body {
  overflow: hidden;
}
</style>
