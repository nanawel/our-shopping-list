<template>
    <v-dialog
      v-model="showDialog"
      persistent
      max-width="500"
      @keydown.esc="onCancelItemForm">
      <v-card>
        <v-card-title class="headline grey lighten-2">
          <span v-if="formItem && formItem._id">{{ $t('edit-item-dialog.existing-title') }}</span>
          <span v-else>{{ $t('edit-item-dialog.new-title') }}</span>
        </v-card-title>

        <v-card-text v-if="formItem">
          <form novalidate>
            <v-row>
              <v-col>
                <v-text-field
                  ref="nameInput"
                  :label="$t('item.input.name')"
                  autocapitalize="sentences"
                  v-model="formItem.name"
                  @keydown.enter="onSaveItemForm"/>
              </v-col>
              <v-col cols="2" md="1">
                <v-checkbox v-model="formItem.checked"></v-checkbox>
              </v-col>
            </v-row>
            <v-text-field
              type="number"
              :label="$t('item.input.qty')"
              v-model="formItem.qty"
              @keydown.enter="onSaveItemForm"/>
            <v-textarea
              :label="$t('item.input.details')"
              autocapitalize="sentences"
              v-model="formItem.details"
              :rows="3">
            </v-textarea>
            <div class="last-checked-label" v-if="formItem.lastCheckedAt">
              <v-icon>mdi-calendar-check</v-icon> {{ $t('item.last-checked-label', {date: new Date(formItem.lastCheckedAt).toLocaleString()}) }}
            </div>
          </form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn
            icon
            color="red"
            plain
            @click="onDeleteItemForm">
            <v-icon>mdi-trash-can</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
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
import Item from "@/models/Item";

export default {
  name: 'EditDialogComponent',
  components: {
  },
  props: {
    item: Item
  },
  data: function() {
    return {
      formItem: null
    }
  },
  watch: {
    item() {
      this.formItem = this.item
    }
  },
  computed: {
    showDialog: {
      get: function() {
        return !!this.formItem
      }
    },
  },
  methods: {
    onCancelItemForm() {
      this.$emit('cancel')
      this.clear()
    },
    onSaveItemForm() {
      this.$emit('save', this.formItem)
      this.clear()
    },
    onDeleteItemForm() {
      this.$emit('delete', this.formItem)
      this.clear()
    },
    clear() {
      this.formItem = null
    }
  }
}
</script>

<style>
.last-checked-label {
  opacity: var(--v-medium-emphasis-opacity);
  font-size: small;
}
</style>
