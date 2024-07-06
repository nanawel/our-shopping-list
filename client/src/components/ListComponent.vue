<template>
  <div id="list-panel">

    <template v-if="!listModel">
      <div class="list-wrapper">
        <EmptyStateComponent>
          <template v-slot:icon-name>mdi-alert-octagon-outline</template>
          <template v-slot:title>{{ $t('list.not-found.title') }}</template>
          <template v-slot:subtitle>{{ $t('list.not-found.subtitle') }}</template>
          <template v-slot:buttons>
            <v-btn @click="newList" color="primary">{{ $t('list.not-found.button') }}</v-btn>
          </template>
        </EmptyStateComponent>
      </div>
    </template>

    <template v-else-if="isNewList">
      <v-container class="v-col-md-4 text-center">
        <v-row>
          <v-col>
            <div v-cloak>
              <v-icon size="8em"
                      color="teal-lighten-3"
                      style="height: auto !important; width: auto !important;">mdi-format-list-bulleted-type</v-icon>
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
                v-touch:hold="onTouchHoldItem(item._id)"
                @click="onClickItem"
                @editClick="onEditItem"
                @doubleClick="onDoubleClickItem"
                @swipeOutLeft="onItemSwipeOutLeft"
                @swipeOutRight="onItemSwipeOutRight"/>
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
        @keydown.enter="submitSearchInput"
        bg-color="transparent"
        hide-details="auto"/>
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

    <v-overlay v-model="loadingOverlay"
               class="align-center justify-center"
               contained
               persistent>
      <v-icon size="10em"
              color="white"
              style="height: auto !important; width: auto !important;">mdi-cloud-sync-outline</v-icon>
    </v-overlay>
  </div>
</template>

<script>
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import debounce from 'lodash.debounce'
import {DynamicScroller, DynamicScrollerItem} from 'vue-virtual-scroller'
import EmptyStateComponent from "./EmptyStateComponent"
import ItemEditDialogComponent from "./Item/EditDialogComponent"
import ItemComponent from "./ItemComponent"
import List from '@/models/List'
import Item from '@/models/Item'

import {containsIgnoreCase} from "@/libs/compare-strings"

import {DISPLAY_MODE_CHECKED_HISTORY, DISPLAY_MODE_UNCHECKED_ONLY} from '@/constants'
import config from '@/config'

export default {
  name: 'ListComponent',
  components: {
    DynamicScroller,
    DynamicScrollerItem,
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
      loadingOverlay: false,
      apmSpan: null
    }
  },
  computed: {
    listModel: {
      get: function() {
        return this.$store.state?.list.currentList
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
        return this.$store.state?.list.displayMode
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
    this.apmSpan = this.$apm.startSpan('components/ListComponent::create-mount')
    this.unwatchLoadingOverlay = this.$store.watch(
      (state, getters) => getters['modelSync/isSyncInProgress'](List, this.listModelId),
      debounce(
        (newValue) => {
        this.loadingOverlay = newValue
      }, 500)
    )
  },
  beforeDestroy() {
    this.unwatchLoadingOverlay()
  },
  mounted() {
    if (this.isNewList && this.$refs.newListNameInput) {
      this.$refs.newListNameInput.focus()
    }
    this.apmSpan && this.apmSpan.end()
  },
  watch: {
    listModelId: function () {
      // Empty search field when switching list
      this.cancelSearch()
    },
    searchInputValue: debounce(function (val) {
      this.debouncedSearchString = val
    }, 400),
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
        .then((list) => {
          self.$router.push({name: 'list', params: {listId: list._id}})
        })
        .catch((e) => {
          self.$logger.error(e)
          self.$snackbar.msg(self.$t('errors.list.save'))
        })
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
      this.editionItemModel = item
        ? Object.assign(new Item(), item)
        : new Item()
      this.$logger.debug('LIST.editItem() clone', this.editionItemModel)
    },
    saveItem(itemData, callback) {
      const item = Object.assign(new Item(), itemData)
      if (!item.listId) {
        item.listId = this.listModelId
      }
      this.$logger.debug('LIST.saveItem()', item, this.listModel)
      callback = callback || function() {}
      const self = this
      this.$repository.save(item)
        .then(callback)
        .catch((e) => {
          self.$logger.error(e)
          self.$snackbar.msg(self.$t('errors.item.save'))
        })
    },
    deleteItem(itemData, callback) {
      const item = Object.assign(new Item(), itemData)
      this.$logger.debug('LIST.deleteItem()', item, this.listModel)
      callback = callback || function() {}
      const self = this
      this.$repository.delete(item)
        .then(callback)
        .catch((e) => {
          self.$logger.error(e)
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
      this.populateNewItemFromSearchString(item, this.searchString)
      this.saveItem(item, function(newItem) {
        self.cancelSearch()
        if (config.VUE_APP_EDIT_ITEM_ON_CREATE) {
          self.editItem(newItem)
        }
      })
    },
    populateNewItemFromSearchString(item, searchString) {
      if (config.VUE_APP_USE_ITEM_QUICK_SYNTAX) {
        const re = new RegExp('^(\\d+)x (.*)$')
        const m = searchString.match(re)
        if (!m || !m.length) {
          item.name = this.searchString
        } else {
          item.name = m[2]
          item.qty = m[1]
        }
      } else {
        item.name = this.searchString
      }
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
      // // v-touch:* are not like v-on but custom directives so we need a little
      // // workaround here to declare the handler.
      // // This is also why we must pass the ID instead of the instance, and load the model
      // // on trigger (bug #49).
      // // See https://github.com/robinrodricks/vue3-touch-events?tab=readme-ov-file#passing-parameters-to-the-event-handler
      return function (ev) {
        const item = Item.find(itemId)
        self.$logger.debug('LIST.onTouchHoldItem()', ev, item)
        ev.preventDefault()
        self.editItem(item)
        return false
      }
    },
    onClickItem(ev, item) {
      this.$logger.debug('LIST.onClickItem()', ev, item)
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
    onDoubleClickItem(ev, item) {
      this.$logger.debug('LIST.onDoubleClickItem()', item)
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
@import 'vuetify/settings';

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

  // Workaround to keep search bar at the bottom
  // (see node_modules/vuetify/lib/components/VToolbar/VToolbar.mjs -> contentHeight)
  // 56px: nav header's height (=64-8 as we're using the "comfortable" density)
  // 80px: footer's height
  --header-height: 56px;

  // GITHUB#9 BEGIN ## Fix for svh compatibility with old mobile browsers
  // 100svh: 100% of viewport's height
  @supports (min-height: 100svh) {
    min-height: calc(100svh - (var(--header-height) + 80px));
    max-height: calc(100svh - (var(--header-height) + 80px));
  }
  @supports not (min-height: 100svh) {
    min-height: calc(var(--x-vh) - (var(--header-height) + 80px));
    max-height: calc(var(--x-vh) - (var(--header-height) + 80px));
  }
  // GITHUB#9 END ## Fix for svh compatibility with old mobile browsers

  > .empty-state {
    padding: 1rem;
  }
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
