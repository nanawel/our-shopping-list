<template>
  <div>
    <template v-if="model">
      <form novalidate>
        <v-row>
          <v-col>
            <v-text-field
              name="name"
              ref="nameInput"
              :label="$t('edit-list-dialog.name-input')"
              autocapitalize="sentences"
              autocomplete="off"
              v-model="model.name" />
            <v-text-field
              name="creationDate"
              :label="$t('edit-list-dialog.creation-date-label')"
              v-model="model.createdAt"
              :disabled="true" />
          </v-col>
        </v-row>
      </form>
    </template>
  </div>
</template>

<script>
export default {
  name: 'ListFormComponent',
  props: [
    'list'
  ],
  model: {
    item: 'list',
    event: 'listchange'
  },
}
</script>
