/**
 * Append a console element the message
 * @param {string} message
 */
function logConsole(message) {
  const consoleClass = 'console';
  const consoleEl = document.querySelector(`.${consoleClass}`);

  const log = document.createElement('p');
  log.innerText = message;
  consoleEl.appendChild(log);
}

/**
 * Parse the file
 * @param {string} sourceHtml The relative web URI containing the data to parse
 * @returns the data requested
 */
const parseWebPage = (cssSelector, sourceHtml) => {
  const parser = new DOMParser();

  // Parse the text
  let doc = parser.parseFromString(sourceHtml, 'text/html');

  // You can now even select part of that html as you would in the regular DOM
  // Example:
  // const elements = doc.querySelectorAll('#items #details #video-title');//test
  const elements = doc.querySelectorAll(`${cssSelector}`);

  if (elements === null || elements.length === 0) {
    logConsole(`The selector "${cssSelector}" yielded no node from the page.`);
  }
  console.log(elements);

  const resultEl = document.querySelector('.results');
  resultEl.innerHTML = '';
  elements.forEach((element) => {
    const block = document.createElement('article');
    const title = document.createElement('p');
    title.innerText = element.innerText;
    const link = document.createElement('a');
    link.innerText = link.href = element.href;
    block.appendChild(title).appendChild(link);
    resultEl.appendChild(block);
  });
};

/**
 * Build a list of filenames to fetch to shrink
 */
const processeFile = (cssSelector) => {
  var fileInput = document.getElementById('get-file');
  for (i = 0; i < fileInput.files.length; i++) {
    let file = fileInput.files[i];
    // do things with file
    var reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = function (evt) {
      const filesContents = evt.target.result;
      parseWebPage(cssSelector, filesContents);
    };
    reader.onerror = function (evt) {
      throw new Error('error reading file');
    };
  }
};

const startBtn = document.querySelector('button');
startBtn.addEventListener('click', function (event) {
  const cssSelectorInput = document.querySelector('#css-selector');
  if (cssSelectorInput.value === null) {
    logConsole('A selector must be provided...');
  }
  processeFile(cssSelectorInput.value);
});
