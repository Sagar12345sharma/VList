import React from "react";

const RowTemplate = ({ item, selectedItems, setSelecteditems }) => {
  let id = `item${item.index}`;

  return (
    <div
      className={`item${item.index} li_item ${item.index}`}
      id={`item${item.index}`}
      key={item.index}
      style={{
        height: `${
          selectedItems.includes(id)
            ? `${item.height * 2 + 2}px`
            : `${item.height}px`
        }`,
        borderBottom: "1px solid #c8c5c59c",
      }}
      onClick={() => {
        let newSelectedArray = [];
        newSelectedArray.push(`item${item.index}`);
        setSelecteditems([...newSelectedArray]);
      }}
    >
      <div className="itemIndex">{item.index}</div>
      <div className="itemIndex">{item.text}</div>
      <div className="itemIndex">{item.height}</div>
    </div>
  );
};

export default RowTemplate;
