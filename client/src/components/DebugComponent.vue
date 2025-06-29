<template>
  <v-container class="debug">
    <v-row align="center" justify="center">
      <v-col md="6">
        <h1>Debug</h1>

        <v-divider/>

        <v-tabs
          v-model="tab"
          color="deep-purple-accent-4"
          align-tabs="center"
          fixed-tabs
          class="mb-4">
          <v-tab>Internals</v-tab>
        </v-tabs>
        <v-window v-model="tab"
                  class="mb-4">
          <v-window-item class="tab-internals">
            <v-data-table
              :headers="internalsHeaders"
              :items="internalsAsDataTable"
              :items-per-page="20"
              item-key="key"
              class="elevation-1 internals-table"
            >
            </v-data-table>
          </v-window-item>
        </v-window>

        <v-container>
          <v-row>
            <v-col cols="6">
              <v-btn name="DebugComponent.back.button"
                     @click="onBackClick"
                     prepend-icon="mdi-arrow-left">{{ $t('back') }}</v-btn>
            </v-col>
            <v-col cols="6"
                   style="text-align: right">
              <v-btn name="DebugComponent.say-hello.button"
                     @click="onTestDialogClick"
                     prepend-icon="mdi-window-restore">Test dialog</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {router} from '@/router'

export default {
  name: 'DebugComponent',
  data: function() {
    return {
      tab: null
    }
  },
  computed: {
    internalsHeaders: {
      get: function () {
        return [
          {
            text: 'Label',
            align: 'start',
            sortable: true,
            value: 'label',
          },
          {
            text: 'Value',
            sortable: true,
            value: 'value'
          }
        ]
      }
    },
    internalsAsDataTable: {
      get: function () {
        return [
          {
            label: 'Boards count',
            value: this.$store.getters['entities/boards/all']().length
          },
          {
            label: 'Lists count',
            value: this.$store.getters['entities/lists/all']().length
          },
          {
            label: 'Items count',
            value: this.$store.getters['entities/items/all']().length
          },
        ]
      }
    }
  },
  methods: {
    onBackClick: function () {
      router.back()
    },
    onTestDialogClick: function () {
      this.$store.commit('dialog/showMessage', {
        title: 'This is a title',
        message: "This is a message",
        closeButtonLabel: 'Close'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.tab-source {
  table {
    width: 100%;

    th {
      width: 20%;
      text-align: right;
    }
  }
}

.tab-internals {
  text-align: left;

  :deep(th) {
    background-color: whitesmoke;
  }
  :deep(td) {
    font-family: monospace;
  }
}
</style>
