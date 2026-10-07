// Browser regression seam: runs against real Foundry CSS, not a copied reset.
export function checkLayout(root = document) {
  const card = root.querySelector(".an-card");
  const heading = root.querySelector(".an-header h1");
  const timeline = root.querySelector(".an-timeline button");
  const checkbox = root.querySelector('input[type="checkbox"]');
  const headerIcons = [...root.querySelectorAll(".window-header button.icon")];
  return {
    cards: !!card && card.getBoundingClientRect().height >= 200,
    typography:
      !!heading && !getComputedStyle(heading).fontFamily.includes("Modesto"),
    timeline:
      !!timeline && getComputedStyle(timeline).flexDirection === "column",
    checkbox:
      !!checkbox && getComputedStyle(checkbox, "::before").content === "none",
    headerIcons:
      headerIcons.length >= 2 &&
      headerIcons.every((icon) => {
        const style = getComputedStyle(icon, "::before");
        return (
          style.fontFamily.includes("Font Awesome") &&
          style.fontWeight === "900"
        );
      }),
  };
}
if (location.pathname.endsWith("foundry.html")) {
  const output = document.createElement("output");
  output.id = "layout-regression";
  output.style.cssText =
    "position:fixed;bottom:0;left:16px;z-index:9999;font:10px sans-serif;background:#111;color:#9ed;padding:2px 8px";
  document.body.append(output);
  requestAnimationFrame(() => {
    const checks = checkLayout();
    output.textContent = Object.entries(checks)
      .map(([k, v]) => `${k}: ${v ? "PASS" : "FAIL"}`)
      .join(" · ");
  });
}
