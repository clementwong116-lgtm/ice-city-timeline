(function () {
  var DISMISS_KEY = "ice-city-install-dismissed";
  var state = SteamDay.resolve(new Date());
  var announced = "";

  function padClock(parts) {
    return SteamDay.clock(parts);
  }

  function applyNow() {
    state = SteamDay.resolve(new Date());
    var nodes = document.querySelectorAll("[data-id]");
    nodes.forEach(function (node) {
      node.classList.remove("is-now");
      if (node.getAttribute("aria-current") === "time") node.removeAttribute("aria-current");
    });

    var status = document.getElementById("now-status");
    var live = document.getElementById("now-live");
    if (!state.eventDay) {
      status.hidden = true;
      status.textContent = "";
      return;
    }

    var clock = padClock(state.parts);
    var message;
    if (!state.block) {
      message = "現在 " + clock + "　活動尚未開始，07:40 值崗";
      status.className = "now-status tone-wait";
    } else {
      message = "現在 " + clock + "　" + state.block.label;
      status.className = "now-status tone-" + state.block.id;
      document.querySelectorAll('[data-id="' + state.block.id + '"]').forEach(function (node) {
        node.classList.add("is-now");
        node.setAttribute("aria-current", "time");
      });
    }
    status.hidden = false;
    status.textContent = message;
    if (live && announced !== message) {
      live.textContent = message;
      announced = message;
    }
  }

  function dismissed() {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch (err) {
      return false;
    }
  }

  function rememberDismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch (err) {
      /* private mode */
    }
  }

  function standalone() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  function iosDevice() {
    var ua = navigator.userAgent || "";
    var iPadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    return /iPad|iPhone|iPod/.test(ua) || iPadOs;
  }

  function showHint(text, withButton) {
    var hint = document.getElementById("install-hint");
    var label = document.getElementById("install-text");
    var action = document.getElementById("install-action");
    if (!hint || !label || !action) return;
    label.textContent = text;
    action.hidden = !withButton;
    hint.hidden = false;
  }

  function hideHint() {
    var hint = document.getElementById("install-hint");
    if (hint) hint.hidden = true;
  }

  function setupInstall() {
    if (standalone() || dismissed()) return;
    var deferred = null;
    var action = document.getElementById("install-action");
    var dismiss = document.getElementById("install-dismiss");

    window.addEventListener("beforeinstallprompt", function (event) {
      event.preventDefault();
      deferred = event;
      showHint("可安裝到主畫面。首次載入完成後，沒有網絡亦可查看當日流程。", true);
    });

    if (action) {
      action.addEventListener("click", function () {
        if (!deferred) return;
        deferred.prompt();
        deferred.userChoice.finally(function () {
          deferred = null;
          hideHint();
          rememberDismiss();
        });
      });
    }
    if (dismiss) {
      dismiss.addEventListener("click", function () {
        hideHint();
        rememberDismiss();
      });
    }

    if (iosDevice()) {
      showHint("如需離線使用：點分享按鈕，選擇「加入主畫面」。", false);
    }
  }

  function setupOfflineNote() {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("sw.js", { scope: "./", updateViaCache: "none" }).catch(function () {
      /* page still works online */
    });
    navigator.serviceWorker.ready.then(function () {
      var note = document.getElementById("offline-note");
      if (note) note.textContent = "已儲存於這部裝置，沒有網絡亦可查看當日流程。";
    });
  }

  function scrollCurrent() {
    if (!state.eventDay || !state.block) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var narrow = window.matchMedia("(max-width: 719px)").matches;
    var target = document.getElementById(state.block.id);
    if (!target) return;
    if (!narrow && (state.block.id === "recess1" || state.block.id === "recess2")) return;
    target.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  applyNow();
  setupInstall();
  setupOfflineNote();
  window.setInterval(applyNow, 30000);
  window.setTimeout(scrollCurrent, 400);
})();
