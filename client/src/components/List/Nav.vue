<template>
  <div class="wrapper">
    <nav-default>
      <template v-slot:main-title>
        {{ title }}
      </template>
      <template v-slot:main-title-after v-if="listModel && listModel._id">
        <div class="list-title-after">
          <v-btn @click="onEditClick" icon>
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </div>
      </template>
    </nav-default>

    <v-btn
        id="btn-toggle-history-mode"
        @click="onToggleHistoryMode"
        :class="showHistory ? 'active' : 'inactive'"
        icon>
      <v-icon>mdi-history</v-icon>
    </v-btn>

    <v-dialog
      v-model="showEditListDialog"
      persistent
      max-width="500"
      @keydown.esc="onCancelListForm">
      <v-card>
        <v-card-title class="headline grey lighten-2">
          <span>{{ $t('edit-list-dialog.existing-title') }}</span>
        </v-card-title>

        <v-card-text>
          <ListForm
            :model="editionListModel"
            v-on:cancel="onCancelListForm"
            v-on:save="onSaveListForm"
            v-on:delete="onDeleteListForm"/>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red"
            plain
            @click="onDeleteListForm">
            {{ $t('delete') }}
          </v-btn>
          <v-btn
            color="grey"
            plain
            @click="onCancelListForm">
            {{ $t('cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            depressed
            @click="onSaveListForm">
            {{ $t('save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {DISPLAY_MODE_UNCHECKED_ONLY, DISPLAY_MODE_CHECKED_HISTORY} from '@/constants'

import NavDefault from '@/components/Nav/Default'
import ListForm from "@/components/ListForm"

export default {
  name: "List-Nav",
  components: {
    NavDefault,
    ListForm
  },
  data: () => ({
    editionListModel: null,
    showEditListDialog: false,
  }),
  computed: {
    title: {
      get: function() {
        return this.listModel && this.listModel.name
          ? this.listModel.name
          : this.$t('edit-list-dialog.new-title')
      }
    },
    listModel: {
      get: function() {
        return this.$store.state.list.currentList
      }
    },
    showHistory: {
      get: function() {
        return this.$store.state.list.displayMode === DISPLAY_MODE_CHECKED_HISTORY
      },
      set: function(val) {
        this.$store.commit(
          'list/setDisplayMode',
          { mode: val ? DISPLAY_MODE_CHECKED_HISTORY : DISPLAY_MODE_UNCHECKED_ONLY },
          { root: true }
        )
      }
    }
  },
  watch: {
    editionListModel: function (val) {
      this.showEditListDialog = !!val
    }
  },
  methods: {
    onToggleHistoryMode: function() {
      this.showHistory = !this.showHistory
    },

    saveList(list, callback) {
      console.log("saveList()", list)
      callback = callback || function() {}
      const self = this
      this.$repository.save(list)
        .then(callback)
        .catch((e) => {
          console.error(e)
          self.$snackbar.msg(self.$t('errors.list.save'))
        })
    },
    deleteList(list, callback) {
      console.log("deleteList()", list)
      callback = callback || function() {}
      const self = this
      this.$repository.delete(list)
        .then(callback)
        .catch((e) => {
          console.error(e)
          self.$snackbar.msg(self.$t('errors.list.delete'))
        })
    },

    onEditClick() {
      this.editionListModel = this.listModel
    },
    onCancelListForm() {
      this.editionListModel = null
    },
    onSaveListForm() {
      const self = this
      this.saveList(this.editionListModel, function() {
        self.closeEditListForm()
      })
    },
    onDeleteListForm() {
      const self = this
      if (confirm(self.$t('confirmation-question'))) {
        this.deleteList(this.editionListModel, function() {
          self.closeEditListForm()
        })
      }
    },
    closeEditListForm() {
      this.editionListModel = null
    },
  }
}
</script>

<style lang="scss" scoped>
@import '~vuetify/src/styles/styles';

.wrapper {
  display: contents;  // Fix appbar display by forcing ignore
}

#btn-toggle-history-mode {
  &.active {
    background-color: map-get($material-theme, "background");
  }
}
</style>
