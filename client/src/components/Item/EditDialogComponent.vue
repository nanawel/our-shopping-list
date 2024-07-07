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
                  name="Item/EditDialogComponent.name.textfield"
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
              name="Item/EditDialogComponent.qty.textfield"
              type="number"
              :label="$t('item.input.qty')"
              v-model="formItem.qty"
              @keydown.enter="onSaveItemForm"/>
            <v-textarea
              name="Item/EditDialogComponent.details.textarea"
              :label="$t('item.input.details')"
              autocapitalize="sentences"
              v-model="formItem.details"
              :rows="2">
            </v-textarea>
            <div class="list-selector">
              <v-select name="Item/EditDialogComponent.list.select"
                        :label="$t('item.input.list')"
                        density="compact"
                        :items="lists"
                        item-title="name"
                        item-value="_id"
                        v-model="formItem.listId"/>
            </div>
            <div class="last-checked-label" v-if="formItem.lastCheckedAt">
              <v-icon>mdi-calendar-check</v-icon> {{ $t('item.last-checked-label', {date: new Date(formItem.lastCheckedAt).toLocaleString()}) }}
            </div>
          </form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn
            name="Item/EditDialogComponent.delete.button"
            icon
            color="red"
            plain
            @click="onDeleteItemForm">
            <v-icon>mdi-trash-can</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            name="Item/EditDialogComponent.cancel.button"
            color="grey"
            plain
            @click="onCancelItemForm">
            {{ $t('cancel') }}
          </v-btn>
          <v-btn
            name="Item/EditDialogComponent.save.button"
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
import Item from "@/models/Item"
import List from "@/models/List"

export default {
  name: 'EditDialogComponent',
  components: {
  },
  props: {
    item: Item,
  },
  data: function() {
    return {
      formItem: null,
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
    lists: {
      get: function () {
        return List.query()
          .where('boardId', this.$store.state?.board?.currentBoardId)
          .orderBy('name')
          .get()
      }
    }
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
