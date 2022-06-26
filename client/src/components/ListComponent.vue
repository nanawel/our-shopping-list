<template>
  <div id="list-panel">

    <template v-if="!listModel">
      <EmptyStateComponente>
        <template v-slot:icon-name>mdi-alert-octagon-outline</template>
        <template v-slot:title>{{ $t('list.not-found.title') }}</template>
        <template v-slot:subtitle>{{ $t('list.not-found.subtitle') }}</template>
        <template v-slot:buttons>
          <v-btn @click="newList" color="primary">{{ $t('list.not-found.button') }}</v-btn>
        </template>
      </EmptyStateComponente>
    </template>

    <template v-else-if="isNewList">
      <v-container class="col-md-4 offset-md-4 text-center">
        <v-row>
          <v-col>
            <div v-cloak>
              <v-icon size="8em" color="teal lighten-3">mdi-format-list-bulleted-type</v-icon>
              <h1>{{ $t('list.new.title') }}</h1>
              <v-text-field
                ref="newListNameInput"
                autocapitalize="sentences"
                v-model="listModel.name"
                :placeholder="$t('list.new.input-placeholder')"
                @keydown.enter="saveList"/>
              <div class="btn-wrapper">
                <v-btn v-if="listModel.name.length > 0"
                       class="md-raised md-primary"
                       @click="saveList">{{ $t('list.new.button') }}</v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </template>

    <template v-else-if="shouldDisplayNewItemPrompt">
      <div class="list-wrapper">
        <EmptyStateComponent>
          <template v-slot:icon-name>mdi-format-list-bulleted-type</template>
          <template v-slot:title>{{ listModel.name }}</template>
          <template v-slot:subtitle>{{ $t('list.new-item.subtitle') }}</template>
          <template v-slot:buttons>
            <v-btn @click="newItem" color="primary">{{ $t('list.new-item.button') }}</v-btn>
          </template>
        </EmptyStateComponent>
      </div>
    </template>

    <template v-else-if="shouldDisplayAllCheckedMessage">
      <div class="list-wrapper">
        <EmptyStateComponent key="empty-all-checked">
          <template v-slot:icon-name>mdi-check-outline</template>
          <template v-slot:title>{{ listModel.name }}</template>
          <template v-slot:subtitle>{{ $t('list.all-checked.subtitle') }}</template>
        </EmptyStateComponent>
      </div>
    </template>

    <template v-else-if="shouldDisplayNoneCheckedMessage">
      <div class="list-wrapper">
        <EmptyStateComponent key="empty-none-checked">
          <template v-slot:icon-name>mdi-cancel</template>
          <template v-slot:title>{{ listModel.name }}</template>
          <template v-slot:subtitle>{{ $t('list.none-checked.subtitle') }}</template>
        </EmptyStateComponent>
      </div>
    </template>

    <template v-else>
      <div class="list-wrapper">
        <EmptyStateComponent key="empty-no-results"
                     v-show="items.length === 0 && this.searchString">
          <template v-slot:icon-name>mdi-cancel</template>
          <template v-slot:title>{{ $t('list.no-results.title') }}</template>
          <template v-slot:subtitle>{{ $t('list.no-results.subtitle') }}</template>
        </EmptyStateComponent>

        <DynamicScroller
          :items="items"
          :min-item-size="60"
          key-field="_id"
          id="list-scroller"
          class="scroller"
          page-mode
        >
          <template v-slot:default="{ item, index, active }">
            <DynamicScrollerItem
              :item="item"
              :active="active"
              :data-index="index"
            >
              <ItemComponent
                :key="item._id"
                :item="item"
                v-touch-event:touchhold="onTouchHoldItem(item)"
                @click="onClickItem(item)"
                @editClick="onEditItem(item)"
                @doubleClick="onDoubleClickItem(item)"
                @swipeOutLeft="onItemSwipeOutLeft(item)"
                @swipeOutRight="onItemSwipeOutRight(item)"/>
              <v-divider :key="index"/>
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
      </div>
    </template>

    <div class="list-footer align-end" v-if="shouldShowBottomSearchBar">
      <v-footer class="px-6 px-md-20">
        <v-text-field
          name="new_item_name"
          id="new_item_name"
          ref="searchInput"
          :label="$t('list.search-bar.input-label')"
          autocomplete="off"
          prepend-icon="mdi-magnify"
          clearable
          v-model="searchInputValue"
          autocapitalize="sentences"
          class="pr-4"
          @keydown.enter="submitSearchInput"/>
        <v-btn
          depressed
          small
          color="primary"
          :disabled="this.searchString.length === 0"
          @click="submitSearchInput">
          <v-icon>mdi-plus</v-icon>
          <span>{{ $t('list.search-bar.add-button') }}</span>
        </v-btn>
      </v-footer>
    </div>

    <v-dialog
      v-model="showEditItemDialog"
      persistent
      max-width="500"
      @keydown.esc="onCancelItemForm">
      <v-card>
        <v-card-title class="headline grey lighten-2">
          <span v-if="editionItemModel && editionItemModel._id">{{ $t('edit-item-dialog.existing-title') }}</span>
          <span v-else>{{ $t('edit-item-dialog.new-title') }}</span>
        </v-card-title>

        <v-card-text>
          <ItemFormComponent
            :model="editionItemModel"
            v-on:cancel="onCancelItemForm"
            v-on:save="onSaveItemForm"
            v-on:delete="onDeleteItemForm"
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

    <v-overlay
      :value="loadingOverlay">
      <v-progress-circular
        indeterminate
        size="64"/>
    </v-overlay>
  </div>
</template>

<script>
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import debounce from 'lodash.debounce'
import { DynamicScroller } from 'vue-virtual-scroller'
import EmptyStateComponent from "./EmptyStateComponent"
import ItemFormComponent from "./ItemFormComponent"
import ItemComponent from "./ItemComponent"
import Item from "@/models/Item"

import {containsIgnoreCase} from "@/libs/compare-strings"

import {DISPLAY_MODE_CHECKED_HISTORY, DISPLAY_MODE_UNCHECKED_ONLY} from '@/constants'

export default {
  name: 'ListComponent',
  components: {
    DynamicScroller,
    ItemFormComponent,
    EmptyStateComponent,
    ItemComponent,
  },
  data: function() {
    return {
      listContainerId: 'list-container',
      editionItemModel: null,
      showEditItemDialog: false,
      snack: {
        show: false,
        duration: 3000,
        text: null,
        buttonText: "Close",
        buttonCallback: null,
      },
      searchInputValue: null, // nullable, see also searchString and debouncedSearchString (NOT nullable)
      debouncedSearchString: '',
      sock: null,
      loadingOverlay: false
    }
  },
  computed: {
    listModel: {
      get: function() {
        return this.$store.state.list.currentList
      }
    },
    listModelId: {
      get: function() {
        return this.listModel ? this.listModel._id : null
      }
    },
    isNewList: {
      get: function() {
        return !this.listModelId
      }
    },
    displayMode: {
      get: function() {
        return this.$store.state.list.displayMode
      }
    },
    shouldShowBottomSearchBar: {
      get: function() {
        return this.listModelId
      }
    },
    shouldDisplayNewItemPrompt: {
      get: function() {
        return this.allItems.length === 0
      }
    },
    shouldDisplayAllCheckedMessage: {
      get: function() {
        return this.listModelId
          && !this.searchString
          && this.displayMode === DISPLAY_MODE_UNCHECKED_ONLY
          && this.allItems.length !== 0
          && this.uncheckedItems.length === 0
      }
    },
    shouldDisplayNoneCheckedMessage: {
      get: function() {
        return this.listModelId
          && !this.searchString
          && this.displayMode === DISPLAY_MODE_CHECKED_HISTORY
          && this.allItems.length !== 0
          && this.checkedItems.length === 0
      }
    },
    items: {
      get: function() {
        const self = this
        if (self.listModel) {
          const q = self.itemQuery()

          if (this.displayMode === DISPLAY_MODE_CHECKED_HISTORY) {
              q.where('checked', true)
                .orderBy(item => item.lastCheckedAt || 0, 'desc') // Need to handle specifically undefined values as 0
          } else {
              q.orderBy('checked')
          }
          q.orderBy('sortName', 'asc')

          if (self.debouncedSearchString) {
            q.where('search', (value) => containsIgnoreCase(value, self.debouncedSearchString))
          } else {
            if (self.displayMode === DISPLAY_MODE_UNCHECKED_ONLY) {
              q.where('checked', false)
            }
          }

          return q.get()
        } else {
          return []
        }
      },
    },
    allItems: {
      get: function() {
        if (this.listModel) {
          return this.itemQuery().get()
        } else {
          return []
        }
      },
    },
    checkedItems: {
      get: function() {
        if (this.listModel) {
          return this.itemQuery().where('checked', true).get()
        } else {
          return []
        }
      },
    },
    uncheckedItems: {
      get: function() {
        if (this.listModel) {
          return this.itemQuery().where('checked', false).get()
        } else {
          return []
        }
      },
    },
    searchString: {
      get: function() {
        return this.searchInputValue && this.searchInputValue.length
          ? this.searchInputValue
          : ''
      }
    }
  },
  created() {
    const self = this

    this.$ws.on('connect', () => {
      self.checkSync()
    })
  },
  mounted() {
    this.checkSync()

    if (this.isNewList && this.$refs.newListNameInput) {
      this.$refs.newListNameInput.focus()
    }
  },
  watch: {
    listModelId: function () {
      // Empty search field when switching list
      this.cancelSearch()
      this.checkSync()
    },
    editionItemModel: function (val) {
      this.showEditItemDialog = !!val
    },
    searchInputValue: debounce(function (val) {
      this.debouncedSearchString = val
    }, 400, {trailing: true}),
  },
  methods: {
    newList() {
      console.log("LIST.newList()", this.listModel)
      this.$router.push({name: 'newList'})
        .catch(() => {})  // Hide "Redirected when going from ... to ..." errors
    },
    saveList() {
      console.log("LIST.saveList()", this.listModel)
      const self = this
      this.$repository.save(this.listModel)
        .then((response) => {
          self.$router.push({name: 'list', params: {listId: response.entities.lists[0]._id}})
        })
        .catch((e) => {
          console.error(e)
          self.$snackbar.msg(self.$t('errors.list.save'))
        })
    },
    async checkSync() {
      const self = this
      if (this.listModelId) {
        console.log('LIST.checkSync()', this.listModelId)

        return this.$repository.checkSync(self.listModel)
          .then((isSync) => {
            if (!isSync) {
              return self.$repository.sync(self.listModel)
            }
          })
      }
    },

    //
    // ITEMS
    itemQuery() {
      if (this.listModel) {
        return Item.query()
          .where('listId', this.listModelId)
      } else {
        return Item.query()
          .where(() => {
            return false
          })
      }
    },
    newItem() {
      this.editItem(null)
    },
    editItem(item) {
      console.log('LIST.editItem()', item, this.listModel)
      this.editionItemModel = item || new Item()
    },
    saveItem(item, callback) {
      item.listId = this.listModelId
      console.log('LIST.saveItem()', item, this.listModel)
      callback = callback || function() {}
      const self = this
      this.$repository.save(item)
        .then(callback)
        .catch((e) => {
          console.error(e)
          self.$snackbar.msg(self.$t('errors.item.save'))
        })
    },
    deleteItem(item, callback) {
      console.log('LIST.deleteItem()', item, this.listModel)
      callback = callback || function() {}
      const self = this
      this.$repository.delete(item)
        .then(callback)
        .catch((e) => {
          console.error(e)
          self.$snackbar.msg(self.$t('errors.item.delete'))
        })
    },
    toggleCheckedItem(item) {
      item.toggleChecked()
      this.saveItem(item)
    },
    submitSearchInput() {
      const self = this
      var item = new Item()
      item.name = this.searchString
      this.saveItem(item, function() {
        self.cancelSearch()
      })
    },
    onEditItem(item) {
      this.editItem(item)
    },
    onItemSwipeOutLeft(item) {
      console.log('LIST.onItemSwipeOutLeft()', item)
      this.toggleCheckedItem(item)
      if (this.searchString) {
        this.cancelSearch()
      }
    },
    onItemSwipeOutRight(item) {
      console.log('LIST.onItemSwipeOutRight()', item)
      this.toggleCheckedItem(item)
      if (this.searchString) {
        this.cancelSearch()
      }
    },
    onTouchHoldItem(item) {
      const self = this
      return function (ev) {
        console.log('LIST.onTouchHoldItem()', ev, item)
        ev.preventDefault()
        self.editItem(item)
        return false
      }
    },
    onClickItem(item) {
      if (this.searchString) {
        this.toggleCheckedItem(item)
        if (this.searchString) {
          this.cancelSearch()
        }
      }
    },
    onDoubleClickItem(item) {
      this.editItem(item)
    },

    //
    // ITEM FORM
    onCancelItemForm() {
      console.log('onCancelItemForm()', this.editionItemModel)
      this.closeEditItemForm()
    },
    onSaveItemForm() {
      console.log('onSaveItemForm()', this.editionItemModel)
      this.saveItem(this.editionItemModel, function() {
        this.closeEditItemForm()
      }.bind(this))
    },
    onDeleteItemForm() {
      console.log('onDeleteItemForm()', this.editionItemModel)
      const self = this
      if (confirm(this.$t('confirmation-question'))) {
        if (this.editionItemModel && this.editionItemModel._id) {
          this.deleteItem(this.editionItemModel, function() {
            self.closeEditItemForm()
          })
        } else {
          // Just cancel
          this.closeEditItemForm()
        }
      }
    },
    closeEditItemForm() {
      this.editionItemModel = null
    },

    //
    // SEARCH
    cancelSearch() {
      this.searchInputValue = ''
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~vuetify/src/styles/settings/_variables';

[v-cloak] {
  display: none;
}

#list-panel {
  position: relative;
  display: flex;
  flex-direction: column;
}
.list-wrapper {
  overflow-y: auto;
  min-height: calc(100vh - (64px + 80px));
  max-height: calc(100vh - (64px + 80px));
}
.scroller {
  height: 100%;
}
.list-footer {
  position: relative;
  bottom: 0;
  margin-left: -12px;
  margin-right: -12px;
}
.v-footer {
  height: 80px;
  z-index: 5;
  flex-wrap: nowrap;

  .v-btn__content {
    @media #{map-get($display-breakpoints, 'md-and-down')} {
      > span {
        display: none;
      }
    }
  }
}
</style>
