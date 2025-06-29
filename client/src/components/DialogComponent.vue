<template>
  <v-dialog v-model="model.show"
            width="auto">
    <v-card>
      <v-card-title v-if="model.title"
                    class="text-h5 grey lighten-2">
        {{ model.title }}
      </v-card-title>

      <v-card-text class="message">
        {{ model.message }}
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          name="DialogComponent.close.button"
          color="primary"
          text
          @click="model.show = false"
        >
          {{ model.closeButtonLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {store} from '@/service/store'
import {i18n} from '@/service/i18n'
import {ref} from 'vue'

const defaultData = () => ({
  show: false,
  title: '',
  message: '',
  closeButtonLabel: i18n.global.t('ok')
})
const model = ref(defaultData())

const reset = () => {
  Object.assign(model, defaultData())
}

store.subscribe((mutation, state) => {
  if (mutation.type === 'dialog/showMessage') {
    model.value.title = state.dialog.title
    model.value.message = state.dialog.message
    model.value.closeButtonLabel = state.dialog.closeButtonLabel
    model.value.show = true
  }
  if (mutation.type === 'dialog/close') {
    reset()
  }
})
</script>

<style lang="scss" scoped>
.message {
  padding-top: 1em !important;
}
</style>
