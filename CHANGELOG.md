## [2.6.1](https://github.com/truss44/mcp-crypto-price/compare/v2.6.0...v2.6.1) (2026-03-21)

### Bug Fixes

* update smithery.yaml to use HTTP transport and icon field ([4815fc0](https://github.com/truss44/mcp-crypto-price/commit/4815fc078270718aefd15653a5d73452e9898824))

## [2.6.0](https://github.com/truss44/mcp-crypto-price/compare/v2.5.0...v2.6.0) (2026-03-21)

### Features

* add icon to mcp server ([#133](https://github.com/truss44/mcp-crypto-price/issues/133)) ([809e333](https://github.com/truss44/mcp-crypto-price/commit/809e3335df46e697e5ebb25db117a9f24ad6e452)), closes [#131](https://github.com/truss44/mcp-crypto-price/issues/131) [#130](https://github.com/truss44/mcp-crypto-price/issues/130)
* update icon ([#134](https://github.com/truss44/mcp-crypto-price/issues/134)) ([a852c19](https://github.com/truss44/mcp-crypto-price/commit/a852c198d90e17dfb5108ea68ded2e89f763be07)), closes [#131](https://github.com/truss44/mcp-crypto-price/issues/131) [#130](https://github.com/truss44/mcp-crypto-price/issues/130)

### Bug Fixes

* remove unsupported MCP tool icons metadata ([9b16dbb](https://github.com/truss44/mcp-crypto-price/commit/9b16dbb2597f4df0f88d3b4efecdabbab78994e3))

## [2.5.0](https://github.com/truss44/mcp-crypto-price/compare/v2.4.0...v2.5.0) (2026-03-21)

### Features

* improve Smithery quality score ([b94054e](https://github.com/truss44/mcp-crypto-price/commit/b94054e705d85f5eb5a4f4952e8d1bb49fb5ff89))

### Bug Fixes

* rename iconUrl to icon in smithery.yaml ([a0f0757](https://github.com/truss44/mcp-crypto-price/commit/a0f0757438967ab5dc4cdaca7736cfaccfbe43dc))

## [2.4.0](https://github.com/truss44/mcp-crypto-price/compare/v2.3.2...v2.4.0) (2026-03-21)

### Features

* improve Smithery quality score ([#130](https://github.com/truss44/mcp-crypto-price/issues/130)) ([28b4df8](https://github.com/truss44/mcp-crypto-price/commit/28b4df8b173b1791995155f4acd8a90863de990e))

## [2.3.2](https://github.com/truss44/mcp-crypto-price/compare/v2.3.1...v2.3.2) (2026-03-21)

### Bug Fixes

* route POST / to MCP handler, reserve GET / for health checks ([821b2cd](https://github.com/truss44/mcp-crypto-price/commit/821b2cde160755bb892fd67238015901ebd2eb40))
* serve 200 on root path for default health check probes ([3b0491b](https://github.com/truss44/mcp-crypto-price/commit/3b0491b462c1c5065a726255ae49acc38fd52681))

## [2.3.1](https://github.com/truss44/mcp-crypto-price/compare/v2.3.0...v2.3.1) (2026-03-21)

### Bug Fixes

* add health check endpoint and Dockerfile HEALTHCHECK for Coolify ([#127](https://github.com/truss44/mcp-crypto-price/issues/127)) ([1ed1675](https://github.com/truss44/mcp-crypto-price/commit/1ed1675f3dcd627e4442de52be3f95bc2c187eaa))

## [2.3.0](https://github.com/truss44/mcp-crypto-price/compare/v2.2.0...v2.3.0) (2026-03-21)

### Features

* replace Smithery with native MCP HTTP transport for Coolify deployment ([#125](https://github.com/truss44/mcp-crypto-price/issues/125)) ([2863561](https://github.com/truss44/mcp-crypto-price/commit/28635613edcbee6be776b36ea117dc0a15df0ec3)), closes [#124](https://github.com/truss44/mcp-crypto-price/issues/124)

### Bug Fixes

* update release workflow to use unified build script ([#126](https://github.com/truss44/mcp-crypto-price/issues/126)) ([063f161](https://github.com/truss44/mcp-crypto-price/commit/063f161361bd85af450a013f6b712bf7c63bd8d2))

## [2.2.0](https://github.com/truss44/mcp-crypto-price/compare/v2.1.5...v2.2.0) (2026-03-21)

### Features

* add get-top-assets tool and support asset lookup by name ([2c113d1](https://github.com/truss44/mcp-crypto-price/commit/2c113d146605bfb3ed5145fb9ad8c56bb4e41f2f))

### Bug Fixes

* resolve 4 high-priority bugs ([#114](https://github.com/truss44/mcp-crypto-price/issues/114), [#115](https://github.com/truss44/mcp-crypto-price/issues/115), [#116](https://github.com/truss44/mcp-crypto-price/issues/116), [#117](https://github.com/truss44/mcp-crypto-price/issues/117)) ([#122](https://github.com/truss44/mcp-crypto-price/issues/122)) ([fe77be7](https://github.com/truss44/mcp-crypto-price/commit/fe77be7f35bb9eaab4f8d49bb2ffe3e1b33fc8f6))
* resolve 4 high-priority issues ([#118](https://github.com/truss44/mcp-crypto-price/issues/118), [#119](https://github.com/truss44/mcp-crypto-price/issues/119), [#120](https://github.com/truss44/mcp-crypto-price/issues/120), [#121](https://github.com/truss44/mcp-crypto-price/issues/121)) ([#123](https://github.com/truss44/mcp-crypto-price/issues/123)) ([1d7e3ae](https://github.com/truss44/mcp-crypto-price/commit/1d7e3ae3b515c569e6e289b66515873eb168287c))

## [2.1.5](https://github.com/truss44/mcp-crypto-price/compare/v2.1.4...v2.1.5) (2026-02-27)

### Bug Fixes

* bump semantic-release packages and add empty resource/prompt handlers ([f82c856](https://github.com/truss44/mcp-crypto-price/commit/f82c8560b46891f5e2828fe4355c5a103e9c182d))
* replace empty resource/prompt handlers with server-info resource ([6525679](https://github.com/truss44/mcp-crypto-price/commit/6525679a0846d4702e6edeef92ba17ebae37a296))

## [2.1.4](https://github.com/truss44/mcp-crypto-price/compare/v2.1.3...v2.1.4) (2026-02-14)

### Bug Fixes

* add Windows cmd.exe config and Smithery CLI usage notes ([d210cdb](https://github.com/truss44/mcp-crypto-price/commit/d210cdbbfecfd0fe411a38724379d11d9c6aee76))
* disable GitHub release labels in semantic-release config ([6947c17](https://github.com/truss44/mcp-crypto-price/commit/6947c179b7448cfbd0d8deee29527bc18b0c64f2))
* improve module exports and add sandbox server support ([a6212b3](https://github.com/truss44/mcp-crypto-price/commit/a6212b38eaca2029f951957403440e730ecd88c9))

## [2.1.3](https://github.com/truss44/mcp-crypto-price/compare/v2.1.2...v2.1.3) (2025-12-05)

### Bug Fixes

* **security:** bump semantic-release from 24.2.3 to 25.0.2 ([314a9a3](https://github.com/truss44/mcp-crypto-price/commit/314a9a34a0a5b921e2153854192070d42997dd18))

## [2.1.2](https://github.com/truss44/mcp-crypto-price/compare/v2.1.1...v2.1.2) (2025-11-25)

### Bug Fixes

* improve stdio transport startup detection with CLI run check ([6ac7376](https://github.com/truss44/mcp-crypto-price/commit/6ac7376138d6fe1cce590a54f7435430c711ee42))

## [2.1.1](https://github.com/truss44/mcp-crypto-price/compare/v2.1.0...v2.1.1) (2025-10-02)

### Bug Fixes

* update Jest config and dependencies for ESM support ([#63](https://github.com/truss44/mcp-crypto-price/issues/63)) ([618ce84](https://github.com/truss44/mcp-crypto-price/commit/618ce84aae409f5e945ff130d16858daf43e97f8))

## [2.1.0](https://github.com/truss44/mcp-crypto-price/compare/v2.0.0...v2.1.0) (2025-09-09)

### Features

* add HTTP transport support with build configs and SSH signing docs ([#54](https://github.com/truss44/mcp-crypto-price/issues/54)) ([692aced](https://github.com/truss44/mcp-crypto-price/commit/692aced77ae4153636176e96dc5d7d756408995f))

## [2.0.0](https://github.com/truss44/mcp-crypto-price/compare/v1.2.0...v2.0.0) (2025-09-08)

### ⚠ BREAKING CHANGES

* add conventional-changelog-conventionalcommits dependency for… (#53)
* enable debug logs and use conventionalcommits preset for semantic-release (#52)
* add SSH commit signing configuration to release workflow (#51)
* **deps:** bump the github-actions group across 1 directory with 2 updates (#49)
* add HTTP server support and upgrade to MCP SDK v1.17.3 (#50)

### Features

* add HTTP server support and upgrade to MCP SDK v1.17.3 ([#50](https://github.com/truss44/mcp-crypto-price/issues/50)) ([890d5c5](https://github.com/truss44/mcp-crypto-price/commit/890d5c5adf0d0972a199d548a1eebb1830f91cdb))
* add SSH commit signing configuration to release workflow ([#51](https://github.com/truss44/mcp-crypto-price/issues/51)) ([a9cd461](https://github.com/truss44/mcp-crypto-price/commit/a9cd461683a5b090ea32f8db74b2b5059dde2158))

### Miscellaneous Chores

* add conventional-changelog-conventionalcommits dependency for… ([#53](https://github.com/truss44/mcp-crypto-price/issues/53)) ([008fce2](https://github.com/truss44/mcp-crypto-price/commit/008fce270a392f11dc783337d197367f89d5283d))
* **deps:** bump the github-actions group across 1 directory with 2 updates ([#49](https://github.com/truss44/mcp-crypto-price/issues/49)) ([be77ee9](https://github.com/truss44/mcp-crypto-price/commit/be77ee9803e54613219b1ed94eab0aa12a31f17b))
* enable debug logs and use conventionalcommits preset for semantic-release ([#52](https://github.com/truss44/mcp-crypto-price/issues/52)) ([3024d1d](https://github.com/truss44/mcp-crypto-price/commit/3024d1d9244ac27f973292fc636c63f30ff34828))

# [1.2.0](https://github.com/truss44/mcp-crypto-price/compare/v1.1.1...v1.2.0) (2025-05-18)


### Features

* enable GPG signing for semantic-release git commits ([#21](https://github.com/truss44/mcp-crypto-price/issues/21)) ([f14ec1c](https://github.com/truss44/mcp-crypto-price/commit/f14ec1ce282057da1352cca3d9caea7469a6db46))


### Performance Improvements

* security updates ([ba17b96](https://github.com/truss44/mcp-crypto-price/commit/ba17b96964d974d1cf3260cc8aa1248b293baaa5))
* update package-lock.json dependencies ([#20](https://github.com/truss44/mcp-crypto-price/issues/20)) ([8ba64f3](https://github.com/truss44/mcp-crypto-price/commit/8ba64f3c8f2f9c93b37220572397e45ff1b4f3fb))

## [1.1.1](https://github.com/truss44/mcp-crypto-price/compare/v1.1.0...v1.1.1) (2025-03-17)


### Bug Fixes

* removing original distro ([111e4d7](https://github.com/truss44/mcp-crypto-price/commit/111e4d7b1c245f47c4a18b72f585826a3347cc7f))

# [1.1.0](https://github.com/truss44/mcp-crypto-price/compare/v1.0.4...v1.1.0) (2025-03-17)


### Features

* adding v3 with v2 backwards compatibility ([ecfa9e4](https://github.com/truss44/mcp-crypto-price/commit/ecfa9e4cb8e1d25faf86ba57f39269670d36229a))
