const enableMarkdown = document.querySelector('#enable-markdown');
console.log('enableMarkdown', enableMarkdown.checked);

enableMarkdown.addEventListener('change', (event) => {
  console.log('enableMarkdown', enableMarkdown.checked);
});

const downloadJson = document.querySelector('#download-json');
console.log('downloadJson', downloadJson.checked);

downloadJson.addEventListener('change', (event) => {
  console.log('downloadJson', downloadJson.checked);
});

const downloadCsv = document.querySelector('#download-csv');
console.log('downloadCsv', downloadCsv.checked);

downloadCsv.addEventListener('change', (event) => {
  console.log('downloadCsv', downloadCsv.checked);
});

const downloadMarkdown = document.querySelector('#download-md');
console.log('downloadMarkdown', downloadMarkdown.checked);

downloadMarkdown.addEventListener('change', (event) => {
  console.log('downloadMarkdown', downloadMarkdown.checked);
});

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

const makeMarkdown = (nodes) => {
  const cssSelectors = getCssSelectors();
  const markdownArr = [];
  nodes.forEach((element) => {
    const title = element.querySelector(cssSelectors.child1);
    const published = element.querySelector(cssSelectors.child2);
    markdownArr.push(`## ${title.innerText}\r\n\r\n`);
    markdownArr.push(
      `**Lien:** [visionner sur YouTube](${title.href})\r\n\r\n`,
    );
  });
  return markdownArr;
};
const parseWebPageToMarkdown = (resultEl, nodes) => {
  const textArea = document.createElement('textarea');
  textArea.width = '100%';
  const markdownArr = makeMarkdown(nodes);
  markdownArr.forEach((line) => {
    textArea.append(line);
  });
  resultEl.appendChild(textArea);
};

const parseWebPageToHtml = (resultEl, nodes) => {
  nodes.forEach((element) => {
    const block = document.createElement('article');
    const title = document.createElement('p');
    title.innerText = element.innerText;
    const link = document.createElement('a');
    link.innerText = link.href = element.href;
    block.appendChild(title).appendChild(link);
    resultEl.appendChild(block);
  });
};
const downloadFile = (fileName, content, format) => {
  const encodedContent = new TextEncoder().encode(content);

  // (A) CREATE BLOB OBJECT
  var fileBlob = new Blob([encodedContent], { type: format });

  // (B) CREATE DOWNLOAD LINK
  var url = window.URL.createObjectURL(fileBlob);
  var anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${fileName}`;
  document.body.appendChild(anchor);
  // (C) "FORCE DOWNLOAD"
  // NOTE: MAY NOT ALWAYS WORK DUE TO BROWSER SECURITY
  // BETTER TO LET USERS CLICK ON THEIR OWN
  anchor.click();
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    document.body.removeChild(anchor);
  }, 0);
};

const makeJson = (nodes) => {
  const cssSelectors = getCssSelectors();
  const jsonArray = [];
  nodes.forEach((element) => {
    const title = element.querySelector(cssSelectors.child1);
    const published = element.querySelector(cssSelectors.child2);

    const obj = {};
    obj['Title'] = title.innerText;
    obj['VlogLink'] = title.href;
    obj['State'] = false;
    obj['Published'] = published.innerText;
    jsonArray.push(JSON.stringify(obj, null, 2));
  });

  const json = `[${jsonArray.join(',')}]`;
  console.log(json);
  return json;
};

const makeCsv = (nodes) => {
  const cssSelectors = getCssSelectors();
  const csvArray = [];

  nodes.forEach((element) => {
    const title = element.querySelector(cssSelectors.child1);
    const published = element.querySelector(cssSelectors.child2);

    let line = '';
    line += `"${title.innerText.replace('"', '').replace(';', ' -').trim()}";`;
    line += ``;
    line += `"${title.href}";`;
    line += `"${published.innerText.trim()}";`;
    csvArray.push(line);
  });
  const sortedArr = csvArray.sort();
  sortedArr.unshift('Title;State;VlogLink;Published'); //add headers first
  const csv = csvArray.join('\r\n');
  console.log(csv);
  return csv;
};

/**
 * Parse the file
 * @param {string} sourceHtml The relative web URI containing the data to parse
 * @returns the data requested
 */
const parseWebPage = (fileName, sourceHtml) => {
  const parser = new DOMParser();

  // Parse the text
  let doc = parser.parseFromString(sourceHtml, 'text/html');

  // You can now even select part of that html as you would in the regular DOM
  // Example:
  // const elements = doc.querySelectorAll('#items #details #video-title');//test
  // published = #metadata-line > span:nth-child(2)
  const cssSelectors = getCssSelectors();
  const elements = doc.querySelectorAll(`${cssSelectors.parent}`);

  if (elements === null || elements.length === 0) {
    logConsole(
      `The selector "${cssSelectors.parent}" yielded no node from the page.`,
    );
  }
  console.log(elements);

  const enableMarkdown = document.querySelector('#enable-markdown');
  const resultEl = document.querySelector('.results');
  resultEl.innerHTML = '';
  const outputFileName = fileName.replace('-channel.htm', '');
  if (downloadJson.checked) {
    const content = makeJson(elements);
    downloadFile(
      `${outputFileName}.json`,
      content,
      'application/json;charset=utf-8',
    );
  }
  if (downloadCsv.checked) {
    const content = makeCsv(elements);
    downloadFile(`${outputFileName}.csv`, content, 'text/plain;charset=utf-8');
  }
  if (downloadMarkdown.checked) {
    const contentArr = makeMarkdown(elements);
    downloadFile(
      `${outputFileName}.md`,
      contentArr.join('\r\n', ''),
      'text/plain;charset=utf-8',
    );
  }
  if (enableMarkdown.checked) {
    parseWebPageToMarkdown(resultEl, elements);
    return;
  }

  parseWebPageToHtml(resultEl, elements);
};

/**
 * Build a list of filenames to fetch to shrink
 */
const processeFile = () => {
  var fileInput = document.getElementById('get-files');
  for (i = 0; i < fileInput.files.length; i++) {
    let file = fileInput.files[i];
    // do things with file
    var reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = function (evt) {
      const filesContents = evt.target.result;
      parseWebPage(file.name, filesContents);
    };
    reader.onerror = function (evt) {
      throw new Error('error reading file');
    };
  }
};

const getCssSelectors = () => {
  const cssSelectorInput = document.querySelector('#css-selector');
  if (cssSelectorInput.value === null) {
    logConsole('A selector must be provided...');
    return;
  }
  const cssSelectorChild1Input = document.querySelector('#css-selector-child1');
  if (cssSelectorChild1Input.value === null) {
    logConsole('A child 1 selector must be provided...');
    return;
  }
  const cssSelectorChild2Input = document.querySelector('#css-selector-child2');
  if (cssSelectorChild2Input.value === null) {
    logConsole('A child 2 selector must be provided...');
    return;
  }
  return {
    parent: cssSelectorInput.value,
    child1: cssSelectorChild1Input.value,
    child2: cssSelectorChild2Input.value,
  };
};

const startBtn = document.querySelector('button');
startBtn.addEventListener('click', function (event) {
  processeFile();
});
