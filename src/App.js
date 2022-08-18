import { useEffect, useState, memo, useCallback } from "react";
import "./App.css";
import VirtualScroller from "./VirtualScroller";

function App() {
  const [
    mapContainsPageNumberAsKeyAndStartIndexEndIndexAsValue,
    setMapContainsPageNumberAsKeyAndStartIndexEndIndexAsValue,
  ] = useState(new Map()); // this map contains the page number as key and the start index and end index as value like:-
  /**
   *
   * [
        {
            "key": 1,
            "value": "1-17"
        }
    ]
   */

  const [
    mapContainsLastIndexAsKeyPageNumberAsValue,
    setMapContainsLastIndexAsKeyPageNumberAsValue,
  ] = useState(new Map()); // this map contains the last index as key and page number as value... like
  /**
 * [
        {
            "key": 17,
            "value": 1
        }
    ]
 */

  const [paginationStorage, setPaginationStorage] = useState(new Map());

  const getRequestCallOptimizationMap = new Map();

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
    maxIndex: 100,
    startIndex: 1,
    itemHeight: 90,
    amount: 10,
    tolerance: 7,
  };

  const [state, setState] = useState(setInitialState(SETTINGS));

  // optimized getData
  const memoIzedGetDataFuntion = useCallback((offset, limit) => {
    return getData(offset, limit);
  }, []);
  const getData = (offset, limit) => {
    const data = [];
    const start = Math.max(SETTINGS.minIndex, offset);
    const end = Math.min(offset + limit - 1, SETTINGS.maxIndex);

    if (getRequestCallOptimizationMap.has(`${start}${end}`)) {
      return getRequestCallOptimizationMap.get(`${start}${end}`);
    }

    if (start <= end) {
      for (let i = start; i <= end; i++) {
        data.push({ index: i, text: `item ${i}`, height: SETTINGS.itemHeight });
      }
    }
    let startEndString = `${start}${end}`;
    getRequestCallOptimizationMap.set(startEndString, data);
    return data;
  };

  useEffect(() => {
    let initialState = setInitialState(SETTINGS);
    setState(initialState);
    paginationHandler();
  }, []);

  const paginationHandler = () => {
    const minIndex = SETTINGS.minIndex;
    const maxIndex = SETTINGS.maxIndex;
    let pagination = 1;
    const mapContainsPageNumberAsKeyAndStartIndexEndIndexAsValue = new Map();

    const mapContainsLastIndexAsKeyPageNumberAsValue = new Map();

    let firstIndex = minIndex;
    let lastIndex = pagination * SETTINGS.amount + SETTINGS.tolerance;

    while (lastIndex < maxIndex) {
      mapContainsPageNumberAsKeyAndStartIndexEndIndexAsValue.set(
        pagination,
        `${firstIndex}-${lastIndex}`
      );

      mapContainsLastIndexAsKeyPageNumberAsValue.set(lastIndex, pagination);

      firstIndex += SETTINGS.amount;
      lastIndex += SETTINGS.amount;
      pagination += 1;
      setMapContainsPageNumberAsKeyAndStartIndexEndIndexAsValue(
        mapContainsPageNumberAsKeyAndStartIndexEndIndexAsValue
      );

      setMapContainsLastIndexAsKeyPageNumberAsValue(
        mapContainsLastIndexAsKeyPageNumberAsValue
      );
    }
  };

  return (
    <div className="App">
      <VirtualScroller
        settings={SETTINGS}
        get={memoIzedGetDataFuntion}
        InitialState={state}
        mapContainsPageNumberAsKeyAndStartIndexEndIndexAsValue={
          mapContainsPageNumberAsKeyAndStartIndexEndIndexAsValue
        }
        mapContainsLastIndexAsKeyPageNumberAsValue={
          mapContainsLastIndexAsKeyPageNumberAsValue
        }
        setPaginationStorage={setPaginationStorage}
        paginationStorage={paginationStorage}
      />
    </div>
  );
}

export default memo(App);
