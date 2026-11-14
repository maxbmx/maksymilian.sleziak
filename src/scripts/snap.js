/*
 * Dopasowanie do siatki tam, gdzie sam CSS nie potrafi zaokrąglić naturalnego wymiaru:
 * [data-snap]         wysokość bloku w górę do 32 px (reszta trafia do --snap, na koniec bloku),
 * [data-snap-w] > *   szerokość przycisku z etykiety w górę do 8 px (--snap-w).
 * Mierzymy tylko oznaczone elementy. Zmiana --snap nie zmienia mierzonego pudełka,
 * więc obserwator nie wpada w pętlę. Reaguje na szerokość okna, fonty, obrazy i treść.
 */
(() => {
  if (!("ResizeObserver" in window)) return;
  const px = (value) => parseFloat(value) || 0;
  const up = (value, step) => Math.ceil((value - 0.05) / step) * step;
  const observer = new ResizeObserver((entries) => {
    const unit = px(getComputedStyle(document.documentElement).fontSize) / 2;
    for (const { target } of entries) {
      const size = target.getBoundingClientRect();
      if (target.hasAttribute("data-snap")) {
        const rest = up(size.height, unit * 4) - size.height;
        target.style.setProperty("--snap", `${Math.max(0, rest)}px`);
      } else {
        const button = target.parentElement;
        const style = getComputedStyle(button);
        const width = size.width + px(style.paddingLeft) + px(style.paddingRight);
        button.style.setProperty("--snap-w", `${up(width, unit)}px`);
      }
    }
  });
  for (const el of document.querySelectorAll("[data-snap], [data-snap-w] > *")) {
    observer.observe(el, { box: "border-box" });
  }
})();
