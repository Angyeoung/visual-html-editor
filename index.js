// Add created stylesheet
(async function addStyle() {
    const sheet = new CSSStyleSheet();
    const rules = `
        body {
            background: #FAA;
        }

        #popupContainer {
            position: absolute;
            min-width: 200px;
            height: auto;
            background: #DFDFDF;
        }

        .popupHeader {
            user-select: none;
            padding: 0px 4px;
            background: #CCC;
            text-align: center;
        }

        .popupElement {
            user-select: none;
            padding: 0px 4px;
            display: flex;
            justify-content: space-between;
        }

        .popupElement > p, .popupElement > input {
            margin: 0px;
            padding: 0px;
        }

        .popupElement:hover {
            background: #CCC;
        }

        .hovered {
            outline: 2px dotted #AAA;
            border-radius: 2px;
        }

        .selected {
            outline: 2px dotted;
            border-radius: 2px;
            content
        }
    `;
    await sheet.replace(rules);
    document.adoptedStyleSheets = [sheet];
})();
// Make sure interactibles don't work
(function disableLinks() {
    document.querySelectorAll('a, button, input').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
        });
    });
})();


const popupTemplates = new Map([
    ['DIV', []],
    ['LI', []],
    ['UL', []],
    ['default', ['background', 'font-size']]
]);

const popupFields = new Map([
    ['background', {
        text: 'Background',
        type: 'color',
        get: (el) => el.style.background,
        set: (el, val) => el.style.background = val,
    }],
    ['font-size', {
        text: 'Font Size',
        type: 'range',
        get: (el) => el.style.fontSize,
        set: (el, val) => el.style.fontSize = val + 'px',
    }],
]);

class Popup {

    isHidden = true;

    constructor() {
        this.el = document.createElement('div');
        this.el.id = 'popupContainer';
        document.body.append(this.el);
    }

    show(x = 0, y = 0, el) {
        this.setPosition(x, y);
        this.isHidden = false;
        this.el.removeAttribute('hidden');
        this.reset();
        this.addButtons(el);
    }

    hide() {
        this.isHidden = true;
        this.el.hidden = true;
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

        this.addHeader(`<${el.nodeName.toLocaleLowerCase()}>`);

        if (popupTemplates.has(el.nodeName)) {
            const order = popupTemplates.get(el.nodeName);
            order.forEach(n => this.addButton(n));
        }

        popupTemplates.get('default').forEach(n => this.addButton(n));
    }

    addButton(field) {
        if (!field) return;

        const container = document.createElement('div');
        container.className = 'popupElement';
        const text = document.createElement('p');
        text.innerText = popupFields.get(field).text;

        container.append(text);
        this.addInput(container, field);

        this.el.appendChild(container);
    }

    addInput(parent, field) {
        if (!field) return;
        const el = SI.selectedElement;
        const input = document.createElement('input');
        input.type = popupFields.get(field).type;
        input.value = popupFields.get(field).get(el);

        input.addEventListener('input', () => {
            popupFields.get(field).set(el, input.value);
        });

        parent.append(input);
    }

    addHeader(name) {
        const b = document.createElement('div');
        b.className = 'popupHeader';
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

    /** @type {HTMLElement} */
    static selectedElement = null;
    static hoveredElement = null;


    static get hoveredIsSelected() {
        return this.hoveredElement === this.selectedElement;
    }


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
        SI.select(e.target);
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
        if (e.target === SI.hoveredElement) return;

        // Popup hover
        if (popup.el.contains(e.target)) {
            SI.unhover();
            return popup.handleHover(e);
        }
        
        SI.hover(e.target);
    }


    /** @param {HTMLElement} el */
    static select(el) {
        if (el === SI.selectedElement) return;
        SI.deselect();
        SI.selectedElement = el;
        el.contentEditable = 'true';
        el.classList.add('selected');
    }


    static deselect() {
        if (!this.selectedElement) return;
        this.selectedElement.classList.remove('selected');
        this.selectedElement.contentEditable = 'false';
        SI.selectedElement = null;
    }


    /** @param {HTMLElement} el */
    static hover(el) {
        SI.unhover();
        SI.hoveredElement = el;
        el.classList.add('hovered');
    }


    /** `hover()` automatically unhovers */
    static unhover() {
        if (!SI.hoveredElement) return;
        SI.hoveredElement.classList.remove('hovered');
        SI.hoveredElement = null;
    }
}




const popup = new Popup();

document.addEventListener('mousedown', (e) => {
    SI.handleClick(e);
});
document.addEventListener('mouseover', (e) => {
    SI.handleHover(e);
});


