import EvincedUT from '@evinced/unit-tester';

// Make EvincedUT available globally in all unit tests so you don't need to
// import it in every spec file.
Object.defineProperty(global, 'EvincedUT', {
  value: EvincedUT,
  writable: false,
});
