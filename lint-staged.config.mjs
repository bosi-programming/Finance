export default {
  '*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}': [
    'eslint --fix --report-unused-disable-directives --max-warnings 0',
    () => 'tsc -b --noEmit',
    'vitest related --run',
  ],
};
