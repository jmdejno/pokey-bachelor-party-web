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

const init = () => {
    const main = document.querySelector(SELECTORS.APP_MAIN);
    main.style.opacity = "1";
};

const getSlideStartIndex = () => {
    const hash = window.location.hash;
    const parsedHash = parseInt(hash.replace("#", ""));
    return isNaN(parsedHash) ? 0 : parsedHash - 1;
};

document.addEventListener("DOMContentLoaded", () => {
    CountdownTimer.init({
        selector: SELECTORS.COUNTDOWN_TIMER,
        date: DETAILS.startDate,
    });
    const slideDeck = SlideDeck.init(slides, {
        containerElementSelector: SELECTORS.APP_MAIN,
        counterElementSelector: SELECTORS.SLIDE_COUNTER,
        startIndex: getSlideStartIndex(),
    });

    const scrollInstrcutions = document.querySelector(SELECTORS.SCROLL_INSCTRUCTIONS);
    slideDeck.onTransitionStart((idx) => {
        window.location.hash = idx + 1;
        if (idx > 0) {
            scrollInstrcutions.style.opacity = '0';
            scrollInstrcutions.style.animation = '';
        }
    });

    setTimeout(init, 1000);
});
