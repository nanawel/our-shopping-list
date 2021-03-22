<template>
  <span class="md-title">{{ title }}</span>
</template>

<script>
export default {
  name: "Title",
  data: () => ({
    defaultTitle: 'Our Shopping List',
    title: null,
  }),
  methods: {
    setTitle: function(title) {
      this.title = title || this.defaultTitle
      document.title = this.title
    }
  },
  mounted() {
    this.setTitle()
  }
};
</script>

<style lang="scss" scoped>

</style>
