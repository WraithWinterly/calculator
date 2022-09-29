import "./input.css";

import { create, all } from "mathjs";

import utilsImp from "./utils";

const utils = new utilsImp();

const math = create(all, {});

const buttons = document.querySelectorAll("[data-button]");
const inputDisplay = document.getElementById("input");
const outputDisplay = document.getElementById("output");

const acButton = document.getElementById("ac");
const delButton = document.getElementById("del");
const equals = document.getElementById("equals");

const modeButton = document.getElementById("mode-button");

const devInferredInput = document.getElementById("dev-inferred-input");
const devOutput = document.getElementById("dev-output");

let prevCaretPos = 0;

let mode = "rad";

const setMode = (newMode) => {
  if (newMode === "rad" || newMode === "deg" || newMode === "grad") {
    document.getElementById("rad").classList = "text-gray-400";
    document.getElementById("deg").classList = "text-gray-400";
    document.getElementById("grad").classList = "text-gray-400";
    document.getElementById(newMode).classList = "font-bold";
    mode = newMode;
  }
};

setMode("rad");

modeButton.addEventListener("click", () => {
  if (mode === "rad") {
    setMode("grad");
  } else if (mode === "grad") {
    setMode("deg");
  } else if (mode === "deg") {
    setMode("rad");
  }
  console.log("update");
  updateCalc();
});

buttons.forEach((button) => {
  button.addEventListener("click", (e) => {
    console.log(utils);
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
      if (button.hasAttribute("data-function")) {
        console.log("is func");
        inputDisplay.setSelectionRange(inputDisplay.selectionStart - 1, inputDisplay.selectionStart - 1);
      }
      console.log("is desk");
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

equals.addEventListener("click", () => {
  if (outputDisplay.innerText === "" && inputDisplay.value !== "") {
    outputDisplay.innerText = "Error";
    return;
  }
  inputDisplay.value = outputDisplay.innerText;
  outputDisplay.innerText = "";
});

function updateCalc() {
  let valStr = inputDisplay.value;
  // Interpert string
  valStr = valStr.replaceAll("√", "sqrt");
  valStr = valStr.replaceAll("π", "(pi)");
  valStr = valStr.replaceAll(" ", "");
  valStr = valStr.replaceAll("ln", "log");

  valStr = valStr.replaceAll("**", "^");

  let missingCommas = valStr.split("(").length - valStr.split(")").length;
  for (let i = 0; i < missingCommas; i++) {
    valStr += ")";
  }

  // If last character of the string is a operator
  while (/[+\-*/^]$/.test(valStr)) {
    valStr = valStr.slice(0, -1);
  }

  valStr = valStr.replaceAll(/log10\((\d+)\)/g, "log($1, 10)");

  devInferredInput.innerText = valStr;

  try {
    let evaluation = String(math.evaluate(valStr));
    devOutput.innerText = evaluation;
    if (/^[0-9\.\-\+i\s]+/.test(evaluation) || evaluation.toLowerCase() === "nan" || evaluation === "") {
      outputDisplay.innerText = math.evaluate(valStr);
    } else {
      outputDisplay.innerText = "";
    }
  } catch {
    devOutput.innerText = `Output: Error`;
    outputDisplay.innerText = "";
  }
}

// config

let replacements = {};

// our extended configuration options
const config = {
  angles: "deg", // 'rad', 'deg', 'grad'
};

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
