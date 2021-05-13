<template>
  <div>
    <template v-if="model">
      <form novalidate @submit.prevent="validateList">
        <v-row>
          <v-col>
            <v-text-field
              name="name"
              ref="nameInput"
              label="Name"
              autocapitalize="sentences"
              autocomplete="off"
              v-model="model.name" />
            <v-text-field
              name="creationDate"
              label="Creation Date"
              v-model="model.creationDate"
              :disabled="true" />
          </v-col>
        </v-row>
      </form>
    </template>
  </div>
</template>

<script>
export default {
  name: 'ListForm',
  props: {
    model: null,
  },
}
</script>
