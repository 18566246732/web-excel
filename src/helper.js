export default {
    deepClone(value) {
      return JSON.parse(JSON.stringify(value));
    },
    /**
   * 截流函数
   *
   * @param {Function} fn
   * @param {Number} interval
   */
  throttle(fn, interval = 50) {
    let canRun = true;
    return function throttledFn() {
      if (!canRun) return;
      canRun = false;
      setTimeout(() => {
        fn.apply(this, arguments);
        canRun = true;
      }, interval);
    };
  },
};