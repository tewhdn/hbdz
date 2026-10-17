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

## @mesh-gradient/core v2.0.2（WebGL 网格渐变背景）
- 文件：`mesh-gradient/mesh-gradient.js`
- 项目：https://github.com/mikhailmogilnikov/mesh-gradient ｜ npm：`@mesh-gradient/core`
- 许可：MIT License（见 `mesh-gradient/LICENSE.md`）
- 用途：玻璃模式下的背景场景，SwiftUI MeshGradient 的 Web 移植，WebGL 实时渲染。
- 本站的接入方式：
  - `mesh-gradient.js` 为 esbuild 打包的单文件 IIFE（上游为 ESM）：
    ```sh
    npx esbuild node_modules/@mesh-gradient/core/dist/index.mjs \
      --bundle --format=iife --global-name=MeshGradientLib --minify \
      --outfile=assets/mesh-gradient/mesh-gradient.js
    ```
  - 参数按手机端取舍：`targetFps:24`（背景渐变不需要 60 帧）、`pixelRatio:1`（柔和渐变不需要
    高分屏锐度，省掉一半以上像素）、`animationSpeed:.55`、`reducedMotion:'auto'`。
  - 初始化前用上游的 `MeshGradient.isSupported()` 探测 WebGL；不支持则画布留空，
    由 `.bg-scene` 的静态 CSS 网格渐变兜底。切回实色时调用 `destroy()` 释放 WebGL 资源。

## number-flow v0.6.2（投档分数字滚动）
- 文件：`number-flow/number-flow.js`
- 项目：https://github.com/barvian/number-flow ｜ npm：`number-flow`
- 许可：MIT License（见 `number-flow/LICENSE.md`）
- 用途：玻璃模式下把院校投档分渲染成 `<number-flow>`，数字滚动到位。
- 本站的接入方式：
  - 同为 esbuild 打包的单文件 IIFE（上游依赖 `esm-env`，已一并打包）：
    ```sh
    npx esbuild node_modules/number-flow/dist/index.mjs \
      --bundle --format=iife --global-name=NumberFlowLib --minify \
      --outfile=assets/number-flow/number-flow.js
    ```
  - **不做一次性全量升级**：96 张卡同时滚会卡，改为 IntersectionObserver 按视野逐个升级
    （`rootMargin:160px`），滚动到哪张滚哪张。
  - 该库的 `value` 是只读属性，必须用 `update(v)`；Shadow DOM 在首次 `update()` 时才建立，
    因此先 `update(0)` 再于下一帧 `update(真值)` 才会产生滚动动画。
  - 字号/字重/颜色靠继承穿透 Shadow DOM，滚动遮罩宽度用其 `--number-flow-mask-*` 变量微调。

## fflate v0.8.3（zip 压缩，用于生成 .xlsx）
- 文件：`fflate/fflate.js`
- 项目：https://github.com/101arrowz/fflate ｜ npm：`fflate`
- 许可：MIT License（见 `fflate/LICENSE`）
- 用途：Excel 导出时把最小 OOXML 部件压成 .xlsx（zip 容器）。
- 本站的接入方式：
  ```sh
  npx esbuild node_modules/fflate/esm/browser.js \
    --bundle --format=iife --global-name=FFlate --minify --outfile=assets/fflate/fflate.js
  ```
  表格本身由 `index.html` 里的 `buildXlsx()` 手写生成（6 个必需 XML 部件），单元格用 `inlineStr`
  免去 sharedStrings，体积最小；数字列写成数值单元格，Excel 里可直接求和。
  若 fflate 缺失或生成失败，会自动回落到 CSV 导出。

## edge-glass（边缘折射，**本站自写**，非第三方库）
- 文件：`edge-glass/edge-glass.js`
- 作用：让玻璃只在**边缘**发生折射，中心保持清晰 —— 这是液态玻璃最关键的一条，
  也是之前用 `feTurbulence` 做全表面随机扭曲时"不像玻璃"的根本原因。
- 做法：按圆角矩形 SDF 生成一张位移贴图（R/G 通道存位移向量），
  以 `feImage` → `feDisplacementMap` 注入 SVG 滤镜，元素的 `--lg-filter` 指向它。
  贴图按半径档位缓存（192×192），每个元素只多一次 `feDisplacementMap`。
- 思路来源与致敬：
  - 中文技术文章《HTML + CSS 实现 Liquid Glass 液态玻璃效果》：
    https://juejin.cn/post/7514618352829448244
    —— 其中「折射变形仅限于边缘部分，中间部分没有变形」是决定性的纠正；
    该文还对比了 5 个开源方案，并指出 `github.com/shuding/liquid-glass` 的边缘折射最还原。
  - shuding/liquid-glass（MIT）的 `roundedRectSDF` + 位移贴图做法：
    https://github.com/shuding/liquid-glass
  本文件为按上述原理重写，未直接拷贝其代码。
- 降级：没有 canvas 2d / 贴图生成失败时不注入滤镜，退回 CSS 中的默认值，页面不受影响。
  自适应降档到 1 时会自动去掉 `feDisplacementMap`（最贵的一环），只保留高斯模糊。

## 数据来源
- 院校、专业、招生计划、2026 投档最低分：抓取自 https://hbdzxx.com （河北单招网）公开页面。
- 考试类科目与考试大纲：河北省教育考试院及各牵头院校发布的 2026 年官方考试说明。
- 抓取日期：2026-10-10。整理脚本与校验报告见项目根目录 `DATA-NOTES.md`。
