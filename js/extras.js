// Ignacio Palacios Clar — extra animations
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var css = getComputedStyle(document.documentElement);
  var C = {
    ink: css.getPropertyValue("--ink").trim() || "#23272C",
    soft: css.getPropertyValue("--ink-soft").trim() || "#5A626C",
    line: css.getPropertyValue("--line").trim() || "#DDDDD6",
    accent: css.getPropertyValue("--accent").trim() || "#3E6B4F"
  };
  function ease(t) { return t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3); }
  function clamp(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
  function onVisible(el, fn, threshold) {
    if (!el) return;
    if (!("IntersectionObserver" in window)) { fn(); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); fn(); } });
    }, { threshold: threshold || 0.4 });
    io.observe(el);
  }

  // ----- Hero: a P&L whose figures scatter and resolve into the name -----
  var cv = document.getElementById("name-canvas");
  if (cv) {
    var ctx = cv.getContext("2d");
    var W = 1600, H = 560;
    var LINES = ["Ignacio", "Palacios Clar"];
    var labels = ["Revenue","Cost of sales","Gross margin","Personnel","IT & software","Marketing","Professional fees","EBITDA","Net income","Cash position"];
    var months = ["Jan 26","Feb 26","Mar 26","Apr 26","May 26","Jun 26","Jul 26"];
    var rowH = 44, top = 70, labelW = 300, colW = (W - labelW - 20) / months.length;
    var cells = [];
    labels.forEach(function (l, r) {
      months.forEach(function (m, c) {
        var v = Math.round((Math.random() * 480000 + 6000) * (r === 9 ? 3 : 1));
        var neg = r === 1 || (r > 2 && r < 7);
        var txt = (neg ? "(" : "") + v.toLocaleString("en-US") + (neg ? ")" : "");
        var x = labelW + colW * (c + 1) - 14, y = top + rowH * (r + 1) + 28;
        cells.push({ t: txt, x: x, y: y,
          tx: Math.random() * W, ty: 40 + Math.random() * (H - 60),
          pop: Math.random() < 0.3 ? 1.25 + Math.random() * 0.5 : 1,
          big: Math.random() < 0.12, d: Math.random() * 350 });
      });
    });
    var nameSize = 200;
    function layoutName() {
      ctx.font = "600 200px Fraunces, Georgia, serif";
      var w = Math.max(ctx.measureText(LINES[0]).width, ctx.measureText(LINES[1]).width);
      nameSize = Math.min(240, 200 * (W * 0.86) / w);
    }
    function drawName(a, lift) {
      if (a <= 0) return;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = C.ink;
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.font = "600 " + nameSize + "px Fraunces, Georgia, serif";
      ctx.fillText(LINES[0], 6, nameSize * 1.0 + 10 + lift);
      ctx.fillText(LINES[1], 6, nameSize * 2.05 + 10 + lift);
      ctx.restore();
    }
    function frame(ms) {
      ctx.clearRect(0, 0, W, H);
      var tableA = clamp(ms / 400) * (1 - clamp((ms - 1000) / 600));
      // grid and labels
      if (tableA > 0) {
        ctx.save(); ctx.globalAlpha = tableA;
        ctx.strokeStyle = C.line; ctx.lineWidth = 1.5;
        for (var r = 0; r <= labels.length + 1; r++) { ctx.beginPath(); ctx.moveTo(0, top + rowH * r); ctx.lineTo(W, top + rowH * r); ctx.stroke(); }
        ctx.font = "600 22px Inter, sans-serif"; ctx.fillStyle = C.ink; ctx.textAlign = "left";
        ctx.fillText("P&L · EUR", 14, top + 30);
        ctx.textAlign = "right";
        months.forEach(function (m, c) { ctx.fillText(m, labelW + colW * (c + 1) - 14, top + 30); });
        ctx.textAlign = "left"; ctx.fillStyle = C.soft; ctx.font = "400 22px Inter, sans-serif";
        labels.forEach(function (l, i) { ctx.fillText(l, 14, top + rowH * (i + 1) + 28); });
        ctx.restore();
      }
      // figures
      ctx.textAlign = "right";
      cells.forEach(function (c) {
        var appear = clamp(ms / 400);
        var popT = clamp((ms - 450 - c.d * 0.6) / 350);
        var s = 1 + (c.pop - 1) * Math.sin(popT * Math.PI) * (ms < 1300 ? 1 : 0) + (c.big ? ease((ms - 1100) / 900) * 1.4 : 0);
        var m = ease((ms - 1050 - c.d) / 900);
        var x = c.x + (c.tx - c.x) * m, y = c.y + (c.ty - c.y) * m;
        var a = appear * (1 - clamp((ms - 1700 - c.d) / 700));
        if (a <= 0) return;
        ctx.save(); ctx.globalAlpha = a;
        ctx.translate(x, y); ctx.scale(s, s);
        ctx.font = (c.pop > 1 || c.big ? "600 " : "400 ") + "22px Inter, sans-serif";
        ctx.fillStyle = c.big ? C.accent : C.ink;
        ctx.fillText(c.t, 0, 0);
        ctx.restore();
      });
      // name
      var na = ease((ms - 1650) / 900);
      drawName(na, (1 - na) * 24);
    }
    var start = function () {
      layoutName();
      if (reduce) { frame(99999); return; }
      var t0 = null;
      function loop(ts) {
        if (t0 === null) t0 = ts;
        var ms = ts - t0;
        frame(ms);
        if (ms < 2900) requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);
    };
    var started = false;
    var go = function () { if (!started) { started = true; start(); } };
    if (document.fonts && document.fonts.load) {
      Promise.all([document.fonts.load("600 200px Fraunces"), document.fonts.load("400 22px Inter"), document.fonts.load("600 22px Inter")]).then(go, go);
      setTimeout(go, 1200);
    } else { go(); }
  }

  // ----- Count-up for every figure -----
  document.querySelectorAll("dd[data-count]").forEach(function (dd) {
    var original = dd.innerHTML;
    var nums = original.match(/\d+/g);
    if (!nums || reduce) return;
    onVisible(dd, function () {
      var t0 = null, dur = 1100;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = ease((ts - t0) / dur), i = 0;
        dd.innerHTML = original.replace(/\d+/g, function (n) { i++; return String(Math.round(parseInt(n, 10) * p)); });
        if (p < 1) requestAnimationFrame(step); else dd.innerHTML = original;
      }
      requestAnimationFrame(step);
    }, 0.6);
  });

  // ----- Close calendar: 12 working days shrink to 3 -----
  var grid = document.getElementById("closeGrid"), num = document.getElementById("closeDays");
  if (grid && num) {
    var days = [];
    for (var i = 1; i <= 12; i++) { var d = document.createElement("div"); d.className = "closecal__day"; d.textContent = i; grid.appendChild(d); days.push(d); }
    var finish = function () { days.forEach(function (d, i) { d.className = "closecal__day " + (i < 3 ? "is-done" : "is-freed"); }); num.textContent = "3"; };
    if (reduce) finish();
    else onVisible(grid, function () {
      var n = 12;
      setTimeout(function step() {
        if (n > 3) { n--; days[n].className = "closecal__day is-freed"; num.textContent = n; setTimeout(step, 150); }
        else days.slice(0, 3).forEach(function (d, i) { setTimeout(function () { d.className = "closecal__day is-done"; }, i * 180); });
      }, 500);
    }, 0.6);
  }

  // ----- Nav mark: digits reshuffle on hover -----
  var mark = document.querySelector(".nav__mark");
  if (mark && !reduce) {
    var texts = mark.querySelectorAll("text"), busy = false;
    mark.addEventListener("mouseenter", function () {
      if (busy) return; busy = true;
      var k = 0, iv = setInterval(function () {
        texts.forEach(function (t) { t.textContent = t.textContent.replace(/\d/g, function () { return Math.floor(Math.random() * 10); }); });
        if (++k > 8) { clearInterval(iv); busy = false; }
      }, 45);
    });
  }
})();
