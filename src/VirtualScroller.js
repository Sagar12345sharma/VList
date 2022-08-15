import React, { useEffect, useRef, useState } from "react";
import RowTemplate from "./RowTemplate";

function VirtualScroller({ settings, get, row, InitialState }) {
  const [state, setState] = useState({ ...InitialState });
  const [selectedItems, setSelecteditems] = useState([]);
  const viewportElement = useRef(null);

  useEffect(() => {
    viewportElement.current.scrollTop = state.initialPosition;
    if (!state.initialPosition) {
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

    const index =
      minIndex + Math.floor((scrollTop - toleranceHeight) / itemHeight);
    const data = get(index, bufferedItems);
    const topPaddingHeight = Math.max((index - minIndex) * itemHeight, 0);
    const bottomPaddingHeight = Math.max(
      totalHeight - topPaddingHeight - data.length * itemHeight,
      0
    );

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
      onScroll={(e) => {
        runScroller(e);
      }}
    >
      <div
        style={{ height: `${state.topPaddingHeight}px`, background: "red" }}
      ></div>

      {state.data.map((item) => {
        return (
          <RowTemplate
            item={item}
            setSelecteditems={setSelecteditems}
            selectedItems={selectedItems}
          ></RowTemplate>
        );
      })}
      <div
        style={{ height: `${state.bottomPaddingHeight}px`, background: "blue" }}
      ></div>
    </div>
  );
}

export default VirtualScroller;
