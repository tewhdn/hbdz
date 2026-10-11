# 第三方资源与许可

## Pico CSS v2.1.1
- 文件：`pico.min.css`
- 项目：https://github.com/picocss/pico
- 许可：MIT License（见 `pico.LICENSE`）
- 用途：本站的排版、表单控件、浅色/深色主题基座（`<html data-theme="light|dark">`）。
  只在其之上做配色与组件覆盖，未修改原文件内容。

## liquid-glass v0.3.0（液态玻璃折射）
- 文件：`liquid-glass/liquid-glass.css`、`liquid-glass/liquid-glass.js`
- 项目：https://github.com/dpawlikowski/liquid-glass ｜ npm：`@dpawlikowski/liquid-glass`
- 许可：MIT License（见 `liquid-glass/LICENSE`）
- 上游说明与文档：`liquid-glass/UPSTREAM-README.md`
- 用途：皮肤切换为「液态玻璃」时，由该库提供折射效果 —— `feTurbulence` + `feDisplacementMap`
  注入 SVG 滤镜，并通过 `backdrop-filter: url(#filter)` 对**真实背景**做位移折射；
  不支持在 backdrop-filter 内引用 SVG 滤镜的引擎（如 Firefox）自动降级为普通霜面。
- 本站的接入方式：
  - **未修改**库的 CSS；`liquid-glass.js` 是用 esbuild 把上游 ES Module 源码打成单文件 IIFE，
    便于静态站点以普通 `<script>` 引入：
    ```sh
    npm i @dpawlikowski/liquid-glass
    npx esbuild node_modules/@dpawlikowski/liquid-glass/src/index.js \
      --bundle --format=iife --global-name=LiquidGlass --minify \
      --outfile=assets/liquid-glass/liquid-glass.js
    ```
  - 库默认的 `--lg-filter` 指向它自己的 `#liquid-glass-filter`；本站改为注入两个滤镜
    （`#lg-anim` 带动画，仅顶栏使用；`#lg-static` 无动画，用于面板/统计条/弹窗），
    依据是上游 `docs/performance.md` 的建议：密集界面用静态玻璃，动画折射只留一两个 hero 面。
  - 配色通过覆盖 `--lg-*` 变量与本站主题对接，见 `index.html` 内的「外观皮肤」区块。

## 数据来源
- 院校、专业、招生计划、2026 投档最低分：抓取自 https://hbdzxx.com （河北单招网）公开页面。
- 考试类科目与考试大纲：河北省教育考试院及各牵头院校发布的 2026 年官方考试说明。
- 抓取日期：2026-10-10。整理脚本与校验报告见项目根目录 `DATA-NOTES.md`。
