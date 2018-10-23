var Hammer = require("hammerjs");
var Static = require("Static.js");

function ImageSlider( element, options ) {

	var api = {
		destroy: destroy
	}
	var classes = {
		PAGINATION: "image-slider__nav--pagination",
		PAGINATION_ITEM: "image-slider__nav--pagination__item",
		NAV: "image-slider__nav--linear",
		NAV_PREV: "image-slider__nav--linear__prev",
		NAV_NEXT: "image-slider__nav--linear__next",
		IMAGE: "image-slider__image",
		CONTAINER: "image-slider__images",
		DISABLED: "button--disabled",
		CURRENT: "current",
	}

	// dom
	var images = null;
	var pagination = null;
	var nav = null;
	var paginationItems = null;
	var navPrev = null;
	var navNext = null;

	var currentIndex = -1;

	// eventhandlers
	var navPrevHandler = null;
	var navNextHandler = null;
	var paginationHandlers = null;
	var swipeHandler = null;
	var autoplayInt = null;

	function initialize() {

		// console.log("initialize");
		options = options || {};

		images          = element.querySelectorAll("." + classes.IMAGE);
		container       = element.querySelectorAll("." + classes.IMAGES);
		pagination      = element.querySelector("." + classes.PAGINATION);
		paginationItems = element.querySelectorAll("." + classes.PAGINATION_ITEM);
		nav             = element.querySelector("." + classes.NAV);
		navPrev         = element.querySelector("." + classes.NAV_PREV);
		navNext         = element.querySelector("." + classes.NAV_NEXT);

		if ( !images || images.length === 1 ) {

			pagination.style.display = "none";
			nav.style.display        = "none";
			return;
		}

		// bind events
		if ( navPrev ) {

			bindNextButton();
		}
		if ( navNext ) {

			bindPrevButton();
		}
		if ( paginationItems ) {

			bindPaginationItems();
		}
		bindSwipe();

		if ( options.autoplay ) {
			autoplayInt = window.setInterval(onAutoplayInterval, options.autoplay);
		}

		Static.each(element.querySelectorAll("*"), function (element) {
			element.addEventListener("dragstart", preventDefault);
		});

		setIndex(0);
	}

	function destroy() {

		// console.log("destroy");

		unbindPaginationItems();
		unbindPrevButton();
		unbindNextButton();
		unbindSwipe();
		window.clearInterval(autoplayInt);
 	}

 	function preventDefault(event) {
 		event.preventDefault();
 	}

 	function bindSwipe() {

 		if ( !swipeHandler ) {
 			swipeHandler = new Hammer(element);
 		}
 		swipeHandler.on("swipe", onSwipe);
 	}

 	function unbindSwipe() {

 		if ( swipeHandler ) {
 			swipeHandler.off("swipe", onSwipe);
 			swipeHandler.destroy();
 			swipeHandler = null;
 		}
 	}

 	function bindPaginationItems() {

 		// console.log("bindPaginationItems");

 		if ( !paginationHandlers ) {

 			paginationHandlers = Static.map(paginationItems, function (item) {
				return new Hammer(item);
			});
 		}
		Static.each(paginationHandlers, function (hammer) {
			hammer.on("tap", onNavRequest);
		});
 	}

 	function unbindPaginationItems() {

 		// console.log("unbindPaginationItems");

 		Static.each(paginationHandlers, function (hammer) {
 			if ( hammer ) {
 				hammer.off("tap", onNavRequest);
				hammer.destroy();
 			}
		});
		paginationHandlers = null;
 	}

 	function bindPrevButton() {

 		// console.log("bindPrevButton");

 		if ( !navPrevHandler ) {
 			navPrevHandler = new Hammer(navPrev);
 		}
 		navPrevHandler.on("tap", onPrevRequest);
 	}

 	function unbindPrevButton() {

 		// console.log("unbindPrevButton");

 		if ( navPrevHandler ) {
 			navPrevHandler.off("tap", onPrevRequest);
 			navPrevHandler.destroy();
 			navPrevHandler = null;
 		}
 	}

 	function bindNextButton() {

 		// console.log("bindNextButton");

 		if ( !navNextHandler ) {
 			navNextHandler = new Hammer(navNext);
 		}
 		navNextHandler.on("tap", onNextRequest);
 	}

 	function unbindNextButton() {

 		// console.log("unbindNextButton");

 		if ( navNextHandler ) {
 			navNextHandler.off("tap", onNextRequest);
 			navNextHandler.destroy();
 			navNextHandler = null;
 		}
 	}

 	function onAutoplayInterval() {

 		var savedValue = options.endlessMode;
 		options.endlessMode = true;
 		setIndex(currentIndex + 1);
 		options.endlessMode = savedValue;
 	}

	function setIndex(value) {

		// console.log("setIndex", value);

		switch ( value ) {

			case currentIndex:
				return;

			case -1:
				if (options.endlessMode) {
					value = images.length - 1;
					break;
				} else {
					return;
				}

			case images.length:
				if (options.endlessMode) {
					value = 0;
					break;
				} else {
					return;
				}
		}


		// set button classes
		var isLastIndex = value == images.length - 1;
		var isFirstIndex = value == 0;

		if ( navPrev ) {

			if ( isFirstIndex ) {

				navPrev.classList.add(classes.DISABLED);

			} else if (navPrev.classList.contains(classes.DISABLED)) {

				navPrev.classList.remove(classes.DISABLED);
			}
		}
		if ( navNext ) {

			if ( isLastIndex ) {

				navNext.classList.add(classes.DISABLED);

			} else if ( navNext.classList.contains(classes.DISABLED) ) {

				navNext.classList.remove(classes.DISABLED);
			}
		}



		if ( images[value] ) {

			Static.each(images, function (item, i) {

				var paginationItem = paginationItems[i];
				var relativeIndex = i - value;
				item.setAttribute("data-index", relativeIndex);
				item.style.transform = "translateX(" + (relativeIndex * 100) + "%)";

				if ( paginationItem ) {
					if ( i == value ) {
						paginationItem.classList.add(classes.CURRENT);
					} else {
						paginationItem.classList.remove(classes.CURRENT);
					}
				}
			});
			element.setAttribute("data-index", value);
			currentIndex = value;
		}
	}

	function onNavRequest(event) {

		// console.log("onNavRequest");
		window.clearInterval(autoplayInt);

		Static.each(paginationItems, function (item, i) {
			if ( item.isEqualNode(event.target) ) {
				setIndex(i);
			}
		});
	}

	function onPrevRequest(event) {

		// console.log("onPrevRequest");
		window.clearInterval(autoplayInt);

		setIndex(currentIndex - 1);
	}

	function onNextRequest(event) {

		// console.log("onNextRequest");
		window.clearInterval(autoplayInt);

		setIndex(currentIndex + 1);
	}

	function onSwipe(event) {

		window.clearInterval(autoplayInt);

		if ( event.deltaX > 0 ) {
			setIndex(currentIndex - 1);
		} else {
			setIndex(currentIndex + 1);
		}
	}

	function keepElementAtScrollpos(el) {

		// console.log("keepElementAtScrollpos");

		if ('scrollBy' in window) {

			var lastYfromViewport = el.offsetTop - window.pageYOffset;

			requestAnimationFrame(function () {

				var currentYfromViewport = el.offsetTop - window.pageYOffset;

				window.scrollBy(0, currentYfromViewport - lastYfromViewport);
			});
		}
	}

	return initialize(), api;
}
if ( typeof module == "object" ) {
	module.exports = window.ImageSlider = ImageSlider;
}

