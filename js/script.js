$(function () {
  const $header = $("header");
  const $desktopMenu = $(".gnb_depth1");
  let desktopMenuCloseTimer;

  const openDesktopMenu = function () {
    window.clearTimeout(desktopMenuCloseTimer);
    if (!$desktopMenu.is(":visible")) $desktopMenu.stop(true, true).slideDown(180);
  };
  const scheduleDesktopMenuClose = function () {
    window.clearTimeout(desktopMenuCloseTimer);
    desktopMenuCloseTimer = window.setTimeout(() => {
      $desktopMenu.stop(true, true).slideUp(180);
    }, 350);
  };

  // Desktop dropdown: keep it open while the pointer moves into the submenu.
  $(".gnb > li").on("mouseenter focusin", openDesktopMenu);
  $(".gnb").on("mouseleave", scheduleDesktopMenuClose);
  $desktopMenu
    .on("mouseenter", openDesktopMenu)
    .on("mouseleave", scheduleDesktopMenuClose);
  $header.on("focusout", function (event) {
    if (!this.contains(event.relatedTarget)) $desktopMenu.stop(true, true).slideUp(180);
  });

  // Switch the archive image from the matching list item.
  const $archiveItems = $(".archive_list li");
  const $archiveImages = $(".archive_img a");
  $archiveItems.each(function (index) {
    $(this).on("mouseenter focusin", function () {
      $archiveImages.removeClass("is-active").eq(index).addClass("is-active");
    });
  });

  // Mobile drawer and expandable navigation groups.
  const $mobileMenu = $(".m_menu");
  $(".menu_icon").on("click", function () {
    $mobileMenu.attr("aria-hidden", "false");
    $mobileMenu.stop(true, true).fadeIn(160);
    $mobileMenu.find(".close").trigger("focus");
  });
  $(".close").on("click", function () {
    $mobileMenu.attr("aria-hidden", "true");
    $mobileMenu.stop(true, true).fadeOut(160);
    $(".menu_icon").trigger("focus");
  });
  $mobileMenu.on("click", function (event) {
    if (event.target === this) {
      $(this).attr("aria-hidden", "true").stop(true, true).fadeOut(160);
      $(".menu_icon").trigger("focus");
    }
  });
  $(document).on("keydown", function (event) {
    if (event.key === "Escape" && $mobileMenu.is(":visible")) {
      $mobileMenu.attr("aria-hidden", "true").stop(true, true).fadeOut(160);
      $(".menu_icon").trigger("focus");
    }
  });
  $(".m_gnb_wrap").each(function () {
    $(this).on("click", function () {
      const $group = $(this).closest("li");
      $group.children(".m_sub").stop(true, true).slideToggle(180);
      $group.find(".icon_down").toggleClass("icon_rotate");
      $(this).attr("aria-expanded", String($(this).attr("aria-expanded") !== "true"));
    });
    $(this).on("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        $(this).trigger("click");
      }
    });
  });

  // The original CSS used `content` on wrapper divs, which cannot replace
  // their nested images. Swap the existing artwork on hover and keyboard focus.
  $(".ticket a, .login a").each(function () {
    const $link = $(this);
    const $image = $link.find("img");
    const normalSource = $image.attr("src");
    const hoverSource = $link.closest(".ticket").length
      ? "images/icon/icon_ticket_hover1.png"
      : "images/icon/icon_person_hover.png";
    $link.on("mouseenter focusin", () => $image.attr("src", hoverSource));
    $link.on("mouseleave focusout", () => $image.attr("src", normalSource));
  });

  if (typeof window.Swiper !== "function") return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const autoplay = prefersReducedMotion
    ? false
    : { delay: 2500, disableOnInteraction: false, pauseOnMouseEnter: true };

  const showcaseElement = document.querySelector(".swiper_showcase");
  const thumbElement = document.querySelector(".swiper_thumb");
  if (showcaseElement && thumbElement) {
    const wrapper = showcaseElement.querySelector(".swiper-wrapper");
    const originalSlides = Array.from(wrapper.querySelectorAll(":scope > .swiper-slide"));
    const slideCount = originalSlides.length;
    const makeLoopCopy = (slide) => {
      const copy = slide.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.querySelectorAll("a, button, input, [tabindex]").forEach((element) => {
        element.setAttribute("tabindex", "-1");
      });
      return copy;
    };
    const leadingCopies = document.createDocumentFragment();
    const trailingCopies = document.createDocumentFragment();
    originalSlides.forEach((slide) => leadingCopies.append(makeLoopCopy(slide)));
    originalSlides.forEach((slide) => trailingCopies.append(makeLoopCopy(slide)));
    wrapper.prepend(leadingCopies);
    wrapper.append(trailingCopies);

    const thumbSwiper = new Swiper(thumbElement, {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 0,
      breakpoints: {
        1024: { slidesPerView: 1, spaceBetween: 100 },
        1300: { slidesPerView: 2, spaceBetween: 100 },
      },
      watchSlidesProgress: true,
    });
    const showcaseSwiper = new Swiper(showcaseElement, {
      loop: false,
      initialSlide: slideCount,
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 500,
      autoplay,
      pagination: {
        el: showcaseElement.closest(".showcase").querySelector(".swiper-pagination"),
        type: "fraction",
        formatFractionCurrent: (current) => ((current - 1) % slideCount) + 1,
        formatFractionTotal: () => slideCount,
      },
      navigation: {
        nextEl: showcaseElement.closest(".showcase").querySelector(".swiper-button-next"),
        prevEl: showcaseElement.closest(".showcase").querySelector(".swiper-button-prev"),
      },
    });

    // The second track starts at B while the featured track starts at A.
    // Advance it by direction so the A-after-F wrap stays a continuous motion.
    const getMainIndex = () =>
      ((showcaseSwiper.activeIndex - slideCount) % slideCount + slideCount) % slideCount;
    const moveMainToIndex = (targetIndex, speed = 450) => {
      const currentIndex = getMainIndex();
      const forward = (targetIndex - currentIndex + slideCount) % slideCount;
      const backward = (currentIndex - targetIndex + slideCount) % slideCount;
      if (!forward) return;
      const distance = forward <= backward ? forward : -backward;
      showcaseSwiper.slideTo(showcaseSwiper.activeIndex + distance, speed);
    };
    let previousMainIndex = getMainIndex();
    let syncingFromThumb = false;
    showcaseSwiper.on("slideChange", () => {
      const currentMainIndex = getMainIndex();
      if (syncingFromThumb) {
        previousMainIndex = currentMainIndex;
        syncingFromThumb = false;
        return;
      }

      const forwardSteps = (currentMainIndex - previousMainIndex + slideCount) % slideCount;
      const backwardSteps = (previousMainIndex - currentMainIndex + slideCount) % slideCount;

      if (forwardSteps === 1) {
        thumbSwiper.slideNext(450);
      } else if (backwardSteps === 1) {
        thumbSwiper.slidePrev(450);
      } else if (currentMainIndex !== previousMainIndex) {
        // A click can skip ahead to the second visible preview.
        thumbSwiper.slideToLoop(currentMainIndex, 450);
      }
      previousMainIndex = currentMainIndex;
    });
    showcaseSwiper.on("transitionEnd", () => {
      const index = showcaseSwiper.activeIndex;
      if (index < slideCount || index >= slideCount * 2) {
        const logicalIndex = getMainIndex();
        showcaseSwiper.slideTo(slideCount + logicalIndex, 0, false);
        previousMainIndex = logicalIndex;
      }
    });
    thumbSwiper.on("slideChange", () => {
      // In the rotated B, C, ... A rail, its active index matches the
      // featured index after a drag. The card click handler below uses +1
      // because a click selects the card itself rather than advancing the rail.
      const targetMainIndex = thumbSwiper.realIndex;
      if (targetMainIndex === getMainIndex()) return;
      syncingFromThumb = true;
      moveMainToIndex(targetMainIndex, 450);
    });
    thumbSwiper.on("click", (swiper, event) => {
      const clickedLink = event.target.closest("a[href='#']");
      if (clickedLink) event.preventDefault();
      if (swiper.clickedIndex == null || !slideCount) return;
      const clickedSlide = swiper.slides[swiper.clickedIndex];
      const clickedRealIndex = Number(clickedSlide?.getAttribute("data-swiper-slide-index"));
      if (Number.isInteger(clickedRealIndex)) {
        moveMainToIndex((clickedRealIndex + 1) % slideCount, 450);
      }
    });
  }

  // Museum feature is selected by hovering or focusing its preview card.
  const museumMain = document.querySelector(".swiper_main");
  const museumThumb = document.querySelector(".swiper_sub");
  if (museumMain && museumThumb) {
    const museumThumbSwiper = new Swiper(museumThumb, {
      loop: false,
      slidesPerView: 3,
      spaceBetween: 10,
      watchSlidesProgress: true,
    });
    const museumMainSwiper = new Swiper(museumMain, {
      loop: false,
      slidesPerView: 1,
      thumbs: { swiper: museumThumbSwiper },
    });

    museumThumb.querySelectorAll(".swiper-slide").forEach((slide, index) => {
      const selectSlide = () => museumMainSwiper.slideTo(index, 450);
      slide.addEventListener("pointerenter", selectSlide);
      slide.addEventListener("focusin", selectSlide);
    });
  }
});
