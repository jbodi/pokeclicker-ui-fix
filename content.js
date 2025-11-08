// Ensure it runs even if the DOM is already loaded
const CLICK_DELAY_MS = 120;
const MAX_FILL_CLICKS = 200; // safety cap
const UPDATE_INTERVAL_MS = 500;
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", waitForModal);
} else {
  waitForModal();
}

function waitForModal() {
  const isVisible = (el) => !!el && window.getComputedStyle(el).display !== "none";

  const setupObserver = (modal) => {
    if (modal.__extBreedingObserver) {
      return;
    }

    const observer = new MutationObserver(() => {
      const visible = isVisible(modal);
      const wasVisible = modal.dataset.extVisible === "1";

      if (visible && !wasVisible) {
        modal.dataset.extVisible = "1";
        initButton(modal);
        startUpdating(modal);
      } else if (!visible && wasVisible) {
        modal.dataset.extVisible = "0";
        stopUpdating(modal);
      }
    });

    observer.observe(modal, { attributes: true, attributeFilter: ["style", "class"] });
    modal.__extBreedingObserver = observer;

    // Initial state
    if (isVisible(modal)) {
      modal.dataset.extVisible = "1";
      initButton(modal);
      startUpdating(modal);
    } else {
      modal.dataset.extVisible = "0";
    }
  };

  let modal = document.querySelector("#breedingModal");
  if (modal) {
    setupObserver(modal);
  } else {
    const waitForModalDom = setInterval(() => {
      modal = document.querySelector("#breedingModal");
      if (modal) {
        clearInterval(waitForModalDom);
        setupObserver(modal);
      }
    }, 500);
  }
}

function initButton(modal) {
  // Locate the warning button (queue full)
  let warningButton = modal.querySelector(".btn.btn-danger.hatchery-warnings");
  if (!warningButton) {
    // Fallback by text in case the class changes
    warningButton = Array.from(modal.querySelectorAll("button"))
      .find((b) => b.textContent.trim().includes("Your breeding queue is full."));
  }

  if (!warningButton) {
    return;
  }

  // Avoid duplicates or reuse if already exists
  let fillButton = modal.querySelector("#breeding-fill-btn");
  const alreadyExists = !!fillButton;
  if (!fillButton) {
    fillButton = document.createElement("button");
    fillButton.id = "breeding-fill-btn";
    fillButton.type = "button";
    fillButton.className = "btn btn-success";
    fillButton.textContent = "Fill Queue";
    fillButton.style.display = "none";
    fillButton.addEventListener("click", () => {
      try {
        fillQueue(modal);
      } catch (e) {
        /* noop */
      }
    });
  }

  // Insert next to the warning button to keep layout/spacing
  if (warningButton.parentNode && !alreadyExists) {
    fillButton.style.marginLeft = warningButton.style.marginLeft;
    fillButton.style.marginTop = warningButton.style.marginTop;
    warningButton.parentNode.insertBefore(fillButton, warningButton.nextSibling);
  }

  // Store original display to restore when toggling
  if (!warningButton.dataset.extOriginalDisplay) {
    const displayOriginal = window.getComputedStyle(warningButton).display;
    warningButton.dataset.extOriginalDisplay = displayOriginal && displayOriginal !== "none" ? displayOriginal : "";
  }

  modal.__extBreedingWarningBtn = warningButton;
  modal.__extBreedingFillBtn = fillButton;
}

function updateVisibility(modal) {
  try {
    const warningButton = modal.__extBreedingWarningBtn || modal.querySelector(".btn.btn-danger.hatchery-warnings");
    const fillButton = modal.__extBreedingFillBtn || modal.querySelector("#breeding-fill-btn");

    if (!warningButton || !fillButton) {
      // Re-init in case of re-render
      initButton(modal);
      return;
    }

    // Real visibility of the warning button in the DOM
    const cs = window.getComputedStyle(warningButton);
    const originalVisible = cs.display !== "none" && cs.visibility !== "hidden" && warningButton.getClientRects().length > 0;

    if (originalVisible) {
      // Queue full -> show warning button, hide fill button
      fillButton.style.display = "none";
      warningButton.style.display = warningButton.dataset.extOriginalDisplay || "";
    } else {
      // Queue not full -> show fill button, hide warning button
      fillButton.style.display = "inline-block";
      warningButton.style.display = "none";
    }
  } catch (e) {
    /* noop */
  }
}


// Programmatically click an element
function clickElement(el) {
  try {
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
    el.dispatchEvent(ev);
  } catch {
    el.click?.();
  }
}

// Fill the queue by clicking the first list item repeatedly until the warning appears (queue full)
async function fillQueue(modal) {
  const fillButton = modal.__extBreedingFillBtn || modal.querySelector('#breeding-fill-btn');
  const warningButton = modal.__extBreedingWarningBtn || modal.querySelector('.btn.btn-danger.hatchery-warnings');

  if (!fillButton) return;

  // Disable while processing to avoid double-runs
  const previousDisabled = fillButton.disabled;
  fillButton.disabled = true;

  const isFull = () => {
    if (!warningButton) return false;
    const cs = window.getComputedStyle(warningButton);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && warningButton.getClientRects().length > 0;
  };

  // Already full? do nothing
  if (isFull()) {
    fillButton.disabled = previousDisabled;
    return;
  }

  // Always click the first <li> in the breeding list container
  const listContainer = modal.querySelector('#breeding-pokemon-list-container');
  if (!listContainer) {
    fillButton.disabled = previousDisabled;
    return;
  }

  let clicks = 0;
  while (!isFull() && clicks < MAX_FILL_CLICKS) {
    // Re-query the first li each iteration (in case of re-render)
    let li = listContainer.querySelector('li');
    if (!li) break;

    // If there's an inner actionable element, click that instead
    let target = li;
    const innerAction = li.querySelector('button, [role="button"], a');
    if (innerAction) target = innerAction;

    clickElement(target);
    clicks++;
    await new Promise(res => setTimeout(res, CLICK_DELAY_MS));
  }

  // Re-enable the button
  fillButton.disabled = previousDisabled;
}

function startUpdating(modal) {
  if (modal.__extBreedingInterval) {
    return;
  }
  // Update periodically while the modal is visible
  modal.__extBreedingInterval = setInterval(() => {
    const visible = window.getComputedStyle(modal).display !== "none";
    if (!visible) {
      stopUpdating(modal);
      return;
    }
    updateVisibility(modal);
  }, UPDATE_INTERVAL_MS);
}

function stopUpdating(modal) {
  if (modal.__extBreedingInterval) {
    clearInterval(modal.__extBreedingInterval);
    modal.__extBreedingInterval = null;
  }
}
