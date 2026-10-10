(function () {
  "use strict";

  /* ====== config ====== */
  var LAUNCH = new Date("2027-03-01T09:00:00+07:00"); // peluncuran platform Lambepadel (Q1 2027, WIB)
  var STORE_KEY = "lambepadel-notify-email";
  var CAL_TITLE = "LAMBEPADEL — Peluncuran Ekosistem Turnamen Padel";
  var CAL_DETAILS =
    "Registrasi, scoring, bracket, dan ranking turnamen padel dalam satu platform. " +
    "Kunjungi lambepadel.com di hari peluncuran.";
  var CAL_LOCATION = "lambepadel.com";
  var NOTIFY_ENDPOINT = "https://formsubmit.co/ajax/asraffahruddin741@gmail.com";
  var NOTIFY_SUBJECT = "[lambepadel.com] Email baru dari landing page";

  /* ====== countdown ====== */
  var el = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    mins: document.getElementById("cd-mins"),
    secs: document.getElementById("cd-secs"),
    done: document.getElementById("cd-done"),
  };
  var countdownBox = document.querySelector(".countdown");

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function tick() {
    var diff = LAUNCH.getTime() - Date.now();
    if (diff <= 0) {
      el.days.textContent = el.hours.textContent = el.mins.textContent = el.secs.textContent = "00";
      el.done.hidden = false;
      if (countdownBox) countdownBox.hidden = true;
      return;
    }
    var s = Math.floor(diff / 1000);
    el.days.textContent = pad(Math.floor(s / 86400));
    el.hours.textContent = pad(Math.floor((s % 86400) / 3600));
    el.mins.textContent = pad(Math.floor((s % 3600) / 60));
    el.secs.textContent = pad(s % 60);
  }

  tick();
  setInterval(tick, 1000);

  /* ====== google calendar "set reminder" ====== */
  function gcalStamp(d) {
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }

  var calLink = document.getElementById("cal-link");
  if (calLink) {
    var end = new Date(LAUNCH.getTime() + 60 * 60 * 1000);
    calLink.href =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent(CAL_TITLE) +
      "&dates=" + gcalStamp(LAUNCH) + "/" + gcalStamp(end) +
      "&details=" + encodeURIComponent(CAL_DETAILS) +
      "&location=" + encodeURIComponent(CAL_LOCATION);
  }

  /* ====== notify form ====== */
  var form = document.getElementById("notify-form");
  var input = document.getElementById("email");
  var err = document.getElementById("notify-err");
  var done = document.getElementById("notify-done");
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showDone() {
    form.hidden = true;
    err.hidden = true;
    done.hidden = false;
  }

  try {
    if (localStorage.getItem(STORE_KEY)) showDone();
  } catch (e) { /* localStorage unavailable */ }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var value = input.value.trim();

    if (!EMAIL_RE.test(value)) {
      err.hidden = false;
      form.classList.remove("shake");
      void form.offsetWidth;
      form.classList.add("shake");
      input.focus();
      return;
    }

    try { localStorage.setItem(STORE_KEY, value); } catch (e) { /* ignore */ }
    showDone();

    /* Fire-and-forget: kirim email notifikasi ke pemilik situs. */
    if (window.fetch) {
      fetch(NOTIFY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: value,
          sumber: "lambepadel.com",
          _subject: NOTIFY_SUBJECT,
          _template: "table",
          _captcha: "false",
        }),
      }).catch(function () { /* ignore */ });
    }
  });
})();
