const moment = require("moment");

const MINUTES_PER_DAY = 24 * 60;
const SECONDS_PER_DAY = MINUTES_PER_DAY * 60;

/**
 * @typedef CountdownTimerOptions
 * @type {object}
 * @property {string} selector is the element selector to bind the countdown timeer
 * @property {Date|Moment} date is the date to countdown to
 * @property {Date|Moment} [endDate] is the end date of the event
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
        this.endDate = options.endDate && moment(options.endDate);
        this.element = document.querySelector(options.selector);
        this._init();
    }

    _init() {
        this._appendDateDetails();
        this._update();
        setInterval(this._update.bind(this), 1000);
    }

    _update() {
        const secondsUntil = this.targetDate.diff(moment.now(), "seconds");
        const minutesUntil = this.targetDate.diff(moment.now(), "minutes");
        const daysUntil = parseInt(minutesUntil / MINUTES_PER_DAY);
        const remainingHours = parseInt(
            (minutesUntil - daysUntil * MINUTES_PER_DAY) / 60
        );
        const remainingMinutes =
            minutesUntil - daysUntil * MINUTES_PER_DAY - remainingHours * 60;
        const remainingSeconds = secondsUntil - minutesUntil * 60;

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
        if (remainingSeconds) {
            parts.push(
                `${remainingSeconds} second${remainingSeconds === 1 ? "" : "s"}`
            );
        }
        this.element.textContent = parts.join(' ');
    }

    _appendDateDetails() {
        const container = this.element.parentElement;
        const fragment = document.createDocumentFragment();
        const dateDetailsSpan = document.createElement('span');

        dateDetailsSpan.innerText = `(${this.targetDate.format("MMM Do")} - ${this.endDate.format("MMM Do YYYY")})`;

        fragment.appendChild(document.createElement('br'));
        fragment.appendChild(document.createElement('br'));
        fragment.appendChild(dateDetailsSpan);
        container.appendChild(fragment);
    }
}
