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
                v-touch-event:touchhold="onTouchHoldItem(item._id)"
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

    <div class="list-footer" v-if="shouldShowBottomSearchBar">
      <!-- See https://stackoverflow.com/a/73466347/5431347 to see why type="search" is required -->
      <v-text-field
        name="new_item_name"
        id="new_item_name"
        type="search"
        aria-autocomplete="both" aria-haspopup="false"
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
        :disabled="searchString.length === 0"
        @click="submitSearchInput">
        <v-icon>mdi-plus</v-icon>
        <span>{{ $t('list.search-bar.add-button') }}</span>
      </v-btn>
    </div>

    <ItemEditDialogComponent
      :item="editionItemModel"
      v-on:save="onSaveItemForm"
      v-on:cancel="onCancelItemForm"
      v-on:delete="onDeleteItemForm"/>

    <v-overlay
      :value="loadingOverlay">
      <v-icon size="10em">mdi-cloud-sync-outline</v-icon>
    </v-overlay>
  </div>
</template>

<script>
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import debounce from 'lodash.debounce'
import { DynamicScroller } from 'vue-virtual-scroller'
import EmptyStateComponent from "./EmptyStateComponent"
import ItemEditDialogComponent from "./Item/EditDialogComponent"
import ItemComponent from "./ItemComponent"
import Item from "@/models/Item"

import {containsIgnoreCase} from "@/libs/compare-strings"

import {DISPLAY_MODE_CHECKED_HISTORY, DISPLAY_MODE_UNCHECKED_ONLY} from '@/constants'
import config from '@/config'

export default {
  name: 'ListComponent',
  components: {
    DynamicScroller,
    ItemEditDialogComponent,
    EmptyStateComponent,
    ItemComponent,
  },
  data: function() {
    return {
      listContainerId: 'list-container',
      editionItemModel: null,
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
                .orderBy(item =>
                  item[config.VUE_APP_CHECKED_ITEMS_HISTORY_SORT_FIELD || 'lastCheckedAt'] || 0,  // Need to handle specifically undefined values as 0
                  String(config.VUE_APP_CHECKED_ITEMS_HISTORY_SORT_ORDER).toLowerCase() === 'asc' ? 'asc' : 'desc'
                )
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
    searchInputValue: debounce(function (val) {
      this.debouncedSearchString = val
    }, 400, {trailing: true}),
  },
  methods: {
    newList() {
      this.$logger.debug('LIST.newList()', this.listModel)
      this.$router.push({name: 'newList'})
        .catch(() => {})  // Hide "Redirected when going from ... to ..." errors
    },
    saveList() {
      this.$logger.debug('LIST.saveList()', this.listModel)
      const self = this
      this.$repository.save(this.listModel)
        .then((response) => {
          self.$router.push({name: 'list', params: {listId: response.entities.lists[0]._id}})
        })
        .catch((e) => {
          this.$logger.error(e)
          self.$snackbar.msg(self.$t('errors.list.save'))
        })
    },
    async checkSync() {
      const self = this
      if (this.listModelId) {
        this.$logger.debug('LIST.checkSync()', this.listModelId)

        // Display the loading overlay with a 500ms delay to avoid flashes
        const debouncedOverlayTriggerFunc = debounce(() => {
          self.loadingOverlay = true
        }, 500)
        debouncedOverlayTriggerFunc()

        return this.$repository.checkSync(self.listModel)
          .then((isSync) => {
            if (!isSync) {
              return self.$repository.sync(self.listModel)
            }
          })
          .finally(() => {
            debouncedOverlayTriggerFunc.cancel()
            self.loadingOverlay = false
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
      this.$logger.debug('LIST.editItem()', item, this.listModel)
      // Pass a clone to the form so that modifications are only applied upon validation
      this.editionItemModel = {...(item ? item : new Item())}
    },
    saveItem(itemData, callback) {
      const item = Object.assign(
        new Item(),
        itemData,
        {listId: this.listModelId}  // Force current list
      )
      this.$logger.debug('LIST.saveItem()', item, this.listModel)
      callback = callback || function() {}
      const self = this
      this.$repository.save(item)
        .then(callback)
        .catch((e) => {
          this.$logger.error(e)
          self.$snackbar.msg(self.$t('errors.item.save'))
        })
    },
    deleteItem(itemData, callback) {
      const item = Object.assign(
        new Item(),
        itemData
      )
      this.$logger.debug('LIST.deleteItem()', item, this.listModel)
      callback = callback || function() {}
      const self = this
      this.$repository.delete(item)
        .then(callback)
        .catch((e) => {
          this.$logger.error(e)
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
      this.$logger.debug('LIST.onItemSwipeOutLeft()', item)
      this.toggleCheckedItem(item)
      if (this.searchString) {
        this.cancelSearch()
      }
    },
    onItemSwipeOutRight(item) {
      this.$logger.debug('LIST.onItemSwipeOutRight()', item)
      this.toggleCheckedItem(item)
      if (this.searchString) {
        this.cancelSearch()
      }
    },
    onTouchHoldItem(itemId) {
      const self = this
      // v-touch:* are not like v-on but custom directives so we need a little
      // workaround here to declare the handler.
      // This is also why we must pass the ID instead of the instance, and load the model
      // on trigger (bug #49).
      // See https://github.com/jerrybendy/vue-touch-events#how-to-add-extra-parameters
      return function (ev) {
        const item = Item.find(itemId)
        this.$logger.debug('LIST.onTouchHoldItem()', ev, item)
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
      } else {
        this.$snackbar.msg(item.checked
          ? this.$t('item.help-onclick-checked')
          : this.$t('item.help-onclick-unchecked')
        )
      }
    },
    onDoubleClickItem(item) {
      this.editItem(item)
    },

    //
    // ITEM FORM
    onCancelItemForm() {
      this.$logger.debug('onCancelItemForm()')
      this.closeEditItemForm()
    },
    onSaveItemForm(itemData) {
      const self = this
      this.$logger.debug('onSaveItemForm()', itemData)
      this.saveItem(itemData, function() {
        self.closeEditItemForm()
      })
    },
    onDeleteItemForm(itemData) {
      this.$logger.debug('onDeleteItemForm()', itemData)
      const self = this
      if (confirm(this.$t('confirmation-question'))) {
        if (itemData && itemData._id) {
          this.deleteItem(itemData, function() {
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

  // GITHUB#9 BEGIN ## Fix for svh compatibility with old mobile browsers
  @supports (min-height: 100svh) {
    min-height: calc(100svh - (56px + 80px));
    max-height: calc(100svh - (56px + 80px));
  }
  @supports not (min-height: 100svh) {
    min-height: calc(var(--x-vh) - (56px + 80px));
    max-height: calc(var(--x-vh) - (56px + 80px));
  }
  // GITHUB#9 END ## Fix for svh compatibility with old mobile browsers
}
#list-scroller {
  padding-top: 6px;
}
.scroller {
  height: 100%;
}
.list-footer {
  height: 80px;
  background-color: #f5f5f5;
  display: flex;
  padding: 6px 16px;
  align-items: center;
  flex: 0 1 auto;
  flex-wrap: wrap;

  position: relative;
  bottom: 0;

  .v-btn__content {
    @media #{map-get($display-breakpoints, 'md-and-down')} {
      > span {
        display: none;
      }
    }
  }
}
</style>
