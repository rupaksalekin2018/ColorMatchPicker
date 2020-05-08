//Global Selections
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector('.copy-container');
const adjustButton = document.querySelectorAll('.adjust');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.slider');
const lockButtons = document.querySelectorAll('.lock');
let initialColors;
///This is for local storage
let savedPalettes = [];

//Functions
//generating color without chroma js
// function generatorHex() {
//     const letters = "0123456789ABCDEF";
//     let hash = "#";
//     for (let i = 0; i < 6; i++) {
//         hash += letters[Math.floor(Math.random() * 16)];
//     }

//     return hash;
// }


//Add our event listener

generateBtn.addEventListener('click', randomColors);


sliders.forEach(slider => {
    slider.addEventListener("input", hslControls);
});

colorDivs.forEach((div, index) => {
    div.addEventListener("change", () => {
        updateTextUI(index);
    });
});

currentHexes.forEach(hex => {
    hex.addEventListener('click', () => {
        copyToClipboard(hex);
    });
});

popup.addEventListener('transitionend', () => {
    const popupBox = popup.children[0];
    popup.classList.remove('active');
    popupBox.classList.remove('active');
});

adjustButton.forEach((button, index) => {
    button.addEventListener('click', () => {
        openAdjustmentPanel(index);
    });
});

closeAdjustments.forEach((button, index) => {
    button.addEventListener('click', () => {
        closeAdjustmentPanel(index);
    });
});

lockButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
        colorDivs[index].classList.toggle('locked');
        if (colorDivs[index].classList.contains("locked")) {
            button.innerHTML = '<i class="fas fa-lock"></i>';
        } else {
            button.innerHTML = '<i class="fas fa-lock-open"></i>';
        }
    });
});
//generating color with chroma js
function generatorHex() {
    const hexColor = chroma.random();
    return hexColor;
}

function randomColors() {

    initialColors = [];
    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generatorHex();

        if (div.classList.contains('locked')) {
            initialColors.push(hexText.innerText);
            return;
        } else {
            //Add it to the array 
            initialColors.push(chroma(randomColor).hex());
        }

        // console.log(chroma(randomColor).hex());
        //Add the color to the bg
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;
        checkTextContrast(randomColor, hexText);
        const color = chroma(randomColor);
        const slider = div.querySelectorAll('.slider input');
        const hue = slider[0];
        const brightness = slider[1];
        const saturation = slider[2];
        colorizeSliders(color, hue, brightness, saturation);
    });

    //Reset inputs
    resetInputs();

    //check for button contrast
    adjustButton.forEach((button, index) => {
        checkTextContrast(initialColors[index], button);
        checkTextContrast(initialColors[index], lockButton[index]);
    });

}


function checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();

    if (luminance > 0.5) {
        text.style.color = 'black';
        // console.log('nigga please');
    } else {
        text.style.color = 'white';
        // console.log('hello');
    }
}


function colorizeSliders(color, hue, brightness, saturation) {
    //scale saturation
    const noSat = color.set("hsl.s", 0);
    const fullSat = color.set("hsl.s", 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);

    //scale brightness
    const midBright = color.set("hsl.l", 0.5);
    const scaleBright = chroma.scale(["black", midBright, "white"]);
    //Update Input Colors
    saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(0)}, ${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(0)}, ${scaleBright(0.5)},${scaleBright(1)})`;
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function hslControls(e) {
    const index = e.target.getAttribute("data-bright") || e.target.getAttribute("data-sat") || e.target.getAttribute("data-hue");

    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    //console.log(sliders);
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];


    //console.log(initialColors[index]);
    // const bgColor = colorDivs[index].querySelector("h2").innerText;
    const bgColor = initialColors[index];


    //new color generation via slider
    let color = chroma(bgColor).set('hsl.s', saturation.value).set('hsl.l', brightness.value).set('hsl.h', hue.value);

    //console.log(color);

    colorDivs[index].style.backgroundColor = color.hex();

    //updating sliders
    colorizeSliders(color, hue, brightness, saturation);

}

function updateTextUI(index) {
    const activeDiv = colorDivs[index];
    // const color = activeDiv.style.backgroundColor;
    // console.log(color);
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');
    textHex.innerText = color.hex();
    checkTextContrast(color, textHex);
    for (icon of icons) {
        checkTextContrast(color, icon);
    }
}

function resetInputs() {
    const sliders = document.querySelectorAll(".slider input");
    sliders.forEach(function (slider) {
        if (slider.name === "hue") {
            const hueColor = initialColors[slider.getAttribute("data-hue")];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
        }

        if (slider.name === "brightness") {
            const brightColor = initialColors[slider.getAttribute("data-bright")];
            const brightValue = chroma(brightColor).hsl()[2];
            slider.value = Math.floor(brightValue * 100) / 100;
        }

        if (slider.name === "saturation") {
            const SatColor = initialColors[slider.getAttribute("data-sat")];
            const SatValue = chroma(SatColor).hsl()[1];
            slider.value = Math.floor(SatValue * 100) / 100;
        }
    });
}

function copyToClipboard(hex) {
    const el = document.createElement('textarea');
    el.value = hex.innerText;
    document.body.appendChild(el);

    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    const popupBox = popup.children[0];
    popup.classList.add("active");
    popupBox.classList.add("active");
}

function openAdjustmentPanel(index) {
    sliderContainers[index].classList.toggle('active');
}

function closeAdjustmentPanel(index) {
    sliderContainers[index].classList.remove('active');
}

//Implement Save to palette and local storage settings
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");

//Event Listener
saveBtn.addEventListener('click', openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalettes);
libraryBtn.addEventListener('click', openLibrary);
closeLibraryBtn.addEventListener('click', closeLibrary);

function openPalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');
}

function closePalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.remove("active");
    popup.classList.add("remove");
}

function savePalettes(e) {
    saveContainer.classList.remove("active");
    popup.classList.remove('active');
    const name = saveInput.value;
    const colors = [];
    currentHexes.forEach(hex => {
        colors.push(hex.innerText);
    });

    //Generate Object
    let palleteNr;
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
    if (paletteObjects) {
        palleteNr = paletteObjects.length;
    } else {
        palleteNr = savedPalettes.length;
    }
    const palleteObj = {
        name: name,
        colors: colors,
        nr: palleteNr
    };

    savedPalettes.push(palleteObj);
    //console.log(savedPalettes);
    savetoLocal(palleteObj);
    saveInput.value = "";

    //Generate the Palette for library
    const palette = document.createElement('div');
    //console.log(palette);
    palette.classList.add('custom-palette');
    console.log(palette);
    const title = document.createElement('h4');
    title.innerText = palleteObj.name;
    //console.log(palleteObj.name);
    const preview = document.createElement('div');
    preview.classList.add('small-preview');
    palleteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
    });

    const paletteBtn = document.createElement("button");
    paletteBtn.classList.add("pick-palette-btn");
    // paletteBtn.classList.add(paletteObj.nr);
    const num = String(palleteObj.nr);
    paletteBtn.classList.add(num);
    paletteBtn.innerText = "Select";

    paletteBtn.addEventListener("click", e => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        //console.dir(paletteIndex);
        //console.log(typeof (paletteIndex));
        const numP = parseInt(paletteIndex);
        initialColors = [];
        savedPalettes[numP].colors.forEach((color, index) => {
            initialColors.push(color);

            colorDivs[index].style.background = color;
            const text = colorDivs[index].children[0];
            checkTextContrast(color, text);
            updateTextUI(index);
        });
        resetInputs();
    });
    // Append to library
    palette.appendChild(title);
    //console.log(palette);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);

}

function savetoLocal(palleteObj) {
    let localPalletes;
    if (localStorage.getItem('palettes') == null) {
        localPalletes = [];
    } else {
        localPalletes = JSON.parse(localStorage.getItem('palettes'));
    }
    localPalletes.push(palleteObj);
    localStorage.setItem('palettes', JSON.stringify(localPalletes));
}




function savetoLocal(palleteObj) {
    let localPalletes;
    if (localStorage.getItem('palettes') == null) {
        localPalletes = [];
    } else {
        localPalletes = JSON.parse(localStorage.getItem('palettes'));
    }
    localPalletes.push(palleteObj);
    localStorage.setItem('palettes', JSON.stringify(localPalletes));
}

function openLibrary() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add("active");
    popup.classList.add("active");
}

function closeLibrary() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove("active");
    popup.classList.remove("active");
}

function getLocal() {
    if (localStorage.getItem('palettes') == null) {
        localPalletes = [];
    } else {
        const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
        savedPalettes = [...paletteObjects];
        paletteObjects.forEach(palleteObj => {
            //Generate the Palette for library
            const palette = document.createElement('div');
            //console.log(palette);
            palette.classList.add('custom-palette');
            console.log(palette);
            const title = document.createElement('h4');
            title.innerText = palleteObj.name;
            //console.log(palleteObj.name);
            const preview = document.createElement('div');
            preview.classList.add('small-preview');
            palleteObj.colors.forEach(smallColor => {
                const smallDiv = document.createElement('div');
                smallDiv.style.backgroundColor = smallColor;
                preview.appendChild(smallDiv);
            });

            const paletteBtn = document.createElement("button");
            paletteBtn.classList.add("pick-palette-btn");
            // paletteBtn.classList.add(paletteObj.nr);
            const num = String(palleteObj.nr);
            paletteBtn.classList.add(num);
            paletteBtn.innerText = "Select";

            paletteBtn.addEventListener("click", e => {
                closeLibrary();
                const paletteIndex = e.target.classList[1];
                //console.dir(paletteIndex);
                //console.log(typeof (paletteIndex));
                const numP = parseInt(paletteIndex);
                initialColors = [];
                paletteObjects[numP].colors.forEach((color, index) => {
                    initialColors.push(color);

                    colorDivs[index].style.background = color;
                    const text = colorDivs[index].children[0];
                    checkTextContrast(color, text);
                    updateTextUI(index);
                });
                resetInputs();
            });
            // Append to library
            palette.appendChild(title);
            //console.log(palette);
            palette.appendChild(preview);
            palette.appendChild(paletteBtn);
            libraryContainer.children[0].appendChild(palette);
        });
    }
}

getLocal();
randomColors();