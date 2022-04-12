<template>
  <div class="about">
    <img src="@/assets/logo.svg" width="120" height="120" alt="OSL logo">
    <h1>Our Shopping List</h1>
    <em>{{ appVersion }}-{{ appBuildId }}</em>
    <p>Copyright &copy; 2021-{{new Date().getFullYear()}} Anaël Ollier</p>

    <hr/>

    <h2>Source / Issues</h2>
    <p><a href="https://github.com/nanawel/our-shopping-list">https://github.com/nanawel/our-shopping-list</a></p>

    <h2>License</h2>
    <p>AGPL-3.0</p>
    <!--
    <h2>Dependencies</h2>
    <div class="dependencies">
      TODO: Dump dependencies
    </div>
    -->

    <hr/>

    <v-btn @click="onBackClick">{{ $t('back') }}</v-btn>
  </div>
</template>

<script>
export default {
  name: 'About',
  computed: {
    appVersion: {
      get: function() {
        return this.$store.state.version.version
      }
    },
    appBuildId: {
      get: function() {
        return this.$store.state.version.buildId
      }
    }
  },
  methods: {
    onBackClick: function () {
      history.back()
    }
  },
  created() {
    this.$root.setTitle('About')
  },
  destroyed() {
    this.$root.setTitle(null)
  }
}
</script>

<style lang="scss" scoped>
.about {
  text-align: center;
}

.dependencies {
  text-align: left;
}

hr {
  max-width: 50%;
  margin: 1em auto;
}
</style>
