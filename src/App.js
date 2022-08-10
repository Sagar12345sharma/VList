import { useEffect, useState } from "react";
import "./App.css";
import VirtualScroller from "./VirtualScroller";

function App() {
  const setInitialState = ({
    minIndex,
    maxIndex,
    startIndex,
    itemHeight,
    amount,
    tolerance,
  }) => {
    // 1) height of the visible part of the viewport (px)
    const viewportHeight = amount * itemHeight;
    // 2) total height of rendered and virtualized items (px)
    const totalHeight = (maxIndex - minIndex + 1) * itemHeight;
    // 3) single viewport outlet height, filled with rendered but invisible rows (px)
    const toleranceHeight = tolerance * itemHeight;
    // 4) all rendered rows height, visible part + invisible outlets (px)
    const bufferHeight = viewportHeight + 2 * toleranceHeight;
    // 5) number of items to be rendered, buffered dataset length (pcs)
    const bufferedItems = amount + 2 * tolerance;
    // 6) how many items will be virtualized above (pcs)
    const itemsAbove = startIndex - tolerance - minIndex;
    // 7) initial height of the top padding element (px)
    const topPaddingHeight = itemsAbove * itemHeight;
    // 8) initial height of the bottom padding element (px)
    const bottomPaddingHeight = totalHeight - topPaddingHeight;
    // 9) initial scroll position (px)
    const initialPosition = topPaddingHeight + toleranceHeight;
    // initial state object
    return {
      SETTINGS,
      viewportHeight,
      totalHeight,
      toleranceHeight,
      bufferHeight,
      bufferedItems,
      topPaddingHeight,
      bottomPaddingHeight,
      initialPosition,
      data: [],
    };
  };
  const SETTINGS = {
    minIndex: 1,
    maxIndex: 16,
    startIndex: 1,
    itemHeight: 120,
    amount: 5,
    tolerance: 2,
  };
  const [state, setState] = useState(setInitialState(SETTINGS));

  const getData = (offset, limit) => {
    const data = [];
    const start = Math.max(SETTINGS.minIndex, offset);
    const end = Math.min(offset + limit - 1, SETTINGS.maxIndex);
    if (start <= end) {
      for (let i = start; i <= end; i++) {
        data.push({ index: i, text: `item ${i}` });
      }
    }
    return data;
  };

  const rowTemplate = (item) => {
    return (
      <div className="item" key={item.index} style={{ height: "120px" }}>
        {item.text}
      </div>
    );
  };

  useEffect(() => {
    let initialState = setInitialState(SETTINGS);
    setState(initialState);
  }, []);

  return (
    <div className="App">
      <VirtualScroller
        settings={SETTINGS}
        get={getData}
        row={rowTemplate}
        InitialState={state}
      />
    </div>
  );
}

export default App;
