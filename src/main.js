import "./input.css";

import { evaluate, log10, log10Dependencies } from "mathjs";

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
  updateCalc();
});

buttons.forEach((button) => {
  button.addEventListener("click", (e) => {
    if (getOS() == "iOS" || getOS() == "Android") {
      inputDisplay.value += e.target.getAttribute("data-button");
      updateCalc();
      return;
    } else {
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
        // inputDisplay.setSelectionRange(inputDisplay.selectionStart - 1, inputDisplay.selectionStart - 1);
      }
    }
  });
});

inputDisplay.addEventListener("keyup", () => {
  updateCalc();
});

if (!(getOS() == "iOS" || getOS() == "Android")) {
  inputDisplay.focus();
}

if (!(getOS() == "iOS" || getOS() == "Android")) {
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
    outputDisplay.innerText = "ERROR";
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

  if (mode === "deg") {
    valStr = valStr.replaceAll(/sin\((\d+)\)/g, "sin($1 / 360 * 2 * pi)");
    valStr = valStr.replaceAll(/cos\((\d+)\)/g, "cos($1 / 360 * 2 * pi)");
    valStr = valStr.replaceAll(/tan\((\d+)\)/g, "tan($1 / 360 * 2 * pi)");
  } else if (mode === "grad") {
    valStr = valStr.replaceAll(/sin\((\d+)\)/g, "sin($1 / 400 * 2 * pi)");
    valStr = valStr.replaceAll(/cos\((\d+)\)/g, "cos($1 / 400 * 2 * pi)");
    valStr = valStr.replaceAll(/tan\((\d+)\)/g, "tan($1 / 400 * 2 * pi)");
  }

  valStr = valStr.replaceAll(/log10\((\d+)\)/g, "log($1, 10)");

  devInferredInput.innerText = `Input: ${valStr}`;

  try {
    let evaluation = String(evaluate(valStr));
    devOutput.innerText = `Output: ${evaluation}`;
    if (/^[0-9\.\-\+i\s]+/.test(evaluation) || evaluation.toLowerCase() === "nan" || evaluation === "") {
      outputDisplay.innerText = evaluate(valStr);
    } else {
      outputDisplay.innerText = "";
    }
  } catch {
    outputDisplay.innerText = "";
  }
}

function getOS() {
  var userAgent = window.navigator.userAgent,
    platform = window.navigator?.userAgentData?.platform || window.navigator.platform,
    macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"],
    windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"],
    iosPlatforms = ["iPhone", "iPad", "iPod"],
    os = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = "Mac OS";
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = "iOS";
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = "Windows";
  } else if (/Android/.test(userAgent)) {
    os = "Android";
  } else if (/Linux/.test(platform)) {
    os = "Linux";
  }

  return os;
}
