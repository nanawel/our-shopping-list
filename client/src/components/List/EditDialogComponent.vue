<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="500"
    @keydown.esc="onCancelListForm"
    @keydown.enter="onSaveListForm">
    <v-card>
      <v-card-title class="headline grey lighten-2">
        <span>{{ $t('edit-list-dialog.existing-title') }}</span>
      </v-card-title>

      <v-card-text v-if="formList">
        <form novalidate>
          <v-row>
            <v-col>
              <v-text-field
                name="List/EditDialogComponent.name.textfield"
                ref="nameInput"
                :label="$t('edit-list-dialog.name-input')"
                autocapitalize="sentences"
                autocomplete="off"
                v-model="formList.name" />
              <v-text-field
                name="List/EditDialogComponent.creation_date.textfield"
                :label="$t('edit-list-dialog.creation-date-label')"
                v-model="formList.createdAt"
                :disabled="true" />
            </v-col>
          </v-row>
        </form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-btn
          name="List/EditDialogComponent.delete.button"
          icon
          color="red"
          plain
          @click="onDeleteListForm">
          <v-icon>mdi-trash-can</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          name="List/EditDialogComponent.cancel.button"
          color="grey"
          plain
          @click="onCancelListForm">
          {{ $t('cancel') }}
        </v-btn>
        <v-btn
          name="List/EditDialogComponent.save.button"
          color="primary"
          depressed
          @click="onSaveListForm">
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import List from "@/models/List";

export default {
  name: 'EditDialogComponent',
  props: {
    list: List
  },
  data: function() {
    return {
      formList: null
    }
  },
  watch: {
    list() {
      this.formList = this.list
    }
  },
  computed: {
    showDialog: {
      get: function() {
        return !!this.formList
      }
    },
  },
  methods: {
    onCancelListForm() {
      this.$emit('cancel')
      this.clear()
    },
    onSaveListForm() {
      this.$emit('save', this.formList)
      this.clear()
    },
    onDeleteListForm() {
      this.$emit('delete', this.formList)
      this.clear()
    },
    clear() {
      this.formList = null
    }
  }
}
</script>
