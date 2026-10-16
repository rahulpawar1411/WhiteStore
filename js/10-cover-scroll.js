/* ==========================================================================
   10-cover-scroll.js — mobile: next page starts after the previous one ends
   ========================================================================== */

(function () {
  const mq = window.matchMedia('(max-width: 767px)');

  function panes() {
    return document.querySelectorAll('.cover-stack__pane');
  }

  function apply() {
    const mobile = mq.matches;
    const vh = window.innerHeight;
    panes().forEach((pane) => {
      if (!mobile) {
        pane.style.removeProperty('top');
        return;
      }
      const overflow = pane.offsetHeight - vh;
      const top = overflow > 1 ? -Math.round(overflow) : 0;
      pane.style.setProperty('top', top + 'px', 'important');
    });
  }

  let frame = 0;
  function schedule() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(apply);
  }

  function boot() {
    schedule();
    const ro = new ResizeObserver(schedule);
    panes().forEach((pane) => ro.observe(pane));
    window.addEventListener('resize', schedule);
    window.addEventListener('load', schedule);
    if (mq.addEventListener) mq.addEventListener('change', schedule);
    else mq.addListener(schedule);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
