<template>
  <div class="about">
    <h1>Our Shopping List</h1>
    <em>{{ appVersion }}-{{ appBuildId }}</em>
    <p>Copyright &copy; 2021 Anaël Ollier</p>

    <!--
    <h2>Dependencies</h2>
    <div class="dependencies">
      TODO: Dump dependencies
    </div>
    -->
  </div>
</template>

<script>
export default {
  name: "About",
  computed: {
    appVersion: {
      get: function() {
        return this.$store.state.version.currentVersion
      }
    },
    appBuildId: {
      get: function() {
        return this.$store.state.version.currentBuildId
      }
    }
  },
  created() {
    this.$root.setTitle('About');
  },
  destroyed() {
    this.$root.setTitle(null);
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
</style>
