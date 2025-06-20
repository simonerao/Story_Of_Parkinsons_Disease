import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import { latencies as oldLatencies } from './typing-test.js';

let words;

let personid = "8TEUUGQBYB";
d3.select('#person-select-2')
    .on('change', (event) => {
        personid = event.target.value;
        resetTest(words);
    });

let wordcount = parseInt("10");
d3.select('#word-count-2')
    .on('change', (event) => {
        wordcount = parseInt(event.target.value);
        resetTest(words);
    });

function getWords(text) {
    return text.split('\n').map(word => word.trim()).filter(Boolean);
}

function resetTest(words) {
    d3.select("#input-2").property("value", "");
    d3.select('#blur-overlay-2').style('display', 'flex')

    // Clear results and latency chart
    d3.select("#result-2").text("");
    d3.select("#time-taken-line").html("");

    // Clear sentence and caret
    d3.select("#sentence-2").html("");

    // Reset state variables (if global)
    latencies = [];
    timestamps = [];
    ghostIndex = 0;
    currentUnlockedIndex = 0;

    // Recreate test with a new sentence
    createTypingTest(words);
}

function calculateDelayArray(chars, personid) {
    const users = {
        '5USOYSDCXB': {'LL': 175.8, 'LR': 125.0, 'LS': 125.0, 'RL': 125.0, 'RR': 187.5, 'RS': 156.3, 'SL': 140.6, 'SR': 156.3, 'SS': 210.95},
        '8TEUUGQBYB': {'LL': 312.5, 'LR': 402.3, 'LS': 382.8, 'RL': 429.7, 'RR': 281.3, 'RS': 390.6, 'SL': 406.3, 'SR': 426.8, 'SS': 217.8},
        'E0TBSMYHQI': {'LL': 312.5, 'LR': 320.3, 'LS': 363.3, 'RL': 421.9, 'RR': 335.9, 'RS': 382.8, 'SL': 382.8, 'SR': 398.4, 'SS': 179.7},
        'I3U47MF5UF': {'LL': 222.7, 'LR': 148.4, 'LS': 154.3, 'RL': 171.9, 'RR': 187.5, 'RS': 187.5, 'SL': 128.9, 'SR': 148.4, 'SS': 250.0},
        'IDZHIUK2W2': {'LL': 205.05, 'LR': 156.3, 'LS': 191.4, 'RL': 175.8, 'RR': 214.8, 'RS': 289.1, 'SL': 199.2, 'SR': 234.4, 'SS': 589.8},
        'JHBOKKHOQW': {'LL': 285.2, 'LR': 230.5, 'LS': 300.8, 'RL': 269.5, 'RR': 269.5, 'RS': 358.0, 'SL': 246.1, 'SR': 273.4, 'SS': 199.2},
        'LIOUUNGQ8Q': {'LL': 421.9, 'LR': 503.9, 'LS': 416.05, 'RL': 570.3, 'RR': 464.8, 'RS': 429.7, 'SL': 480.5, 'SR': 593.8, 'SS': 359.4},
        'LSQWWDXEYO': {'LL': 328.1, 'LR': 246.1, 'LS': 300.8, 'RL': 250.0, 'RR': 281.3, 'RS': 335.9, 'SL': 250.0, 'SR': 328.1, 'SS': 224.65},
        'QEYNMBJ8T0': {'LL': 253.9, 'LR': 235.35, 'LS': 230.5, 'RL': 238.3, 'RR': 269.5, 'RS': 250.95, 'SL': 235.35, 'SR': 300.8, 'SS': 281.3},
        'SGT8K5GXG0': {'LL': 298.85, 'LR': 335.9, 'LS': 240.2, 'RL': 269.5, 'RR': 359.4, 'RS': 312.5, 'SL': 328.1, 'SR': 429.7, 'SS': 398.45},
        'TL2XHTLK1T': {'LL': 265.6, 'LR': 418.0, 'LS': 390.6, 'RL': 421.9, 'RR': 310.5, 'RS': 347.7, 'SL': 375.0, 'SR': 359.4, 'SS': 183.6},
        'UDCY90VKYN': {'LL': 203.1, 'LR': 179.7, 'LS': 183.6, 'RL': 152.3, 'RR': 230.5, 'RS': 214.8, 'SL': 257.8, 'SR': 277.3, 'SS': 183.6},
        'V2SZVYXBOD': {'LL': 265.6, 'LR': 265.6, 'LS': 218.8, 'RL': 273.4, 'RR': 328.1, 'RS': 363.3, 'SL': 265.6, 'SR': 375.0, 'SS': 300.8},
        'VCTVD6LMPK': {'LL': 390.6, 'LR': 250.0, 'LS': 375.0, 'RL': 421.9, 'RR': 291.05, 'RS': 484.4, 'SL': 521.45, 'SR': 468.8, 'SS': 203.1},
        'WDNE1Q9EHT': {'LL': 230.5, 'LR': 152.3, 'LS': 203.1, 'RL': 171.9, 'RR': 207.0, 'RS': 246.1, 'SL': 160.2, 'SR': 187.5, 'SS': 169.95},
        'XWAX2IHF3O': {'LL': 132.8, 'LR': 168.0, 'LS': 162.1, 'RL': 136.7, 'RR': 226.6, 'RS': 265.6, 'SL': 162.1, 'SR': 277.3, 'SS': 117.2},
    };

    const userLatency = users[personid];
    const leftLetters = new Set([...'QWERTASDFGZXCVB']);
    let delayArray = [];

    for (let i = 0; i < chars.length - 1; i++) {
        let direction = '';

        [i, i + 1].forEach(j => {
            if (chars[j] === ' ') {
                direction += 'S';
            } else if (leftLetters.has(chars[j])) {
                direction += 'L';
            } else {
                direction += 'R';
            }
        });
        delayArray.push(userLatency[direction]);
    }
    
    return delayArray;
}

function generateRandomSentence(words, n_words) {
    let sentence_words = [];
    for (let i = 0; i < n_words; i++) {
        const word = words[Math.floor(Math.random() * words.length)];
        sentence_words.push(word);
    }
    return sentence_words.join(' ');
}

let latencies;
let timestamps;

let currentUnlockedIndex = 0;

function unlockNextLetter(ghostIndex, delayArray, sentence, spans) {
    currentUnlockedIndex++;

    if (currentUnlockedIndex < sentence.length) {
        const span = spans[currentUnlockedIndex];
        if (span) {
            span.classList.remove('locked');
            span.classList.add('unlocked');
        }

        const ghostDelay = delayArray[ghostIndex] * (Math.random() / 2 + 1);
        ghostIndex++;

        setTimeout(() => unlockNextLetter(ghostIndex, delayArray, sentence, spans), ghostDelay);
    }
}

function plotTimeTakenLine() {
    const rollingLatencies = [];
    let oldRollingLatencies = [];

    let sum = 0;
    for (let i = 0; i < latencies.length; i++) {
        sum += latencies[i];
        rollingLatencies.push(sum);
    }
    const data = rollingLatencies.map((latency, i) => ({ index: i + 1, latency: latency / 1000 }));

    if (oldLatencies !== undefined) {
        sum = 0;
        for (let i = 0; i < oldLatencies.length; i++) {
            sum += oldLatencies[i];
            oldRollingLatencies.push(sum);
        }
    }
    const oldData = oldRollingLatencies.map((latency, i) => ({ index: i + 1, latency: latency / 1000 }));

    const margin = { top: 10, right: 20, bottom: 60, left: 60 };
    const width = 700 - margin.left - margin.right;
    const height = 250;

    const svg = d3.select("#result-2")
        .html("") // Clear previous chart
        .append("svg")
        .attr("id", "time-taken-line")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleLinear()
        .domain([1, d3.max([data.length, oldData.length])])
        .range([0, width - 80]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.latency)])
        .nice()
        .range([height, 0]);

    const line = d3.line()
        .x(d => x(d.index))
        .y(d => y(d.latency));

    const colors = ['#FFC857', '#384E77'];

    // Draw X axis
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(Math.min(10, data.length)))
        .append("text")
        .attr("class", "x label")
        .attr("x", (width - 65) / 2)
        .attr("y", 40)
        .attr("fill", "#000")
        .attr("text-anchor", "middle")
        .text("Character Index");

    // Draw Y axis
    svg.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("class", "y label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -45)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .attr("text-anchor", "middle")
        .text("Time Taken (s)");

    svg.append("g")
            .attr("class", "grid")
            .call(
                d3.axisLeft(y)
                    .ticks(5)  // adjust as needed
                    .tickSize(-width + 80)  // full-width lines
                    .tickFormat("")    // no text
            );

    // Draw lines
    [data, oldData].forEach((points, i) => {
        svg.append("path")
            .datum(points)
            .attr("fill", "none")
            .attr("stroke", colors[i])
            .attr("stroke-width", 2.5)
            .attr("d", line);
    });

    const legendData = [
        { label: "Restriction", color: colors[0] },
        { label: "No Restriction", color: colors[1] }
    ];

    const legend = svg.append("g")
        .attr("transform", `translate(${width - 65}, 0)`);  // Adjust position as needed

    legendData.forEach((entry, i) => {
        const legendRow = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);

        legendRow.append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", entry.color);

        legendRow.append("text")
            .attr("x", 18)
            .attr("y", 10)
            .attr("fill", "#000")
            .style("font-size", "10px")
            .text(entry.label);
    });
}

function createResults() {
    plotTimeTakenLine();
}

let ghostIndex;

function createTypingTest(words) {
    const sentence = generateRandomSentence(words, wordcount);

    let sentenceDiv = d3.select('#sentence-2');
    const input = d3.select('#input-2').property("value", "");
    const overlay = d3.select('#blur-overlay-2');

    currentUnlockedIndex = 0; // Reset unlock index
    ghostIndex = 0;

    overlay.on('click', () => {
        overlay.style('display', 'none');
        input.node().focus();
        latencies = [];
        timestamps = [];
    });

    sentenceDiv.html('');
    sentence.split('').forEach((char, i) => {
        sentenceDiv.append('span')
            .attr('id', `letter-${i}`)
            .attr('data-char', char)
            .attr('class', i === 0 ? 'unlocked' : 'locked')
            .text(char);
    });

    let spans = sentenceDiv.selectAll('span').nodes();

    const caretSpan = d3.select('#test-container-2')
        .append('span')
        .attr('class', 'caret-2')
        .attr('id', 'start');
    spans[0].before(caretSpan.node());

    let startTime = null;
    let ended = false;
    let delayArray;

    input.on("keydown", (event) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

        if (ctrlKey && event.key === "Backspace") {
            event.preventDefault(); // block Ctrl+Backspace
        }

        const now = performance.now();

        if (event.key === "Backspace") {
            if (ghostIndex > 0) ghostIndex--;

            // Handle latency arrays
            if (timestamps.length > 1) {
                timestamps.pop();
                latencies.pop();
            } else if (timestamps.length === 1) {
                timestamps.pop();
            }

            // Revert the span at the deleted position
            const deletedIndex = input.property("value").length - 1;
            const span = d3.select(`#letter-${deletedIndex}`).node();

            if (span) {
                span.classList.remove('correct', 'incorrect');
                if (deletedIndex <= currentUnlockedIndex) {
                    span.classList.add('unlocked');
                } else {
                    span.classList.add('locked');
                }

                // Restore original character (handle space + underscore)
                const originalChar = span.dataset.char || span.textContent;
                span.textContent = originalChar === ' ' ? ' ' : originalChar;
            }
        } else {
            // Record timing
            timestamps.push(now);
            if (timestamps.length > 1) {
                const diff = timestamps[timestamps.length - 1] - timestamps[timestamps.length - 2];
                latencies.push(diff);
            }
        }
    });

    input.on("input", () => {
        const typed = input.property("value");

        // Prevent typing ahead of unlocked letters
        if (typed.length - 1 > currentUnlockedIndex) {
            input.property("value", typed.slice(0, currentUnlockedIndex + 1));
            return;
        }

        if (!startTime) {
            startTime = new Date();
            ghostIndex = 1;
            delayArray = calculateDelayArray(sentence.split(''), personid);
            unlockNextLetter(ghostIndex, delayArray, sentence, spans);
        }

        // Mark correctness without overriding unlocked/locked classes
        spans.forEach((span, i) => {
            const expected = span.dataset.char;
            const actual = typed[i];

            if (actual == null) {
                // Do not remove locked/unlocked class
                span.textContent = expected;
                return;
            }

            if (actual === expected) {
                span.classList.add('correct');
                span.textContent = expected;
            } else {
                span.classList.add('incorrect');
                if (expected === ' ') {
                    span.textContent = '_'; // red underscore
                } else {
                    span.textContent = expected;
                }
            }
        });

        // Add caret
        const caretIndex = typed.length;
        d3.selectAll('.caret-2').remove();
        caretSpan.attr('id', 'typing...');

        if (caretIndex < spans.length) {
            spans[caretIndex].before(caretSpan.node());
        } else {
            spans[spans.length - 1].after(caretSpan.node());
        }

        if (!d3.select('#time-taken-line').empty()) {
            plotTimeTakenLine();
        }

        if (typed.length === sentence.length && !ended) {
            ended = true;
            input.node().blur();
            createResults();
        }
    });
}

await fetch('data/words.txt')
    .then(response => response.text())
    .then((text) => {
        words = getWords(text);
        d3.select('#reset-2')
            .on('click', () => {
                resetTest(words);
            });
        createTypingTest(words);
    })