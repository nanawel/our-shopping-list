<template>
  <div id="list-panel">
    <template v-if="!isListPersisted">
      <v-container class="col-md-4 offset-md-4 text-center">
        <v-row>
          <v-col>
            <div v-cloak>
              <v-icon size="8em" color="teal lighten-3">mdi-format-list-bulleted-type</v-icon>
              <h1>Name your list</h1>
              <template v-if="isListReady">
                <v-text-field
                  autocapitalize="sentences"
                  v-model="listModel.name"
                  placeholder="My shopping list..."
                  @keydown.enter="saveList"/>
                <div class="btn-wrapper">
                  <v-btn v-if="listModel.name.length > 0" class="md-raised md-primary" @click="saveList">Create</v-btn>
                </div>
              </template>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </template>

    <template v-else-if="shouldDisplayNewItemPrompt">
      <div class="list-wrapper">
        <empty-state>
          <template v-slot:icon-name>mdi-format-list-bulleted-type</template>
          <template v-slot:title>{{ isListReady ? listModel.name : '' }}</template>
          <template v-slot:subtitle>This list is empty.</template>
          <template v-slot:buttons>
            <v-btn @click="newItem" color="primary">New item</v-btn>
          </template>
        </empty-state>
      </div>
    </template>

    <template v-else-if="shouldDisplayAllCheckedMessage">
      <div class="list-wrapper">
        <empty-state key="empty-all-checked">
          <template v-slot:icon-name>mdi-check-outline</template>
          <template v-slot:title>{{ isListReady ? listModel.name : '' }}</template>
          <template v-slot:subtitle>All items are checked!</template>
        </empty-state>
      </div>
    </template>

    <template v-else>
      <div class="list-wrapper">
        <empty-state key="empty-no-results"
                     v-show="items.length === 0 && this.searchString">
          <template v-slot:icon-name>mdi-format-list-bulleted-type</template>
          <template v-slot:title>No results</template>
          <template v-slot:subtitle>Click "Add" to create a new item.</template>
        </empty-state>

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
              <ItemView
                :key="item._id"
                :item="item"
                v-touch:touchhold="onTouchHoldItem(item)"
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
          label="Search or add a new item"
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
          <span>Add</span>
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
          <span v-if="editionItemModel && editionItemModel._id">Edit Item</span>
          <span v-else>New Item</span>
        </v-card-title>

        <v-card-text>
          <ItemForm
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
            Delete
          </v-btn>
          <v-btn
            color="grey"
            plain
            @click="onCancelItemForm">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            depressed
            @click="onSaveItemForm">
            Save
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

import debounce from 'lodash.debounce';
import { DynamicScroller } from 'vue-virtual-scroller'
import EmptyState from "./EmptyState";
import ItemForm from "./ItemForm";
import ItemView from "./Item";
import Item from "@/models/Item";

import { containsIgnoreCase } from "@/libs/compare-strings";

import {DISPLAY_MODE_CHECKED_HISTORY, DISPLAY_MODE_UNCHECKED_ONLY} from '@/constants'

export default {
  name: "List",
  components: {
    DynamicScroller,
    ItemForm,
    EmptyState,
    ItemView,
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
    currentListId: {
      get: function() {
        return this.listModel && this.listModel._id
          ? this.listModel._id
          : null;
      },
    },
    listModel: {
      get: function() {
        return this.$store.state.list.currentList
      },
      // set: function(val) {
      //   this.$store.commit('list/setCurrentList', { list: val })
      // }
    },
    isListReady: {
      get: function() {
        return !!this.listModel
      }
    },
    isListPersisted: {
      get: function() {
        return this.isListReady && this.listModel._id
      }
    },
    displayMode: {
      get: function() {
        return this.$store.state.list.displayMode
      }
    },
    shouldShowBottomSearchBar: {
      get: function() {
        return this.isListPersisted
      }
    },
    shouldDisplayNewItemPrompt: {
      get: function() {
        return this.allItems.length === 0
      }
    },
    shouldDisplayAllCheckedMessage: {
      get: function() {
        return !this.searchString
          && this.displayMode == DISPLAY_MODE_UNCHECKED_ONLY
          && this.allItems.length !== 0
          && this.uncheckedItems.length === 0
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
          q.orderBy(item => item.name.toUpperCase())

          if (self.debouncedSearchString) {
            q.where('name', (value) => containsIgnoreCase(value, self.debouncedSearchString))
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
      if (self.listModel) {
        self.$repository.checkSync(self.listModel)
          .then((isSync) => {
            if (!isSync) {
              self.initList(this.currentListId)
            }
          })
      }
    })
  },
  watch: {
    currentListId: function () {
      this.cancelSearch()
    },
    editionItemModel: function (val) {
      this.showEditItemDialog = !!val
    },
    searchInputValue: debounce(function (val) {
      this.debouncedSearchString = val
    }, 400, {trailing: true}),
  },
  methods: {
    saveList() {
      console.log("saveList()", this.listModel);
      const self = this
      this.$repository.save(this.listModel)
        .then((response) => {
          self.initList(response.entities.lists[0]._id)
          self.$router.push(`/list/${response.entities.lists[0]._id}`)
        })
        .catch((e) => {
          console.error(e)
          self.$snackbar.msg("Could not save list :(")
        })
    },

    //
    // ITEMS
    itemQuery() {
      if (this.listModel) {
        return Item.query()
          .where('listId', this.listModel._id)
      } else {
        return Item.query()
          .where(() => {
            return false
          })
      }
    },
    newItem() {
      this.editItem(null);
    },
    editItem(item) {
      console.log("editItem()", item, this.listModel);
      this.editionItemModel = item || new Item();
    },
    saveItem(item, callback) {
      item.listId = this.listModel._id
      console.log("saveItem()", item, this.listModel)
      callback = callback || function() {}
      const self = this
      this.$repository.save(item)
        .then(callback)
        .catch((e) => {
          console.error(e)
          self.$snackbar.msg("Could not save item :(")
        })
    },
    deleteItem(item, callback) {
      console.log("deleteItem()", item, this.listModel);
      callback = callback || function() {}
      const self = this
      this.$repository.delete(item)
        .then(callback)
        .catch((e) => {
          console.error(e)
          self.$snackbar.msg("Could not delete item :(")
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
      console.log("LIST.onItemSwipeOutLeft", item);
      this.toggleCheckedItem(item)
      if (this.searchString) {
        this.cancelSearch()
      }
    },
    onItemSwipeOutRight(item) {
      console.log("LIST.onItemSwipeOutRight", item);
      this.toggleCheckedItem(item)
      if (this.searchString) {
        this.cancelSearch()
      }
    },
    onTouchHoldItem(item) {
      const self = this
      return function (ev) {
        console.log("onTouchHoldItem", ev, item);
        self.editItem(item)
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
      console.log('onCancelItemForm()', this.editionItemModel);
      this.closeEditItemForm()
    },
    onSaveItemForm() {
      console.log('onSaveItemForm()', this.editionItemModel);
      this.saveItem(this.editionItemModel, function() {
        //this.$snackbar.msg(`${this.editionItemModel.name} saved successfully.`)
        this.closeEditItemForm()
      }.bind(this))
    },
    onDeleteItemForm() {
      console.log('onDeleteItemForm()', this.editionItemModel);
      const self = this
      if (confirm('Are you sure?')) {
        if (this.editionItemModel._id) {
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
};
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
