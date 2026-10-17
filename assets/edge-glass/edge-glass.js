/* ============================================================================
 * edge-glass.js —— 边缘折射（本文件为本站自写，不是第三方库）
 *
 * 为什么不用 feTurbulence：
 *   随机噪声会让整个表面均匀扭曲，看起来像"果冻/毛玻璃"，而不是玻璃。
 *   真实液态玻璃的折射只发生在**边缘**：中心完全不位移，越靠近边框，
 *   采样坐标越往内收（放大），形成透镜般的边缘弯折。
 *   参考思路：https://juejin.cn/post/7514618352829448244（"仅边缘 5px 折射"）
 *            与 shuding/liquid-glass (MIT) 的 roundedRectSDF 位移贴图做法。
 *
 * 做法：
 *   1. 用圆角矩形 SDF 生成一张位移贴图（R/G 通道 = 位移向量），缓存复用；
 *   2. 注入一个 SVG <filter>：feImage(贴图) → feDisplacementMap；
 *   3. 把元素的 --lg-filter 指向该 filter，配合 backdrop-filter 即得到边缘折射。
 *
 * 成本：贴图只生成一次（按半径档位缓存），之后每个元素只是一次 feDisplacementMap。
 *       卡片这类数量多的元素由调用方按视野挂载/卸载。
 * ========================================================================== */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var MAP_SIZE = 192;
  var cache = {};          // 半径档位 -> { url, maxA }
  var injected = {};       // filterId -> true
  var svgHost = null;

  function smoothStep(a, b, t) {
    t = (t - a) / (b - a);
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return t * t * (3 - 2 * t);
  }

  // 圆角矩形有符号距离：内部为负，边界为 0
  function roundedRectSDF(x, y, halfW, halfH, radius) {
    var qx = Math.abs(x) - halfW + radius;
    var qy = Math.abs(y) - halfH + radius;
    return Math.min(Math.max(qx, qy), 0) +
           Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - radius;
  }

  /**
   * 生成位移贴图（正方形，拉伸后套到任意尺寸的元素上）
   * @param {number} radiusNorm 归一化圆角（相对短边）
   * @param {number} zone       折射带宽度（归一化）
   * @param {number} strength   边缘最大内收比例
   */
  function buildMap(radiusNorm, zone, strength) {
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = MAP_SIZE;
    var ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx || typeof ctx.createImageData !== 'function') return null;   // 无 canvas 能力则跳过
    var img = ctx.createImageData(MAP_SIZE, MAP_SIZE);
    var data = img.data;
    var dxs = new Float32Array(MAP_SIZE * MAP_SIZE);
    var dys = new Float32Array(MAP_SIZE * MAP_SIZE);
    var maxA = 1e-6;

    for (var y = 0; y < MAP_SIZE; y++) {
      for (var x = 0; x < MAP_SIZE; x++) {
        var u = (x + 0.5) / MAP_SIZE - 0.5;
        var v = (y + 0.5) / MAP_SIZE - 0.5;
        // 距离最近边缘的归一化距离
        var d = roundedRectSDF(u, v, 0.5, 0.5, radiusNorm);
        // 0 = 中心，1 = 贴边
        var t = smoothStep(-zone, 0, d);
        var s = t * t * (3 - 2 * t);
        // 越靠边，采样点越往中心收（放大）→ 视觉上是边缘被"吸"进去
        var tx = u * (1 - strength * s);
        var ty = v * (1 - strength * s);
        var i = y * MAP_SIZE + x;
        dxs[i] = tx - u;
        dys[i] = ty - v;
        var ax = Math.abs(dxs[i]), ay = Math.abs(dys[i]);
        if (ax > maxA) maxA = ax;
        if (ay > maxA) maxA = ay;
      }
    }

    for (var j = 0; j < MAP_SIZE * MAP_SIZE; j++) {
      var k = j * 4;
      data[k]     = Math.round((dxs[j] / maxA) * 127 + 127.5);   // R：x 位移
      data[k + 1] = Math.round((dys[j] / maxA) * 127 + 127.5);   // G：y 位移
      data[k + 2] = 128;
      data[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    var url;
    try { url = canvas.toDataURL('image/png'); } catch (e) { url = null; }
    // data URL 不可用（canvas 被污染 / 引擎不支持）时不注入，退回 CSS 里的默认滤镜
    if (!url || url.indexOf('data:') !== 0) return null;
    return { url: url, maxA: maxA };
  }

  function ensureHost() {
    if (svgHost && svgHost.isConnected) return svgHost;
    svgHost = document.createElementNS(NS, 'svg');
    svgHost.setAttribute('aria-hidden', 'true');
    svgHost.setAttribute('focusable', 'false');
    svgHost.setAttribute('width', '0');
    svgHost.setAttribute('height', '0');
    svgHost.style.cssText = 'position:fixed;width:0;height:0;overflow:hidden;pointer-events:none';
    (document.body || document.documentElement).appendChild(svgHost);
    return svgHost;
  }

  /**
   * 注入一个边缘折射滤镜
   * @param {string} id         滤镜 id
   * @param {number} scalePx    最大位移像素（折射强度）
   * @param {object} [opt]      { radiusNorm, zone, strength }
   */
  function injectFilter(id, scalePx, opt) {
    opt = opt || {};
    if (injected[id] && document.getElementById(id)) return id;
    var radiusNorm = opt.radiusNorm == null ? 0.08 : opt.radiusNorm;
    var zone = opt.zone == null ? 0.12 : opt.zone;
    var strength = opt.strength == null ? 0.22 : opt.strength;
    var key = radiusNorm + '|' + zone + '|' + strength;

    if (!cache[key]) cache[key] = buildMap(radiusNorm, zone, strength);
    if (!cache[key]) return null;      // 贴图生成失败：保留 CSS 里的默认滤镜

    var filter = document.createElementNS(NS, 'filter');
    filter.setAttribute('id', id);
    filter.setAttribute('x', '-4%');
    filter.setAttribute('y', '-4%');
    filter.setAttribute('width', '108%');
    filter.setAttribute('height', '108%');
    filter.setAttribute('color-interpolation-filters', 'sRGB');

    var feImage = document.createElementNS(NS, 'feImage');
    feImage.setAttribute('href', cache[key].url);
    feImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', cache[key].url);
    feImage.setAttribute('x', '0');
    feImage.setAttribute('y', '0');
    feImage.setAttribute('width', '100%');
    feImage.setAttribute('height', '100%');
    feImage.setAttribute('preserveAspectRatio', 'none');
    feImage.setAttribute('result', 'map');

    var feDisp = document.createElementNS(NS, 'feDisplacementMap');
    feDisp.setAttribute('in', 'SourceGraphic');
    feDisp.setAttribute('in2', 'map');
    feDisp.setAttribute('scale', String(scalePx));
    feDisp.setAttribute('xChannelSelector', 'R');
    feDisp.setAttribute('yChannelSelector', 'G');

    filter.appendChild(feImage);
    filter.appendChild(feDisp);
    ensureHost().appendChild(filter);
    injected[id] = true;
    return id;
  }

  global.EdgeGlass = {
    /** 初始化常用滤镜（幂等） */
    init: function () {
      injectFilter('lg-edge-lg', 18, { radiusNorm: 0.07, zone: 0.11, strength: 0.24 });  // 卡片/面板
      injectFilter('lg-edge-sm', 7,  { radiusNorm: 0.30, zone: 0.16, strength: 0.20 });  // 顶栏/统计条
      return this;
    },
    /** 给元素挂上边缘折射（只改 --lg-filter，视觉其余部分仍由 glass 库负责） */
    apply: function (el, which) {
      if (!el) return;
      var id = which === 'sm' ? 'lg-edge-sm' : 'lg-edge-lg';
      if (!document.getElementById(id)) return;   // 滤镜没注入成功就不改，保留默认
      el.style.setProperty('--lg-filter', 'url("#' + id + '")');
    },
    remove: function (el) {
      if (el) el.style.removeProperty('--lg-filter');
    },
    _buildMap: buildMap,     // 便于测试
    _injectFilter: injectFilter,
  };
})(window);
