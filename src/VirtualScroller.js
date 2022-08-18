import React, { useEffect, useRef, useState, memo } from "react";
import RowTemplate from "./RowTemplate";

function VirtualScroller({
  settings,
  get,
  row,
  InitialState,
  mapContainsPageNumberAsKeyAndStartIndexEndIndexAsValue,
  mapContainsLastIndexAsKeyPageNumberAsValue,
  setPaginationStorage,
  paginationStorage,
  setNumberOfSteps,
  numberOfSteps,
}) {
  const [state, setState] = useState({ ...InitialState });
  const [selectedItems, setSelecteditems] = useState([]);
  const viewportElement = useRef(null);
  const [scrollerHeight, setScrollerHeight] = useState(0);
  const [paginationCursor, setPaginationCursor] = useState(1);
  const [bottomHeight, setBottomHeight] = useState(0);
  const [topHeight, setTopHeight] = useState(0);
  const [topPaddingHeight_, setTopPaddingHeight_] = useState(0);

  const mapIter = mapContainsLastIndexAsKeyPageNumberAsValue.keys();
  const mapValues = [...mapIter];

  useEffect(() => {
    viewportElement.current.scrollTop = state.initialPosition;
    if (!state.initialPosition) {
      runScroller({ target: { scrollTop: 0 } });
    }
  }, []);

  const runScroller = (e) => {
    const { scrollTop } = e.target;
    if (state.length === 0) {
      return;
    }

    const {
      totalHeight,
      toleranceHeight,
      bufferedItems,
      SETTINGS: { itemHeight, minIndex },
    } = state;

    setTimeout(() => {
      const index =
        minIndex + Math.floor((scrollTop - toleranceHeight) / itemHeight);

      let topPaddingHeight = Math.max((index - minIndex) * itemHeight, 0);

      const data = get(index, bufferedItems);

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

      // pagination Work
      checkTheScrollerDirection(e, topPaddingHeight);
    }, 1000);
  };

  const checkTheScrollerDirection = (e, topPaddingHeight) => {
    if (e.timeStamp !== undefined) {
      let { scrollTop } = e.target;
      if (scrollTop > scrollerHeight) {
        helperFunctionForPaginationScrollLastElement("down");
        setTopHeight(topPaddingHeight);
        setBottomHeight(0);
      } else {
        helperFunctionForPaginationScrollLastElement("up");
        setBottomHeight(topHeight - topPaddingHeight);
      }
      setScrollerHeight(scrollTop);
    }
  };

  const helperFunctionForPaginationScrollLastElement = (mode) => {
    setTimeout(() => {
      // settimeout isiliye lagaaya h kyuki dom fast update hone ki vajah se last viewport item previous vaala mil rha hn

      let viewPortDocuments = document.getElementsByClassName("li_item");

      let lastViewPortDocument =
        viewPortDocuments[viewPortDocuments.length - 1].getAttribute("class");

      const arrayOfClasses = lastViewPortDocument.split(" ");

      const lastIndexOfListItem = +arrayOfClasses[arrayOfClasses.length - 1];

      if (paginationStorage.has(lastIndexOfListItem)) {
        const obj = paginationStorage.get(lastIndexOfListItem);
        setPaginationCursor(obj.pageNumber);
        return;
      }

      const nearestGreatestValueIndex =
        getTheNearestGreaterValue(lastIndexOfListItem);

      const paginationStorageNewMap = paginationStorage;

      if (mode === "up") {
        if (nearestGreatestValueIndex !== -1) {
          const pageNumber = mapContainsLastIndexAsKeyPageNumberAsValue.get(
            mapValues[nearestGreatestValueIndex]
          );

          if (pageNumber > 1) {
            pageNumber = pageNumber - 1;
          }

          setPaginationCursor(pageNumber);

          paginationStorageNewMap.set(lastIndexOfListItem, {
            pageNumber: pageNumber,
            paginationIndexes:
              mapContainsPageNumberAsKeyAndStartIndexEndIndexAsValue.get(
                pageNumber
              ),
          });
        }
      } else {
        if (nearestGreatestValueIndex !== -1) {
          const pageNumber = mapContainsLastIndexAsKeyPageNumberAsValue.get(
            mapValues[nearestGreatestValueIndex]
          );
          setPaginationCursor(pageNumber);

          paginationStorageNewMap.set(lastIndexOfListItem, {
            pageNumber: pageNumber,
            paginationIndexes:
              mapContainsPageNumberAsKeyAndStartIndexEndIndexAsValue.get(
                pageNumber
              ),
          });
        }
      }

      setPaginationStorage(paginationStorageNewMap);
    }, 0);
  };

  const getTheNearestGreaterValue = (lastIndexValue) => {
    for (let i = 0; i < mapValues.length; i++) {
      const mapVal = mapValues[i];
      if (mapVal >= lastIndexValue) {
        return i;
      }
    }
    return -1;
  };

  const paginationNextPreviousBtnHandler = (action) => {
    setSelecteditems([]); // set the selected item to its initial state...

    // let toScrollHeight = state.totalHeight / state.SETTINGS.amount;

    let element = document.querySelector(".viewport");

    if (action === "up") {
      element.scrollBy(0, -state.viewportHeight);
    } else {
      element.scrollBy(0, state.viewportHeight);
    }
  };

  // debouncing
  function debounce(func, timeout = 100) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  }

  const processChange = debounce((e) => runScroller(e));

  return (
    <>
      <div
        className="viewport"
        style={{
          height: `${state.viewportHeight}px`,
          overflowY: "auto",
        }}
        ref={viewportElement}
        onScroll={(e) => {
          processChange(e);
        }}
      >
        <div
          style={{
            height: `${state.topPaddingHeight}px`,
            background: "white",
          }}
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
          style={{
            height: `${bottomHeight}px`,
            background: "white",
          }}
        ></div>
      </div>
      <div className="pagination">
        <div
          className="previousBtn"
          onClick={() => {
            paginationNextPreviousBtnHandler("up");
          }}
        >
          Previous
        </div>
        <div className="paginationCursor">{paginationCursor}</div>
        <div
          className="nextBtn"
          onClick={() => {
            paginationNextPreviousBtnHandler("down");
          }}
        >
          Next
        </div>
      </div>
    </>
  );
}

export default memo(VirtualScroller);
