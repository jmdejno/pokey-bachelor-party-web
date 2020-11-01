require("normalize.css/normalize.css");
require("./styles/index.scss");
const { PhotoGallery } = require("./scripts/photo-gallery");
const moment = require("moment");

const DETAILS = {
    startDate: moment([2021, 9, 20]),
};

const SELECTORS = {
    COUNTDOWN_TIMER: "#bachelor-party-date-countdown-timer-time",
};

document.addEventListener("DOMContentLoaded", () => {
    initCountdownTimer(SELECTORS.COUNTDOWN_TIMER, DETAILS.startDate);
    PhotoGallery.init();
});

/**
 * Initialize a countdown timer.
 * @param {String} selector HTMLElement selector
 * @param {Date|Moment} targetDate is the target date to countdown to
 */
const initCountdownTimer = (selector, targetDate) => {
    const el = document.querySelector(selector);
    if (el) {
        const minutesInADay = 24 * 60;
        const update = () => {
            const now = moment.now();
            const minutesUntil = targetDate.diff(now, "minutes");
            const daysUntil = parseInt(minutesUntil / minutesInADay);
            const remainingHours = parseInt(
                (minutesUntil - daysUntil * minutesInADay) / 60
            );
            const remainingMinutes =
                minutesUntil - daysUntil * minutesInADay - remainingHours * 60;

            let textString = `${daysUntil} days`;
            if (remainingHours) {
                textString += ` ${remainingHours} hours`;
            }
            if (remainingMinutes) {
                textString += ` ${remainingMinutes} minutes`;
            }
            el.textContent = textString;
        };
        update();
        setInterval(update, 10000);
    }
};
