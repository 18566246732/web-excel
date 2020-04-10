<template>
  <header>
    <ul class="menus">
      <li class="menu">
        <button
          :disabled="!mergeable"
          @click="merge"
        >
          {{ reverseMerge ? '取消合并' : '合并' }}
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
    },
    reverseMerge: {
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
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: grey;
    align-items: center;
    color: white;
    margin: 0;
  }
</style>
