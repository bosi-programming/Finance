module.exports = {
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: {
      path: [
        '^node_modules',
        '\\.css$',
        '\\.test\\.',
        '\\.spec\\.',
        '^src/test',
      ],
    },
    includeOnly: { path: '^src' },
    tsConfig: { fileName: 'tsconfig.app.json' },
    reporterOptions: {
      metrics: { orderBy: 'name' },
    },
  },
  forbidden: [],
};
