import React, { useEffect, useRef, useState } from "react";

function VirtualScroller({ settings, get, row, InitialState }) {
  const [state, setState] = useState({ ...InitialState });
  const viewportElement = useRef(null);

  useEffect(() => {
    viewportElement.current.scrollTop = state.initialPosition;
    if (!state.initialPosition) {
      console.log("from useEffect");
      runScroller({ target: { scrollTop: 0 } });
    }
  }, []);

  const runScroller = ({ target: { scrollTop } }) => {
    if (state.length === 0) {
      return;
    }
    const {
      totalHeight,
      toleranceHeight,
      bufferedItems,
      SETTINGS: { itemHeight, minIndex },
    } = state;

    console.log(
      "previous",
      scrollTop,
      state.data,
      state.topPaddingHeight,
      state.bottomPaddingHeight,
      bufferedItems
    );

    const index =
      minIndex + Math.floor((scrollTop - toleranceHeight) / itemHeight);
    const data = get(index, bufferedItems);
    const topPaddingHeight = Math.max((index - minIndex) * itemHeight, 0);
    const bottomPaddingHeight = Math.max(
      totalHeight - topPaddingHeight - data.length * itemHeight,
      0
    );

    console.log("after", data, topPaddingHeight, bottomPaddingHeight);

    setState({
      ...state,
      data,
      topPaddingHeight,
      bottomPaddingHeight,
    });
  };

  return (
    <div
      className="viewport"
      style={{ height: `${state.viewportHeight}px`, overflowY: "auto" }}
      ref={viewportElement}
      onScroll={runScroller}
    >
      <div
        style={{ height: `${state.topPaddingHeight}px`, background: "red" }}
      ></div>
      {state.data.map((item) => {
        return row(item);
      })}
      <div
        style={{ height: `${state.bottomPaddingHeight}px`, background: "blue" }}
      ></div>
    </div>
  );
}

export default VirtualScroller;
