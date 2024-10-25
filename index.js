disableLinks();
const sheet = new CSSStyleSheet();
let once = false;
addStyle();
console.log("once")

document.addEventListener('mousedown', (e) => {
    SI.handleClick(e);
});
document.addEventListener('mouseover', (e) => {
    SI.handleHover(e);
});



const popupTemplates = {
    DIV: ['innerText', 'background'],
    LI: ['innerText', 'background'],
    UL: ['innerText', 'background']
}

class Popup {

    isHidden = true;

    constructor() {
        this.el = document.createElement('div');
        this.setStyles();
        document.body.append(this.el);
    }

    setStyles() {
        this.el.style.position = 'absolute';
        this.el.style.width = '200px';
        this.el.style.height = 'auto';
        this.el.style.background = '#DfDfDf';
    }

    show(x = 0, y = 0, el) {
        this.setPosition(x, y);
        this.isHidden = false;
        this.el.style.visibility = 'visible';
        this.reset();
        this.addButtons(el);
    }

    hide() {
        this.isHidden = true;
        this.el.style.visibility = 'hidden';
    }

    setPosition(x = 0, y = 0) {
        this.el.style.top = `${y}px`;
        this.el.style.left = `${x}px`;
    }

    reset() {
        this.el.innerHTML = '';
    }

    /** @param {HTMLElement} el */
    addButtons(el) {
        const order = popupTemplates[el.nodeName];
        order.forEach(n => this.addButton(n));
        
    }

    addButton(name) {
        const b = document.createElement('div');
        b.innerText = name;
        this.el.appendChild(b);
    }

    /** @param {MouseEvent} e */
    handleClick(e) {

    }

    handleHover(e) {

    }

}

class SI {



    static selectedElement = null;
    static hoveredElement = null;



    /** @param {MouseEvent} e */
    static handleClick(e) {
        if (e.button === 0)
            SI.handleLeftClick(e);
        else if(e.button === 2)
            SI.handleRightClick(e);
    }


    /** @param {MouseEvent} e */
    static handleRightClick(e) {
        if (popup.el.contains(e.target)) return;
        
        popup.show(e.clientX, e.clientY, e.target);
        if (e.target !== SI.selectedElement){
            SI.select(e.target);
        }

        popup.show(e.clientX, e.clientY, e.target);
    }

    /** @param {MouseEvent} e */
    static handleLeftClick(e) {

        // ! Move handler to popup (Will break if popup has children)
        if (popup.el.contains(e.target)) {
            popup.handleClick(e);
            return
        }

        // Hide popup
        if (e.target === SI.selectedElement){
            popup.hide();
            return;
        }

        // Deselect selected element
        if (SI.selectedElement) {
            SI.deselect(SI.selectedElement);
            popup.hide();
        }

        SI.select(e.target);
    }



    /** @param {MouseEvent} e */
    static handleHover(e) {
        
        // Don't hover itself
        if (e.target === SI.hoveredElement) {
            return;
        }

        // ! Don't hover the popup (Can break if children added to popup)
        if (popup.el.contains(e.target)) {
            SI.unhover();
            popup.handleHover(e);
            return;
        }
        
        SI.hover(e.target);
    }



    /** @param {HTMLElement} el */
    static select(el) {
        SI.deselect();
        SI.selectedElement = el;
        el.style.outline = '2px dotted';
        el.style.borderRadius = '2px';
    }



    static deselect() {
        if (this.selectedElement) {
            this.selectedElement.style.outline = '';
            this.selectedElement.style.borderRadius = '';
        }
        SI.hover(SI.selectedElement);
        SI.selectedElement = null;
    }


    /** @param {HTMLElement} el */
    static hover(el) {
        SI.unhover();
        SI.hoveredElement = el;
        if (el === SI.selectedElement) return;
        el.style.outline = '3px dotted #AAA';
        el.style.borderRadius = '2px';
    }


    /** hover() automatically deselects */
    static unhover() {
        if (!SI.hoveredElement) return;
        if (SI.hoveredElement !== SI.selectedElement) {
            SI.hoveredElement.style.outline = '';
            SI.hoveredElement.style.borderRadius = '';
        }
        SI.hoveredElement = null;
    }
}

const popup = new Popup();




function disableLinks() {
    document.querySelectorAll('a, button, input').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
        });
    });
}


async function addStyle() {
    if (once) return;
    once = true;
    const rules = `
        body {
            background: #FAA;
        }
    `;
    await sheet.replace(rules);
    document.adoptedStyleSheets = [sheet];

}