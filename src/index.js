require("normalize.css/normalize.css");
require("./styles/index.scss");
const moment = require("moment");
const { CountdownTimer } = require("./scripts/components/countdown-timer");
const { SlideDeck } = require("./scripts/components/slide-deck");

const DETAILS = {
    startDate: moment([2021, 9, 20]),
};

const SELECTORS = {
    COUNTDOWN_TIMER: "#bachelor-party-date-countdown-timer-time",
    APP_MAIN: "#app-main",
    SLIDE_COUNTER: "#app-photo-galley-counter",
    SCROLL_INSCTRUCTIONS: "#scroll-instructions",
    SLIDE_DECK_SIDEBAR: '#slide-deck-sidebar'
};

/**
 * @type {SlideDeckOptions[]}
 */
const slides = [
    {
        imgUrl: require("./assets/chris-allie-1.jpg"),
        contentElementSelector: "#intro-slide",
    },
    {
        imgUrl: require("./assets/chris-bio.jpg"),
        contentElementSelector: "#groom-slide",
    },
    {
        imgUrl: require("./assets/chris-allie-sf.jpg"),
        contentElementSelector: "#best-man-slide",
    },
    {
        imgUrl: require("./assets/beeler-chris-napoleon.jpg"),
        contentElementSelector: "#beeler-slide",
    },
];

const show = () => {
    const main = document.querySelector(SELECTORS.APP_MAIN);
    main.style.opacity = "1";
};

const getSlideStartIndex = () => {
    const hash = window.location.hash;
    const parsedHash = parseInt(hash.replace("#", ""));
    return isNaN(parsedHash) ? 0 : Math.min(slides.length, parsedHash) - 1;
};

document.addEventListener("DOMContentLoaded", () => {
    init();
    setTimeout(show, 1000);
});

function init() {
    initCountdownTimer();
    initSlideDeck();
}

function initCountdownTimer() {
    CountdownTimer.init({
        selector: SELECTORS.COUNTDOWN_TIMER,
        date: DETAILS.startDate,
    });
}

function initSlideDeck() {
    const slideDeck = SlideDeck.init(slides, {
        containerElementSelector: SELECTORS.APP_MAIN,
        counterElementSelector: SELECTORS.SLIDE_COUNTER,
        sidebarElementSelector: SELECTORS.SLIDE_DECK_SIDEBAR,
        startIndex: getSlideStartIndex(),
    });

    let isScrollVisivle = true;
    const scrollInstrcutions = document.querySelector(
        SELECTORS.SCROLL_INSCTRUCTIONS
    );
    slideDeck.onTransitionStart((idx) => {
        window.location.hash = idx + 1;
        if (idx > 0 && isScrollVisivle) {
            isScrollVisivle = false;
            scrollInstrcutions.style.opacity = "0";
            scrollInstrcutions.style.animation = "";
        }
    });
}
