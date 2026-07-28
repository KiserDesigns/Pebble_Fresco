// version 0.11 by Daniel Rench
// More information: http://dren.ch/strftime/
// This is public domain software
//
// Some modification by tokuhirom.
// Tokuhirom's modifications are public domain, too.
// GitHub source: https://github.com/tokuhirom/strftime-js
// 
// More modifications (and minify) by Noah Kiser
(function () {
    "use strict";

function pad (d, n, p) {
    var s = '' + d;
    p = p || '0';
    while (s.length < n) s = p + s;
    return s;
}

var locales = {
    en: {
        A: [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday',
            'Thursday', 'Friday', 'Saturday'
        ],
        a: [
            "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
        ],
        B: [
            'January', 'February', 'March', 'April', 'May', 'June', 'July',
            'August', 'September', 'October', 'November', 'December'
        ],
        b:  ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    },
    ja: {
        B: [" 1月", " 2月", " 3月", " 4月", " 5月", " 6月", " 7月", " 8月", " 9月", "10月", "11月", "12月"],
        b: [" 1月", " 2月", " 3月", " 4月", " 5月", " 6月", " 7月", " 8月", " 9月", "10月", "11月", "12月"],
        A: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
        a: ["日", "月", "火", "水", "木", "金", "土"]
    }
};

var formats = {
		A: function (d, locale) { return locales[locale].A[d.getDay()]; },
		a: function (d, locale) { return locales[locale].a[d.getDay()]; },
		B: function (d, locale) { return locales[locale].B[d.getMonth()]; },
		b: function (d, locale) { return locales[locale].b[d.getMonth()]; },
		C: function (d) { return Math.floor(d.getFullYear()/100); },
		c: function (d) { return d.toString(); },
		D: function (d) {
				return formats.m(d) + '/' +
					formats.d(d) + '/' + formats.y(d);
			},
		d: function (d) { return pad(d.getDate(), 2,'0'); },
		e: function (d) { return pad(d.getDate(), 2,' '); },
		F: function (d) {
				return formats.Y(d) + '-' + formats.m(d) + '-' +
					formats.d(d);
			},
		G: function (d) { return getISOWeekYear(d).year; },
		g: function (d) { return pad((getISOWeekYear(d).year % 100), 2); },
		H: function (d) { return pad(d.getHours(), 2,'0'); },
		I: function (d) { return pad((d.getHours() % 12 || 12), 2); },
        /*
%g
like %G, but without the century
%G
The 4-digit year corresponding to the ISO week number
%Z
time zone name or abbreviation
*/
		j: function (d) {
                return pad(Math.floor((d - (new Date(d.getFullYear(), 0, 0))) / (1000 * 60 * 60 * 24)+1),3,'0');
			},
		k: function (d) { return pad(d.getHours(), 2,' '); },
		l: function (d) { return pad((d.getHours() % 12 || 12), 2,' '); },
		M: function (d) { return pad(d.getMinutes(), 2,'0'); },
		m: function (d) { return pad((d.getMonth()+1), 2,'0'); },
		n: function (d) { return "\n"; },
		p: function (d) { return (d.getHours() > 11) ? 'PM' : 'AM'; },
		P: function (d) { return formats.p(d).toLowerCase(); },
		R: function (d) { return formats.H(d) + ':' + formats.M(d); },
		r: function (d) {
				return formats.I(d) + ':' + formats.M(d) + ':' +
					formats.S(d) + ' ' + formats.p(d);
			},
		S: function (d) { return pad(d.getSeconds(), 2,'0'); },
		s: function (d) { return Math.floor(d.getTime()/1000); },
		T: function (d) {
				return formats.H(d) + ':' + formats.M(d) + ':' +
					formats.S(d);
			},
		t: function (d) { return "\t"; },
		U: function (d) { return pad(weekNumber(d, 'sunday'), 2, '0'); }, 
		u: function (d) { return(d.getDay() || 7); },
		V: function (d) { return getISOWeekYear(d).week; }, 
		v: function (d) {
				return formats.e(d) + '-' + formats.b(d) + '-' +
					formats.Y(d);
			},
		W: function (d) { return pad(weekNumber(d, 'monday'), 2, '0'); }, 
		w: function (d) { return d.getDay(); },
		X: function (d) { return d.toTimeString(); }, // wrong?
		x: function (d) { return d.toDateString(); }, // wrong?
		Y: function (d) { return d.getFullYear(); },
		y: function (d) { return pad((d.getYear() % 100), 2, '0'); },
//		Z: function (d) { return d.toString().match(/\((.+)\)$/)[1]; },
//		z: function (d) { return d.getTimezoneOffset(); }, // wrong
//		z: function (d) { return d.toString().match(/\sGMT([+-]\d+)/)[1]; },
		'%': function (d) { return '%'; }
	};

formats['+'] = formats.c;
formats.h = formats.b;

var defaultLocale = 'en';

function strftime(date, fmt, locale) {
    var r = '';
    var n = 0;
    if (!locale) { locale = defaultLocale; }
    while(n < fmt.length) {
        var c = fmt.substring(n, n+1);
        if (c == '%') {
            c = fmt.substring(++n, n+1);
            r += (formats[c]) ? formats[c](date, locale) : c;
        } else r += c;
        ++n;
    }
    return r;
}

Date.prototype.strftime = function (fmt, locale) {
    return strftime(this, fmt, locale);
};

Date.prototype.strftime.formats = formats;
Date.prototype.strftime.setDefaultLocale = function (locale) {
    defaultLocale = locale;
};
Date.prototype.strftime.locales = locales;

})();

    // firstWeekday: 'sunday' or 'monday', default is 'sunday'
    //
    // Pilfered & ported from Ruby's strftime implementation.
    function weekNumber(date, firstWeekday) {
        firstWeekday = firstWeekday || 'sunday';

        // This works by shifting the weekday back by one day if we
        // are treating Monday as the first day of the week.
        var weekday = date.getDay();
        if (firstWeekday === 'monday') {
            if (weekday === 0) // Sunday
                weekday = 6;
            else
                weekday--;
        }

        var firstDayOfYearUtc = Date.UTC(date.getFullYear(), 0, 1),
            dateUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
            yday = Math.floor((dateUtc - firstDayOfYearUtc) / 86400000),
            weekNum = (yday + 7 - weekday) / 7;

        return Math.floor(weekNum);
    }

function getISOWeekYear(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7; // Sunday = 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum); // Move to nearest Thursday
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return { year: d.getUTCFullYear(), week: weekNo };
}
