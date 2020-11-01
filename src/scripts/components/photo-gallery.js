const imageContainerSelector = "#app-main";
const appContentSelector = "#app-main-content";
const photoGalleryCounterSelector = "#app-photo-galley-counter";

const ratePerImage = 200;

export class PhotoGallery {
    static init() {
        return new PhotoGallery();
    }

    constructor() {
        this.container = document.querySelector(imageContainerSelector);
        this.content = document.querySelector(appContentSelector);
        this.counter = document.querySelector(photoGalleryCounterSelector);
        this.images = [
            require("../../assets/chris-allie-1.jpg"),
            require("../../assets/chris-bio.jpg"),
            require("../../assets/chris-allie-sf.jpg"),
        ];
        this._stateChangeListeners = [];
        this._y = 0;
        this._isActive = false;
        this.init();
    }

    /**
     * Bind listener function to when state changes from active/inactive
     * @param {(isActive: boolean): void} fn callback invoked when
     */
    onActiveStateChange(fn) {
        this._stateChangeListeners.push(fn);
    }

    init() {
        window.addEventListener("wheel", this._onWheel.bind(this), {
            passive: false,
        });
        this.container.addEventListener(
            "transitionstart",
            () => (this._isTransitioning = true)
        );
        this.container.addEventListener("transitionend", () => {
            this._isTransitioning = false;
            if (this._prevImageIdx !== this.currentImageIdx) {
                this._setImage();
            }
        });
        this.onActiveStateChange((isActive) => {
            if (isActive) {
                this.content.style.transform = "translateY(-200%)";
                this.counter.style.opacity = "1";
            } else {
                this.content.style.transform = "";
                this.counter.style.opacity = "0";
            }
        });
        this.images.forEach((imgUrl) => (new Image().src = imgUrl));
        this._setImage();
    }

    _onWheel(event) {
        const { deltaY } = event;
        const isActive = this.computeIsActive(deltaY);
        this._setIsActive(isActive);
        if (isActive) {
            event.preventDefault();
            this._setY(deltaY);
            this._setImage();
        }
    }

    _setY(deltaY) {
        const delta = Math.min(deltaY, 5);
        this._y = Math.min(this.maxY, this._y + delta);
    }

    _setImage() {
        if (
            this._prevImageIdx !== this.currentImageIdx &&
            !this._isTransitioning
        ) {
            requestAnimationFrame(() => {
                this._prevImageIdx = this.currentImageIdx;
                const styleString = `url("${this.currentImage}")`;
                this.container.style.backgroundImage = styleString;
                this._setCounter();
            });
        }
    }

    _setCounter() {
        this.counter.textContent = `${this.currentImageIdx + 1}/${
            this.images.length
        }`;
    }

    _setIsActive(isActive) {
        if (this._isActive !== isActive) {
            this._isActive = isActive;
            this._stateChangeListeners.forEach(fn => fn(isActive));
        }
    }

    computeIsActive(deltaY) {
        const isDown = deltaY > 0;
        return this.isScrolledToBottom && (isDown || (!isDown && this._y >= 0));
    }

    get maxY() {
        return this.images.length * ratePerImage;
    }

    get currentImageIdx() {
        return parseInt(
            Math.max(
                0,
                Math.min(this._y / ratePerImage, this.images.length - 1)
            )
        );
    }

    get currentImage() {
        return this.images[this.currentImageIdx];
    }

    get isScrolledToBottom() {
        return (
            document.scrollingElement.scrollTop + window.innerHeight >=
            document.scrollingElement.scrollHeight
        );
    }
}
