<template>
  <v-snackbar v-model="show" :color="color" :timeout="timeout">
    {{ message }}
    <template v-slot:action="{ attrs }">
        <v-btn
          v-if="closeable"
          color="primary"
          text
          v-bind="attrs"
          @click="close">
          {{ $t('close') }}
        </v-btn>
      </template>
  </v-snackbar>
</template>

<script>
const defaultData = () => ({
  show: false,
  message: '',
  color: '',
  timeout: 2500,
  closeable: true
})

export default {
  data () {
    return defaultData()
  },
  created () {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'snackbar/showMessage') {
        this.message = state.snackbar.content
        this.color = state.snackbar.color
        this.timeout = state.snackbar.timeout || 2500
        this.closeable = typeof state.snackbar.closeable !== 'undefined' ? state.snackbar.closeable : true
        this.show = true
      }
      if (mutation.type === 'snackbar/close') {
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
