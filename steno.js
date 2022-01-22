const BRACKETS = /\{(.*?)\}/g;
const BRACKETS_SPLIT = /\{.*?\}/g;
const PUNCT_CAPS = /^(\.|!|\?)$/;
const PUNCT_SPACE = /^(,|:|;)$/;
const IS_COMMAND = /^#.+?/;
const IS_GLUE = /^&.+?/;

const FOLDING_SUFFIX = ["z", "d", "s", "g"];
const NUMBERS = {
    "#": "",
    "S": "1",
    "T": "2",
    "P": "3",
    "H": "4",
    "A": "5",
    "O": "0",
    "f": "6",
    "p": "7",
    "l": "8",
    "t": "9",
}

const format = {
    attach: 1,
    glue: 1 << 1,
    capitalize: 1 << 2,
    lowercase: 1 << 3,

    reset_caps: ~(1 << 2 | 1 << 3),
}

class Engine {

    constructor() {
        this.strokes = [];
        this.dictionary = dictionary();
        this.longest = 11;
    }

    process_stroke(s) {
        if (s.length < 1) {
            return;
        } else if (s === "*") {
            this.strokes.pop();
        } else {
            this.strokes.push(s);
        }
    }

    translate() {
        let strings = [];
        let formats = [0];

        let i = 0;
        while (i < this.strokes.length) {
            let consumed = 0;
            for (let l = this.longest; l > 0; l--) {
                let s = Math.min(l, this.strokes.length - i);
                let search = this.strokes.slice(i, i + s).join(" ");
                if (search in this.dictionary) {
                    consumed = s;
                    this.process_dict_result(strings, formats, this.dictionary[search]);
                    break;
                }
            }

            // try 1: suffix folding
            if (consumed === 0) {
                suffix_search:
                for (let j = 0; j < FOLDING_SUFFIX.length; j++) {
                    let suffix = FOLDING_SUFFIX[j];
                    if (suffix in this.dictionary) {
                        for (let l = this.longest; l > 0; l--) {
                            let s = Math.min(l, this.strokes.length - i);
                            let search = this.strokes.slice(i, i + s);
                            search[s - 1] = search[s - 1].replace(suffix, "");
                            search = search.join(" ");
                            if (search in this.dictionary) {
                                consumed = s;
                                this.process_dict_result(strings, formats, this.dictionary[search]);
                                this.process_dict_result(strings, formats, this.dictionary[suffix]);
                                break suffix_search;
                            }
                        }
                    }
                }
            }

            // try 2: numbers
            if (consumed === 0) {
                let search = this.strokes[i];
                if (search.includes("#")) {
                    for (const [key, num] of Object.entries(NUMBERS)) {
                        search = search.replace(key, num);
                    }
                    if (search.includes("d")) {
                        search = search.replace("d", "");
                        search = search + search.charAt(search.length - 1);
                    }
                    if (search.includes("eu")) {
                        search = search.replace("eu", "");
                        search = search.split("").reverse().join('');
                    }
                    this.process_dict_result(strings, formats, `{&${search}}`);
                    consumed = 1;
                }
            }

            // last try: failed trans
            if (consumed === 0) {
                strings.push(this.strokes[i]);
                formats.push(0);
                consumed = 1;
            }

            i += consumed;
        }

        let output = "";
        for (let i = 0; i < strings.length; i++) {
            output += this.to_output(strings[i], formats[i]);
        }

        return output;
    }

    process_dict_result(strings, formats, s) {
        let commands = [...s.matchAll(BRACKETS)].map(x => x[1]);
        let texts = s.split(BRACKETS_SPLIT);

        for (let i = 0; i < texts.length; i++) {
            if (texts[i].length > 0) {
                strings.push(texts[i]);
                formats.push(0);
            }
            if (i < commands.length) {
                this.process_command(strings, formats, commands[i]);
            }
        }
    }

    process_command(strings, formats, s) {
        let f = formats.pop();
        let next = 0;
        if (formats.length > strings.length) {
            next = f;
            f = formats.pop();
        }
        switch (s) {
            case "":
                formats.push(0);
                break;

            case "^":
            case "^^":
                formats.push(f | format.attach);
                break;

            case "-|":
                formats.push(f & format.reset_caps | format.capitalize);
                break;

            case ">":
                formats.push(f & format.reset_caps | format.lowercase);
                break;
            
            default:
                if (s.match(PUNCT_CAPS)) {
                    strings.push(s);
                    formats.push(format.attach);
                    formats.push(format.capitalize);
                } else if (s.match(PUNCT_SPACE)) {
                    strings.push(s);
                    formats.push(format.attach);
                    formats.push(0);
                } else if (s.match(IS_COMMAND)) {
                    // Don't know how I'd implement commands in a text box... Figure it out later I guess
                } else if (s.match(IS_GLUE)) {
                    strings.push(s.slice(1));
                    formats.push(formats.length > 0 && formats[formats.length - 1] & format.glue ? f | format.attach | format.glue : f | format.glue);
                    formats.push(0);
                } else {
                    let needs_orthography = false;
                    if (s.startsWith("^")) {
                        s = s.slice(1);
                        f |= format.attach;
                        needs_orthography = true;
                    }
                    if (s.endsWith("^")) {
                        s = s.slice(0, -1);
                        next |= format.attach;
                    }

                    if (needs_orthography && strings.length > 0) {
                        let last = strings.pop();
                        s = apply_orthography(last, s);
                        strings.push(s);
                        formats.push(next);
                    } else {
                        strings.push(s);
                        formats.push(f);
                        formats.push(next);
                    }
                }
        }
    }

    to_output(s, f) {
        if (f & format.capitalize) {
            s = s.charAt(0).toUpperCase() + s.slice(1);
        }
        if (f & format.lowercase) {
            s = s.toLowerCase();
        }
        if (!(f & format.attach)) {
            s = " " + s;
        }
        return s;
    }

}