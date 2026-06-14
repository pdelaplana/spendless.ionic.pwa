## [1.17.3](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.17.2...v1.17.3) (2026-06-14)


### Bug Fixes

* correct setup-node v4.2.0 commit SHA to 1d0ff469b7ec7b3cb9d8673fde0c81c44821de2a ([e90f8d5](https://github.com/pdelaplana/spendless.ionic.pwa/commit/e90f8d5c76ea287b3ed1a9423a4c44fbe58ca877))

## [1.17.2](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.17.1...v1.17.2) (2026-06-14)


### Bug Fixes

* correct setup-node action commit hash in deploy-website.yml ([c5123c6](https://github.com/pdelaplana/spendless.ionic.pwa/commit/c5123c6d744cab04a69dd3006d77d9c6d4a4385a))

## [1.17.1](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.17.0...v1.17.1) (2026-06-13)


### Bug Fixes

* add environment context to build job to resolve secrets during compilation ([30fa9d5](https://github.com/pdelaplana/spendless.ionic.pwa/commit/30fa9d51af099a692de538626b7432c07ea4fa52))

# [1.17.0](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.16.0...v1.17.0) (2026-06-13)


### Bug Fixes

* add hosting target mappings for dev and prod environments in .firebaserc ([0e2dec7](https://github.com/pdelaplana/spendless.ionic.pwa/commit/0e2dec71f09e3e8da7fd307a7c0b84a1b10ecdec))
* **monorepo:** Relocate USER_GUIDE.md to mobile-pwa to fix import resolution ([4ea828d](https://github.com/pdelaplana/spendless.ionic.pwa/commit/4ea828d4cd5862ca9e7b5ddc412a0f1004e8b963))
* remove invalid --no-predeploy flag from firebase deploy functions command ([5b6d429](https://github.com/pdelaplana/spendless.ionic.pwa/commit/5b6d429553aee9c7396124b5ecfab1e52fb60349))
* resolve empty DATABASE_ID and STORAGE_BUCKET variables in functions deployment ([3d7f55e](https://github.com/pdelaplana/spendless.ionic.pwa/commit/3d7f55e4ccc0be3b2f429673f7f7b3e0288fb859))
* sync GEMINI_API_KEY secret to Firebase Secret Manager during deployment ([1220758](https://github.com/pdelaplana/spendless.ionic.pwa/commit/1220758f5d8b1e3914599aa20e27688b1e5a49b4))


### Features

* **monorepo:** Centralize biome.json and tsconfig.json configuration at root ([b810d16](https://github.com/pdelaplana/spendless.ionic.pwa/commit/b810d169525621ca21a61de0ed271ca8843c2eef))
* **monorepo:** Implement root-level build, lint, test, and deploy tooling ([4d76cc9](https://github.com/pdelaplana/spendless.ionic.pwa/commit/4d76cc9914a4a6e7fe7c81575ca496b1273aa379))
* **monorepo:** Initialize packages/shared with common types ([4fccbf0](https://github.com/pdelaplana/spendless.ionic.pwa/commit/4fccbf044b21724e971283575bd8676d1f23054c))
* **monorepo:** Initialize root workspace and migrate PWA structure ([bea847e](https://github.com/pdelaplana/spendless.ionic.pwa/commit/bea847e1f30da739aa0a7a4fe6c58afab1e46322))
* **monorepo:** Migrate spendless.cloud.functions to apps/cloud-functions ([4cae35c](https://github.com/pdelaplana/spendless.ionic.pwa/commit/4cae35c0d3404658b96cb470122fa9e95bf00d4a))
* **monorepo:** Migrate spendless.website to apps/website ([c5cc5d8](https://github.com/pdelaplana/spendless.ionic.pwa/commit/c5cc5d8ae711a3ef20e3054e0ccad094273f6cb4))
* **monorepo:** Update project configurations, workspace names, and firebase configs ([8fdaa1f](https://github.com/pdelaplana/spendless.ionic.pwa/commit/8fdaa1fbfba1c8abd599d1f31198232edd6d7181))

# [1.16.0](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.15.1...v1.16.0) (2026-06-12)


### Bug Fixes

* apply safety improvements and validation enhancements for recurring spends ([ebef96c](https://github.com/pdelaplana/spendless.ionic.pwa/commit/ebef96cb98e078736655fbd87a12ed6e057a15d7))


### Features

* **period:** add recurringSpendsWalletMapping to PeriodFormData (recurring-spends-wallets_20260612) ([4db3bfb](https://github.com/pdelaplana/spendless.ionic.pwa/commit/4db3bfba10e1b577f0f73d524f76ab8734f23a91))
* **period:** implement updateRecurringSpendWalletMapping in useMultiStepForm (recurring-spends-wallets_20260612) ([b8e0694](https://github.com/pdelaplana/spendless.ionic.pwa/commit/b8e06941bc5d5968acf7e12937f351f031fdbee0))
* **period:** persist chosen wallet mappings to recurring spends in Firestore on submit (recurring-spends-wallets_20260612) ([92b3d56](https://github.com/pdelaplana/spendless.ionic.pwa/commit/92b3d566460b65e71624a0fe6b8d67b1e8f78e53))
* **ui:** render wallet selector for recurring spends in period wizard (recurring-spends-wallets_20260612) ([8efcd3f](https://github.com/pdelaplana/spendless.ionic.pwa/commit/8efcd3fa3b5ca934ab81dade8b406b6d0163bc55))

## [1.15.1](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.15.0...v1.15.1) (2026-03-14)


### Bug Fixes

* recurring spend wallet assignment and future spend visibility ([265afd7](https://github.com/pdelaplana/spendless.ionic.pwa/commit/265afd7eae8a28494e985274b145c0b40b22b85b))

# [1.15.0](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.14.0...v1.15.0) (2026-03-04)


### Features

* **coach:** enrich system prompt with period dates, budget, and wallet breakdown ([bbd6ae4](https://github.com/pdelaplana/spendless.ionic.pwa/commit/bbd6ae4dd9b8f3fed13df821993a1e95526bd275))
* **coach:** pass period and wallet data to system prompt builder ([d717210](https://github.com/pdelaplana/spendless.ionic.pwa/commit/d71721041c3932d2300793416c98cea40fb7f166))

# [1.14.0](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.13.0...v1.14.0) (2026-03-03)


### Bug Fixes

* **coach:** keep input visible above iOS keyboard using visualViewport ([770f015](https://github.com/pdelaplana/spendless.ionic.pwa/commit/770f01543ada4f80d53a907d6c8a6738a05ad586))
* **test:** cast to any when deleting window.visualViewport to satisfy TS2704 ([4753e31](https://github.com/pdelaplana/spendless.ionic.pwa/commit/4753e3145da27e005f9937e4bed90bdc2a3246e1))
* **ui:** fix import order in useVisualViewport test ([2581181](https://github.com/pdelaplana/spendless.ionic.pwa/commit/25811810680cd36f432c4e36f88f917570b204cd))
* **ui:** fix lint violations and add scroll event test for useVisualViewport ([a8622d0](https://github.com/pdelaplana/spendless.ionic.pwa/commit/a8622d0a755534495fc059456c0ae0adc13e3f92))


### Features

* **ui:** add useVisualViewport hook for iOS keyboard offset ([bca3ef2](https://github.com/pdelaplana/spendless.ionic.pwa/commit/bca3ef2f76e5893c22ffa03584d109b96a80aa17))

# [1.13.0](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.12.0...v1.13.0) (2026-03-03)


### Bug Fixes

* **coach:** Fix pre-existing Biome lint errors in chat page ([e035f96](https://github.com/pdelaplana/spendless.ionic.pwa/commit/e035f963a96a8e2d0496e3b847566a5fe9c9a57d))
* **coach:** Fix TypeScript types, add remarkGfm, fix import order and CSS ([1798f1b](https://github.com/pdelaplana/spendless.ionic.pwa/commit/1798f1b4543a8de5c0dd935b017a69f6f09636db))
* **conductor:** Apply review suggestions for track 'ai_financial_coach_20260302' ([123ef64](https://github.com/pdelaplana/spendless.ionic.pwa/commit/123ef644ca5f3865575c58811cd2a4c9261d7350))


### Features

* **coach:** Complete AI Financial Coach feature ([cc5cfa3](https://github.com/pdelaplana/spendless.ionic.pwa/commit/cc5cfa3baa648ca484a32d3a7e2f92cb51d0fba9))
* **coach:** Finalize AI Financial Coach integration and cleanup ([8ae01a4](https://github.com/pdelaplana/spendless.ionic.pwa/commit/8ae01a446697c03fb8a34edfc74c8ef9992af7bc))
* **coach:** Implement AI message sending hook for Phase 3 ([d096b3c](https://github.com/pdelaplana/spendless.ionic.pwa/commit/d096b3ceacc5b0575cc240126d9ba06245f41395))
* **coach:** Implement Phase 4 UI — session list, chat interface, context banner ([d1c3442](https://github.com/pdelaplana/spendless.ionic.pwa/commit/d1c34425bd98aeede9b36eaf2d2e9d65a2272533))
* **coach:** Phase 5 — wire routes and add InsightsPage entry point ([a0c0ea0](https://github.com/pdelaplana/spendless.ionic.pwa/commit/a0c0ea00494b04767dbabf8b76bb6daed177791d))
* **coach:** Render AI responses as markdown ([ba1e77c](https://github.com/pdelaplana/spendless.ionic.pwa/commit/ba1e77c8fe190690961e646f272d22b546d0ec28))

# [1.12.0](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.11.0...v1.12.0) (2026-03-01)


### Bug Fixes

* **conductor:** Apply review suggestions for track 'refactor_inbox_20260227' ([7526d95](https://github.com/pdelaplana/spendless.ionic.pwa/commit/7526d9520074eb64c0dafd390683c789cc710d1c))
* **menu:** fix beforeEach return type causing TS build error ([bd77d57](https://github.com/pdelaplana/spendless.ionic.pwa/commit/bd77d579ffaaa4727983400e8d63787cd9e5db67))


### Features

* **menu:** hide Inbox for non-premium users ([dabc001](https://github.com/pdelaplana/spendless.ionic.pwa/commit/dabc001a0d0058736465d4f24d55139e9aaad04e))

# [1.11.0](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.10.0...v1.11.0) (2026-01-30)


### Features

* Weekly Spending ([756d7c2](https://github.com/pdelaplana/spendless.ionic.pwa/commit/756d7c203afd518c557c5975818290e1ff9de657))

# [1.10.0](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.9.1...v1.10.0) (2026-01-25)


### Bug Fixes

* 1-tap phrases not appearing for scheduled spending ([2d0e054](https://github.com/pdelaplana/spendless.ionic.pwa/commit/2d0e054903619621cb1303a436308f172841b210))
* lint and tsc issues ([53af269](https://github.com/pdelaplana/spendless.ionic.pwa/commit/53af269df76fbae64170f960a0d749c943c90d0d))
* refactoring of MoodSpendingChart ([25a5be3](https://github.com/pdelaplana/spendless.ionic.pwa/commit/25a5be32c2c33955d9de4958f9ea6584b09afd44))


### Features

* Add custom contetextual mood phrases ([804a526](https://github.com/pdelaplana/spendless.ionic.pwa/commit/804a526e60161d7010b8aae22eeab19418187f3e))
* Mood Analysis Visualization ([fb835ca](https://github.com/pdelaplana/spendless.ionic.pwa/commit/fb835ca1f32fd6700495392f343d9c286c53fab0))
* Mood Tracking ([1cc7e3b](https://github.com/pdelaplana/spendless.ionic.pwa/commit/1cc7e3b292d481a327ddf70da1c9ae3cb07a2bb3))

## [1.9.1](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.9.0...v1.9.1) (2026-01-20)


### Bug Fixes

* remove modal breakpoints ([cfaf3e6](https://github.com/pdelaplana/spendless.ionic.pwa/commit/cfaf3e63ab6c609590ee35f89b313e1a465d2f01))

# [1.9.0](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.8.2...v1.9.0) (2026-01-20)


### Bug Fixes

* add breakpoints to all modals ([9924c25](https://github.com/pdelaplana/spendless.ionic.pwa/commit/9924c250baf4e2915820cc1fbc04dd05cd548b06))
* Remove recurring field from spend form and modal ([81a206c](https://github.com/pdelaplana/spendless.ionic.pwa/commit/81a206cb7ffe7d65e5aa04b4b88589e7bce197fa))
* unit tests ([3e52c66](https://github.com/pdelaplana/spendless.ionic.pwa/commit/3e52c665743da6f04a82c2b37dad839d78b44fe1))


### Features

* Automate recurring spend generation for new periods ([aba506d](https://github.com/pdelaplana/spendless.ionic.pwa/commit/aba506de317a63ce57f6fbe154e21a30a17059ef))
* Recurring Spend ([a07fcd7](https://github.com/pdelaplana/spendless.ionic.pwa/commit/a07fcd7cb3ba7ef4c2e7f76f22782c6049fa61f2))

## [1.8.2](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.8.1...v1.8.2) (2025-12-12)


### Bug Fixes

* ui redesign of AI Checkin page ([4942491](https://github.com/pdelaplana/spendless.ionic.pwa/commit/494249141d9961b8720074790ce5ddd27b61d8ac))

## [1.8.1](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.8.0...v1.8.1) (2025-12-11)


### Bug Fixes

* appflow build due to heapsize max limit ([ac88f14](https://github.com/pdelaplana/spendless.ionic.pwa/commit/ac88f140e86a1ce5d1faaa7e9bf095737ff50de4))

# [1.8.0](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.7.0...v1.8.0) (2025-12-11)


### Bug Fixes

* build errors ([0c553d7](https://github.com/pdelaplana/spendless.ionic.pwa/commit/0c553d77fe7741107d5e6d8cd729d401af4fd70a))
* localization fixes ([837b71b](https://github.com/pdelaplana/spendless.ionic.pwa/commit/837b71bb603a98ae02bcdce0af04aac19fc9a2c1))


### Features

* adaptive tags icon ([26346b8](https://github.com/pdelaplana/spendless.ionic.pwa/commit/26346b88bb269b11850fee59dda09bf27f98ba02))
* add iOS platform for Appflow builds ([7079964](https://github.com/pdelaplana/spendless.ionic.pwa/commit/7079964a927c6b9e0dca05f34918f1be1969943d))

# [1.7.0](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.6.0...v1.7.0) (2025-12-04)


### Features

* AI Checkins ([b89082d](https://github.com/pdelaplana/spendless.ionic.pwa/commit/b89082dc42a849a3acd39f8ff09913619cb75eaf))

# [1.6.0](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.5.0...v1.6.0) (2025-11-13)


### Features

* Ios Install Card ([0207227](https://github.com/pdelaplana/spendless.ionic.pwa/commit/02072272ea41517fbc87b94f20b33f86d66616ea))
* Password Complexity Improvement ([00bd4cd](https://github.com/pdelaplana/spendless.ionic.pwa/commit/00bd4cdc99fed4c1dbbb89113b0653d9a66a4df8))

# [1.5.0](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.4.0...v1.5.0) (2025-11-12)


### Features

* BudgetvsSpend Chart across periods ([60840c7](https://github.com/pdelaplana/spendless.ionic.pwa/commit/60840c7f5cdd8fc69faea05f936dce71baa4f43c))
* Google Signin ([021f980](https://github.com/pdelaplana/spendless.ionic.pwa/commit/021f980190ec51f194bb7b44b0000c8ff39411c0))
* Spending Analysis By Tags ([842eb55](https://github.com/pdelaplana/spendless.ionic.pwa/commit/842eb55300fabad66fae05d45266f2cc8234595e))

# [1.4.0](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.3.0...v1.4.0) (2025-11-09)


### Features

* add subscriptionCancelled cancelled and subscription price change ([6b567e1](https://github.com/pdelaplana/spendless.ionic.pwa/commit/6b567e1447f518a263c527d6149af2aaf2573de2))
* add subscriptionTier and expiresAt to Account model ([98d6f6e](https://github.com/pdelaplana/spendless.ionic.pwa/commit/98d6f6e265be1da36256d74513622a32afe70c75))
* implement 1 month history for essentials account ([1046a95](https://github.com/pdelaplana/spendless.ionic.pwa/commit/1046a951dd9ecab8d75f58c4e557cb6ebf3dd9e5))
* subscriptions ([6f8a306](https://github.com/pdelaplana/spendless.ionic.pwa/commit/6f8a30667ab64039d148265cb74cdb50999512e3))
* UI refactoring ([f591816](https://github.com/pdelaplana/spendless.ionic.pwa/commit/f59181652f9ca4472457b17cfcb8122e8856bca7))

# [1.3.0](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.2.0...v1.3.0) (2025-11-02)


### Bug Fixes

* scroll tags input to top of spend modal on focus ([447ab64](https://github.com/pdelaplana/spendless.ionic.pwa/commit/447ab6432b9e525731c55f24fbf060444473d4f7))
* selecting past periods in period switcher ([f70612d](https://github.com/pdelaplana/spendless.ionic.pwa/commit/f70612db1f863ec6e297b9304b8a5fab6b533a52))


### Features

* Send feedback ([b2b6a69](https://github.com/pdelaplana/spendless.ionic.pwa/commit/b2b6a69a7a73eb14b1485d7406c33e7d9591ee7c))

# [1.2.0](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.1.0...v1.2.0) (2025-10-24)


### Bug Fixes

* Calculate total spent from spending transactions instead of wallet.currentBalance ([83bbe87](https://github.com/pdelaplana/spendless.ionic.pwa/commit/83bbe8798276318a669f32a85b30ac05a375563f))
* Remove location field from Step2Password type definition ([4fedf24](https://github.com/pdelaplana/spendless.ionic.pwa/commit/4fedf24260efda10fa299823890307628c21f0bb))
* start new period ([38d83f7](https://github.com/pdelaplana/spendless.ionic.pwa/commit/38d83f7863595978efe4d23e1b2dc9849d8fd954))


### Features

* Detects and sets currency based on browser timezone ([1a132f7](https://github.com/pdelaplana/spendless.ionic.pwa/commit/1a132f73c5e136693158bc6399296db8f5b93937))

# [1.1.0](https://github.com/pdelaplana/spendless.ionic.pwa/compare/v1.0.0...v1.1.0) (2025-10-20)


### Bug Fixes

* updates progress container background color ([3d097db](https://github.com/pdelaplana/spendless.ionic.pwa/commit/3d097db1f2f35b834f7fdee0f16070be70ea4e66))


### Features

* Adds SplashScreen and unify app loading states ([8403d09](https://github.com/pdelaplana/spendless.ionic.pwa/commit/8403d090da9114124cd708af4d331b5a1f541082))
* improve pwa update and install prompts ([b1d6602](https://github.com/pdelaplana/spendless.ionic.pwa/commit/b1d660261f71834936cdb854fd26d846aebae23c))
* improves offline experience when saving spending ([461692b](https://github.com/pdelaplana/spendless.ionic.pwa/commit/461692b40bc2a734b261c026fe1034c5425c7da1))
* improves sign in, sign up, forget password and reset password ui/ux ([9ed7983](https://github.com/pdelaplana/spendless.ionic.pwa/commit/9ed79831a64c4f9f0b56d23de0f063ecd02b542a))
* loads sample data from cli and a hook on the onboarding flow ([2d6a6e7](https://github.com/pdelaplana/spendless.ionic.pwa/commit/2d6a6e789c23c36e5e976209a84aaa9b8373ee8b))
* new fav cons added ([cbed896](https://github.com/pdelaplana/spendless.ionic.pwa/commit/cbed89629eaf142d3658556e7ee8ef44486e40b8))
* new pwa icons ([e8e697e](https://github.com/pdelaplana/spendless.ionic.pwa/commit/e8e697e05a189021132affda05fe7159a85e7be5))
* New Signin/Signup flow ([6b42ce0](https://github.com/pdelaplana/spendless.ionic.pwa/commit/6b42ce02395ff899f6aa2829fd7394401fb0cf6c))
* Refactor spending list to use client-side infinite scroll ([4ac8333](https://github.com/pdelaplana/spendless.ionic.pwa/commit/4ac83337d765019708f01358e5859d4d3b957692))

# 1.0.0 (2025-10-06)


### Bug Fixes

* add contents write permission to deployment workflows ([906df4d](https://github.com/pdelaplana/spendless.ionic.pwa/commit/906df4dc8cb9615e76a2cd8d807d64822c53592e))


### Features

* implement dual-environment CI/CD pipeline with semantic versioning ([70724a1](https://github.com/pdelaplana/spendless.ionic.pwa/commit/70724a11a0f322ed99be3847e68059c40396039e))
