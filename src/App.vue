<template>
  <div id="app">
    <Menu
      :mergeable="isMergeAble"
      @merge="handleMerge"
    />
    <table
      class="playground"
      border="1"
      cellspacing="0"
    >
      <tr
        v-for="(rowData, rowIndex) in tableData"
        :key="rowIndex"
      >
        <td
          v-for="(colData, colIndex) in rowData"
          :key="colIndex"
          draggable="false"
          :rowspan="colData.rowspan"
          :colspan="colData.colspan"
          :style="colData.style"
          @mousedown="handleMouseDown(colData, rowIndex, colIndex)"
          @mousemove="debouncedMouseMove(colData, rowIndex, colIndex)"
          @mouseup="handleMouseUp"
        >
          {{ colData.text }}
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import Menu from "./components/Menu";

export default {
  name: 'App',
  components: {
    Menu
  },
  data() {
    return {
      tableData: [],
      isChoosingMode: false,
      activeRowIndex: {
        start: -1,
        len: 0
      },
      start: {
        rowIndex: -1,
        colIndex: -1
      },
      activeColIndex: {
        start: -1,
        len: 0
      },
      isMergeAble: false,
      debouncedMouseMove: () => {}
    };
  },
  mounted() {
    this.tableData = this.generateEmptyTableData(6, 10);
    this.debouncedMouseMove = this.$helper.throttle(this.handleMouseMove);
    // this.mergeBrick(2, 3, 1, 2);
    // this.mergeBrick(3,3,2,2);
  },
  methods: {
    generateEmptyTableData(row, col) {
      const colData = new Array(col).fill({text: '', rowspan: 1, parent: {}, master: false, seleted: false, colspan: 1, style: {display: 'visible', background: ''}});
      return this.$helper.deepClone(new Array(row).fill(colData));
    },
    mergeBrick(x, y, xLen, yLen) {
      const element = this.tableData[x][y];
      element.rowspan = xLen;
      element.colspan = yLen;
      element.maxRow = x + xLen - 1;
      element.maxCol = y + yLen - 1;
      element.master = true;
      this.hideRest(element, x, y, xLen, yLen);
    },
    hideRest(colData, x, y, xLen, yLen) {
      // 处理当前行
      const currentRowData = this.tableData[x];
      for (let yIndex = y + 1; yIndex < y + yLen; yIndex++) {
        const element = currentRowData[yIndex];
        element.style.display = 'none';
        element.slave = true;
        element.parent.rowIndex = x;
        element.parent.colIndex = y;
      }

      // 当，行数大于1，处理余下行
      if (xLen > 1) {
        this.mapArea({}, x + 1, y, x + xLen - 1, y + yLen - 1, (element) => {
          element.style.display = 'none';
          element.slave = true;
          element.parent.rowIndex = x;
          element.parent.colIndex = y;
        });
      }
    },
    handleMouseDown(colData, rowIndex, colIndex) {
      this.resetStyle('background', '');

      this.isChoosingMode = true;
      this.start.rowIndex = rowIndex;
      this.start.colIndex = colIndex;
    },
    handleMouseMove(colData, rowIndex, colIndex) {
      if (this.isChoosingMode) {
        this.resetStyle('background', '');
        this.highlight(colData, this.start.rowIndex, this.start.colIndex, rowIndex, colIndex);
      }
    },
    handleMouseUp() {
      this.isChoosingMode = false;
      this.isMergeAble = true;
    },
    // 重置所有单元格的样式
    resetStyle(key, value) {
      this.tableData.forEach(row => {
        row.forEach(col => {
          col.style[key] = value;
        });
      });
    },
    // 高亮选中
    highlight(colData, rowStart, colStart, rowEnd, colEnd) {
      this.mapArea(colData, rowStart, colStart, rowEnd, colEnd, (element) => {
        element.style.background = 'blue';
      });
    },
    // 创建选区
    mapArea(colData, rowStart, colStart, rowEnd, colEnd, callback) {
      this.updateActiveIndex(rowStart, colStart, rowEnd, colEnd);
      // 向下
      if (rowEnd >= rowStart) {
        // 对于单元格，需要选中最大y值
        if (colData.master) {
          rowEnd = colData.maxRow;
          
        }
        for (let yIndex = rowStart; yIndex < rowEnd + 1; yIndex++) {
          const leftedRowData = this.tableData[yIndex];
          // 向右
          if (colEnd > colStart) {
            console.log('右下');
            // 对于单元格，需要选中最大x值
            if (colData.master) {
              colEnd = colData.maxCol;
            }
            for (let xIndex = colStart; xIndex < colEnd + 1; xIndex++) {
              const element = leftedRowData[xIndex];
              // 当选区包含合并块，则重置边界值
              if (element != colData) {
                // 方块在上，修改终点
                if (element.master && element.maxCol > colEnd) {
                    colEnd  = element.maxCol;
                    this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在上，修改起点
                if (element.slave && element.parent.rowIndex < rowStart) {
                    rowStart = element.parent.rowIndex;
                    this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在下，修改终点
                if (element.master && element.maxRow > rowEnd) {
                    rowEnd = element.maxRow;
                    this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在下，修改起点
                if (element.slave && element.parent.colIndex < colStart) {
                    colStart = element.parent.colIndex;
                    this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
                }
              }
              callback(element);
            }
          }
          // 向左
          if (colEnd <= colStart) {
            console.log('左下');
            
            for (let xIndex = colStart; xIndex > colEnd - 1; xIndex--) {
              const element = leftedRowData[xIndex];
              // 当选区包含合并块，则重置边界值
              if (element != colData) {
                // 方块在上，修改终点
                if (element.slave && element.parent.colIndex < colEnd) {
                    colEnd  = element.parent.colIndex;
                    this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在上，修改起点
                if (element.slave && element.parent.rowIndex < rowStart) {
                    rowStart = element.parent.rowIndex;
                    this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在下，修改终点
                if (element.master && element.maxRow > rowEnd) {
                    rowEnd  = element.maxRow;
                    this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在下，修改起点
                if (element.master && element.maxCol > colStart) {
                    colStart = element.maxCol;
                    this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
                }
              }
              callback(element);
            }
          }
        }
      }
      // 向上
      if (rowEnd < rowStart) {
        for (let yIndex = rowStart; yIndex > rowEnd - 1; yIndex--) {
          const leftedRowData = this.tableData[yIndex];
          // 向右
          if (colEnd > colStart) {
            console.log('右上');

            // 对于单元格，需要选中最大x值
            if (colData.master) {
              colEnd = colData.maxCol;
            }
            for (let xIndex = colStart; xIndex < colEnd + 1; xIndex++) {
              const element = leftedRowData[xIndex];
              // 当选区包含合并块，则重置边界值
              if (element != colData) {
                // 方块在上，修改终点
                if (element.slave && element.parent.rowIndex < rowEnd) {
                    rowEnd  = element.parent.rowIndex;
                    this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在上，修改起点
                if (element.slave && element.parent.colIndex < colStart) {
                    colStart = element.parent.colIndex;
                    this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在下，修改终点
                if (element.master && element.maxCol > colEnd) {
                    colEnd = element.maxCol;
                    this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在下，修改起点
                if (element.master && element.maxRow > rowStart) {
                    rowStart = element.maxRow;
                    this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
                }
              }

              callback(element);
            }
          }
          // 向左
          if (colEnd <= colStart) {
            console.log('左上');
            for (let xIndex = colStart; xIndex > colEnd - 1; xIndex--) {
              const element = leftedRowData[xIndex];
              // 当选区包含合并块，则重置边界值
              if (element != colData) {
                // 方块在上，修改终点
                if (element.slave && element.parent.rowIndex < rowEnd) {
                    rowEnd  = element.parent.rowIndex;
                    this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在上，修改起点
                if (element.master && element.maxCol > colStart) {
                    colStart = element.maxCol;
                    this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在下，修改终点
                if (element.slave && element.parent.colIndex < colEnd) {
                    colEnd = element.parent.colIndex;
                    this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在下，修改起点
                if (element.master && element.maxRow > rowStart) {
                    rowStart = element.maxRow;
                    this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
                }
              }
              callback(element);
            }
          }
        }
      }
    },
    handleMerge() {
      this.mergeBrick(this.activeRowIndex.start, this.activeColIndex.start, this.activeRowIndex.len, this.activeColIndex.len);
    },
    updateActiveIndex(rowStart, colStart, rowEnd, colEnd) {
      const startY = Math.min(rowStart, rowEnd);
      const startX = Math.min(colStart, colEnd);
      const endY = Math.max(rowStart, rowEnd);
      const endX = Math.max(colStart, colEnd);
      this.activeRowIndex.start = startY;
      this.activeRowIndex.len = endY - startY + 1;
      this.activeColIndex.start = startX;
      this.activeColIndex.len = endX - startX + 1;
    }
  }
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.playground {
  border: 1px;
  td {
    height: 40px;
    min-width: 80px;
    // border: 1px solid grey;
  }
}
</style>
