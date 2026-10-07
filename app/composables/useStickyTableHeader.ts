import { computed, onBeforeUnmount, onMounted, ref, type Ref } from "vue";

type ElementRef = Ref<HTMLElement | { $el?: HTMLElement } | null>;

interface StickyTableHeaderOptions {
  /** Wraps the table; its width changes are watched */
  wrapperRef: ElementRef;
  /** The table's own horizontal scroller */
  containerRef: ElementRef;
  /** Scroller that holds the sticky copy of the header */
  stickyHeaderRef: Ref<HTMLElement | null>;
  tableRef: ElementRef;
  headerRowRef: ElementRef;
}

/**
 * Shows a copy of a table's header once the real one scrolls out of view, adapted from
 * Pixel's enterprise data table block. A table that scrolls sideways can't use
 * `position: sticky` on its header, so the copy is fixed in place, kept as wide as the table
 * and scrolled sideways along with it.
 */
export function useStickyTableHeader(options: StickyTableHeaderOptions) {
  const containerWidth = ref(0);
  const isHeaderOutOfView = ref(false);
  const isTableInView = ref(false);

  const isStickyVisible = computed(() => isHeaderOutOfView.value && isTableInView.value);

  const observers: { disconnect: () => void }[] = [];
  let removeScrollSync: (() => void) | undefined;
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  let setupTimer: ReturnType<typeof setTimeout> | undefined;

  function element(target: HTMLElement | { $el?: HTMLElement } | null): HTMLElement | null {
    if (!target) return null;
    return target instanceof HTMLElement ? target : (target.$el ?? null);
  }

  function measure() {
    const container = element(options.containerRef.value);
    if (container) containerWidth.value = container.getBoundingClientRect().width;
  }

  function observe(target: HTMLElement | null, onChange: (isInView: boolean) => void) {
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) =>
      onChange(Boolean(entry?.isIntersecting))
    );
    observer.observe(target);
    observers.push(observer);
  }

  onMounted(() => {
    // Wait a frame or two so the table has its final size.
    setupTimer = setTimeout(() => {
      measure();
      observe(element(options.tableRef.value), (isInView) => (isTableInView.value = isInView));
      observe(element(options.headerRowRef.value), (isInView) => {
        isHeaderOutOfView.value = !isInView;
      });

      const wrapper = element(options.wrapperRef.value);
      if (wrapper) {
        const resizeObserver = new ResizeObserver(() => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(measure, 25);
        });
        resizeObserver.observe(wrapper);
        observers.push(resizeObserver);
      }

      const container = element(options.containerRef.value);
      const sticky = options.stickyHeaderRef.value;
      if (container && sticky) {
        const syncScroll = () => (sticky.scrollLeft = container.scrollLeft);
        container.addEventListener("scroll", syncScroll, { passive: true });
        removeScrollSync = () => container.removeEventListener("scroll", syncScroll);
      }
    }, 100);
  });

  onBeforeUnmount(() => {
    clearTimeout(setupTimer);
    clearTimeout(resizeTimer);
    observers.forEach((observer) => observer.disconnect());
    removeScrollSync?.();
  });

  return { isStickyVisible, containerWidth };
}
