import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';

import styles from './gradientPicker.module.css';

const GradientPicker = ({ setter, value = 'linear-gradient(#e66465, #9198e5)' }) => {
    const passedType = value.split("(")[0].split("-")[0];
    const passedAngle = value.includes('conic') ? Number(value.split("from ")[1].split("deg")[0]) : 0;
    const passedArr = value && value?.split(')')[0]?.split('-gradient(')[1]?.split(',')?.map(str => str.trim())?.filter(str => str.startsWith('#'));

    const [useGradient, setUseGradient] = useState(!!value);
    const [gradientType, setGradientType] = useState(passedType || 'linear');
    const [gradientAngle, setGradientAngle] = useState(passedAngle);
    const [gradientArr, setGradientArr] = useState(passedArr || ['#e66465', '#9198e5']);
    const [gradientStr, setGradientStr] = useState(value);
    const [isEditingColor, setIsEditingColor] = useState(false);
    const [colorToEdit, setColorToEdit] = useState(0);
    const [editColorResult, setEditColorResult] = useState('#1E90FF');

    useEffect(() => {
        if (useGradient) {
            const angleStr = gradientType === 'conic' ? `from ${gradientAngle}deg,` : '';
            const joinedColors = gradientArr.join(", ");
            setGradientStr(`${gradientType}-gradient(${angleStr} ${joinedColors})`)
        } else {
            setGradientStr('');
        }
    }, [gradientType, gradientAngle, gradientArr, useGradient])

    useEffect(() => {
        setter(gradientStr);
    }, [gradientStr])

    const addColor = () => {
        console.log(value, passedArr)
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
                            gradientType === 'conic' 
                            ?
                                <div className={styles.row}>
                                    <label htmlFor='gradientAngle'>Angle</label>
                                    <input type="number" value={gradientAngle} onChange={e => setGradientAngle(e.target.value)} className={styles.angleInput} />
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