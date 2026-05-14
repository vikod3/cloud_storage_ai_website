const shaderFrame = document.querySelector(".shader-bg");
const shaderBaseUrl = "https://fragcoord.xyz/embed/c6zisyc6";
const maxShaderWidth = 1422;
const maxShaderHeight = 800;
const consoleTabs = Array.from(document.querySelectorAll(".console-tab"));
const consolePanes = Array.from(document.querySelectorAll(".console-pane"));
const accordionSection = document.querySelector(".platform-accordion");
const accordionTabs = Array.from(document.querySelectorAll("[data-accordion-tab]"));
const accordionCards = Array.from(document.querySelectorAll("[data-accordion-card]"));
const pricingSection = document.querySelector(".pricing-section");
const pricingBars = Array.from(document.querySelectorAll(".pricing-bar"));
const operationsCube = document.querySelector(".modal-cube-shell");
let typingTimer;

function updateShaderViewport() {
  if (!shaderFrame) return;
  const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
  let width = maxShaderWidth;
  let height = Math.round(width / aspect);

  if (height > maxShaderHeight) {
    height = maxShaderHeight;
    width = Math.round(height * aspect);
  }

  width = Math.max(320, Math.min(maxShaderWidth, width));
  height = Math.max(180, Math.min(maxShaderHeight, height));

  const nextSrc = `${shaderBaseUrl}?viewport=${width}x${height}`;
  if (shaderFrame.src !== nextSrc) shaderFrame.src = nextSrc;

  const scale = Math.max(window.innerWidth / width, (window.innerHeight + 110) / height);
  shaderFrame.style.setProperty("--shader-scale", scale.toFixed(3));
  shaderFrame.style.width = `${width}px`;
  shaderFrame.style.height = `${height}px`;
}

let resizeTimer;
window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(updateShaderViewport, 180);
});

updateShaderViewport();

function typeInto(target) {
  const value = target.dataset.typed || "";
  let index = 0;
  target.textContent = "";
  target.dataset.typing = "true";

  function tick() {
    target.textContent = value.slice(0, index);
    index += 1;

    if (index <= value.length) {
      typingTimer = window.setTimeout(tick, 42);
      return;
    }

    target.dataset.typing = "false";
  }

  tick();
}

function activateConsoleTab(tabName) {
  window.clearTimeout(typingTimer);

  consoleTabs.forEach((tab) => {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  consolePanes.forEach((pane) => {
    const isActive = pane.dataset.pane === tabName;
    pane.classList.toggle("active", isActive);
    pane.hidden = !isActive;

    if (isActive) {
      const typedTarget = pane.querySelector("[data-typed]");
      if (typedTarget) typeInto(typedTarget);
    }
  });
}

consoleTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activateConsoleTab(tab.dataset.tab);
  });
});

activateConsoleTab("cli");

function activateAccordionPanel(panelName) {
  accordionTabs.forEach((tab) => {
    const isActive = tab.dataset.accordionTab === panelName;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  accordionCards.forEach((card) => {
    card.classList.toggle("active", card.dataset.accordionCard === panelName);
  });
}

function updateScrollAccordion() {
  if (!accordionSection || !accordionCards.length) return;

  const rect = accordionSection.getBoundingClientRect();
  const scrollable = Math.max(1, rect.height - window.innerHeight);
  const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
  const maxIndex = accordionCards.length - 1;
  const rawIndex = progress * maxIndex;
  const activeIndex = Math.min(maxIndex, Math.max(0, Math.round(rawIndex)));
  const stack = document.querySelector(".accordion-stack");
  const stackHeight = stack ? stack.clientHeight : window.innerHeight * 0.74;
  const collapsedHeight = window.innerWidth <= 820 ? 96 : 84;

  const cardPositions = accordionCards.map((_, index) => {
    let y = 0;

    if (index > 0) {
      const segmentProgress = Math.min(1, Math.max(0, rawIndex - (index - 1)));
      const startY = stackHeight + collapsedHeight;
      const endY = index * collapsedHeight;
      y = startY + (endY - startY) * segmentProgress;
    }

    return Math.round(y);
  });

  accordionCards.forEach((card, index) => {
    const y = cardPositions[index];
    const nextY = cardPositions[index + 1];
    const visibleHeight = typeof nextY === "number" ? Math.max(collapsedHeight, Math.min(stackHeight, nextY + 2)) : stackHeight;
    const clipBottom = Math.max(0, stackHeight - visibleHeight);

    card.style.setProperty("--card-y", `${Math.round(y)}px`);
    card.style.setProperty("--card-clip-bottom", `${Math.round(clipBottom)}px`);
    card.style.zIndex = String(index + 1);
  });

  const activeCard = accordionCards[activeIndex];
  if (activeCard) activateAccordionPanel(activeCard.dataset.accordionCard);
}

accordionTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    if (!accordionSection || !accordionCards.length) return;
    const index = accordionCards.findIndex((card) => card.dataset.accordionCard === tab.dataset.accordionTab);
    const maxIndex = accordionCards.length - 1;
    const scrollable = accordionSection.offsetHeight - window.innerHeight;
    const target = accordionSection.offsetTop + (index / maxIndex) * scrollable;
    window.scrollTo({ top: target, behavior: "smooth" });
  });
});

window.addEventListener("scroll", updateScrollAccordion, { passive: true });
window.addEventListener("resize", updateScrollAccordion);
updateScrollAccordion();

function updatePricingBars() {
  if (!pricingSection || !pricingBars.length) return;

  const rect = pricingSection.getBoundingClientRect();
  const viewport = window.innerHeight || 1;
  const progress = Math.min(1, Math.max(0, (viewport - rect.top) / (viewport + rect.height)));

  pricingBars.forEach((bar, index) => {
    const wave = Math.sin(progress * Math.PI * 2 + index * 0.72);
    const secondaryWave = Math.cos(progress * Math.PI + index * 0.34);
    const morph = Math.round(wave * 34 + secondaryWave * 14);
    bar.style.setProperty("--bar-morph", `${morph}px`);
  });
}

window.addEventListener("scroll", updatePricingBars, { passive: true });
window.addEventListener("resize", updatePricingBars);
updatePricingBars();

if (operationsCube) {
  const toggleCube = () => operationsCube.classList.toggle("is-exploded");

  operationsCube.addEventListener("click", toggleCube);
  operationsCube.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      toggleCube();
    }
  });
}
