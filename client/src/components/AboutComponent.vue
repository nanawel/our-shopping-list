<template>
  <v-container class="about">
    <v-row align="center" justify="center">
      <v-col md="6">
        <img src="@/assets/logo.svg" width="120" height="120" alt="OSL logo">
        <h1>Our Shopping List</h1>
        <em>{{ appVersion }}-{{ appBuildId }}</em>
        <p>Copyright &copy; 2021-{{new Date().getFullYear()}} Anaël Ollier</p>

        <v-divider/>

        <v-tabs
          v-model="tab"
          color="deep-purple-accent-4"
          align-tabs="center"
          fixed-tabs
          class="mb-4">
          <v-tab>Source / Issues</v-tab>
          <v-tab>License</v-tab>
          <v-tab>Configuration</v-tab>
        </v-tabs>
        <v-window v-model="tab"
                  class="mb-4">
          <v-window-item class="tab-source">
            <table>
              <tr>
                <th><v-icon>mdi-link</v-icon></th>
                <td><a href="https://github.com/nanawel/our-shopping-list">https://github.com/nanawel/our-shopping-list</a></td>
              </tr>
              <tr>
                <th>
                  <!-- The Mastodon icon is marked as deprecated on MDI, so including the full SVG here instead -->
                  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                    <title>Mastodon</title>
                    <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.67 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z"/>
                  </svg>
                </th>
                <td><a href="https://mamot.fr/@nanawel">@nanawel@mamot.fr</a></td>
              </tr>
            </table>
          </v-window-item>
          <v-window-item class="tab-license">
            <p>AGPL-3.0</p>
            <p>
              <a href="https://www.gnu.org/licenses/agpl-3.0.en.html">https://www.gnu.org/licenses/agpl-3.0.en.html</a>
            </p>
          </v-window-item>
          <v-window-item class="tab-configuration">
            <v-data-table
              :headers="configHeaders"
              :items="configAsDataTable"
              :items-per-page="20"
              item-key="key"
              class="elevation-1 config-table"
            >
            </v-data-table>
          </v-window-item>
        </v-window>

        <v-btn name="AboutComponent.back.button"
               @click="onBackClick">{{ $t('back') }}</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {router} from '@/router'
import config from '@/config'

export default {
  name: 'AboutComponent',
  data: function() {
    return {
      tab: null
    }
  },
  computed: {
    appVersion: {
      get: function() {
        return this.$store.state?.version.version
      }
    },
    appBuildId: {
      get: function() {
        return this.$store.state?.version.buildId
      }
    },
    configHeaders: {
      get: function () {
        return [
          {
            text: 'Key',
            align: 'start',
            sortable: true,
            value: 'key',
          },
          {
            text: 'Value',
            sortable: true,
            value: 'value'
          }
        ]
      }
    },
    configAsDataTable: {
      get: function () {
        return Object.entries(config).map(([key, value]) => ({
          key,
          value
        }))
      }
    }
  },
  methods: {
    onBackClick: function () {
      router.back()
    }
  }
}
</script>

<style lang="scss" scoped>
.about {
  text-align: center;
}

.tab-source {
  table {
    width: 100%;

    th {
      width: 20%;
      text-align: right;
    }
  }
}

.tab-configuration {
  text-align: left;

  :deep(th) {
    background-color: whitesmoke;
  }
  :deep(td) {
    font-family: monospace;
  }
}
</style>
