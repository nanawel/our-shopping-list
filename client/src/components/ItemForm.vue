<template>
  <div>
    <template v-if="model">
      <form novalidate>
        <v-row>
          <v-col>
            <v-text-field
              name="name"
              id="name"
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
          name="qty"
          id="qty"
          type="number"
          label="Quantity"
          v-model="model.qty"
          @keydown.enter="onEnterKey"/>
        <v-textarea
          name="details"
          id="details"
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
  data: function() {
    return {
    }
  },
  methods: {
    onEnterKey: function() {
      this.$emit('enterKey')
    }
  }
}
</script>
