<template>
  <header>
    <ul class="menus">
      <li class="menu">
        <span class="btn-group">
          <span class="title">
            单元格设置
          </span>
          <span class="container">
            <span class="row">
              <el-button
                size="mini"
                :disabled="!mergeable"
                @click="merge"
              >
                {{ reverseMerge ? '取消合并' : '合并' }}
              </el-button>
              <el-button
                size="mini"
                :disabled="!mergeable"
                @click="drawBorder"
              >
                绘制边框
              </el-button>
              <el-button
                size="mini"
                :disabled="!mergeable"
                @click="$emit('removeBorder')"
              >
                无边框
              </el-button>
            </span>
          </span>
        </span>
        <span class="btn-group">
          <span class="title">
            字体设置
          </span>
          <span class="container">
            <span class="row">
              <el-button
                size="mini"
                @click="$emit('fontBold')"
              >加粗</el-button>
              <el-button
                size="mini"
                @click="$emit('fontItalic')"
              >斜体</el-button>
              <el-button
                size="mini"
                @click="$emit('fontUnderscore')"
              >下划线</el-button>
            </span>
            <span class="row">
              <el-button
                size="mini"
                @click="$emit('cancelFontBold')"
              >取消加粗</el-button>
              <el-button
                size="mini"
                @click="$emit('cancelFontItalic')"
              >取消斜体</el-button>
              <el-button
                size="mini"
                @click="$emit('cancelFontUnderscore')"
              >取消下划线</el-button>
            </span>
          </span>
        </span>
        <span class="btn-group">
          <span class="title">
            对齐方式
          </span>
          <span class="container">
            <span class="row">
              <el-button
                size="mini"
                @click="$emit('leftAlign')"
              >左对齐</el-button>
              <el-button
                size="mini"
                @click="$emit('horizontalCenterAlign')"
              >水平居中</el-button>
              <el-button
                size="mini"
                @click="$emit('rightAlign')"
              >右对齐</el-button>
            </span>
            <span class="row">
              <el-button
                size="mini"
                @click="$emit('topAlign')"
              >上对齐</el-button>
              <el-button
                size="mini"
                @click="$emit('verticalCenterAlign')"
              >垂直居中</el-button>
              <el-button
                size="mini"
                @click="$emit('bottomAlign')"
              >下对齐</el-button>
            </span>
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
      this.$emit('drawBorders');
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
    height: 100px;
    background: grey;
    align-items: center;
    color: white;
    margin: 0;
    .menu {
      display: flex;
      align-items: center;
    }
    .container {
      display: flex;
      flex-direction: column;
      .row {
        text-align: left;
        margin-bottom: 5px;
      }
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
