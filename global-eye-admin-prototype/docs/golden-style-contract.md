# Golden Style Contract

- Request: 全球眼信息系统 SaaS 服务管理后台交互原型
- System/page type: MT Web 管理后台，左侧导航，多列表、多查询、多弹窗/抽屉
- Primary golden: `shared/goldens/ui-spec/涓€绾у垪琛?png`
- Supporting goldens: `shared/goldens/ui-spec/瀵艰埅.png`, `shared/goldens/ui-spec/鏈烘瀯鏌ョ湅.png`, `shared/goldens/ui-spec/鏈烘瀯寮€閫?png`, `shared/goldens/ui-spec/缃戠珯鐩戞帶.png`, `shared/goldens/ui-spec/寮圭獥浜?png`, `shared/goldens/ui-spec/鎶藉眽璇︽儏.png`, `shared/goldens/ui-spec/鐘舶€佹爣绛?.png`
- User-supplied field references: `codex-clipboard-f4e1f060-7a79-42a0-8fe4-b6ce74150fc3.png` for institution basic fields; `codex-clipboard-fc49355c-e852-432b-8242-80a0d4d64eb4.png` for configuration fields; `codex-clipboard-6178b244-00a4-4859-b9c5-f9988843f9e3.png` for personnel fields.
- Golden SHA256: list `f6a2f0573fbd88a8bd5b6280284a34e8959a6f567227e34a396720ebd410762c`; navigation `0a2cc6bf0736b33e2cfbfff9251545b9797ce05098846de5cd702074ef671ab5`
- Canvas and viewport: 1920x1080 target, adaptive down to 1366x768
- Domain match rationale: 机构管理采用机构/主体相关参考；网址、方案、标签为同后台密集表格与配置类页面，使用列表、弹窗、抽屉、状态标签参考。

## Immutable visual surfaces

- System shell: 60px topbar, 170px left navigation, white workspace.
- Navigation: left vertical menu, active item blue state.
- Background and separators: white background, light blue table header, light gray separators.
- Control family: compact inputs, selects, primary/secondary/danger buttons.
- Table/grid language: 42px dense rows, fixed right action column, status tags.
- Feedback/status language: semantic success/warning/danger/default states, confirmation before destructive actions.

## Editable content slots

| Slot | Allowed changes | Fixed constraints |
|---|---|---|
| Page title | 全球眼业务模块名称 | Position, hierarchy, topbar rhythm |
| Query labels/values | Institution, scheme, website, tag fields | Query grid, compact control height |
| Table content | Columns and sample business data | Header color, row height, alignment, pagination |
| Detail values | Business labels and values | Label-value groups, drawer width, section rhythm |
| Modal forms | Product opening, personnel, website, tag fields | Required markers, footer actions, validation placement |

## Prohibited substitutions

- No unrelated golden as a pixel baseline.
- No 100% fidelity claim for changed business content.
- No generic marketing landing page, decorative gradients, or improvised product shell.

## Evidence and status

- Screenshot paths: to be captured after user review if needed.
- Focused comparisons: to be captured after user review if needed.
- User review: pending.
- Final status: `GOLDEN_STYLE_CONTRACT`
