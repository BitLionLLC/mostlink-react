import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { SitesContext } from '../contexts/sitesContext';
import toHex from 'colornames';
import { HexColorPicker } from 'react-colorful';
import update from 'immutability-helper';
import GradientColorBox from './gradientColorBox';
import { MenuItem, Select, Checkbox, TextField } from '@mui/material';
import { muiDarkTheme, muiLightTheme } from '../constants/themes';

import styles from './gradientPicker.module.css';

const GRADIENT_PRESETS = {
    'rainbow': ['#F41414', '#ED9909', '#FFEF1F', '#12CC3B', '#1E90FF', '#D633D5'],
    'sunset': ['#1C85F2', '#EFB710'],
    'warm': ['#F41414', '#ED9909', '#FFEF1F'],
    'cool': ['#389CFF', '#5E23B0'],
    'neon': ['#1E90FF', '#DD0BAF']
}

const GradientPicker = ({ setter, value, place, isContainerTransparent }) => {
    const { themeObj, theme } = useContext(SitesContext);

    const [useGradient, setUseGradient] = useState(false);
    const [gradientType, setGradientType] = useState('linear');
    const [conicAngle, setConicAngle] = useState(0);
    const [gradientArr, setGradientArr] = useState(['#e66465', '#9198e5']);
    const [colorBoxArr, setColorBoxArr] = useState(['#e66465', '#9198e5']);
    const [gradientStr, setGradientStr] = useState('');
    const [linearDirection, setLinearDirection] = useState('to top')
    const [isEditingColor, setIsEditingColor] = useState(false);
    const [isColorSet, setIsColorSet] = useState(true);
    const [colorToEdit, setColorToEdit] = useState(0);
    const [editColorResult, setEditColorResult] = useState('#1E90FF');
    const editColorRef = useRef(editColorResult);
    const [selectedPreset, setSelectedPreset] = useState('custom');
    const [containerAlphaPercent, setContainerAlphaPercent] = useState(100);

    const HEX_COLOR_REGEX_SHORT = "^#(?:[0-9a-fA-F]{3}){1}$";
    const HEX_COLOR_REGEX_LONG = "^#(?:[0-9a-fA-F]{2}){3,4}$";

    useEffect(() => {
        if (value && isColorSet) {
            setUseGradient(!!value);
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
    }, [value, isColorSet])

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
        setColorBoxArr(selectedPreset && selectedPreset !== 'custom' ?  GRADIENT_PRESETS[selectedPreset] : gradientArr);
    }, [selectedPreset, gradientArr])

    useEffect(() => {
        if (!containerAlphaPercent.length) {
            return;
        }

        if (Number.isNaN(+containerAlphaPercent)) {
            setContainerAlphaPercent(100);
            return;
        }

        const alpha = Math.round(+containerAlphaPercent);
        
        if (alpha <= 100) {
            let alphaHex = (parseInt((alpha)/100*255, 10)).toString(16);
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
        if (place === "container" && gradientArr[colorToEdit].length === 7) {
            setContainerAlphaPercent(100);
        } else if (place === "container" && gradientArr[colorToEdit].length === 9) {
            const alphaPercent = Math.round(parseInt(gradientArr[colorToEdit].slice(7), 16)/255*100);
            setContainerAlphaPercent(alphaPercent);
        }
    }, [colorToEdit])

    useEffect(() => {
        setIsColorSet(false);

        const delayDebounceFn = setTimeout(() => {
            setIsColorSet(true);
        }, 1000)

        return () => clearTimeout(delayDebounceFn)
    }, [editColorResult])

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
        let newColor;
        if (color?.match(HEX_COLOR_REGEX_SHORT) || color?.match(HEX_COLOR_REGEX_LONG)) {
            let alphaHex = (parseInt((+containerAlphaPercent)/100*255, 10)).toString(16);
            if (alphaHex.length === 1) {alphaHex = '0' + alphaHex}
            newColor = color.slice(0,7)+ alphaHex;
        } else {
            newColor = color;
        }
        
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
        } else if (allColorNames.includes(input.toLowerCase())) {
            setterCallback(toHex(input.toLowerCase()).toUpperCase());
            ref.current = toHex(input.toLowerCase()).toUpperCase();
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
        setSelectedPreset('custom');
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
                            <TextField type="text" value={editColorResult} onChange={e => standardizeColorInput(e.target.value, editColor, editColorRef)} className={styles.textField} variant="filled" size="small" />
                        </div>
                        
                        {
                            place === "container" && 
                            <div className={styles.row}>
                                Alpha %
                                <TextField type="text" value={containerAlphaPercent} onChange={e => setContainerAlphaPercent(e.target.value)} className={styles.textField} variant="filled" size="small" />
                            </div>
                        }
                        {place === "container" && editColorResult.length === 9 && +containerAlphaPercent < 100 && !isContainerTransparent && <div>If you want transparency, please check the checkbox above for container color (called 'Transparent?')</div>}
                    </>
                :
                    <>
                        <div className={styles.row}>
                            <label htmlFor='useGradient'>Use</label>
                            <Checkbox checked={useGradient} onChange={e => setUseGradient(e.target.checked)} id="useGradient" className={styles.useGradient} />
                        </div>
                        <div className={styles.row}>
                            <label htmlFor='gradientType'>Type</label>
                            <Select onChange={e => setGradientType(e.target.value)} value={gradientType} className={styles.select}>
                                <MenuItem value='linear'>Linear</MenuItem>
                                <MenuItem value='radial'>Radial</MenuItem>
                                <MenuItem value='conic'>Conic</MenuItem>
                            </Select>
                        </div>
                        {
                            gradientType === 'linear' 
                            ?
                                <div className={styles.row}>
                                    <label htmlFor='linearDirection'>Direction</label>
                                    <Select onChange={e => setLinearDirection(e.target.value)} value={linearDirection} className={styles.select}>
                                        <MenuItem value='to top'>To top</MenuItem>
                                        <MenuItem value='to top right'>To top right</MenuItem>
                                        <MenuItem value='to right'>To right</MenuItem>
                                        <MenuItem value='to bottom right'>To bottom right</MenuItem>
                                        <MenuItem value='to bottom'>To bottom</MenuItem>
                                        <MenuItem value='to bottom left'>To bottom left</MenuItem>
                                        <MenuItem value='to left'>To left</MenuItem>
                                        <MenuItem value='to top left'>To top left</MenuItem>
                                    </Select>
                                </div>
                            : 
                            null
                        }
                        {
                            gradientType === 'conic' 
                            ?
                                <div className={styles.row}>
                                    <label htmlFor='conicAngle'>Angle</label>
                                    <TextField type="number" value={conicAngle} onChange={e => setConicAngle(e.target.value)} className={styles.textField} variant="filled" size="small" />
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
                            <Select onChange={e => setSelectedPreset(e.target.value)} value={selectedPreset} className={styles.select}>
                                <MenuItem value='custom'>Custom</MenuItem>
                                <MenuItem value='rainbow'>Rainbow</MenuItem>
                                <MenuItem value='sunset'>Sunset</MenuItem>
                                <MenuItem value='warm'>Warm</MenuItem>
                                <MenuItem value='cool'>Cool</MenuItem>
                                <MenuItem value='neon'>Neon</MenuItem>
                            </Select>
                            {selectedPreset && selectedPreset !== 'custom' && <button onClick={copyPresetToCustom} className={styles.copyButton}>Copy preset to custom</button>}
                        </div>
                    </>
                }
        </div>
    )
}

export default GradientPicker;