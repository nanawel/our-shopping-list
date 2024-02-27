<template>
  <div class="wrapper">
    <v-toolbar-title>
      <span>{{ title }}</span>
      <template v-if="listModel?._id">
        <v-btn @click="onEditClick"
               icon
               :aria-label="$t('edit')"
               class="text-grey-darken-2">
          <v-icon size="small">mdi-pencil</v-icon>
        </v-btn>
      </template>
    </v-toolbar-title>

    <v-btn id="btn-toggle-history-mode"
           @click="onToggleHistoryMode"
           :active="showHistory"
           icon
           :aria-label="$t('list.toggle-history-mode')"
           class="text-grey-darken-2">
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

import EditDialogComponent from "@/components/List/EditDialogComponent"
import List from "@/models/List"

export default {
  name: "List-Nav",
  components: {
    EditDialogComponent
  },
  data: () => ({
    editionListModel: null,
  }),
  computed: {
    title: {
      get: function() {
        return this.listModel?.name
          ? this.listModel.name
          : this.$t('edit-list-dialog.new-title')
      }
    },
    listModel: {
      get: function() {
        return this.$store.state?.list?.currentList
      }
    },
    showHistory: {
      get: function() {
        return this.$store.state?.list?.displayMode === DISPLAY_MODE_CHECKED_HISTORY
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
    editList(list) {
      this.$logger.debug('NAV.editList()', list)
      // Pass a clone to the form so that modifications are only applied upon validation
      this.editionListModel = {...(list ? list : new List())}
    },
    saveList(listData, callback) {
      const list = Object.assign(
        new List(),
        listData
      )
      this.$logger.debug('NAV.saveList()', list)
      callback = callback || function() {}
      const self = this
      this.$repository.save(list)
        .then(callback)
        .catch((e) => {
          self.$logger.error(e)
          self.$snackbar.msg(self.$t('errors.list.save'))
        })
    },
    deleteList(listData, callback) {
      const list = Object.assign(
        new List(),
        listData
      )
      this.$logger.debug('NAV.deleteList()', list)
      callback = callback || function() {}
      const self = this
      this.$repository.delete(list)
        .then(callback)
        .catch((e) => {
          self.$logger.error(e)
          self.$snackbar.msg(self.$t('errors.list.delete'))
        })
    },

    onToggleHistoryMode: function() {
      this.showHistory = !this.showHistory
    },
    onEditClick() {
      this.editList(this.listModel)
    },
    onCancelListForm() {
      this.$logger.debug('onCancelListForm()')
      this.closeEditListForm()
    },
    onSaveListForm(listData) {
      const self = this
      this.$logger.debug('onSaveListForm()', listData)
      this.saveList(listData, function() {
        self.closeEditListForm()
      })
    },
    onDeleteListForm(listData) {
      const self = this
      this.$logger.debug('onDeleteListForm()', listData)
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
.wrapper {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  position: relative;
  flex-grow: 1;
}
// Fix ".v-toolbar__content > .v-toolbar-title" rule which got ignored because of the <wrapper> node in between
.wrapper > .v-toolbar-title {
  margin-inline-start: 16px;
}
#btn-toggle-history-mode {
  margin-right: 1rem;
  &.v-btn--active {
    background-color: rgb(var(--v-theme-background));
  }
}
</style>
