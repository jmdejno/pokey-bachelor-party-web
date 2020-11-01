const { debounce } = require("../utils/timings");

/**
 * @typedef SlideDeckOptions
 * @type {object}
 * @property {string} containerElementSelector is the query selector for the container element
 * @property {string} [contentElementSelector] is the query selector for the content element (e.g title and description)
 * @property {string} [counterElementSelector] is the query selector for the slide count text
 * @property {string} [transitionTime] is the duration of each transition
 * @property {string} [transitionEase] is the easing of the transition
 * @property {number} [velocityThreshold] is the sensistivity to of the deltaY scroll to trigger a transition
 * @property {number} [startIndex] is the index of the slide to start on
 */

/**
 * @typedef SlideData
 * @type {object}
 * @property {string} contentElement is the HTMLElement that contains the text description of the
 * @property {string} imgUrl is the URL of the background img of the slide
 */

const defaultOptions = {
    transitionTime: 1500,
    transitionEase: "ease",
    velocityThreshold: 5,
    startIndex: 0,
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
        this._enter();
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

    _init() {
        this._container = document.querySelector(
            this.options.containerElementSelector
        );
        this._counter = document.querySelector(
            this.options.counterElementSelector
        );
        this._container.style.transition = `all ${this.options.transitionTime}ms ease`;
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
        this._enterContent();
    }

    _setSlide() {
        const slide = this.currentSlide;
        this._container.style.backgroundImage = `url("${slide.imgUrl}")`;
    }

    _exitContent() {
        const contentEl = this.currentSlideContent;
        if (contentEl) {
            contentEl.style.opacity = "0";
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
