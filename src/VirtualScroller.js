import React, { useEffect, useRef, useState } from "react";
import RowTemplate from "./RowTemplate";

function VirtualScroller({ settings, get, row, InitialState }) {
  const [state, setState] = useState({ ...InitialState });
  const [selectedItems, setSelecteditems] = useState([]);
  const viewportElement = useRef(null);
  const [scrollerHeight, setScrollerHeight] = useState(0);
  const [paginationCursor, setPaginationCursor] = useState(1);

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

    // pagination Work

    checkTheScrollerDirection(e);
  };

  const checkTheScrollerDirection = (e) => {
    if (e.timeStamp !== undefined) {
      let { scrollTop } = e.target;
      if (scrollTop > scrollerHeight) {
        helperFunctionForPaginationScrollLastElement("down");
      } else {
        helperFunctionForPaginationScrollLastElement("up");
      }

      setScrollerHeight(scrollTop);
    }
  };

  const helperFunctionForPaginationScrollLastElement = (mode) => {
    setTimeout(() => {
      // settimeout isiliye lagaaya h kyuki dom fast update hone ki vajah se last viewport item previous vaala mil rha hn
      const { amount, tolerance } = settings;
      let newPaginationCursor = paginationCursor;
      let viewPortDocuments = document.getElementsByClassName("li_item");
      let lastViewPortDocument =
        viewPortDocuments[viewPortDocuments.length - 1].getAttribute("class");
      const arrayOfClasses = lastViewPortDocument.split(" ");
      const lastIndexOfListItem = +arrayOfClasses[arrayOfClasses.length - 1];
      if (mode === "up") {
        newPaginationCursor = paginationCursor - 1;
        const scrollDownLimitDecider = newPaginationCursor * amount + tolerance;

        if (lastIndexOfListItem <= scrollDownLimitDecider) {
          setPaginationCursor(paginationCursor - 1);
        }
      } else {
        const scrollDownLimitDecider = newPaginationCursor * amount + tolerance;
        if (lastIndexOfListItem >= scrollDownLimitDecider) {
          setPaginationCursor(paginationCursor + 1);
        }
      }
    }, 0);
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

  return (
    <>
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
        {/* <div
          style={{
            height: `${state.bottomPaddingHeight}px`,
            background: "blue",
          }}
        ></div> */}
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

export default VirtualScroller;
