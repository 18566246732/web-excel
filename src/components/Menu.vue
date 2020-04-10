<template>
  <header>
    <ul class="menus">
      <li class="menu">
        <button
          :disabled="!mergeable"
          @click="merge"
        >
          合并
        </button>
      </li>
    </ul>
  </header>
</template>
<script>
export default {
  props: {
    mergeable: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    merge() {
      this.$emit('merge');
    }
  }
};
</script>
<style lang="scss" scoped>
  .menus {
    list-style: none;
    display: flex;
  }
</style>