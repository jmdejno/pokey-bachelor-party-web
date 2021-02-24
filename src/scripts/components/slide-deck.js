import { isMobile } from "../utils/user-agent";
import { debounce } from "../utils/timings";

/**
 * @typedef SlideDeckOptions
 * @type {object}
 * @property {string} containerElementSelector is the query selector for the container element
 * @property {string} [counterElementSelector] is the query selector for the slide count text
 * @property {string} [sidebarElementSelector] is the query selector for the side bar
 * @property {string} [transitionTime] is the duration of each transition
 * @property {string} [transitionEase] is the easing of the transition
 * @property {number} [velocityThreshold] is the sensistivity to of the deltaY scroll to trigger a transition
 * @property {number} [startIndex] is the index of the slide to start on
 */

/**
 * @typedef SlideData
 * @type {object}
 * @property {string} contentElementSelector is the HTMLElement that contains the text description of the
 * @property {string} imgUrl is the URL of the background img of the slide
 * @property {string} [title] is the title of thr slide--to be used in the sidebar
 */

const defaultOptions = {
    transitionTime: 1500,
    transitionEase: "ease",
    velocityThreshold: 5,
    startIndex: 0,
};

const CLASSES = {
    SIDEBAR: "slide-deck__sidebar",
    SIDEBAR_ICON: "slide-deck__sidebar-icon",
    SIDEBAR_ACTIVE: "slide-deck__sidebar--active",
    SIDEBAR_LIST: "slide-deck__sidebar-list",
    SIDEBAR_LIST_ITEM: "slide-deck__sidebar-list-item",
    SIDEBAR_LIST_ITEM_BTN: "slide-deck__sidebar-list-item-btn",
    SIDEBAR_LIST_ITEM_ACTIVE: "slide-deck__sidebar-list-item--active",
};

const DATA_ATTRIBUTES = {
    DATA_SLIDE_INDEX: "data-slide-index",
};

export class SlideDeck {
    /**
     * Initialize the slide deck.
     * @param {SlideData} slides
     * @param {SlideDeckOptions} options
     */
    static init(slides = [], options = {}) {
        return new SlideDeck(options, slides);
    }

    constructor(options = {}, slides = []) {
        this.options = Object.assign({}, defaultOptions, options);
        this._slides = slides;
        this._isTrasitioning = false;
        this._onTransitionEndListeners = [];
        this._onTransitionStartListeners = [];
        this._currentSlideIdx = this.options.startIndex;

        this._init();
        this._transitionSlide(this.currentSlideIdx);
    }

    /**
     * Add listener to be invoked when transition starts.
     * Function will be invoked with the current slide index.
     * @param {(index: number): void} fn
     */
    onTransitionStart(fn) {
        this._onTransitionStartListeners.push(fn);
    }

    /**
     * Add listener to be invoked when transition ends.
     * Function will be invoked with the current slide index.
     * @param {(index: number): void} fn
     */
    onTransitionEnd(fn) {
        this._onTransitionEndListeners.push(fn);
    }

    get currentSlideIdx() {
        return Math.min(this._currentSlideIdx, this._slides.length - 1);
    }

    get currentSlide() {
        return this._slides[this.currentSlideIdx];
    }

    get currentSlideContent() {
        return document.querySelector(this.currentSlide.contentElementSelector);
    }

    get currentSidebarListItem() {
        return this._sidebar
            ? this._sidebar.querySelector(
                  `li[${DATA_ATTRIBUTES.DATA_SLIDE_INDEX}="${this.currentSlideIdx}"]`
              )
            : null;
    }

    get activeSidebarListItem() {
        return this._sidebar
            ? this._sidebar.querySelector(
                  `.${CLASSES.SIDEBAR_LIST_ITEM_ACTIVE}`
              )
            : null;
    }

    _init() {
        this._initContainer();
        this._initSidebar();
        this._initCounter();
        this._initListeners();
        setTimeout(() => {
            this._slides.forEach(({ contentElementSelector, imgUrl }) => {
                new Image().src = imgUrl;
                if (contentElementSelector) {
                    const contentEl = document.querySelector(
                        contentElementSelector
                    );
                    if (contentEl) {
                        contentEl.style.transition = `all ${this.options.transitionTime}ms ease`;
                    }
                }
            });
        }, 100);
    }

    _initListeners() {
        this._container.addEventListener("transitionstart", () => {
            this._isTrasitioning = true;
            this._onTransitionStartListeners.forEach((fn) =>
                fn(this.currentSlideIdx)
            );
        });
        this._container.addEventListener("transitionend", () => {
            this._isTrasitioning = false;
            this._onTransitionEndListeners.forEach((fn) =>
                fn(this.currentSlideIdx)
            );
        });
        window.addEventListener("wheel", this._onWheel.bind(this), {
            passive: false,
        });
        window.addEventListener("touchstart", this._onTouchStart.bind(this), {
            passive: false,
        });
        window.addEventListener("touchmove", this._onTouchMove.bind(this), {
            passive: false,
        });
        window.addEventListener("keyup", this._onKeyUp.bind(this));

        if (this._sidebar) {
            this._sidebar.addEventListener(
                "click",
                this._onSidebarItemClick.bind(this)
            );
            this._sidebar.addEventListener(
                "mouseenter",
                () => {
                    this._isMouseInSidebar = true;
                    this._showSidebar();
                }
            );
            this._sidebar.addEventListener(
                "mouseleave",
                () => {
                    this._isMouseInSidebar = false;
                    this._hideSidebar();
                }
            );
        }
    }

    _initSidebar() {
        if (!this.options.sidebarElementSelector || isMobile()) {
            return;
        }

        this._sidebar = document.querySelector(
            this.options.sidebarElementSelector
        );
        if (this._sidebar) {
            this._sidebar.classList.add(CLASSES.SIDEBAR);
            const fragment = document.createDocumentFragment();
            const sidebarIcon = document.createElement('div');
            sidebarIcon.classList.add(CLASSES.SIDEBAR_ICON);
            sidebarIcon.innerHTML = '&#x2024;&#x2024;&#x2024;';
            fragment.appendChild(sidebarIcon);

            const list = document.createElement("ol");
            list.classList.add(CLASSES.SIDEBAR_LIST);
            fragment.appendChild(list);
            this._slides.forEach((slide, idx) => {
                const button = document.createElement("button");
                button.classList.add(CLASSES.SIDEBAR_LIST_ITEM_BTN);
                button.textContent = idx + 1;

                const li = document.createElement("li");
                li.setAttribute("data-slide-index", idx);
                li.setAttribute("data-slide-title", slide.title || "");
                li.classList.add(CLASSES.SIDEBAR_LIST_ITEM);
                li.appendChild(button);
                list.appendChild(li);
            });
            this._sidebar.appendChild(fragment);
        }
    }

    _initContainer() {
        this._container = document.querySelector(
            this.options.containerElementSelector
        );

        this._container.style.transition = `all ${this.options.transitionTime}ms ease`;
    }

    _initCounter() {
        this._counter = document.querySelector(
            this.options.counterElementSelector
        );
    }

    _onWheel(event) {
        const { deltaY } = event;
        event.preventDefault();
        requestAnimationFrame(() => this._tryTransitionSlide(deltaY));
    }

    _onTouchStart(event) {
        this._touchStart = event.touches[0];
    }

    _onTouchMove(event) {
        event.preventDefault();
        const changedTouch = event.changedTouches[0];
        if (this._touchStart) {
            const deltaY = this._touchStart.screenY - changedTouch.screenY;
            requestAnimationFrame(() => this._tryTransitionSlide(deltaY));
        }
    }

    /**
     * Handle key up event
     * @param {KeyboardEvent} event
     */
    _onKeyUp(event) {
        const { key } = event;
        if ((key === 'ArrowLeft' || key === 'ArrowRight') && !this._isTrasitioning) {
            const isNext = key === 'ArrowRight';
            let slideIdx;
            if (isNext) {
                slideIdx = this._currentSlideIdx === this._slides.length - 1 ? 0 : this._currentSlideIdx + 1;
            } else {
                slideIdx = this._currentSlideIdx === 0 ? this._slides.length - 1 : this._currentSlideIdx - 1;
            }
            this._transitionSlide(slideIdx);
        }
    }

    _onSidebarItemClick({ target }) {
        const item = target.parentNode;
        const slideIdx = parseInt(
            item.getAttribute(DATA_ATTRIBUTES.DATA_SLIDE_INDEX)
        );
        if (!isNaN(slideIdx)) {
            this._transitionSlide(slideIdx);
        }
    }

    _tryTransitionSlide(deltaY) {
        if (this._shouldTransition(deltaY)) {
            const isNext = deltaY > 0;
            const slideIdx = this._currentSlideIdx + (isNext ? 1 : -1);
            this._transitionSlide(slideIdx);
        }
    }

    _transitionSlide(slideIdx) {
        this._isTrasitioning = true;
        this._exitContent();
        this._currentSlideIdx = slideIdx;
        this._enter();
    }

    _enter() {
        this._setCounter();
        this._setSlide();
        this._setSidebarItem();
        this._enterContent();
    }

    _setSlide() {
        const slide = this.currentSlide;
        this._container.style.backgroundImage = `url("${slide.imgUrl}")`;
    }

    _setSidebarItem() {
        if (!this._sidebar) {
            return;
        }
        this._showSidebar();

        const activeItem = this.activeSidebarListItem;
        if (activeItem) {
            activeItem.classList.remove(CLASSES.SIDEBAR_LIST_ITEM_ACTIVE);
        }

        const item = this.currentSidebarListItem;
        if (item) {
            item.classList.add(CLASSES.SIDEBAR_LIST_ITEM_ACTIVE);
        }

        if (!this._isMouseInSidebar) {
            debounce(this, '_hideSidebar', 2000);
        }
    }

    _enterContent() {
        const contentEl = this.currentSlideContent;
        if (contentEl) {
            contentEl.style.opacity = "1";
        }
    }

    _setCounter() {
        if (this._counter) {
            this._counter.style.opacity = "1";
            this._counter.textContent = `${this.currentSlideIdx + 1}/${
                this._slides.length
            }`;
            debounce(this, "_hideCounter", 2000);
        }
    }

    _exitContent() {
        const contentEl = this.currentSlideContent;
        if (contentEl) {
            contentEl.style.opacity = "0";
        }
    }

    _shouldTransition(delta) {
        const isNext = delta > 0;
        return (
            !this._isTrasitioning &&
            Math.abs(delta) > this.options.velocityThreshold &&
            (isNext
                ? this._currentSlideIdx < this._slides.length - 1
                : this._currentSlideIdx > 0)
        );
    }

    _hideCounter() {
        if (this._counter) {
            this._counter.style.opacity = "0";
        }
    }

    _showSidebar() {
        if (this._sidebar) {
            this._sidebar.classList.add(CLASSES.SIDEBAR_ACTIVE);
        }
    }

    _hideSidebar() {
        if (this._sidebar) {
            this._sidebar.classList.remove(CLASSES.SIDEBAR_ACTIVE);
        }
    }

    _log(delta) {
        console.log(
            "currentSlideIdx:",
            this._currentSlideIdx,
            "currentSlide:",
            this.currentSlide,
            "delta:",
            delta,
            "isTransitioning:",
            this._isTrasitioning,
            "shouldTransition:",
            this._shouldTransition(delta)
        );
    }
}
