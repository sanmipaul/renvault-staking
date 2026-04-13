# Changelog

## [1.1.0] - 2026-04-12

### Changed
- **Breaking**: package entry point changed from `stakingAPI.js` to `./dist/index.js`
- Converted entire codebase from JavaScript to TypeScript
- All public classes, functions, and constants now ship with `.d.ts` type declarations

### Added
- `module` field (`./dist/index.mjs`) — ESM entry point for bundlers
- `types` field (`./dist/index.d.ts`) — TypeScript declarations
- `exports` map with `types`, `import`, and `require` conditions
- `bugs` field pointing to the GitHub issue tracker
- `engines` field requiring Node.js ≥ 18
- `src/types.ts` — shared domain interfaces (`StakeResult`, `StakingReturns`, `Distribution`, etc.)
- `tsup.config.ts` — dual CJS/ESM build with source maps
- `tsconfig.json` — strict TypeScript compiler config
- `vitest.config.ts` — TypeScript-native test runner
- 92 vitest tests migrated from Jest-style CommonJS to TypeScript
- `.npmignore` to keep `src/`, config files, and test files out of the published package
- `prepublishOnly` script (`typecheck + test + build`) to gate bad publishes
- Expanded README with full API reference, method tables, and TypeScript examples

### Removed
- `renvault-bridge` dependency (unpublished package — was causing install failures)
- `renvault-security-audit` dependency (unpublished package — was causing install failures)
- `start` script (replaced by `build`, `test`, `typecheck`)

## [1.0.2] - 2026-03-19

### Added
- Index entry point exporting all modules
- Input validators for amount, address, and network
- Error codes matching on-chain contract responses
- Staking constants for amounts and lock periods

## [1.0.1] - 2026-03-14

### Added
- Repository metadata and npm keywords
- Homepage and author fields

## [1.0.0] - 2026-03-12

### Added
- Initial release
- Staking manager with stake/unstake/claim-rewards
- Yield calculator for APY estimation
- Rewards distributor
- Express REST API
