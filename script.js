(function() {
  'strict';
  var grid, buffer, turScales = [], ctx;

  // *********** Grid **************
  function getP(grid, rx, ry) {
    var x = (rx + grid.width) % grid.width;
    var y = (ry + grid.height) % grid.height;
    return grid[y * grid.width + x];
  }

  function setP(grid, x, y, val) {
    return (grid[y * grid.width + x] = val);
  }

  function cap(min, max, v) {
    return Math.min(Math.max(v, min), max);
  }

  function TuringScale(height, width, actRad, inhRad, smAmt) {
    this.height = height;
    this.width = width;
    this.actRad = actRad;
    this.inhRad = inhRad;
    this.smAmt = smAmt;
    this.act = new Array(width * height);
    this.act.height = height;
    this.act.width = width;
    this.inh = new Array(width * height);
    this.inh.height = height;
    this.inh.width = width;
    this.var = new Array(width * height);
    this.var.height = height;
    this.var.width = width;
  }

  function resize() {
    canvas.height = innerHeight;
    canvas.width = innerWidth;
    //canvas.height = 400;
    //canvas.width = 600;
  }

  function blurHor(src, dest, rad) {
    var sum;
    var area = rad*2 + 1;
    for (var y = 0; y < src.height; ++y) {
      sum = 0;
      for (i = -rad; i <= rad; ++i) {
        sum += getP(src, i, y);
      }
      for (var x = 0; x < src.width; ++x) {
        sum += getP(src, x + i, y) - getP(src, x - i, y);
        setP(dest, x, y, sum / area);
      }
    }
  }

  function blurVer(src, dest, rad) {
    var sum;
    var area = rad*2 + 1;
    for (var x = 0; x < src.width; ++x) {
      sum = 0;
      for (i = -rad; i <= rad; ++i) {
        sum += getP(src, x, i);
      }
      for (var y = 0; y < src.height; ++y) {
        sum += getP(src, x, y + i) - getP(src, x, y - i);
        setP(dest, x, y, sum / area);
      }
    }
  }

  function blur(src, dest, rad) {
    blurHor(src, buffer, rad);
    blurVer(buffer, dest, rad);
  }

  function normalize(grid, max) {
    for (var i = 0; i < grid.length; ++i) {
      grid[i] = grid[i] / max;
    }
  }

  function calcVariation(src, turScale) {
    blur(src, turScale.act, turScale.actRad);
    blur(src, turScale.inh, turScale.inhRad);
    for (var i = 0; i < src.length; ++i) {
      turScale.var[i] = Math.abs(turScale.act[i] - turScale.inh[i]);
    }
  }

  function applyTuringScale(src, turScale) {
    blur(src, turScale.act, turScale.actRad);
    blur(src, turScale.inh, turScale.inhRad);
    for (var i = 0; i < src.length; ++i) {
      var diff = turScale.act[i] > turScale.inh[i] ? turScale.smAmt : -turScale.smAmt;
      turScale.var[i] = src[i] + diff;
    }
  }

  function step(grid) {
    var i, j, max = 0, leastVar, diff;
    for (i = 0; i < turScales.length; i++) {
      calcVariation(grid, turScales[i]);
    }
    for (i = 0; i < grid.length; ++i) {
      leastVar = 0;
      for (j = 1; j < turScales.length; j++) {
        if (turScales[j].var[i] < turScales[leastVar].var[i]) {
          leastVar = j;
        }
      }
      if (turScales[leastVar].act[i] > turScales[leastVar].inh[i]) {
        diff = turScales[leastVar].smAmt;
      } else {
        diff = -turScales[leastVar].smAmt;
      }
      grid[i] += diff;
      max = Math.max(max, Math.abs(grid[i]));
    }
    normalize(grid, max);
  }
  function setPx(d, w, y, x, v) {
    var i = (y * w + x) * 4;
    d[i] = v;
    d[i+1] = v;
    d[i+2] = v;
    d[i+3] = 255;
  }
  function draw(grid, imgData) {
    var h = imgData.height;
    var w = imgData.width;
    for (var y = 0; y < h; ++y) {
      for (var x = 0; x < w; ++x) {
        setPx(imgData.data, w, y, x, (grid[y*w+x] + 1) / 2 * 256 | 0);
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }
  function initialize() {
    resize();
    buffer = new Array(canvas.width * canvas.height);
    buffer.width = canvas.width;
    buffer.height = canvas.height;
    grid = new Array(canvas.width * canvas.height);
    grid.width = canvas.width;
    grid.height = canvas.height;
    turScales = [
      new TuringScale(canvas.height, canvas.width, 400, 700, 0.08),
      //new TuringScale(canvas.height, canvas.width, 300, 550, 0.08),
      //new TuringScale(canvas.height, canvas.width, 100, 200, 0.06),
      new TuringScale(canvas.height, canvas.width, 60, 80, 0.05),
      //new TuringScale(canvas.height, canvas.width, 20, 40, 0.04),
      new TuringScale(canvas.height, canvas.width, 10, 20, 0.03),
      //new TuringScale(canvas.height, canvas.width, 5, 10, 0.02),
      new TuringScale(canvas.height, canvas.width, 2, 4, 0.02),
    ];
    for (var i = 0; i < canvas.width * canvas.height; ++i) {
      grid[i] = Math.random() * 2 - 1;
    }
    ctx = canvas.getContext('2d');
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    function frame() {
      step(grid);
      draw(grid, imageData);
      setTimeout(frame, 16);
    }
    frame();
  }
  document.addEventListener('DOMContentLoaded', initialize);
  window.addEventListener('resize', resize);
}());
