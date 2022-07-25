<template>
  <div class="wrapper">
    <NavDefaultComponent>
      <template v-slot:main-title>
        {{ title }}
      </template>
      <template v-slot:main-title-after v-if="listModel && listModel._id">
        <div class="list-title-after">
          <v-btn @click="onEditClick"
                 icon
                 :aria-label="$t('edit')">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </div>
      </template>
    </NavDefaultComponent>

    <v-btn
        id="btn-toggle-history-mode"
        @click="onToggleHistoryMode"
        :class="showHistory ? 'active' : 'inactive'"
        icon
        :aria-label="$t('list.toggle-history-mode')">
      <v-icon>mdi-history</v-icon>
    </v-btn>

    <EditDialogComponent
      :list="editionListModel"
      v-on:cancel="onCancelListForm"
      v-on:save="onSaveListForm"
      v-on:delete="onDeleteListForm"/>
  </div>
</template>

<script>
import {DISPLAY_MODE_UNCHECKED_ONLY, DISPLAY_MODE_CHECKED_HISTORY} from '@/constants'

import NavDefaultComponent from '@/components/Nav/DefaultComponent'
import EditDialogComponent from "@/components/List/EditDialogComponent"
import List from "@/models/List"

export default {
  name: "List-Nav",
  components: {
    NavDefaultComponent,
    EditDialogComponent
  },
  data: () => ({
    editionListModel: null,
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
  methods: {
    onToggleHistoryMode: function() {
      this.showHistory = !this.showHistory
    },

    editList(list) {
      console.log('NAV.editList()', list)
      // Pass a clone to the form so that modifications are only applied upon validation
      this.editionListModel = {...(list ? list : new List())}
    },
    saveList(listData, callback) {
      const list = Object.assign(
        new List(),
        listData
      )
      console.log('NAV.saveList()', list)
      callback = callback || function() {}
      const self = this
      this.$repository.save(list)
        .then(callback)
        .catch((e) => {
          console.error(e)
          self.$snackbar.msg(self.$t('errors.list.save'))
        })
    },
    deleteList(listData, callback) {
      const list = Object.assign(
        new List(),
        listData
      )
      console.log('NAV.deleteList()', list)
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
      this.editList(this.listModel)
    },
    onCancelListForm() {
      console.log('onCancelListForm()')
      this.closeEditListForm()
    },
    onSaveListForm(listData) {
      const self = this
      console.log('onSaveListForm()', listData)
      this.saveList(listData, function() {
        self.closeEditListForm()
      })
    },
    onDeleteListForm(listData) {
      const self = this
      console.log('onDeleteListForm()', listData)
      if (confirm(self.$t('confirmation-question'))) {
        this.deleteList(listData, function() {
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
