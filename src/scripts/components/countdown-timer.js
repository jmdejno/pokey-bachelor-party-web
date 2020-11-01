const moment = require("moment");

const MINUTES_PER_DAY = 24 * 60;

/**
 * @typedef CountdownTimerOptions
 * @type {object}
 * @property {string} selector is the element selector to bind the countdown timeer
 * @property {Date|Moment} date is the date to countdown to
 */

export class CountdownTimer {
    /**
     * Initialize the countdown timer
     * @param {CountdownTimerOptions} options
     */
    static init(options = {}) {
        return new CountdownTimer(options);
    }

    constructor(options = {}) {
        this.options = options;
        this.targetDate = moment(options.date);
        this.element = document.querySelector(options.selector);
        this._init();
    }

    _init() {
        this._update();
        setInterval(this._update.bind(this), 1000);
    }

    _update() {
        const minutesUntil = this.targetDate.diff(moment.now(), "minutes");
        const daysUntil = parseInt(minutesUntil / MINUTES_PER_DAY);
        const remainingHours = parseInt(
            (minutesUntil - daysUntil * MINUTES_PER_DAY) / 60
        );
        const remainingMinutes =
            minutesUntil - daysUntil * MINUTES_PER_DAY - remainingHours * 60;

        const parts = [];
        if (daysUntil) {
            parts.push(`${daysUntil} day${daysUntil === 1 ? "" : "s"} `);
        }

        if (remainingHours) {
            parts.push(
                `${remainingHours} hour${remainingHours === 1 ? "" : "s"}`
            );
        }
        if (remainingMinutes) {
            parts.push(
                `${remainingMinutes} minute${remainingMinutes === 1 ? "" : "s"}`
            );
        }
        this.element.textContent = parts.join(' ');
    }
}
