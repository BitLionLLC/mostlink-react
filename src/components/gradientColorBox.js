import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import styles from './gradientColorBox.module.css';

const style = {
  border: '1px dashed gray',
  padding: '5px',
  margin: '2px',
  backgroundColor: 'midnightblue',
  cursor: 'move',
};

const ItemTypes = {
  BOX: 'box'
};

const GradientColorBox = ({ color, index, setIsEditingColor, setColorToEdit, setEditColorResult, removeColor, moveBox, id }) => {
  const ref = useRef(null);
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.BOX,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action
      moveBox(dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.BOX,
    item: () => {
      return { id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <div ref={ref} style={{opacity, ...style}} data-handler-id={handlerId}>
      <div className={styles.colorBox} key={index} style={{backgroundColor: color}} onClick={() => {
        setIsEditingColor(true);
        setColorToEdit(index);
        setEditColorResult(color);
      }}/>
      <button onClick={() => removeColor(index)}>-</button>
    </div>
  );
};

export default GradientColorBox;