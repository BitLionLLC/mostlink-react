import React, { useRef } from 'react';
import Select, { components as reactSelectComponents } from "react-select";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { useDrag, useDrop } from 'react-dnd';

const style = {
    border: '1px dashed gray',
    padding: '0.5rem 1rem',
    marginBottom: '.5rem',
    backgroundColor: 'white',
    cursor: 'move',
};

const ItemTypes = {
    LINK: "link"
}

const EditableLink = ({ link, links, setLinks, deleteLink, moveLink, index, id, key }) => {
    const transformIconKey = (key, lib) => {
        const arr = key.split("").slice(2);
        const display = arr.join("");
        let valueArr = [];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].toUpperCase() === arr[i] && !Number.isInteger(Number(arr[i])) && i !== 0) {
                valueArr.push("-");
                valueArr.push(arr[i].toLowerCase());
            } else if (arr[i].toUpperCase() === arr[i] && !Number.isInteger(Number(arr[i]))) {
                valueArr.push(arr[i].toLowerCase());
            } else {
                valueArr.push(arr[i]);
            }
        }

        const value = lib + "_" + valueArr.join("");
        return [display, value];
    }

    const selectOptions = Object.keys(fab).concat(Object.keys(far)).filter((key) => key !== "faFontAwesomeLogoFull").sort().map(key => {
        let lib;
        if (Object.keys(far).includes(key)) {
            lib = "far"
        } else {
            lib = "fab"
        }
        const [label, value] = transformIconKey(key, lib);
        return {value, label}
    })

    const { Option } = reactSelectComponents;
    const IconOption = props => (
        <Option {...props} className="icon-option">
            {props.data.label}
            <FontAwesomeIcon icon={props.data.value.split("_")} size="2x" className="icon-option-icon" />
        </Option>
    );

    const ref = useRef(null);
    const [{ handlerId }, drop] = useDrop({
        accept: ItemTypes.LINK,
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
            moveLink(dragIndex, hoverIndex);
            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.LINK,
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
        <li className="link-edit-li" style={{...style, opacity}} ref={ref} data-handler-id={handlerId}>
                                
            <input type="text" value={link.text} placeholder={`Link #${index + 1} text`} onChange={e => {
                const newLinks = links.slice();
                newLinks[index].text = e.target.value;
                setLinks(newLinks);
            }} />
            <input type="text" value={link.href} placeholder={`Link #${index + 1} URI`} onChange={e => {
                const newLinks = links.slice();
                newLinks[index].href = e.target.value;
                setLinks(newLinks);
            }} />
            <FontAwesomeIcon icon={["far", "window-close"]} size="1x" onClick={() => deleteLink(index)} color="red" className="delete-link" />
            <Select 
                onChange={e => {
                    const newLinks = links.slice();
                    newLinks[index].icon = e.value;
                    setLinks(newLinks);
                }} 
                defaultValue={selectOptions[selectOptions.indexOf(selectOptions.find(obj => obj.value === link?.icon))]} 
                options={selectOptions} 
                components={{ Option: IconOption }} 
            />
        </li>
    )
}

export default EditableLink;