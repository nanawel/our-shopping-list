<template>
    <v-dialog
      :value="value"
      persistent
      max-width="500"
      @keydown.esc="onCancelItemForm">
      <v-card>
        <v-card-title class="headline grey lighten-2">
          <span v-if="item && item._id">{{ $t('edit-item-dialog.existing-title') }}</span>
          <span v-else>{{ $t('edit-item-dialog.new-title') }}</span>
        </v-card-title>

        <v-card-text>
          <ItemFormComponent
            :model="item"
            v-on:enterKey="onSaveItemForm"/>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red"
            plain
            @click="onDeleteItemForm">
            {{ $t('delete') }}
          </v-btn>
          <v-btn
            color="grey"
            plain
            @click="onCancelItemForm">
            {{ $t('cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            depressed
            @click="onSaveItemForm">
            {{ $t('save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script>
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import ItemFormComponent from "./FormComponent"

export default {
  name: 'EditDialogComponent',
  components: {
    ItemFormComponent,
  },
  props: [
    'item',
    'value'
  ],
  data: function() {
    return {}
  },
  methods: {
    onCancelItemForm() {
      console.log('onCancelItemForm()', this.item)
      this.$emit('onCancel')
    },
    onSaveItemForm() {
      console.log('onSaveItemForm()', this.item)
      this.$emit('onSave', this.item)
    },
    onDeleteItemForm() {
      console.log('onDeleteItemForm()', this.item)
      this.$emit('onDelete', this.item)
    },
  }
}
</script>

<style lang="scss" scoped>
</style>
