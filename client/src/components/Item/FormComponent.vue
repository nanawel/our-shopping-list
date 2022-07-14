<template>
  <div>
    <template v-if="model">
      <form novalidate>
        <v-row>
          <v-col>
            <v-text-field
              ref="nameInput"
              :label="$t('item.input.name')"
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
          :label="$t('item.input.qty')"
          v-model="model.qty"
          @keydown.enter="onEnterKey"/>
        <v-textarea
          :label="$t('item.input.details')"
          autocapitalize="sentences"
          v-model="model.details"
          :rows="3">
        </v-textarea>
        <div v-if="model.lastCheckedAt">
          <v-icon>mdi-calendar-check</v-icon> {{ $t('item.last-checked-label', {date: new Date(model.lastCheckedAt).toLocaleString()}) }}
        </div>
      </form>
    </template>
  </div>
</template>

<script>
export default {
  name: 'FormComponent',
  props: [
    'model'
  ],
  methods: {
    onEnterKey: function() {
      this.$emit('enterKey')
    },
  }
}
</script>
