const layout = {
    "#": [50, 292, 100, 130],
    "S": [50, 432, 100, 130],
    "T": [160, 252, 100, 130],
    "K": [160, 392, 100, 130],
    "P": [270, 227, 100, 130],
    "W": [270, 367, 100, 130],
    "H": [380, 272, 100, 130],
    "R": [380, 412, 100, 130],

    "A": [365, 602, 100, 130],
    "O": [475, 602, 100, 130],

    "*": [490, 272, 293, 270],

    "e": [710, 602, 100, 130],
    "u": [820, 602, 100, 130],

    "f": [793, 272, 100, 130],
    "r": [793, 412, 100, 130],
    "p": [903, 227, 100, 130],
    "b": [903, 367, 100, 130],
    "l": [1013, 252, 100, 130],
    "g": [1013, 392, 100, 130],
    "t": [1123, 292, 100, 130],
    "s": [1123, 432, 100, 130],
    "d": [1233, 292, 100, 130],
    "z": [1233, 432, 100, 130],
}
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const output_display = document.querySelector("#output");
const strokes_display = document.querySelector("#strokes")
const STENO_ORDER = "#STKPWHRAO*eufrpblgtsdz";
const TOUCH_SCALE = 2;
const style = getComputedStyle(document.body);
const COLOR_BG = style.getPropertyValue('--bg');
const COLOR_MG = style.getPropertyValue('--mg');
const COLOR_FG = style.getPropertyValue('--fg');
const COLOR_HL = style.getPropertyValue('--hl');
let currentStroke = new Set();
let engine = new Engine();



function drawLayout() {

    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const [id, coords] of Object.entries(layout)) {

        ctx.fillStyle = currentStroke.has(id) ? COLOR_HL : COLOR_MG;
        ctx.fillRect(...coords);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "24px monospace";
        ctx.fillStyle = COLOR_FG;
        ctx.fillText(id.toUpperCase(), coords[0] + coords[2] / 2, coords[1] + coords[3] / 2);

    }

}

function aabb_aabb(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !(
        x1 > x2 + w2 ||
        x1 + w1 < x2 ||
        y1 > y2 + h2 ||
        y1 + h1 < y2
    );
}

function touchToRect(touch) {
    return [
        touch.pageX - touch.radiusX, touch.pageY - touch.radiusY,
        touch.radiusX * TOUCH_SCALE, touch.radiusY * TOUCH_SCALE,
    ];
}

function touchStart(e) {
    e.preventDefault()

    for (let i = 0; i < e.changedTouches.length; i++) {
        for (const [id, coords] of Object.entries(layout)) {
            if (aabb_aabb(...touchToRect(e.changedTouches[i]), ...coords)) {
                currentStroke.add(id);
            }
        }
    }

    drawLayout();
    ctx.strokeStyle = "#f3e6ca";
    for (let i = 0; i < e.touches.length; i++) {
        ctx.beginPath();
        ctx.rect(...touchToRect(e.touches[i]));
        ctx.stroke();
    }

}

function touchEnd(e) {
    e.preventDefault();
    if (e.touches.length === 0) {

        let converted = [...currentStroke];
        converted.sort((a, b) => STENO_ORDER.indexOf(a) - STENO_ORDER.indexOf(b));
        converted = converted.join("");

        engine.process_stroke(converted);
        output_display.innerHTML = engine.translate();
        output_display.scrollTop = output_display.scrollHeight;

        strokes_display.innerHTML += converted + "\n";
        strokes_display.scrollTop = strokes_display.scrollHeight;

        currentStroke.clear();
        drawLayout();

    }
}



document.getElementById("clear").addEventListener("click", () => {
    if (window.confirm("Really clear?")) {
        engine.strokes = [];
        output_display.innerHTML = "";
        strokes_display.innerHTML = "";
    }
});

document.getElementById("copy-out").addEventListener("click", () => {
    navigator.permissions.query({name: "clipboard-write"}).then(result => {
        if (result.state == "granted" || result.state == "prompt") {
            navigator.clipboard.writeText(output_display.innerText).then(() => {
                strokes_display.innerHTML += "Copied to clipboard\n";
            }, () => {
                strokes_display.innerHTML += "Failed to copy to clipboard\n";
            });
        }
        strokes_display.scrollTop = strokes_display.scrollHeight;
    });
});

canvas.addEventListener("touchstart", touchStart);
canvas.addEventListener("touchend", touchEnd);

drawLayout();
document.querySelector("main").style.opacity = 1;