/*
 * Ripple effect functionality
 */

interface ClickRippleEvent extends MouseEvent {
  pageX: number;
  pageY: number;
}

interface ClickRippleElement extends HTMLElement {
  clickRipple?: (event: ClickRippleEvent, el: ClickRippleElement) => void;
}

export default {
  beforeMount: function (el: ClickRippleElement): void {
    // Add specific CSS styles to element
    el.style.overflow = "hidden";
    el.style.position = "relative";
    el.style.zIndex = "1";

    // Setup ripple functionality
    el.clickRipple = (event: ClickRippleEvent, el: ClickRippleElement): void => {
      const cssClass = "click-ripple";
      let rippleElements = el.querySelectorAll("." + cssClass);
      let d: number, x: number, y: number;

      // If the ripple element doesn't exist in this element, add it..
      if (rippleElements.length === 0) {
        const elChild = document.createElement("span");
        elChild.classList.add(cssClass);

        el.insertBefore(elChild, el.firstChild);
      } else {
        // ..else remove .animate class from ripple element
        (rippleElements[0] as HTMLElement).classList.remove("animate");
      }

      // Get the ripple element
      const ripple = el.querySelectorAll("." + cssClass)[0] as HTMLElement;

      // If the ripple element doesn't have dimensions, set them accordingly
      if (
        getComputedStyle(ripple).height === "0px" ||
        getComputedStyle(ripple).width === "0px"
      ) {
        d = Math.max(el.offsetWidth, el.offsetHeight);

        ripple.style.height = d + "px";
        ripple.style.width = d + "px";
      }

      // Get coordinates for our ripple element
      x =
        event.pageX -
        (el.getBoundingClientRect().left + window.scrollX) -
        parseFloat(getComputedStyle(ripple).width.replace("px", "")) / 2;
      y =
        event.pageY -
        (el.getBoundingClientRect().top + window.scrollY) -
        parseFloat(getComputedStyle(ripple).height.replace("px", "")) / 2;

      // Position the ripple element and add the class .animate to it
      ripple.style.top = y + "px";
      ripple.style.left = x + "px";
      ripple.classList.add("animate");
    };

    // Attach the click event to the element
    const clickHandler = (event: ClickRippleEvent) => {
      if (el.clickRipple) {
        el.clickRipple(event, el);
      }
    };
    
    el.addEventListener("click", clickHandler);
    
    // Store the handler reference for cleanup
    (el as any)._clickHandler = clickHandler;
  },
  unmounted: (el: ClickRippleElement): void => {
    const clickHandler = (el as any)._clickHandler;
    if (clickHandler) {
      el.removeEventListener("click", clickHandler);
    }
  },
}; 