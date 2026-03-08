import "@testing-library/jest-dom";

// Mock IntersectionObserver for framer-motion whileInView
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    void callback;
    void options;
  }

  observe(target: Element): void {
    void target;
  }
  unobserve(target: Element): void {
    void target;
  }
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

globalThis.IntersectionObserver = MockIntersectionObserver;
