# 河北单招 · 2026 估分选校

河北省高职单招（考试一类 ~ 考试十类 + 对口计算机类）招生院校投档数据查询与估分选校工具。
纯静态站点，零构建、零依赖（除本地引入的开源 CSS），可直接部署到 GitHub Pages。

线上地址：<https://dz.shandiana.cn>（`CNAME`）

## 功能

| 功能 | 说明 |
|---|---|
| 估分选校 | 输入分数后按 `|我的分数 − 该校2026投档最低分|` **由近到远**排序，优先展示分数最接近的院校 |
| 录取判定 | 分差 > 15 → **比较稳**；5 < 分差 ≤ 15 → **可以冲**；分差 ≤ 5 → **不推荐**（阈值见 `index.html` 中 `SCORE_RULES`） |
| 院校卡片 | 一所院校一行，同校不同专业已合并；可展开查看每个专业的计划人数与投档分 |
| 筛选 | 考试类 / 办学性质（公办·民办）/ 城市 / 关键字搜索 / 隐藏“不推荐” |
| 昼夜切换 | 顶栏按钮切换深色·浅色，跟随系统初始值并记忆选择 |
| 外观皮肤 | **默认即全站液态玻璃**；顶栏水滴按钮可切回实色并记忆。玻璃折射由开源库 [@dpawlikowski/liquid-glass](https://github.com/dpawlikowski/liquid-glass)（MIT）提供。通透度靠 `brightness()` 校准而非奶白膜（tint 低至 .10~.12） |
| 网格渐变背景 | 玻璃模式下由 [@mesh-gradient/core](https://github.com/mikhailmogilnikov/mesh-gradient)（MIT）渲染 WebGL 实时网格渐变；无 WebGL 时退回静态 CSS 渐变 |
| 数字滚动 | 玻璃模式下院校投档分由 [number-flow](https://github.com/barvian/number-flow)（MIT）滚动到位；按视野逐个升级，不做全量动画 |
| 选择院校 | 每张院校卡右下角「加入已选」，选择保存在本机 localStorage；底部浮动条可查看/导出/清空，跨考试类保留 |
| 导出 Excel / CSV | 已选院校可导出 **.xlsx**（fflate 打包最小 OOXML，数字列为数值单元格可求和）或 **.csv**（带 UTF-8 BOM，不乱码）；含考试类、院校、性质、城市、计划、投档分、专业、我的分数、分差、判定、来源 |
| 匹配排序 | 输入分数后按「比较稳 → 可以冲 → 不推荐」分档，组内离你的分数由近到远；避免出现「上一所不推荐、下一所比较稳」的倒挂 |
| 自适应性能 | 实时测帧率：连续 2 秒 <48fps 自动降档（① 隐藏 WebGL 背景、模糊减半 ② 关闭卡片背景滤镜），连续 8 秒 >57fps 才回退；档位记忆在本机 |

> 以上三套开源库的版本、许可与打包/接入方式见 [assets/README.md](assets/README.md)
| 考试类与大纲 | 1~10 类的科目构成、2026 录取控制线、大纲原文链接与要点 |
| 免责声明 | 首次进入弹窗，**滚动到底部后**“同意”按钮才由灰色变为绿色可点击 |
| 反馈 | 顶栏与页脚均有 `mailto:2932944216@qq.com` 入口 |

## 目录结构

```
index.html              单页应用（布局 + 主题层 + 逻辑）
data/1.json ~ 10.json   考试一类 ~ 考试十类（每校一行，专业合并）
data/对口计算机.json      对口计算机类
data/syllabus.json      1~10 类大纲、控制线、计算机补充资料、数据校验元信息
assets/pico.min.css     开源样式基座 Pico CSS v2.1.1（MIT）
assets/pico.LICENSE     其许可证
assets/liquid-glass/    液态玻璃折射库 @dpawlikowski/liquid-glass v0.3.0（MIT）
assets/mesh-gradient/   WebGL 网格渐变 @mesh-gradient/core v2.0.2（MIT）
assets/number-flow/     数字滚动 number-flow v0.6.2（MIT）
assets/README.md        第三方资源与数据来源说明（含打包/接入方式）
DATA-NOTES.md           数据口径、校验报告、已知差异、大纲年份问题
```

## 本地运行

浏览器直接双击 `index.html` 会因 `file://` 限制读不到 `data/*.json`，请用静态服务器：

```bash
python3 -m http.server 8099
# 打开 http://127.0.0.1:8099/
```

## 数据

- 来源：[hbdzxx.com](https://hbdzxx.com)（河北单招网）公开页面，抓取日期 **2026-10-10**。
- 口径：一所院校一行，同校不同专业合并；校区、中外合作办学等独立招生单位单独成行。
- 校验：682 个「考试类 × 院校」组合院校名单零缺失；招生计划一致率 97.8%，投档分一致率 98.5%；753 条记录中 99.1% 的专业明细与权威汇总完全自洽。
- 详见 [DATA-NOTES.md](DATA-NOTES.md)，其中包含**考试大纲年份不一致**（类页标注 2026、原文实为 2027 版）的说明。

## 免责

本站数据为第三方整理结果，未经官方核验，仅供参考。招生政策、招生计划与录取分数线请以河北省教育考试院及各招生院校官方发布为准。本站与 hbdzxx.com、河北省教育考试院及各招生院校均无隶属、合作或代理关系。数据纠错请联系 2932944216@qq.com。
