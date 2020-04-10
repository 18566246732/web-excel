<template>
  <div id="app">
    <Menu
      :mergeable="isMergeAble"
      :reverse-merge="reverseMerege"
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
      reverseMerege: false,
      isMergeAble: false,
      debouncedMouseMove: () => {}
    };
  },
  mounted() {
    this.tableData = this.generateEmptyTableData(6, 10);
    this.debouncedMouseMove = this.$helper.throttle(this.handleMouseMove);
  },
  methods: {
    generateEmptyTableData(row, col) {
      const colData = new Array(col).fill({text: '', rowspan: 1, parent: {}, master: false, seleted: false, colspan: 1, style: {display: 'table-cell', background: ''}});
      return this.$helper.deepClone(new Array(row).fill(colData));
    },
    mergeBrick(x, y, xLen, yLen) {
      const element = this.tableData[x][y];
      if (this.reverseMerege) {
        if (element.master) {
          element.rowspan = 1;
          element.colspan = 1;
          element.master = false;
        }
        if (element.slave) {
          element.slave = false;
          element.style.display = 'table-cell';
        }
      } else {
        element.rowspan = xLen;
        element.colspan = yLen;
        element.maxRow = x + xLen - 1;
        element.maxCol = y + yLen - 1;
        element.master = true;
        // this.reverseMerege = true;
      }
      this.processRest(element, x, y, xLen, yLen, this.reverseMerege);
    },
    processRest(colData, x, y, xLen, yLen, reverse = false) {
      console.log(x, y, xLen, yLen, 'x, y, xLen, yLen');

      // 处理当前行
      const currentRowData = this.tableData[x];
      for (let yIndex = y + 1; yIndex < y + yLen; yIndex++) {
        const element = currentRowData[yIndex];

        if (reverse) {
          if (element.slave) {
            element.slave = false;
            element.style.display = 'table-cell';
          }
          if (element.master) {
            element.rowspan = 1;
            element.colspan = 1;
            element.master = false;
          }
          this.reverseMerege = false;
          continue;
        }
        element.style.display = 'none';
        element.slave = true;
        element.parent.rowIndex = x;
        element.parent.colIndex = y;
        if (xLen <= 1) {
          this.reverseMerege = true;
        }
      }
      // 当行数大于1，处理余下行
      if (xLen > 1) {
        this.mapArea({}, x + 1, y, x + xLen - 1, y + yLen - 1, (element) => {
          if (reverse) {
            if (element.slave) {
              element.slave = false;
              element.style.display = 'table-cell';
            }
            if (element.master) {
              element.rowspan = 1;
              element.colspan = 1;
              element.master = false;
            }
            this.reverseMerege = false;
            return;
          }
          element.style.display = 'none';
          element.slave = true;
          element.parent.rowIndex = x;
          element.parent.colIndex = y;
          this.reverseMerege = true;
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
      if (colStart != colEnd || rowStart != rowEnd) {
        this.isMergeAble = true;
        // 默认情况下是合并
        this.reverseMerege = false;
      }
      this.mapArea(colData, rowStart, colStart, rowEnd, colEnd, (element) => {
        element.style.background = 'blue';
      });
    },
    expandRightBottom() {

    },
    expandRightTop() {

    },
    expandLeftBottom() {

    },
    expandLeftTop() {

    },
    // 创建选区
    mapArea(colData, rowStart, colStart, rowEnd, colEnd, callback) {
      // 在merge状态时，禁止更新激活的下标
      if (this.isChoosingMode) {
        this.updateActiveIndex(rowStart, colStart, rowEnd, colEnd);
      }
      // 向下
      if (rowEnd >= rowStart) {
        // 对于合并单元格，需要选中最大y值
        if (colData.master) {
          rowEnd = colData.maxRow;
          this.reverseMerege = true;
          this.updateActiveIndex(rowStart, colStart, rowEnd, colEnd);
          this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
        }
        for (let yIndex = rowStart; yIndex < rowEnd + 1; yIndex++) {
          const leftedRowData = this.tableData[yIndex];
          // 向右
          if (colEnd > colStart) {
            console.log('右下');
            if (colData.master) {
              colEnd = colData.maxCol;
              this.reverseMerege = true;
              this.updateActiveIndex(rowStart, colStart, rowEnd, colEnd);
              this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
            }
            for (let xIndex = colStart; xIndex < colEnd + 1; xIndex++) {
              const element = leftedRowData[xIndex];
              // 当选区包含合并块，则重置边界值
              if (element != colData) {
                // 方块在上，修改终点
                if (element.master && element.maxCol > colEnd) {
                  this.reverseMerege = true;
                    colEnd  = element.maxCol;
                    this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在上，修改起点
                if (element.slave && element.parent.rowIndex < rowStart) {
                  this.reverseMerege = true;
                    rowStart = element.parent.rowIndex;
                    this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在下，修改终点
                if (element.master && element.maxRow > rowEnd) {
                  this.reverseMerege = true;
                    rowEnd = element.maxRow;
                    this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在下，修改起点
                if (element.slave && element.parent.colIndex < colStart) {
                  this.reverseMerege = true;
                    colStart = element.parent.colIndex;
                    this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
                }
              }
              callback(element);
            }
          }
          // 向左
          if (colEnd <= colStart) {
            console.log('左下');
            if (colData.master) {
              colEnd = colData.maxCol;
              this.updateActiveIndex(rowStart, colStart, rowEnd, colEnd);
              this.reverseMerege = true;
              this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
            }
            console.log(colData, 'colData');


            for (let xIndex = colStart; xIndex > colEnd - 1; xIndex--) {
              const element = leftedRowData[xIndex];
              // 当选区包含合并块，则重置边界值
              if (element != colData) {
                // 方块在上，修改终点
                if (element.slave && element.parent.colIndex < colEnd) {
                  this.reverseMerege = true;
                    colEnd  = element.parent.colIndex;
                    this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在上，修改起点
                if (element.slave && element.parent.rowIndex < rowStart) {
                  this.reverseMerege = true;
                    rowStart = element.parent.rowIndex;
                    this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在下，修改终点
                if (element.master && element.maxRow > rowEnd) {
                  this.reverseMerege = true;
                    rowEnd  = element.maxRow;
                    this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在下，修改起点
                if (element.master && element.maxCol > colStart) {
                  this.reverseMerege = true;
                    colStart = element.maxCol;
                    this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
                }
              }
              callback(element);
            }
          }
          // 垂直向下
          // if (colEnd === colStart) {
          //   console.log('垂直向下');
          //   if (colData.master) {
          //     colEnd = colData.maxCol;
          //     this.updateActiveIndex(rowStart, colStart, rowEnd, colEnd);
          //     this.reverseMerege = true;
          //     this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
          //   }
          //   for (let xIndex = colStart; xIndex > colEnd - 1; xIndex--) {
          //     const element = leftedRowData[xIndex];
          //     callback(element);
          //   }
          // }
        }
      }
      // 向上
      if (rowEnd < rowStart) {
        if (colData.master) {
          colEnd = colData.maxCol;
          this.updateActiveIndex(rowStart, colStart, rowEnd, colEnd);
          this.reverseMerege = true;
          this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
        }
        for (let yIndex = rowStart; yIndex > rowEnd - 1; yIndex--) {
          const leftedRowData = this.tableData[yIndex];
          // 向右
          if (colEnd > colStart) {
            if (colData.master) {
              rowStart = colData.maxRow;
              this.updateActiveIndex(rowStart, colStart, rowEnd, colEnd);
              this.reverseMerege = true;
              this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
            }
            for (let xIndex = colStart; xIndex < colEnd + 1; xIndex++) {
              const element = leftedRowData[xIndex];
              // 当选区包含合并块，则重置边界值
              if (element != colData) {
                // 方块在上，修改终点
                if (element.slave && element.parent.rowIndex < rowEnd) {
                  this.reverseMerege = true;
                    rowEnd  = element.parent.rowIndex;
                    this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在上，修改起点
                if (element.slave && element.parent.colIndex < colStart) {
                  this.reverseMerege = true;
                    colStart = element.parent.colIndex;
                    this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在下，修改终点
                if (element.master && element.maxCol > colEnd) {
                  this.reverseMerege = true;
                    colEnd = element.maxCol;
                    this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在下，修改起点
                if (element.master && element.maxRow > rowStart) {
                  this.reverseMerege = true;
                    rowStart = element.maxRow;
                    this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
                }
              }

              callback(element);
            }
          }
          // 向左
          if (colEnd <= colStart) {
            console.log('左上');
            if (colData.master) {
              colEnd = colData.maxCol;
              this.updateActiveIndex(rowStart, colStart, rowEnd, colEnd);
              this.reverseMerege = true;
              this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
            }
            for (let xIndex = colStart; xIndex > colEnd - 1; xIndex--) {
              const element = leftedRowData[xIndex];
              // 当选区包含合并块，则重置边界值
              if (element != colData) {
                // 方块在上，修改终点
                if (element.slave && element.parent.rowIndex < rowEnd) {
                  this.reverseMerege = true;
                    rowEnd  = element.parent.rowIndex;
                    this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在上，修改起点
                if (element.master && element.maxCol > colStart) {
                  this.reverseMerege = true;
                    colStart = element.maxCol;
                    this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在下，修改终点
                if (element.slave && element.parent.colIndex < colEnd) {
                  this.reverseMerege = true;
                    colEnd = element.parent.colIndex;
                    this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
                }

                // 方块在下，修改起点
                if (element.master && element.maxRow > rowStart) {
                  this.reverseMerege = true;
                    rowStart = element.maxRow;
                    this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
                }
              }
              callback(element);
            }
          }

          // 垂直向上
          // if (colEnd === colStart) {
          //   if (colData.master) {
          //     colEnd = colData.maxCol;
          //     this.updateActiveIndex(rowStart, colStart, rowEnd, colEnd);
          //     this.reverseMerege = true;
          //     this.mapArea({}, rowStart, colStart, rowEnd, colEnd, callback);
          //   }
          //   console.log('垂直向上');
          //   for (let xIndex = colStart; xIndex > colEnd - 1; xIndex--) {
          //     const element = leftedRowData[xIndex];
          //     // 当选区包含合并块，则重置边界值
          //     callback(element);
          //   }
          // }
        }
      }
    },
    handleMerge() {
      this.mergeBrick(this.activeRowIndex.start, this.activeColIndex.start, this.activeRowIndex.len, this.activeColIndex.len);
    },
    updateActiveIndex(rowStart, colStart, rowEnd, colEnd) {
      console.log(rowStart, colStart, rowEnd, colEnd, 'rowStart, colStart, rowEnd, colEnd');

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
