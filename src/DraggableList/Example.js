import { animate, Reorder } from "framer-motion";
import { useState } from "react";
import { Group } from "./Group";
import { GroupGlobal } from "./GroupGlobal";
import { Item } from "./Item";

const Example = () => {
  const [items, setItems] = useState([
    [
      10,
      "loodasds",
      // `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. `,
      2,
      3,
    ],
    [5, 6, 7],
  ]);
  const handleMove = (e) => {
    setItems(e);
  };

  const [items2, setItems2] = useState([5, 4, 7]);
  return (
    <div id="draggable">
      <GroupGlobal values={items} onReorder={handleMove}>
        {items?.map((item, index) => (
          <Group key={index} index={index} axis="y" values={item}>
            {item.map((el) => (
              <Item key={el} value={el} id={el}>
                {el}
              </Item>
            ))}
          </Group>
        ))}

        {/* <Group axis="y" values={items2} onReorder={setItems2}>
          {items2.map((item) => (
            <Item key={item} value={item}>
              {item}
            </Item>
          ))}
        </Group> */}
      </GroupGlobal>
      {/* <Reorder.Group axis="y" values={items} onReorder={setItems}>
        {items.map((item) => (
          <Reorder.Item key={item} value={item}>
            {item}
          </Reorder.Item>
        ))}
      </Reorder.Group> */}
    </div>
  );
};
export default Example;
