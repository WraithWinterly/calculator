import "./input.css";

import { create, all } from "mathjs";

import utilsImp from "./utils";

const utils = new utilsImp();

const math = create(all, {});

const buttons = document.querySelectorAll("[data-button]");
const inputDisplay = document.getElementById("input");
const outputDisplay = document.getElementById("output");

const acButton = document.getElementById("ac-button");
const delButton = document.getElementById("del-button");
const equalsButton = document.getElementById("equals-button");
const modeButton = document.getElementById("mode-button");
const copyOutputButton = document.getElementById("copy-output-button");
const advancedButton = document.getElementById("advanced-button");
const inverseButton = document.getElementById("inverse-button");
const devInferredInput = document.getElementById("dev-inferred-input");
const devOutput = document.getElementById("dev-output");

const degDisplay = document.getElementById("deg-display");
const radDisplay = document.getElementById("rad-display");
const gradDisplay = document.getElementById("grad-display");

const advancedSection = document.getElementById("advanced-section");

const inverseButtonGroup = document.querySelectorAll("[data-inv]");

let prevCaretPos = 0;

let mode = "rad";

let inverseMode = false;

inverseButton.addEventListener("click", () => {
  inverseMode = !inverseMode;
  toggleInverse(inverseMode);
});

toggleInverse(false);
setMode("rad");

function toggleInverse(bool) {
  inverseButtonGroup.forEach((button) => {
    if (bool) {
      // Turn on inverse buttons
      if (button.getAttribute("data-inv") === "true") {
        button.classList = "block";
      } else {
        button.classList = "hidden";
      }
    } else {
      // Turn off inverse buttons
      if (button.getAttribute("data-inv") === "false") {
        button.classList = "block";
      } else {
        button.classList = "hidden";
      }
    }
  });
}

inputDisplay.addEventListener("keypress", (e) => {
  if (e.key == "Enter") {
    equalsConfirm();
  }
});

advancedButton.addEventListener("click", () => {
  if (advancedSection.classList.contains("hidden")) {
    advancedSection.classList = "flex flex-col gap-1";
  } else {
    advancedSection.classList = "hidden";
  }
});

copyOutputButton.addEventListener("click", () => {
  // outputDisplay.select();
  // outputDisplay.setSelectionRange(0, 999999);
  navigator.clipboard.writeText(outputDisplay.innerText);
});

function setMode(newMode) {
  if (newMode === "rad" || newMode === "deg" || newMode === "grad") {
    degDisplay.classList = "text-gray-400";
    radDisplay.classList = "text-gray-400";
    gradDisplay.classList = "text-gray-400";
    mode = newMode;
    const elm = document.getElementById(`${mode}-display`);
    elm.classList = "font-bold";
  }
}

modeButton.addEventListener("click", () => {
  if (mode === "rad") {
    setMode("grad");
  } else if (mode === "grad") {
    setMode("deg");
  } else if (mode === "deg") {
    setMode("rad");
  }
  updateCalc();
});

buttons.forEach((button) => {
  button.addEventListener("click", (e) => {
    if (utils.isDesktop()) {
      prevCaretPos = inputDisplay.selectionStart || 0;
      inputDisplay.value = [
        inputDisplay.value.slice(0, prevCaretPos),
        e.target.getAttribute("data-button"),

        button.hasAttribute("data-function") ? ")" : "",
        inputDisplay.value.slice(prevCaretPos),
      ].join("");
      updateCalc();
      inputDisplay.setSelectionRange(
        prevCaretPos + e.target.getAttribute("data-button").length,
        prevCaretPos + e.target.getAttribute("data-button").length
      );
      // if (button.hasAttribute("data-function")) {
      //   inputDisplay.setSelectionRange(inputDisplay.selectionStart - 1, inputDisplay.selectionStart - 1);
      // }
    } else {
      inputDisplay.value += e.target.getAttribute("data-button");
      updateCalc();
      return;
    }
  });
});

inputDisplay.addEventListener("keyup", () => {
  updateCalc();
});

if (utils.isDesktop()) {
  inputDisplay.focus();
}

if (utils.isDesktop()) {
  inputDisplay.addEventListener("blur", (e) => {
    {
      inputDisplay.focus();
    }
  });
}

acButton.addEventListener("click", () => {
  inputDisplay.value = "";
  outputDisplay.innerText = "";
});

delButton.addEventListener("click", () => {
  // If last character of the string is a space
  while (/\s+$/.test(inputDisplay.value)) {
    inputDisplay.value = inputDisplay.value.slice(0, -1);
  }
  inputDisplay.value = inputDisplay.value.slice(0, -1);
  updateCalc();
});

equalsButton.addEventListener("click", () => {
  equalsConfirm();
});

function equalsConfirm() {
  if (outputDisplay.innerText === "" && inputDisplay.value !== "") {
    outputDisplay.innerText = "Error";
    return;
  }
  inputDisplay.value = outputDisplay.innerText;
  outputDisplay.innerText = "";
  updateCalc();
}

function updateCalc() {
  let valStr = inputDisplay.value;
  // Interpert string
  valStr = valStr.replaceAll("√", "sqrt");
  valStr = valStr.replaceAll("π", "(pi)");
  // valStr = valStr.replaceAll(" ", "");
  valStr = valStr.replaceAll(/(\blog\b)/g, "log10");

  valStr = valStr.replaceAll("ln", "log");

  valStr = valStr.replaceAll("**", "^");

  let missingCommas = valStr.split("(").length - valStr.split(")").length;
  for (let i = 0; i < missingCommas; i++) {
    valStr += ")";
  }

  // If last character of the string is a operator
  const regexpFinalCharIsOperator = /[+\-*/^]$/;
  while (regexpFinalCharIsOperator.test(valStr)) {
    valStr = valStr.slice(0, -1);
  }

  // valStr = valStr.replaceAll(/log10\((\d+)\)/g, "log($1, 10)");

  devInferredInput.innerText = valStr;

  try {
    let evaluation = String(math.evaluate(valStr));
    devOutput.innerText = evaluation;
    if (
      /^[0-9\.\-\+i\s]+/.test(evaluation) ||
      evaluation.toLowerCase() === "nan" ||
      evaluation.toLowerCase() === "true" ||
      evaluation.toLowerCase() === "false" ||
      evaluation === ""
    ) {
      const ev = math.evaluate(valStr);
      outputDisplay.innerText = math.format(ev, { precision: 16 });
    } else {
      outputDisplay.innerText = "";
    }
  } catch {
    devOutput.innerText = `Output: Error`;
    outputDisplay.innerText = "";
  }
}

let replacements = {};

// create trigonometric functions replacing the input depending on angle config
const fns1 = ["sin", "cos", "tan", "sec", "cot", "csc"];

fns1.forEach(function (name) {
  const fn = math[name]; // the original function

  const fnNumber = function (x) {
    // convert from configured type of angles to radians
    switch (mode) {
      case "deg":
        return fn((x / 360) * 2 * Math.PI);
      case "grad":
        return fn((x / 400) * 2 * Math.PI);
      default:
        return fn(x);
    }
  };

  // create a typed-function which check the input types
  replacements[name] = math.typed(name, {
    number: fnNumber,
    "Array | Matrix": function (x) {
      return math.map(x, fnNumber);
    },
  });
});

// create trigonometric functions replacing the output depending on angle config
const fns2 = ["asin", "acos", "atan", "atan2", "acot", "acsc", "asec"];
fns2.forEach(function (name) {
  const fn = math[name]; // the original function

  const fnNumber = function (x) {
    const result = fn(x);

    if (typeof result === "number") {
      // convert to radians to configured type of angles
      switch (mode) {
        case "deg":
          return (result / 2 / Math.PI) * 360;
        case "grad":
          return (result / 2 / Math.PI) * 400;
        default:
          return result;
      }
    }

    return result;
  };

  // create a typed-function which check the input types
  replacements[name] = math.typed(name, {
    number: fnNumber,
    "Array | Matrix": function (x) {
      return math.map(x, fnNumber);
    },
  });
});

// import all replacements into math.js, override existing trigonometric functions
math.import(replacements, { override: true });
