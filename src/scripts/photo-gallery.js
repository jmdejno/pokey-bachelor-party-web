
const imageContainerSelector = "#app-main";
const appContentSelector = "#app-main-content";

const ratePerImage = 200;

export class PhotoGallery {
    static init() {
        return new PhotoGallery();
    }

    constructor() {
        this.container = document.querySelector(imageContainerSelector);
        this.content = document.querySelector(appContentSelector);
        this.images = [
            require("../assets/chris-allie-1.jpg"),
            require("../assets/chris-bio.jpg"),
            require("../assets/chris-allie-sf.jpg"),
        ];
        this._y = 0;
        this.init();
    }

    init() {
        window.addEventListener("wheel", this.onWheel.bind(this), {
            passive: false,
        });
        this.container.addEventListener('transitionstart', () => this._isTransitioning = true);
        this.container.addEventListener('transitionend', () => {
            this._isTransitioning = false
            if (this._prevImageIdx !== this.currentImageIdx) {
                this.setImage();
            }
        });
        this.images.forEach((imgUrl) => (new Image().src = imgUrl));
        this.setImage();
    }

    onWheel(event) {
        const { deltaY } = event;
        const isDown = deltaY > 0;
        if (this.isScrolledToBottom) {
            this.setY(deltaY);

            if (isDown || (!isDown && this._y >= 0)) {
                event.preventDefault();
                this.content.style.transform = "translateY(-200%)";
            } else {
                this.content.style.transform = "";
            }

            this.setImage();
        }
    }

    setY(deltaY) {
        const delta = Math.min(deltaY, 5);
        this._y = Math.min(this.maxY, this._y + delta);
    }

    setImage() {
        if (this._prevImageIdx !== this.currentImageIdx && !this._isTransitioning) {
            requestAnimationFrame(() => {
                this._prevImageIdx = this.currentImageIdx;
                const styleString = `url("${this.currentImage}")`;
                this.container.style.backgroundImage = styleString;
            });
        }
    }

    get maxY() {
        return this.images.length * ratePerImage;
    }

    get currentImageIdx() {
        return parseInt(
            Math.min(this._y / ratePerImage, this.images.length - 1)
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
