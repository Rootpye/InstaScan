// Red button generation and click function
function createButtonElement(container) {
  let btn = document.createElement('button');
  btn.className = 'yt-hover-btn';
  btn.textContent = 'description';

  Object.assign(btn.style, {
      position: 'absolute',
      bottom: '8px',
      right: '8px',
      backgroundColor: '#ff0000',
      color: 'white',
      border: 'none',
      padding: '6px 10px',
      borderRadius: '4px',
      display: 'none',
      cursor: 'pointer',
  });

  //If user click button, 1. Video title and explanation are imported. 2. Create a modal window with that
  btn.addEventListener('click', async () => {
    if (container.querySelector('.yt-hover-modal')) return;
  
    let url = btn.previousElementSibling.querySelector('a#thumbnail')?.href;
    if (!url) return;
  
    let meta = await fetchVideoMeta(url);
    if (!meta.description) return;
  
    let summary = `title: ${meta.title} \ndescription: ${meta.description}`;
    let modal = createModal(`video description: ${meta.description}`, true, summary);
    container.parentElement.appendChild(modal);
  });

  return btn;
}

// Add a button for each YouTube video (only works on the video tab on YouTube homepage & channel)
function injectHoverButtons() {
  let videos = document.querySelectorAll('ytd-rich-item-renderer.ytd-rich-grid-renderer');

  videos.forEach((i) => {
      if (i.querySelector('.yt-hover-btn')) return;

      let container = i.querySelector('#content');
      let btn = createButtonElement(container);
      container.appendChild(btn);

      i.addEventListener('mouseenter', () => {
          btn.style.display = 'block';
      });

      i.addEventListener('mouseleave', () => {
          btn.style.display = 'none';
      });
  });
}

// html static change detection
let observer = new MutationObserver(() => {
injectHoverButtons();
});
observer.observe(document.body, { childList: true, subtree: true });

// First run
window.addEventListener('load', () => {
  setTimeout(injectHoverButtons, 1500);
});

//Modal generation
function createModal(text, showAIBtn = null, summary) {
  let modal = document.createElement('div');
  modal.className = 'yt-hover-modal';
  Object.assign(modal.style, {
    backgroundColor: 'white',
    border: '1px solid #eee',
    borderRadius: '5px',
    padding: '12px',
    marginTop: '8px',
    fontSize: '14px',
    position: 'absolute',
    zIndex: '999',
    maxWidth: '300px',
    wordWrap: 'break-word'
  });

  let closeBtn = document.createElement('span');
  closeBtn.textContent = 'x';
  Object.assign(closeBtn.style, {
    position: 'absolute',
    top: '4px',
    right: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  });

  closeBtn.addEventListener('click', () => {
    modal.remove();
  });

  let textNode = document.createElement('div');
  textNode.textContent = text;

  modal.appendChild(textNode);
  modal.appendChild(closeBtn);
  return modal;
}

// Go into the detail page and get video title and description function
async function fetchVideoMeta(videoUrl) {
  const response = await fetch(videoUrl);
  const html = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const title = doc.querySelector('meta[name="title"]')?.content ||
                doc.querySelector('title')?.innerText;

  const description = doc.querySelector('meta[name="description"]')?.content;

  return { title : title, description : description };
}
