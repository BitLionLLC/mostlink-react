import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';

import styles from './gradientPicker.module.css';

const GradientPicker = ({ setter, value = 'linear-gradient(#e66465, #9198e5)' }) => {
    const passedType = value?.split("(")[0]?.split("-")[0];
    const passedAngle = value.includes('conic') ? Number(value?.split("from ")[1]?.split("deg")[0]) : 0;
    const passedDirection = value.includes('linear') ? value?.split('linear-gradient(')[1]?.split(',')[0] : '';
    const passedArr = value && value?.split(')')[0]?.split('-gradient(')[1]?.split(',')?.map(str => str.trim())?.filter(str => str.startsWith('#'));

    const [useGradient, setUseGradient] = useState(!!value);
    const [gradientType, setGradientType] = useState(passedType || 'linear');
    const [conicAngle, setConicAngle] = useState(passedAngle);
    const [gradientArr, setGradientArr] = useState(passedArr || ['#e66465', '#9198e5']);
    const [gradientStr, setGradientStr] = useState(value);
    const [linearDirection, setLinearDirection] = useState(passedDirection)
    const [isEditingColor, setIsEditingColor] = useState(false);
    const [colorToEdit, setColorToEdit] = useState(0);
    const [editColorResult, setEditColorResult] = useState('#1E90FF');

    useEffect(() => {
        if (useGradient) {
            const angleStr = gradientType === 'conic' ? `from ${conicAngle}deg,` : '';
            const directionStr = gradientType === 'linear' ? linearDirection +',' : '';
            const joinedColors = gradientArr.join(", ");
            setGradientStr(`${gradientType}-gradient(${directionStr || angleStr} ${joinedColors})`);
        } else {
            setGradientStr('');
        }
    }, [gradientType, conicAngle, gradientArr, linearDirection, useGradient])

    useEffect(() => {
        setter(gradientStr);
    }, [gradientStr])

    const addColor = () => {
        const currentColors = gradientArr.slice();
        currentColors.push('#1E90FF');
        setGradientArr(currentColors);
    }

    const removeColor = (index) => {
        const currentColors = gradientArr.slice();
        currentColors.splice(index, 1);
        setGradientArr(currentColors);
    }

    const editColor = (color) => {
        setEditColorResult(color);
        const currentColors = gradientArr.slice();
        currentColors.splice(colorToEdit, 1, color);
        setGradientArr(currentColors);
    }

    return (
        <div className={styles.gradientPicker}>
            {
                isEditingColor 
                ?
                    <>
                        <HexColorPicker color={editColorResult} onChange={e => editColor(e)}/>
                        <span onClick={() => setIsEditingColor(false)} className={styles.closeButton}>+</span>
                    </>
                :
                    <>
                        Gradient Picker
                        <div className={styles.row}>
                            <label htmlFor='useGradient'>Use</label>
                            <input type="checkbox" checked={useGradient} onChange={e => setUseGradient(e.target.checked)} id="useGradient" className={styles.useGradient} />
                        </div>
                        <div className={styles.row}>
                            <label htmlFor='gradientType'>Type</label>
                            <select onChange={e => setGradientType(e.target.value)} value={gradientType}>
                                <option value='linear'>Linear</option>
                                <option value='radial'>Radial</option>
                                <option value='conic'>Conic</option>
                            </select>
                        </div>
                        {
                            gradientType === 'linear' 
                            ?
                                <div className={styles.row}>
                                    <label htmlFor='linearDirection'>Direction</label>
                                    <select onChange={e => setLinearDirection(e.target.value)} value={linearDirection}>
                                        <option value='to top'>To top</option>
                                        <option value='to top right'>To top right</option>
                                        <option value='to right'>To right</option>
                                        <option value='to bottom right'>To bottom right</option>
                                        <option value='to bottom'>To bottom</option>
                                        <option value='to bottom left'>To bottom left</option>
                                        <option value='to left'>To left</option>
                                        <option value='to top left'>To top left</option>
                                    </select>
                                </div>
                            : 
                            null
                        }
                        {
                            gradientType === 'conic' 
                            ?
                                <div className={styles.row}>
                                    <label htmlFor='conicAngle'>Angle</label>
                                    <input type="number" value={conicAngle} onChange={e => setConicAngle(e.target.value)} className={styles.angleInput} />
                                </div>
                            : 
                            null
                        }
                        <div className={styles.column}>
                            Preview
                            <div className={styles.previewBox} style={{backgroundImage: gradientStr}} />
                            Colors <button onClick={addColor}>+</button>
                            <div className={styles.colorBoxes}>
                                {gradientArr.map((color, i) => {
                                    return (
                                        <div>
                                            <div className={styles.colorBox} key={i} style={{backgroundColor: color}} onClick={() => {
                                                setIsEditingColor(true);
                                                setColorToEdit(i);
                                                setEditColorResult(color);
                                            }}/>
                                            <button onClick={() => removeColor(i)}>-</button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </>
                }
        </div>
    )
}

export default GradientPicker;