<template>
  <header>
    <ul class="menus">
      <li class="menu">
        <span class="btn-group">
          <span class="title">
            单元格设置
          </span>
          <span class="container">
            <el-button
              size="small"
              :disabled="!mergeable"
              @click="merge"
            >
              {{ reverseMerge ? '取消合并' : '合并' }}
            </el-button>
            <el-button
              size="small"
              :disabled="!mergeable"
              @click="drawBorder"
            >
              {{ '绘制边框' }}
            </el-button>
          </span>
        </span>
        <span class="btn-group">
          <span class="title">
            字体设置
          </span>
          <span class="container">
            <el-button size="small">加粗</el-button>
            <el-button size="small">斜体</el-button>
            <el-button size="small">下划线</el-button>
          </span>
        </span>
        <span class="btn-group">
          <span class="title">
            对齐方式
          </span>
          <span class="container">
            <el-button size="small">左对齐</el-button>
            <el-button size="small">居中对齐</el-button>
            <el-button size="small">右对齐</el-button>
          </span>
        </span>
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
    },
  },
  methods: {
    merge() {
      this.$emit('merge');
    },
    drawBorder() {
      this.$emit('draw-borders');
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
    height: 70px;
    background: grey;
    align-items: center;
    color: white;
    margin: 0;
    .menu {
      display: flex;
      align-items: center;
    }
    // button {
    //   background: #0DB3A6;
    //   color: white;
    //   font-size: 14px;
    //   padding: 5px 10px;
    //   border: none;
    //   cursor: pointer;
    //   height: 30px;
    //   margin-right: 15px;
    //   &:disabled {
    //     color: grey;
    //     cursor: initial;
    //   }
    //   &:focus {
    //     outline: none;
    //   }
    // }
  }
  .btn-group {
    display: flex;
    flex-direction: column;
    border-left: 1px solid #aba0a0;
    &:first-child {
      border-left: none;
    }
    padding-left: 10px;
    margin-left: 10px;
    .title {
      font-size: 14px;
      text-align: left;
      margin-bottom: 8px;
    }
  }
</style>
