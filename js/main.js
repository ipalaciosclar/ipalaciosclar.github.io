// Ignacio Palacios Clar — resume site

(function () {
  "use strict";

  // ----- Hero video: play once, hold the last frame -----
  // If playback can't happen (autoplay blocked, decode/network error, or the
  // user prefers reduced motion), swap in the last-frame image so the hero
  // never looks empty.
  var heroVideo = document.querySelector(".hero__media video");
  if (heroVideo) {
    var heroFallback = function () {
      if (!heroVideo.parentNode) return;
      var img = document.createElement("img");
      img.src = heroVideo.getAttribute("poster");
      img.alt = "";
      heroVideo.replaceWith(img);
    };

    heroVideo.addEventListener("error", heroFallback);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      heroFallback();
    } else {
      heroVideo.muted = true; // some browsers ignore the attribute for autoplay policy
      var playAttempt = heroVideo.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(heroFallback);
      }
    }
  }

  // ----- Mobile nav toggle -----
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("nav-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close the menu after choosing a section
    menu.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ----- Certificate pop-up -----
  // Links marked data-lightbox show their image in a pop-up. Without
  // <dialog> support they simply open in a new tab as before.
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");

  if (lightbox && lightboxImg && typeof lightbox.showModal === "function") {
    document.addEventListener("click", function (event) {
      var link = event.target.closest ? event.target.closest("a[data-lightbox]") : null;
      if (!link) return;
      event.preventDefault();
      var thumb = link.querySelector("img");
      lightboxImg.src = link.getAttribute("href");
      lightboxImg.alt = thumb ? thumb.alt : link.textContent.trim();

      // The pop-up grows out of whatever was clicked: tell the CSS how far
      // that spot is from the centre of the screen.
      var from = (thumb || link).getBoundingClientRect();
      lightbox.style.setProperty("--from-x", (from.left + from.width / 2 - window.innerWidth / 2) + "px");
      lightbox.style.setProperty("--from-y", (from.top + from.height / 2 - window.innerHeight / 2) + "px");

      lightbox.classList.remove("is-closing");
      lightbox.showModal();
    });

    // Play the closing animation first, then really close
    var closeLightbox = function () {
      if (!lightbox.open || lightbox.classList.contains("is-closing")) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { lightbox.close(); return; }
      lightbox.classList.add("is-closing");
      window.setTimeout(function () {
        lightbox.classList.remove("is-closing");
        lightbox.close();
      }, 220);
    };

    // Close on the × button, a click on the dimmed area, or Esc
    lightbox.addEventListener("click", function (event) {
      if (event.target !== lightboxImg) closeLightbox();
    });
    lightbox.addEventListener("cancel", function (event) {
      event.preventDefault();
      closeLightbox();
    });
  }

  // ----- Reveal-on-scroll -----
  var revealables = document.querySelectorAll(".reveal");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -5% 0px" }
  );

  revealables.forEach(function (el) { observer.observe(el); });
})();
