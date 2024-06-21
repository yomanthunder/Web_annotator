function createAnnotationElement(range, className) {
  const annotation = document.createElement("span");
  annotation.className = className;

  const annotationData = {
    range: serializeRange(range),
    date: new Date().toISOString(),
    className: className,
    html: range.cloneContents().textContent,
  };

  console.log("Saving Annotation: ", annotationData);

  const key = window.location.href;
  console.log("Saving Annotation for Key: ", key);

  chrome.storage.local.get([key], (result) => {
    const annotations = result[key] || [];
    annotations.push(annotationData);
    chrome.storage.local.set({ [key]: annotations }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving annotation: ", chrome.runtime.lastError);
      } else {
        console.log("Annotation saved successfully!");
      }
    });
  });
}

function serializeRange(range) {
  return {
    startContainerXPath: getXPathForElement(range.startContainer),
    startOffset: range.startOffset,
    endContainerXPath: getXPathForElement(range.endContainer),
    endOffset: range.endOffset,
  };
}

function deserializeRange(serializedRange) {
  const range = document.createRange();
  range.setStart(
    document.evaluate(serializedRange.startContainerXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue,
    serializedRange.startOffset
  );
  range.setEnd(
    document.evaluate(serializedRange.endContainerXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue,
    serializedRange.endOffset
  );
  return range;
}

function displayAnnotations(annotations) {
  console.log("Displaying Annotations: ", annotations);
  
  annotations.forEach(annotation => {
    const range = deserializeRange(annotation.range);
    if(annotation.className === "text-marker"){
      const clone = this.highlightTemplate.cloneNode(true).content.firstElementChild;
      clone.appendChild(range.extractContents());
      range.insertNode(clone);
    }
  });
}


// Utility function to get XPath for a DOM element in the current document
function getXPathForElement(element) {
  const idx = (sib, name) => sib 
    ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName === name)
    : 1;
  const segs = elm => !elm || elm.nodeType !== 1 
    ? [''] 
    : elm.id && document.getElementById(elm.id) === elm 
      ? [`id("${elm.id}")`] 
      : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${idx(elm)}]`];
  return segs(element).join('/');
}

const styled = ({ display = "none", left = 0, top = 0 }) => `
  #mediumHighlighter {
    align-items: center;
    border: none;
    cursor: pointer;
    display: ${display};
    justify-content: center;
    left: ${left}px;
    padding: 5px 10px;
    position: fixed;
    top: ${top}px;
    z-index: 9999;
  }
`;

class Toolbar extends HTMLElement {
  constructor() {
    super();
    this.render();
  }
  // connected callback is a method that will be called when the element is added to the DOM
  connectedCallback() {
    this.loadAnnotations();
}

  get toolbarPosition() {
    return JSON.parse(this.getAttribute("toolbarPosition") || "{}");
  }

  get styleElement() {
    return this.shadowRoot.querySelector("style");
  }

  get highlightTemplate() {
    return this.shadowRoot.getElementById("highlightTemplate");
  }
  get rectangle() {
    return this.shadowRoot.getElementById("rectangle");
  }
  get circle() {
    return this.shadowRoot.getElementById("circle");
  }
  get underline() {
    return this.shadowRoot.getElementById("underline");
  }
  get fontColor() {
    return this.shadowRoot.getElementById("fontColor");
  }
  get fontSize() {
    return this.shadowRoot.getElementById("fontSize");
  }

  static get observedAttributes() {
    return ["toolbarPosition"];
  }

  async loadTemplate() {
    const response = await fetch(chrome.runtime.getURL('src/annotator-toolbar/annotator-toolbar.html'));
    const template = await response.text();
    this.shadowRoot.innerHTML += template;
  }
  // async function to load annotations

  async loadAnnotations() {
    try {
      const key = window.location.href;
      console.log("Loading Annotations for Key: ", key);
  
      const annotations = await new Promise((resolve, reject) => {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError) {
            console.error("Error loading annotations: ", chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            const annotations = result[key] || [];
            console.log("Loaded annotations: ", annotations);
            resolve(annotations);
          }
        });
      });
  
      this.displayAnnotations(annotations);
    } catch (error) {
      console.error("Failed to load annotations: ", error);
    }
  }
  

  displayAnnotations(annotations) {
    console.log("Displaying Annotations: ", annotations);
    
    annotations.forEach(annotation => {
      const range = document.createRange();
      
      if (!annotation.range.startContainerXPath || !annotation.range.endContainerXPath) {
        console.error("Invalid XPath in annotation: ", annotation);
        return;
      }
      
      let startContainer = document.evaluate(annotation.range.startContainerXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      let endContainer = document.evaluate(annotation.range.endContainerXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      
      if (!startContainer || !endContainer) {
        console.error("Invalid XPath in annotation: ", annotation);
        return;
      }
  
      range.setStart(startContainer, annotation.range.startOffset);
      range.setEnd(endContainer, annotation.range.endOffset);
      if(annotation.className === "text-marker"){
        const clone = this.highlightTemplate.cloneNode(true).content.firstElementChild;
        clone.appendChild(range.extractContents());
        range.insertNode(clone);
      }
    });
  }
  
  
  render() {
    this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = styled({});
    this.shadowRoot.appendChild(style);
    this.loadTemplate().then(()=>{

      this.setIconImage("text-marker", "marker");
      this.setIconImage("rectangle", "rectangle1");
      this.setIconImage("circle", "oval");
      this.setIconImage("underline", "underline-tool");
      this.setIconImage("pointer", "pointer");
      this.setIconImage("note", "note");
      this.setIconImage("undo", "undo");
      this.setIconImage("redo", "redo");
      this.setIconImage("fontSize", "fontSize");
      this.setIconImage("fontColor", "fontColor");
      
      this.shadowRoot.querySelector(".text-marker").addEventListener("click", ()=>{
        var userSelection = window.getSelection();
        for (let i = 0; i < userSelection.rangeCount; i++) {
          const range = userSelection.getRangeAt(i);
          const clone = this.highlightTemplate.cloneNode(true).content.firstElementChild;
          clone.appendChild(range.extractContents());
          range.insertNode(clone);
          saveAnnotation(range, "text-marker");
        }
        this.save();
        window.getSelection().empty();
      })
      
      this.shadowRoot.querySelector(".rectangle").addEventListener("click", ()=>{
        var userSelection = window.getSelection();
        for (let i = 0; i < userSelection.rangeCount; i++) {
          const range = userSelection.getRangeAt(i);
          const clone = this.rectangle.cloneNode(true).content.firstElementChild;
          clone.appendChild(range.extractContents());
          range.insertNode(clone);
        }
        window.getSelection().empty();
      })
      
      this.shadowRoot.querySelector(".circle").addEventListener("click", ()=>{
        var userSelection = window.getSelection();
        for (let i = 0; i < userSelection.rangeCount; i++) {
          const range = userSelection.getRangeAt(i);
          const clone = this.circle.cloneNode(true).content.firstElementChild;
          clone.appendChild(range.extractContents());
          range.insertNode(clone);
        }
        window.getSelection().empty();
      })
      
      this.shadowRoot.querySelector(".underline").addEventListener("click", ()=>{
        var userSelection = window.getSelection();
        for (let i = 0; i < userSelection.rangeCount; i++) {
          const range = userSelection.getRangeAt(i);
          const clone = this.underline.cloneNode(true).content.firstElementChild;
          clone.appendChild(range.extractContents());
          range.insertNode(clone);
        }
        window.getSelection().empty();
      })
      
      this.shadowRoot.querySelector(".fontColor").addEventListener("click", ()=>{
        var userSelection = window.getSelection();
        for (let i = 0; i < userSelection.rangeCount; i++) {
          const range = userSelection.getRangeAt(i);
          const clone = this.fontColor.cloneNode(true).content.firstElementChild;
          clone.appendChild(range.extractContents());
          range.insertNode(clone);
        }
        window.getSelection().empty();
      })
      
      this.shadowRoot.querySelector(".fontSize").addEventListener("click", ()=>{
        var userSelection = window.getSelection();
        for (let i = 0; i < userSelection.rangeCount; i++) {
          const range = userSelection.getRangeAt(i);
          const clone = this.fontSize.cloneNode(true).content.firstElementChild;
          clone.appendChild(range.extractContents());
          range.insertNode(clone);
        }
        window.getSelection().empty();
      })

    });
    
  }
  // simple funtion to save hello world
  save() {
    console.log("hello world");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "toolbarPosition") {
      this.styleElement.textContent = styled(this.toolbarPosition);
    }
  }

  setIconImage(className, image) {
    const e = this.shadowRoot.querySelector(`.${className}`);
    e.style.background = `url(${chrome.runtime.getURL(`images/${image}.png`)}) no-repeat center center/cover`;
    e.style.filter = 'invert(100%)';
    e.style.backgroundSize = "80%";
  }
}

window.customElements.define("annotator-toolbar", Toolbar);
