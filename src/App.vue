<template>
  <div id="app">
    <Menu
      :mergeable="isMergeAble"
      :reverse-merge="reverseMerege"
      @drawBorders="handleDrawBorders('1px solid black')"
      @removeBorder="hanldeResetBorder('1px solid rgba(128, 128, 128, 0.21)')"

      @fontBold="handleFontBold"
      @fontItalic="handleFontItalic"
      @fontUnderscore="handleFontUnderscore"

      @cancelFontBold="handleCancelFontBold"
      @cancelFontItalic="handleCancelFontItalic"
      @cancelFontUnderscore="handleCancelFontUnderscore"

      @leftAlign="handleLeftAlign"
      @horizontalCenterAlign="handleHorizontalCenterAlign"
      @rightAlign="handleRightAlign"
      @topAlign="handleTopAlign"
      @bottomAlign="handleBottomAlign"
      @verticalCenterAlign="handleVerticalCenterAlign"
      @merge="handleMerge"
    />
    <table
      class="playground"
      border="1"
      cellspacing="0"
      @mousemove="handleDraging"
      @mouseup="handleDragOver"
    >
      <tr>
        <td />
        <td
          v-for="(colData, index) in tableRowHeaderData"
          :key="index"
          :style="colData.style"
          class="header"
          @mousedown="handleStartDrag"
        >
          <span class="header-content">{{ index + 1 }}</span>
          <div
            class="drag-area row"
            @mousedown="handleLockTarget(colData, 'row')"
          />
        </td>
      </tr>
      <tr
        v-for="(rowData, rowIndex) in tableData"
        :key="rowIndex"
      >
        <td
          class="header col"
          :style="tableColHeaderData[rowIndex].style"
          @mousedown="handleStartDrag"
        >
          <span class="header-content">{{ rowIndex + 1 }}</span>
          <div
            class="drag-area col"
            @mousedown="handleLockTarget(tableColHeaderData[rowIndex], 'col')"
            @mouseup="handleDragOver"
          />
        </td>
        <td
          v-for="(colData, colIndex) in rowData"
          :key="colIndex"
          :ref="`${rowIndex}-${colIndex}`"
          draggable="false"
          :contenteditable="colData.contenteditable"
          :rowspan="colData.rowspan"
          :colspan="colData.colspan"
          :style="colData.style"
          @blur="colData.contenteditable = false"
          @dblclick="handleEdit(colData, `${rowIndex}-${colIndex}`)"
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
  name: "App",
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
      startDrag: {
        x: 0,
        y: 0
      },
      dragType: "",
      tableRowHeaderData: [],
      tableColHeaderData: [],
      currentDraggableTarget: {},
      isDragging: false,
      reverseMerege: false,
      isMergeAble: false,
      targetPosition: 0, // 被拖拽对象的初始位置
      debouncedMouseMove: () => {}
    };
  },
  mounted() {
    const row = 6;
    const col = 10;
    this.tableData = this.generateEmptyTableData(row, col);
    const tableRowHeaderData = new Array(col).fill({
      style: {
        "min-width": "80px"
      }
    });
    const tableColHeaderData = new Array(row).fill({
      style: {
        height: "40px"
      }
    });
    this.tableRowHeaderData = this.$helper.deepClone(tableRowHeaderData);
    this.tableColHeaderData = this.$helper.deepClone(tableColHeaderData);
    this.debouncedMouseMove = this.$helper.throttle(this.handleMouseMove);
  },
  methods: {
    handleFontItalic() {
      this.changeSelectedAreaStyle({ "font-style": "italic" });
    },
    handleFontUnderscore() {
      this.changeSelectedAreaStyle({ "text-decoration": "underline" });
    },
    handleFontBold() {
      this.changeSelectedAreaStyle({ "font-weight": "bold" });
    },
    handleCancelFontBold() {
      this.changeSelectedAreaStyle({ "font-weight": "normal" });
    },
    handleCancelFontItalic() {
      this.changeSelectedAreaStyle({ "font-style": "normal" });
    },
    handleCancelFontUnderscore() {
      this.changeSelectedAreaStyle({ "text-decoration": "initial" });
    },
    handleLeftAlign() {
      this.changeSelectedAreaStyle({ "text-align": "left" });
    },
    handleHorizontalCenterAlign() {
      this.changeSelectedAreaStyle({ "text-align": "center" });
    },
    handleRightAlign() {
      this.changeSelectedAreaStyle({ "text-align": "right" });
    },
    handleTopAlign() {
      this.changeSelectedAreaStyle({ "vertical-align": "top" });
    },
    handleBottomAlign() {
      this.changeSelectedAreaStyle({ "vertical-align": "bottom" });
    },
    handleVerticalCenterAlign() {
      this.changeSelectedAreaStyle({ "vertical-align": "middle" });
    },
    hanldeResetBorder(initialborderValue) {
      this.changeSelectedAreaStyle({
        "border-left": initialborderValue,
        "border-right": initialborderValue,
        "border-top": initialborderValue,
        "border-bottom": initialborderValue
      });
    },
    changeSelectedAreaStyle(styleObj) {
      this.mapArea(
        {},
        this.activeRowIndex.start,
        this.activeColIndex.start,
        this.activeRowIndex.start + this.activeRowIndex.len,
        this.activeColIndex.start + this.activeColIndex.len,
        element => {
          for (const key in styleObj) {
            if (Object.hasOwnProperty.call(styleObj, key)) {
              const value = styleObj[key];
              element.style[key] = value;
            }
          }
        }
      );
    },
    handleLockTarget(colData, dragType) {
      this.currentDraggableTarget = colData;
      this.dragType = dragType;
    },
    handleStartDrag(e) {
      this.isDragging = true;
      if (this.dragType === "row") {
        this.startDrag.x = e.clientX;
        this.targetPosition = this.currentDraggableTarget.style["min-width"];
      } else {
        this.startDrag.y = e.clientY;
        this.targetPosition = this.currentDraggableTarget.style["height"];
      }
    },
    handleDraging(e) {
      if (!this.isDragging) {
        return;
      }
      if (this.dragType === "row") {
        const distance = e.clientX - this.startDrag.x;
        this.currentDraggableTarget.style["min-width"] =
          this.normalizeWidth(this.targetPosition) + distance + "px";
      } else {
        const distance = e.clientY - this.startDrag.y;
        this.currentDraggableTarget.style["height"] =
          this.normalizeWidth(this.targetPosition) + distance + "px";
      }
    },
    handleDrawBorders(borderValue) {
      console.log("handleDrawBorders");

      // left and right
      for (
        let i = this.activeRowIndex.start;
        i < this.activeRowIndex.start + this.activeRowIndex.len;
        i++
      ) {
        this.tableData[i][this.activeColIndex.start].style[
          "border-left"
        ] = borderValue;
        this.tableData[i][
          this.activeColIndex.start + this.activeColIndex.len - 1
        ].style["border-right"] = borderValue;
      }
      // top and bottom
      for (
        let i = this.activeColIndex.start;
        i < this.activeColIndex.start + this.activeColIndex.len;
        i++
      ) {
        this.tableData[this.activeRowIndex.start][i].style[
          "border-top"
        ] = borderValue;
        this.tableData[this.activeRowIndex.start + this.activeRowIndex.len - 1][
          i
        ].style["border-bottom"] = borderValue;
      }
    },
    normalizeWidth(width) {
      if (typeof width === "string" && width.endsWith("px")) {
        return Number(width.slice(0, -2));
      }
      return Number(width);
    },
    handleDragOver(colData, e, isRow = true) {
      this.isDragging = false;
      this.currentDraggableTarget = {};
    },
    handleEdit(colData, refIndex) {
      colData.contenteditable = true;
      // vue是异步刷新队列，dom操作需要在异步回调中执行
      this.$nextTick(() => {
        this.$refs[refIndex][0].focus();
      });
    },
    generateEmptyTableData(row, col) {
      const colData = new Array(col).fill({
        text: "",
        rowspan: 1,
        parent: {},
        master: false,
        seleted: false,
        colspan: 1,
        contenteditable: false,
        style: {
          width: 0,
          display: "table-cell",
          background: "",
          border: "initial",
          "border-top": "1px solid #80808036",
          "border-bottom": "1px solid #80808036",
          "border-left": "1px solid #80808036",
          "border-right": "1px solid #80808036",
          "font-weight": "normal",
          "font-style": "normal",
          "text-decoration": "initial",
          "text-align": "center",
          "vertical-align": "middle"
        }
      });
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
          element.style.display = "table-cell";
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
      // 处理当前行
      const currentRowData = this.tableData[x];
      for (let yIndex = y + 1; yIndex < y + yLen; yIndex++) {
        const element = currentRowData[yIndex];

        if (reverse) {
          if (element.slave) {
            element.slave = false;
            element.style.display = "table-cell";
          }
          if (element.master) {
            element.rowspan = 1;
            element.colspan = 1;
            element.master = false;
          }
          this.reverseMerege = false;
          continue;
        }
        element.style.display = "none";
        element.slave = true;
        element.parent.rowIndex = x;
        element.parent.colIndex = y;
        if (xLen <= 1) {
          this.reverseMerege = true;
        }
      }
      // 当行数大于1，处理余下行
      if (xLen > 1) {
        this.mapArea({}, x + 1, y, x + xLen - 1, y + yLen - 1, element => {
          if (reverse) {
            if (element.slave) {
              element.slave = false;
              element.style.display = "table-cell";
            }
            if (element.master) {
              element.rowspan = 1;
              element.colspan = 1;
              element.master = false;
            }
            this.reverseMerege = false;
            return;
          }
          element.style.display = "none";
          element.slave = true;
          element.parent.rowIndex = x;
          element.parent.colIndex = y;
          this.reverseMerege = true;
        });
      }
    },
    handleMouseDown(colData, rowIndex, colIndex) {
      this.resetStyle("background", "");

      this.isChoosingMode = true;
      this.start.rowIndex = rowIndex;
      this.start.colIndex = colIndex;
    },
    handleMouseMove(colData, rowIndex, colIndex) {
      if (this.isChoosingMode) {
        this.resetStyle("background", "");
        this.highlight(
          colData,
          this.start.rowIndex,
          this.start.colIndex,
          rowIndex,
          colIndex
        );
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

      console.log('highlight');

      if (colStart != colEnd || rowStart != rowEnd) {
        this.isMergeAble = true;
        // 默认情况下是合并
        this.reverseMerege = false;
      }
      this.mapArea(colData, rowStart, colStart, rowEnd, colEnd, element => {
        element.style.background = "#03a9f46e";
      });
    },
    expandLeft(
      element, rowStart, colStart, rowEnd, colEnd, callback
    ) {
      console.log('expandLeft');
      // 方块在上，修改起点行
      if (element.slave && element.parent.rowIndex < rowEnd) {
        this.reverseMerege = true;
        rowEnd = element.parent.rowIndex;
        this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
      }

      // 方块在下，修改终点行
      if (element.master && element.maxRow > rowStart) {
        this.reverseMerege = true;
        rowStart = element.maxRow;
        this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
      }
    },
    expandRight(
      element, rowStart, colStart, rowEnd, colEnd, callback
    ) {
      console.log('expandRight');
      // 当选区包含合并块，则重置边界值
      // 方块在下，修改终点行
      if (element.master && element.maxRow > rowEnd) {
        this.reverseMerege = true;
        rowEnd = element.maxRow;
        this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
      }
      // 方块在上，修改起点行
      if (element.slave && element.parent.rowIndex < rowStart) {
        this.reverseMerege = true;
        rowStart = element.parent.rowIndex;
        this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
      }
    },
    expandTop(
      element, rowStart, colStart, rowEnd, colEnd, callback
    ) {
      console.log('expandTop');
      // 方块在左，修改起点列
      if (element.slave && element.parent.colIndex < colEnd) {
        this.reverseMerege = true;
        colEnd = element.parent.colIndex;
        this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
      }

      // 方块在右，修改终点列
      if (element.master && element.maxCol > colStart) {
        this.reverseMerege = true;
        colStart = element.maxCol;
        this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
      }
    },
    expandBottom(
      element, rowStart, colStart, rowEnd, colEnd, callback
    ) {
      console.log('expandBottom');

      // 方块在左，修改起点列
      if (element.slave && element.parent.colIndex < colStart) {
        this.reverseMerege = true;
        colStart = element.parent.colIndex;
        this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
      }

      // 方块在右，修改终点列
      if (element.master && element.maxCol > colEnd) {
        this.reverseMerege = true;
        colEnd = element.maxCol;
        this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
      }
    },
    expandSelf(
      element, rowStart, colStart, rowEnd, colEnd, callback
    ) {
      console.log('expandSelf');
      if (element.master) {
        // 扩展列
        if (element.maxCol > colEnd) {
          this.reverseMerege = true;
          colEnd = element.maxCol;
          this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
        }
        // 扩展行
        if (element.maxRow > rowEnd) {
          this.reverseMerege = true;
          rowEnd = element.maxRow;
          this.mapArea(element, rowStart, colStart, rowEnd, colEnd, callback);
        }
      }
    },
    // 创建选区
    mapArea(colData, rowStart, colStart, rowEnd, colEnd, callback) {
      // 在merge状态时，禁止更新激活的下标
      if (this.isChoosingMode) {
        this.updateActiveIndex(rowStart, colStart, rowEnd, colEnd);
      }
      const rowOffset = rowEnd >= rowStart ? 1 : -1;
      const colOffset = colEnd > colStart ? 1 : -1;


      const expandDirection = [
        rowEnd > rowStart ? 'Bottom' : '',
        rowEnd < rowStart ? 'Top' : '',
        colEnd > colStart ? 'Right' : '',
        colEnd < colStart ? 'Left' : '',
        (rowEnd === rowStart && colEnd === colEnd) ? 'Self' : ''
      ];

      const forRowCondition = yIndex => {
        if (rowEnd >= rowStart) {
          return yIndex < rowEnd + rowOffset;
        }
        return yIndex > rowEnd + rowOffset;
      };

      const forColCondition = xIndex => {
        if (colEnd > colStart) {
          return xIndex < colEnd + colOffset;
        }
        return xIndex > colEnd + colOffset;
      };

      for (let yIndex = rowStart; forRowCondition(yIndex);) {
        const leftedRowData = this.tableData[yIndex];
        for (let xIndex = colStart; forColCondition(xIndex);) {
          const element = leftedRowData[xIndex];
          expandDirection.forEach(direction => {
            direction && this[`expand${direction}`](element, rowStart, colStart, rowEnd, colEnd, callback);
          });
          callback(element);
          colEnd > colStart ? xIndex++ : xIndex--;
        }
        rowEnd >= rowStart ? yIndex++ : yIndex--;
      }
    },
    handleMerge() {
      this.mergeBrick(
        this.activeRowIndex.start,
        this.activeColIndex.start,
        this.activeRowIndex.len,
        this.activeColIndex.len
      );
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
  margin-top: 120px;
  overflow-x: scroll;
  td {
    height: 40px;
    min-width: 100px;
  }
  .content {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: 0;
  }
  .header {
    background: grey;
    color: white;
    position: relative;
    // pointer-events: none;
    -webkit-user-select: none;
    user-select: none;
    -moz-user-select: none;
    &.col {
      min-width: 80px;
    }
    .header-content {
      width: 80%;
      display: inline-block;
      pointer-events: none;
    }
  }
}
.drag-area {
  position: absolute;
  right: 0;
  bottom: 0;
  &.row {
    cursor: e-resize;
    width: 3px;
    top: 0;
  }
  &.col {
    height: 3px;
    left: 0;
    cursor: s-resize;
  }
}
</style>
