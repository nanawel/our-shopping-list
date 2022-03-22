<template>
  <div>
    <template v-if="model">
      <form novalidate>
        <v-row>
          <v-col>
            <v-text-field
              ref="nameInput"
              label="Name"
              autocapitalize="sentences"
              v-model="model.name"
              @keydown.enter="onEnterKey"/>
          </v-col>
          <v-col cols="2" md="1">
            <v-checkbox v-model="model.checked"></v-checkbox>
          </v-col>
        </v-row>
        <v-text-field
          type="number"
          label="Quantity"
          v-model="model.qty"
          @keydown.enter="onEnterKey"/>
        <v-textarea
          label="Details"
          autocapitalize="sentences"
          v-model="model.details"
          :rows="3">
        </v-textarea>
        <div v-if="model.lastCheckedAt">
          <v-icon>mdi-calendar-check</v-icon> Last checked: {{ new Date(model.lastCheckedAt).toLocaleString() }}
        </div>
      </form>
    </template>
  </div>
</template>

<script>
export default {
  name: 'ItemForm',
  props: {
    model: null
  },
  methods: {
    onEnterKey: function() {
      this.$emit('enterKey')
    }
  }
}
</script>
