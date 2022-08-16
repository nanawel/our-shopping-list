<template>
  <v-dialog v-model="show"
            width="auto">
    <v-card>
      <v-card-title v-if="title"
                    class="text-h5 grey lighten-2">
        {{ title }}
      </v-card-title>

      <v-card-text class="message">
        {{ message }}
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          text
          @click="show = false"
        >
          {{ closeButtonLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import i18n from '@/i18n'

const defaultData = () => ({
  show: false,
  title: '',
  message: '',
  closeButtonLabel: i18n.t('ok')
})

export default {
  data () {
    return defaultData()
  },
  created () {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'dialog/showMessage') {
        this.title = state.dialog.title
        this.message = state.dialog.message
        this.closeButtonLabel = state.dialog.closeButtonLabel
        this.show = true
      }
      if (mutation.type === 'dialog/close') {
        this.close()
      }
    })
  },
  methods: {
    close: function() {
      this.reset()
    },
    reset: function() {
      Object.assign(this.$data, defaultData())
    }
  }
}
</script>

<style lang="scss" scoped>
.message {
  padding-top: 1em !important;
}
</style>
