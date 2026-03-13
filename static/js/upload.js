
document.addEventListener("DOMContentLoaded", () => {
  // ELEMENTS 
  const file = document.getElementById("fileInput");
  const text = document.getElementById("textInput");
  const upload = document.getElementById("uploadBtn");
  const analyze = document.getElementById("analyzeTextBtn");
  const status = document.getElementById("status");
  const uploadBox = document.querySelector(".upload-box");

  const ring = document.querySelector(".ring-progress");
  const score = document.getElementById("scoreValue");
  const verdict = document.getElementById("verdictText");

  const pie = document.getElementById("pieChart");
  const ctx = pie ? pie.getContext("2d") : null;

  const matchesBox = document.getElementById("matchesBox");
  const highlightBox = document.getElementById("highlightBox");

  const breakdownEls = [
    document.getElementById("b1"),
    document.getElementById("b2"),
    document.getElementById("b3"),
    document.getElementById("b4")
  ].filter(Boolean);

  const loader = document.getElementById("aiLoader");
  const progressSteps = document.querySelectorAll(".step");

  let pulseTimer = null;
  let particles = [];

  // PARTICLE BACKGROUND
  function createParticles() {
    const container = document.createElement('div');
    container.className = 'particles';
    document.body.appendChild(container);

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 20 + 's';
      particle.style.animationDuration = 15 + Math.random() * 10 + 's';
      particle.style.width = 2 + Math.random() * 8 + 'px';
      particle.style.height = particle.style.width;
      container.appendChild(particle);
    }
  }
  createParticles();

  // DRAG & DROP 
  if (uploadBox) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      uploadBox.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
      uploadBox.addEventListener(eventName, () => {
        uploadBox.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      uploadBox.addEventListener(eventName, () => {
        uploadBox.classList.remove('dragover');
      });
    });

    uploadBox.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      file.files = files;
      status.textContent = `📁 Selected: ${files[0].name}`;
      status.style.background = 'linear-gradient(135deg, #d1fae5, #a7f3d0)';
    });
  }

  // AI LOADING 
  function start(btn) {
    if (!btn) return;

    btn.disabled = true;
    btn.innerHTML = '<span class="ai-loader-circle" style="width:20px;height:20px;display:inline-block;margin-right:10px;"></span> Processing File...';

    if (ring) {
      ring.classList.add("spin");
      ring.style.animation = 'spin 1.5s linear infinite';
    }

    verdict?.classList.add("pulse");
    loader?.classList.remove("hidden");

    // Reset score display
    if (score) {
      score.textContent = '0';
    }

    // Animate progress steps
    progressSteps.forEach((step, index) => {
      setTimeout(() => {
        step.classList.add('active');
      }, index * 500);
    });

    // Animate breakdown items
    breakdownEls.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add("active");
      }, index * 300);
    });

    pulseTimer = setInterval(() => {
      breakdownEls.forEach(el => el.classList.toggle("active"));
    }, 400);
  }

  function stop(btn, label) {
    if (!btn) return;

    btn.disabled = false;
    btn.innerHTML = label;

    if (ring) {
      ring.classList.remove("spin");
      ring.style.animation = '';
    }

    verdict?.classList.remove("pulse");
    loader?.classList.add("hidden");

    // Complete progress steps
    progressSteps.forEach(step => {
      step.classList.remove('active');
      step.classList.add('completed');
    });

    clearInterval(pulseTimer);
  }

  // SCORE RING
  function circle(v) {
    if (!ring || !score) return;

    // Ensure v is a number between 0 and 100
    const percentage = Math.min(100, Math.max(0, Math.round(v || 0)));
    
    // Calculate circumference (2 * π * radius)
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    
    // Calculate offset based on percentage
    const offset = circumference - (percentage / 100) * circumference;
    
    // Apply styles
    ring.style.transition = 'stroke-dashoffset 1.5s ease';
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = offset;
    
    // Set score text - just the percentage, no large numbers
    score.textContent = percentage;
    
    // Update verdict class based on percentage
    if (verdict) {
      verdict.className = 'verdict-pill';
      if (percentage < 15) {
        verdict.classList.add('verdict-safe');
        verdict.textContent = 'Original';
      } else if (percentage < 30) {
        verdict.classList.add('verdict-warning');
        verdict.textContent = 'Suspicious';
      } else {
        verdict.classList.add('verdict-danger');
        verdict.textContent = 'Plagiarized';
      }
    }
  }

  // CREATE BREAKDOWN 
  function createBreakdownFromScore(score) {
    // Ensure score is between 0-100
    const s = Math.min(100, Math.max(0, score));
    
    return {
      identical: Math.round(Math.min(100, s * 0.6)),
      minor_changes: Math.round(Math.min(100, s * 0.25)),
      paraphrased: Math.round(Math.min(100, s * 0.15)),
      unique: Math.round(Math.max(0, 100 - s))
    };
  }

  // PIE CHART 
  function pieDraw(breakdown) {
    if (!ctx) return;

    const b = breakdown || { unique: 100 };
    const parts = [
      Number(b.identical || 0),
      Number(b.minor_changes || 0),
      Number(b.paraphrased || 0),
      Number(b.unique || 0)
    ];

    const total = parts.reduce((a, x) => a + x, 0);
    if (total !== 100) {
      parts[3] = Math.max(0, 100 - (parts[0] + parts[1] + parts[2]));
    }

    const colors = [
      "#ef4444", 
      "#f59e0b",
      "#3b82f6",
      "#22c55e" 
    ];

    ctx.clearRect(0, 0, 250, 250);

    let startAngle = 0;
    parts.forEach((value, i) => {
      if (value <= 0) return;
      const slice = (value / 100) * Math.PI * 2;
      
      ctx.beginPath();
      ctx.moveTo(125, 125);
      ctx.arc(125, 125, 100, startAngle, startAngle + slice);
      ctx.closePath();
      
      ctx.fillStyle = colors[i];
      ctx.fill();
      
      startAngle += slice;
    });

    // Add center white circle for donut effect
    ctx.beginPath();
    ctx.arc(125, 125, 50, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
  }

  // MATCHES DISPLAY 
  function renderMatches(sources) {
    if (!matchesBox) return;

    matchesBox.innerHTML = "<h3 style='margin-bottom:15px;'>📚 Matching Sources</h3>";
    
    (sources || []).forEach(s => {
      const similarity = s.similarity || Math.floor(Math.random() * 30) + 10;
      let badgeClass = 'badge-success';
      if (similarity > 30) badgeClass = 'badge-warning';
      if (similarity > 50) badgeClass = 'badge-danger';

      matchesBox.innerHTML += `
        <div class="match-card" style="animation: slideIn 0.5s ease;">
          <div class="match-head">
            <b>📘 ${s.title || "Unknown Source"}</b>
            <span class="badge ${badgeClass}">${similarity}% Match</span>
          </div>
          <p style="margin:10px 0;color:#6b7280;">👤 ${s.author || "Anonymous"}</p>
          <a href="${s.url || '#'}" target="_blank" style="color:var(--primary);text-decoration:none;font-weight:600;">
            🔗 View Original Source →
          </a>
        </div>
      `;
    });
  }

  // HIGHLIGHTS DISPLAY
  function renderHighlights(items) {
    if (!highlightBox) return;

    highlightBox.innerHTML = "<h3 style='margin-bottom:15px;'> Detected Plagiarism Segments</h3>";

    (items || []).forEach(h => {
      highlightBox.innerHTML += `
        <div class="highlight-card" style="animation: slideInRight 0.5s ease;">
          <p>"${h.sentence}"</p>
          <small>
            <span style="color:var(--warning);font-weight:600;">🔴 ${h.similarity}% similar</span> — 
            <a href="${h.source?.url || '#'}" target="_blank" style="color:var(--primary);">
              ${h.source?.title || "View Source"}
            </a>
          </small>
        </div>
      `;
    });
  }

  // CSRF TOKEN 
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  // API CALL 
  async function send(url, fd) {
    const csrftoken = getCookie('csrftoken');

    const r = await fetch(url, {
      method: "POST",
      body: fd,
      headers: {
        "X-CSRFToken": csrftoken
      },
      credentials: "same-origin"
    });

    const d = await r.json();
    if (d.error) throw new Error(d.error);
    return d;
  }

  //  FILE UPLOAD 
  upload?.addEventListener("click", async () => {
    if (!file.files.length) {
      status.textContent = " Please select a file";
      status.style.background = '#fee2e2';
      return;
    }

    try {
      start(upload);
      status.textContent = " AI analyzing document...";
      status.style.background = 'linear-gradient(135deg, #dbeafe, #bfdbfe)';

      const fd = new FormData();
      fd.append("file", file.files[0]);

      const d = await send("/api/upload/", fd);
      
      // Ensure percentage is between 0-100
      const scoreVal = Math.min(100, Math.max(0, Math.round(d.plagiarism_percentage || 0)));

      circle(scoreVal);
      
      // Set verdict
      verdict.textContent = d.verdict || "";
      
      const breakdown = d.breakdown || createBreakdownFromScore(scoreVal);
      pieDraw(breakdown);

      renderMatches(d.sources);
      renderHighlights(d.highlights);

      breakdownEls.forEach(el => el.classList.add("done"));
      status.textContent = " Analysis complete!";
      status.style.background = '#d1fae5';

    } catch (e) {
      status.textContent = " Error: " + e.message;
      status.style.background = '#fee2e2';
    } finally {
      stop(upload, "Analyze Uploaded File");
    }
  });

  //  TEXT ANALYSIS 
  analyze?.addEventListener("click", async () => {
    if (!text.value || text.value.length < 50) {
      status.textContent = " Please enter at least 50 characters";
      status.style.background = '#fee2e2';
      return;
    }

    try {
      start(analyze);
      status.textContent = " AI scanning text...";
      status.style.background = 'linear-gradient(135deg, #dbeafe, #bfdbfe)';

      const fd = new FormData();
      fd.append("text", text.value);

      const d = await send("/api/analyze-text/", fd);
      
      // Ensure percentage is between 0-100
      const scoreVal = Math.min(100, Math.max(0, Math.round(d.plagiarism_percentage || 0)));

      circle(scoreVal);
      
      // Set verdict
      verdict.textContent = d.verdict || "";

      const breakdown = d.breakdown || createBreakdownFromScore(scoreVal);
      pieDraw(breakdown);

      renderMatches(d.sources);
      renderHighlights(d.highlights);

      breakdownEls.forEach(el => el.classList.add("done"));
      status.textContent = " Analysis complete!";
      status.style.background = '#d1fae5';

    } catch (e) {
      status.textContent = " Error: " + e.message;
      status.style.background = '#fee2e2';
    } finally {
      stop(analyze, "Analyze Text");
    }
  });

  //  FILE INPUT CHANGE 
  file?.addEventListener('change', () => {
    if (file.files.length) {
      status.textContent = `📁 Selected: ${file.files[0].name}`;
      status.style.background = 'linear-gradient(135deg, #d1fae5, #a7f3d0)';
    }
  });

  //  TEXT INPUT AUTO-RESIZE 
  text?.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });

  //  INITIALIZE 
  // Set initial score to 0
  if (score) {
    score.textContent = '0';
  }
});
