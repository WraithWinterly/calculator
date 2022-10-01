import "./input.css";

import { create, all, ConstantNodeDependencies } from "mathjs";

import utilsFunc from "./utils";

const utils = new utilsFunc();

const math = create(all, {});

const buttons = {
  ac: document.getElementById("ac-button"),
  del: document.getElementById("del-button"),
  equals: document.getElementById("equals-button"),
  cycleMode: document.getElementById("mode-button"),
  copyOutput: document.getElementById("copy-output-button"),
  advanced: document.getElementById("advanced-button"),
  inverse: document.getElementById("inverse-button"),
};

const modeButtons = {
  deg: document.getElementById("deg-button"),
  rad: document.getElementById("rad-button"),
  grad: document.getElementById("grad-button"),
};

const modes = ["deg", "rad", "grad"];

const inputDisplay = document.getElementById("input");
const outputDisplay = document.getElementById("output");
const advancedSection = document.getElementById("advanced-section");

const dev_inputToMathJS = document.getElementById("dev-inferred-input");
const dev_mathJsRawOutput = document.getElementById("dev-output");

let currentMode = "rad";

let prevCaretPos = 0;

let inverseMode = false;

onLoad();

function onLoad() {
  setupModes();
  setupInputDisplay();
  setupInverseButton();
  setupAdvancedButton();
  setupEqualsButton();
  setupCalculatorButtons();
  setupAcButton();
  setupDelButton();
  setupCopyOutputButton();

  setupMathJsModeConfig();
}

// Modes
function setupModes() {
  modeButtons.deg.addEventListener("click", () => setMode("deg"));
  modeButtons.rad.addEventListener("click", () => setMode("rad"));
  modeButtons.grad.addEventListener("click", () => setMode("grad"));

  buttons.cycleMode.addEventListener("click", () => {
    if (currentMode === "rad") {
      setMode("grad");
    } else if (currentMode === "grad") {
      setMode("deg");
    } else if (currentMode === "deg") {
      setMode("rad");
    }
  });

  setMode("rad");
}

function setMode(newMode) {
  if (modes.includes(newMode)) {
    const defaultClassList = "text-gray-400 cursor-pointer";
    modes.forEach((mode) => {
      modeButtons[mode].classList = defaultClassList;
    });

    currentMode = newMode;
    const newModeButton = modeButtons[newMode];
    newModeButton.classList = "font-bold";
    updateCalc();
  }
}

// Inverse Button
function setupInverseButton() {
  buttons.inverse.addEventListener("click", () => {
    inverseMode = !inverseMode;

    toggleInverse(inverseMode);
  });

  toggleInverse(false);
}

function toggleInverse(toggleOn) {
  // Color change if active
  if (toggleOn) {
    buttons.inverse.classList.add("active");
  } else {
    buttons.inverse.classList.remove("active");
  }

  const setShowState = (isShowing, btn) => {
    if (isShowing) {
      btn.classList.remove("hidden");
      btn.classList.add("block");
    } else {
      btn.classList.remove("block");
      btn.classList.add("hidden");
    }
  };

  const inverseButtonGroup = document.querySelectorAll("[data-inv]");

  inverseButtonGroup.forEach((button) => {
    const isInverseButton = button.getAttribute("data-inv") === "true";
    setShowState(toggleOn === isInverseButton, button);
  });
}

// Input Display
function setupInputDisplay() {
  inputDisplay.addEventListener("keyup", (e) => {
    if (e.key == "Enter") {
      equalsConfirm();
      return;
    }
    updateCalc();
  });

  if (utils.isDesktop()) {
    inputDisplay.focus();
  }

  if (utils.isDesktop()) {
    inputDisplay.addEventListener("blur", (e) => {
      inputDisplay.focus();
    });
  }
  inputDisplay.classList.remove("focus:border-green-600");
  inputDisplay.classList.remove("focus:border-red-200");
}

function inputDisplayFlash(success) {
  inputDisplay.classList.remove("transition-colors");
  inputDisplay.classList.add("transition-none");
  inputDisplay.classList.add(success ? "focus:border-green-600" : "focus:border-red-200");
  setTimeout(() => {
    inputDisplay.classList.remove("transition-none");
    inputDisplay.classList.add("transition-colors");
    inputDisplay.classList.remove(success ? "focus:border-green-600" : "focus:border-red-200");
  }, 200);
}

function setupAdvancedButton() {
  buttons.advanced.addEventListener("click", () => {
    if (advancedSection.classList.contains("hidden")) {
      advancedSection.classList.remove("hidden");
      buttons.advanced.classList.add("active");
    } else {
      buttons.advanced.classList.remove("active");
      advancedSection.classList.add("hidden");
      toggleInverse(false);
    }
  });
}
function setupCopyOutputButton() {
  buttons.copyOutput.addEventListener("click", () => {
    // outputDisplay.select();
    // outputDisplay.setSelectionRange(0, 999999);
    navigator.clipboard.writeText(outputDisplay.innerText);
  });
}

function setupCalculatorButtons() {
  document.querySelectorAll("[data-button]").forEach((button) => {
    button.addEventListener("click", (e) => {
      if (utils.isDesktop()) {
        prevCaretPos = inputDisplay.selectionStart || 0;
        inputDisplay.value = [
          inputDisplay.value.slice(0, prevCaretPos),
          e.target.getAttribute("data-button"),
          inputDisplay.value.slice(prevCaretPos),
        ].join("");
        updateCalc();
      } else {
        inputDisplay.value += e.target.getAttribute("data-button");
        updateCalc();
        return;
      }
    });
  });
}

function setupAcButton() {
  buttons.ac.addEventListener("click", () => {
    inputDisplay.value = "";
    outputDisplay.innerText = "";
  });
}
function setupDelButton() {
  buttons.del.addEventListener("click", () => {
    // If last character of the string is a space
    const regexpLastCharIsStr = /\s+$/;
    while (regexpLastCharIsStr.test(inputDisplay.value)) {
      inputDisplay.value = inputDisplay.value.slice(0, -1);
    }

    const funcs = document.querySelectorAll("[data-function]");
    const funcDatas = [];
    funcs.forEach((func) => {
      funcDatas.push(func.getAttribute("data-button"));
    });

    const val = inputDisplay.value;
    console.log(val.substring(inputDisplay.selectionStart, inputDisplay.selectionStart - 4));

    inputDisplay.value = inputDisplay.value.slice(0, -1);
    updateCalc();
  });
}

function setupEqualsButton() {
  buttons.equals.addEventListener("click", () => {
    equalsConfirm();
  });
}

function equalsConfirm() {
  if (outputDisplay.innerText === "" && inputDisplay.value !== "") {
    outputDisplay.innerText = "Error";
    inputDisplayFlash(false);

    return;
  }
  if (outputDisplay.innerText === "Error") {
    inputDisplayFlash(false);

    return;
  }
  inputDisplay.value = outputDisplay.innerText;
  inputDisplay.value = inputDisplay.value.replaceAll("°F", "far");
  inputDisplay.value = inputDisplay.value.replaceAll("°C", "cel");
  outputDisplay.innerText = "";
  updateCalc();
  inputDisplayFlash(true);
}

function updateCalc() {
  let valStr = inputDisplay.value;
  // Interpert string
  valStr = valStr.replaceAll("√", "sqrt");
  valStr = valStr.replaceAll("π", "(pi)");

  valStr = valStr.replaceAll(/(log\b)/g, "log10");
  valStr = valStr.replaceAll(/(far\b)/g, "fahrenheit");
  valStr = valStr.replaceAll(/(cel\b)/g, "celsius");
  valStr = valStr.replaceAll(/(kel\b)/g, "kelvin");

  valStr = valStr.replaceAll("ln", "log");

  valStr = valStr.replaceAll("**", "^");

  const missingCommas = valStr.split("(").length - valStr.split(")").length;

  for (let i = 0; i < missingCommas; i++) {
    valStr += ")";
  }

  // If last character of the string is a operator
  const regexpFinalCharIsOperator = /[+\-*/^]$/;
  while (regexpFinalCharIsOperator.test(valStr)) {
    valStr = valStr.slice(0, -1);
  }

  dev_inputToMathJS.innerText = valStr;

  try {
    const evaluation = math.evaluate(valStr);
    dev_mathJsRawOutput.innerText = evaluation;

    const regexpIsNumberOrComplexNumber = /^[0-9\.\-\+i\s]+/;
    const allowedValues = ["Infinity", "NaN", "Error", "", "true", "false"];
    const hasAllowedValue = allowedValues.includes(evaluation);
    const formattedAnswer = math.format(evaluation, { precision: 12 });

    if (regexpIsNumberOrComplexNumber.test(evaluation) || hasAllowedValue) {
      console.log(formattedAnswer);
      outputDisplay.innerText = formattedAnswer;
      outputDisplay.innerText = outputDisplay.innerText.replaceAll("fahrenheit", "°F");
      outputDisplay.innerText = outputDisplay.innerText.replaceAll("celsius", "°C");
      outputDisplay.innerText = outputDisplay.innerText.replaceAll('"', "");
    } else {
      outputDisplay.innerText = "";
    }
  } catch {
    dev_mathJsRawOutput.innerText = "Error";
    outputDisplay.innerText = "";
  }
}

function setupMathJsModeConfig() {
  let replacements = {};

  // Create trigonometric functions replacing the input depending on angle config
  const trigFuncs = ["sin", "cos", "tan", "sec", "cot", "csc"];

  trigFuncs.forEach((name) => {
    const fn = math[name]; // The original function

    const fnNumber = function (x) {
      // Convert from configured type of angles to radians
      switch (currentMode) {
        case "deg":
          return fn((x / 360) * 2 * Math.PI);
        case "grad":
          return fn((x / 400) * 2 * Math.PI);
        default:
          return fn(x);
      }
    };

    // Create a typed-function which check the input types
    replacements[name] = math.typed(name, {
      number: fnNumber,
      "Array | Matrix": function (x) {
        return math.map(x, fnNumber);
      },
    });
  });

  const inverseTrigFuncs = ["asin", "acos", "atan", "atan2", "acot", "acsc", "asec"];
  inverseTrigFuncs.forEach((name) => {
    const fn = math[name];

    const fnNumber = function (x) {
      const result = fn(x);

      if (typeof result === "number") {
        switch (currentMode) {
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

    // Create a typed-function which check the input types
    replacements[name] = math.typed(name, {
      number: fnNumber,
      "Array | Matrix": function (x) {
        return math.map(x, fnNumber);
      },
    });
  });

  // Import all replacements into math.js, override existing trigonometric functions
  math.import(replacements, { override: true });

  var originalDivide = math.divide;
  math.import(
    {
      divide: function (a, b) {
        if (math.isZero(b)) {
          return "Error";
        }
        return originalDivide(a, b);
      },
    },
    { override: true }
  );
}
