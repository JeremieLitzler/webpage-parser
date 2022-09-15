const channels = [
  'althea-provence-channel',
  'charles-dowing-channel',
  'comme-un-pinguin-dans-le-desert-channel',
  'destination-bonheur-channel',
  'huw-richards-channel',
  'jeancovici-channel',
  'l-archipelle-channel',
  'le-chemin-de-la-nature-channel',
  'l-energie-autrement-channel',
  'le-potager-d-olivier-channel',
  'low-tech-labs-channel',
  'objectif-zero-carbone-channel',
  'permaculture-agroecologie-etc-channel',
  'the-dutch-farmer-channel',
];
const wait = 1500;
const consoleEl = document.querySelector('.console');
/**
 * Delay execution
 * @param {int} time the amount of time to wait
 * @returns A promise
 */
const delayBy = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};
/**
 * Save the target file to shrink
 * @param {string} bible The bible code
 * @param {string} sourceFile The file to fetch and shrink
 */
const saveNewFile = (fileOjb) => {
  fetch(fileOjb.sourceFile)
    .then((response) => response.text())
    .then((html) => {
      var parser = new DOMParser();

      // Parse the text
      var doc = parser.parseFromString(html, 'text/html');

      // You can now even select part of that html as you would in the regular DOM
      // Example:
      const content = doc.querySelector(cssSelector.value);
      const style = document.createElement('style');
      style.innerText = `#overlays,ytd-thumbnail-overlay-equalizer,yt-img-shadow,#menu,#video-badges {display: none;}#metadata-line > span:nth-child(1){display: none}`;
      const newPageParser = new DOMParser();
      const newPage = newPageParser.parseFromString(
        content.innerHTML,
        'text/html',
      );
      newPage.body.appendChild(style);
      const contentBytes = new TextEncoder().encode(newPage.body.innerHTML);
      // (A) CREATE BLOB OBJECT
      var fileBlob = new Blob([contentBytes], { type: 'text/html' });

      // (B) CREATE DOWNLOAD LINK
      var url = window.URL.createObjectURL(fileBlob);
      var anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${fileOjb.channel}`;
      document.body.appendChild(anchor);
      // (C) "FORCE DOWNLOAD"
      // NOTE: MAY NOT ALWAYS WORK DUE TO BROWSER SECURITY
      // BETTER TO LET USERS CLICK ON THEIR OWN
      anchor.click();
      const log = document.createElement('p');
      log.innerText = `Downloaded shrinked ${fileOjb.channel}`;
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(anchor);
      }, 0);
      consoleEl.appendChild(log);
    })
    .catch((err) => console.error(err));
};

/**
 * Build a list of filenames to fetch to shrink
 * @returns array[string]
 */
const getFileList = () => {
  const files = [];
  channels.forEach((channel) => {
    files.push({
      sourceFile: `youtube-channels/original/${channel}.html`,
      channel: channel,
    });
  });
  return files;
};

const cssSelector = document.querySelector('input');
if (cssSelector.value === '') {
  cssSelector.placeholder =
    'Please set a css selector matching an element in the target page.';
}
const startBtn = document.querySelector('button');
startBtn.addEventListener('click', function (event) {
  const files = getFileList();
  // console.log(files);
  let wait = 800;
  const waitStep = 800;
  console.table(files);
  files.forEach((file) => {
    delayBy(wait).then(() => {
      console.log('processFile', file);
      saveNewFile(file);
    });
    wait += waitStep;
  });
});
