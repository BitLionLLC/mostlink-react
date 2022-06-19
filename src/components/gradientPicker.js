import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { SitesContext } from '../contexts/sitesContext';
import toHex from 'colornames';
import { HexColorPicker } from 'react-colorful';
import update from 'immutability-helper';
import GradientColorBox from './gradientColorBox';

import styles from './gradientPicker.module.css';

const GRADIENT_PRESETS = {
    'rainbow': ['#F41414', '#ED9909', '#FFEF1F', '#12CC3B', '#1E90FF', '#D633D5'],
    'sunset': ['#1C85F2', '#EFB710'],
    'warm': ['#F41414', '#ED9909', '#FFEF1F'],
    'cool': ['#389CFF', '#5E23B0'],
    'neon': ['#1E90FF', '#DD0BAF']
}

const GradientPicker = ({ setter, value, place, isContainerTransparent }) => {
    const { themeObj } = useContext(SitesContext);

    const [useGradient, setUseGradient] = useState(false);
    const [gradientType, setGradientType] = useState('linear');
    const [conicAngle, setConicAngle] = useState(0);
    const [gradientArr, setGradientArr] = useState(['#e66465', '#9198e5']);
    const [colorBoxArr, setColorBoxArr] = useState(['#e66465', '#9198e5']);
    const [gradientStr, setGradientStr] = useState('');
    const [linearDirection, setLinearDirection] = useState('to top')
    const [isEditingColor, setIsEditingColor] = useState(false);
    const [colorToEdit, setColorToEdit] = useState(0);
    const [editColorResult, setEditColorResult] = useState('#1E90FF');
    const editColorRef = useRef(editColorResult);
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [containerAlphaPercent, setContainerAlphaPercent] = useState(100);

    const HEX_COLOR_REGEX_SHORT = "^#(?:[0-9a-fA-F]{3}){1}$";
    const HEX_COLOR_REGEX_LONG = "^#(?:[0-9a-fA-F]{2}){3,4}$";

    useEffect(() => {
        setUseGradient(!!value);
        
        if (value) {
            const passedType = value?.split("(")[0]?.split("-")[0];
            const passedAngle = value?.includes('conic') ? Number(value?.split("from ")[1]?.split("deg")[0]) : 0;
            const passedDirection = value?.includes('linear') ? value?.split('linear-gradient(')[1]?.split(',')[0] : '';
            const passedArr = value && value?.split(')')[0]?.split('-gradient(')[1]?.split(',')?.map(str => str.trim())?.filter(str => str.startsWith('#'));
            setGradientType(passedType);
            setGradientArr(passedArr);
            setColorBoxArr(passedArr);
            setConicAngle(passedAngle || 0);
            setGradientStr(value);
            setLinearDirection(passedDirection || 'to top');
        }
    }, [value])

    useEffect(() => {
        if (useGradient) {
            const angleStr = gradientType === 'conic' ? `from ${conicAngle}deg,` : '';
            const directionStr = gradientType === 'linear' ? linearDirection +',' : '';
            const joinedColors = colorBoxArr.join(", ");
            setGradientStr(`${gradientType}-gradient(${directionStr || angleStr} ${joinedColors})`);
        } else {
            setGradientStr('');
        }
    }, [gradientType, conicAngle, colorBoxArr, linearDirection, useGradient])

    useEffect(() => {
        setter(gradientStr);
    }, [gradientStr])

    useEffect(() => {
        setColorBoxArr(selectedPreset ?  GRADIENT_PRESETS[selectedPreset] : gradientArr);
    }, [selectedPreset, gradientArr])

    useEffect(() => {
        if (!containerAlphaPercent.length) {
            return;
        }

        if (Number.isNaN(+containerAlphaPercent)) {
            setContainerAlphaPercent(100);
            return;
        }
        
        if (+containerAlphaPercent <= 100) {
            let alphaHex = (parseInt((+containerAlphaPercent)/100*255, 10)).toString(16);
            if (alphaHex.length === 1) {alphaHex = '0' + alphaHex}
            const color = gradientArr[colorToEdit]?.slice(0, 7) + alphaHex;
            editColor(color);
        } else {
            setContainerAlphaPercent(100);
            const color = gradientArr[colorToEdit]?.slice(0, 7) + 'FF';
            editColor(color);
        }
    }, [containerAlphaPercent])

    useEffect(() => {
        if (place === 'container' && gradientArr[colorToEdit].length === 9) {
            const color = gradientArr[colorToEdit];
            const alphaPercent = Math.round(parseInt(color.slice(7), 16)/255*100);
            if (alphaPercent !== !containerAlphaPercent) {
                setContainerAlphaPercent(alphaPercent)
            }
        }
    }, [gradientArr, colorToEdit])

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
        let alphaHex = (parseInt((+containerAlphaPercent)/100*255, 10)).toString(16);
        if (alphaHex.length === 1) {alphaHex = '0' + alphaHex}
        const newColor = color.slice(0,7)+ alphaHex;
        setEditColorResult(newColor);
        const currentColors = gradientArr.slice();
        currentColors.splice(colorToEdit, 1, newColor);
        setGradientArr(currentColors);
    }

    const reverseColors = () => {
        setGradientArr(gradientArr.slice().reverse());
    }

    const standardizeColorInput = (input, setterCallback, ref) => {
        setterCallback(input);
    
        const isHex = input.match(HEX_COLOR_REGEX_SHORT) || input.match(HEX_COLOR_REGEX_LONG);
        const allColorNames = toHex.all().map(color => color.name);

        if (isHex) {
            setterCallback(input.toUpperCase());
            ref.current = input.toUpperCase();
        } else if (allColorNames.includes(input)) {
            setterCallback(toHex(input).toUpperCase());
            ref.current = toHex(input).toUpperCase();
        } else {
            ref.current = input;
        }

        setTimeout(() => {
            const { current } = ref;

            if (!(current.match(HEX_COLOR_REGEX_SHORT)) && !(current.match(HEX_COLOR_REGEX_LONG)) ) {
                setterCallback("#000000");
                ref.current = "#000000";
            }
        }, 5000)
    }

    const copyPresetToCustom = () => {
        setGradientArr(GRADIENT_PRESETS[selectedPreset]);
        setSelectedPreset('');
    }

    const moveBox = useCallback((dragIndex, hoverIndex) => {
        setGradientArr((prevBoxes) => update(prevBoxes, {
            $splice: [
                [dragIndex, 1],
                [hoverIndex, 0, prevBoxes[dragIndex]],
            ],
        }));
    }, []);

    return (
        <div className={styles.gradientPicker} style={{backgroundColor: themeObj.sitesBoxColor}}>
            {
                isEditingColor 
                ?
                    <>
                        <HexColorPicker color={editColorResult} onChange={e => editColor(e)}/>
                        <span onClick={() => setIsEditingColor(false)} className={styles.closeButton}>+</span>
                        <div className={styles.row}>
                            Color
                            <input type="text" value={editColorResult} onChange={e => standardizeColorInput(e.target.value, editColor, editColorRef)} className={styles.hexInputShort} />
                        </div>
                        
                        {
                            place === "container" && 
                            <div className={styles.row}>
                                Alpha %
                                <input type="text" value={containerAlphaPercent} onChange={e => setContainerAlphaPercent(e.target.value)} className={styles.alphaInput} />
                            </div>
                        }
                        {place === "container" && editColorResult.length === 9 && +containerAlphaPercent < 100 && !isContainerTransparent && <div>If you want transparency, please check the checkbox above for container color (called 'Transparent?')</div>}
                    </>
                :
                    <>
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
                            <div className={styles.colorsTitleAndButtons}>
                                Colors 
                                {!selectedPreset && <button onClick={addColor} disabled={gradientArr.length > 11}>+</button>}
                                {!selectedPreset && <button onClick={reverseColors}>Reverse</button>}
                            </div>
                            <div className={styles.colorBoxes}>
                                {colorBoxArr.map((color, i) => {
                                    return (
                                        <GradientColorBox 
                                            color={color} 
                                            index={i} 
                                            key={i}
                                            setIsEditingColor={setIsEditingColor} 
                                            setColorToEdit={setColorToEdit}
                                            setEditColorResult={setEditColorResult}
                                            removeColor={removeColor}
                                            moveBox={moveBox}
                                            id={i}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                        <div className={styles.column}>
                            Color presets
                            <select onChange={e => setSelectedPreset(e.target.value)} value={selectedPreset} className={styles.presetSelect}>
                                <option value=''>Custom</option>
                                <option value='rainbow'>Rainbow</option>
                                <option value='sunset'>Sunset</option>
                                <option value='warm'>Warm</option>
                                <option value='cool'>Cool</option>
                                <option value='neon'>Neon</option>
                            </select>
                            {selectedPreset && <button onClick={copyPresetToCustom} className={styles.copyButton}>Copy preset to custom</button>}
                        </div>
                    </>
                }
        </div>
    )
}

export default GradientPicker;