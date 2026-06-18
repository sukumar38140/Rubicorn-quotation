// ==========================================================================
// Main Application Script - Rubicorn Technologies Proposal Page
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initThemeToggle();
  initCalculator();
  initROI();
  initSignaturePad();
  initFeatureModals();
  
  // PDF download trigger
  const downloadBtn = document.getElementById('download-proposal-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      window.print();
    });
  }
});

/* ==========================================================================
   1. Countdown Timer
   ========================================================================== */
function initCountdown() {
  const countdownEl = document.getElementById('countdown');
  if (!countdownEl) return;

  // Set target date to 2 days 14 hours from now
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 2);
  targetDate.setHours(targetDate.getHours() + 14);

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      countdownEl.innerHTML = "EXPIRED";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = String(days).padStart(2, '0');
    document.getElementById('hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
    document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================================
   2. Theme Toggle
   ========================================================================== */
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    document.body.classList.toggle('dark-theme');
    
    // Save preference
    const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
  });

  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  }
}

/* ==========================================================================
   3. Interactive Booking Mockup (Removed - Available on Demo Site)
   ========================================================================== */

/* ==========================================================================
   4. Pricing Customizer & Subscription Calculator
   ========================================================================== */
let selectedCalcPlanType = 'monthly';

function initCalculator() {
  calculateInvestment();
}

window.selectCalcPlan = function(planType) {
  selectedCalcPlanType = planType;
  
  // Sync the form's select dropdown with this choice
  const planSelect = document.getElementById('form-maintenance-plan');
  if (planSelect) {
    if (planType === 'monthly') {
      planSelect.value = 'Monthly';
    } else if (planType === 'six-month') {
      planSelect.value = '6 Months';
    } else if (planType === 'annual') {
      planSelect.value = 'Annual';
    }
  }

  calculateInvestment();
};

window.calculateInvestment = function() {
  const setupBase = 44999; // Final package price (development + core modules)
  
  // Subscription calculation
  let subName = '';
  let subCostText = '';
  
  if (selectedCalcPlanType === 'monthly') {
    subName = 'Monthly Plan';
    subCostText = '₹4,999 / month';
  } else if (selectedCalcPlanType === 'six-month') {
    subName = '6 Months Plan';
    subCostText = '₹24,999';
  } else if (selectedCalcPlanType === 'annual') {
    subName = 'Annual Plan';
    subCostText = '₹49,999';
  }

  document.getElementById('calc-subscription-name').innerText = subName;
  document.getElementById('calc-subscription-cost').innerHTML = subCostText;
  
  // Total Setup Investment = Setup package price (flat)
  document.getElementById('calc-initial-total').innerText = '₹' + setupBase.toLocaleString('en-IN');
};

/* ==========================================================================
   5. ROI Calculator
   ========================================================================== */
function initROI() {
  calculateROI();
}

window.calculateROI = function() {
  const roomsCount = parseInt(document.getElementById('rooms-count').value);
  const roomPrice = parseInt(document.getElementById('room-price').value);
  const occupancyBoost = parseInt(document.getElementById('occupancy-boost').value);

  // Update slider text
  document.getElementById('rooms-val').innerText = roomsCount + ' rooms';
  document.getElementById('price-val').innerText = '₹' + roomPrice.toLocaleString('en-IN');
  document.getElementById('boost-val').innerText = occupancyBoost + '%';

  // Calculate returns
  // Boost = Additional occupied rooms count per night = roomsCount * (occupancyBoost/100)
  const additionalRoomsPerNight = roomsCount * (occupancyBoost / 100);
  const dailyRevIncrease = additionalRoomsPerNight * roomPrice;
  const monthlyRevIncrease = Math.round(dailyRevIncrease * 30);
  const annualRevIncrease = Math.round(dailyRevIncrease * 365);

  // Update results
  document.getElementById('roi-monthly-rev').innerText = '₹' + monthlyRevIncrease.toLocaleString('en-IN');
  document.getElementById('roi-annual-rev').innerText = '₹' + annualRevIncrease.toLocaleString('en-IN');

  // Calculate Payback period (Setup cost is ₹44,999)
  const setupCost = 44999;
  const paybackDays = Math.ceil(setupCost / dailyRevIncrease);
  
  let paybackText = '';
  if (paybackDays <= 1) {
    paybackText = 'Less than 1 day of occupancy boost!';
  } else {
    paybackText = paybackDays + ' days of occupancy boost';
  }
  document.getElementById('roi-payback-days').innerText = paybackText;

  // Visual Progress bar of payback speed (max 30 days is full progress)
  const progressBarFill = document.getElementById('payback-bar');
  if (progressBarFill) {
    const percentage = Math.max(10, Math.min(100, (30 - paybackDays) * 3.33));
    progressBarFill.style.width = percentage + '%';
  }
};

/* ==========================================================================
   6. Signature Pad
   ========================================================================== */
let canvas = null;
let ctx = null;
let drawing = false;
let hasSigned = false;

function initSignaturePad() {
  canvas = document.getElementById('signature-pad');
  if (!canvas) return;

  ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#d4af37'; // Gold ink
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';

  // Make signature crisp on Retina displays
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.scale(ratio, ratio);
  
  // Set stroke color again after resize/rescale
  ctx.strokeStyle = document.body.classList.contains('light-theme') ? '#967513' : '#d4af37';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';

  // Desktop events
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  // Mobile Touch events
  canvas.addEventListener('touchstart', startDrawingTouch, { passive: false });
  canvas.addEventListener('touchmove', drawTouch, { passive: false });
  canvas.addEventListener('touchend', stopDrawing);

  // Recalculate size on theme changes to adapt strokes
  document.getElementById('theme-toggle').addEventListener('click', () => {
    ctx.strokeStyle = document.body.classList.contains('light-theme') ? '#967513' : '#d4af37';
  });
}

function startDrawing(e) {
  drawing = true;
  hasSigned = true;
  ctx.beginPath();
  const rect = canvas.getBoundingClientRect();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
}

function startDrawingTouch(e) {
  e.preventDefault();
  drawing = true;
  hasSigned = true;
  ctx.beginPath();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
}

function drawTouch(e) {
  e.preventDefault();
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
  ctx.stroke();
}

function stopDrawing() {
  drawing = false;
}

window.clearSignature = function() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hasSigned = false;
};

/* ==========================================================================
   7. Form Acceptance & Confetti Trigger
   ========================================================================== */
window.selectPlanForm = function(planName) {
  const planSelect = document.getElementById('form-maintenance-plan');
  if (planSelect) {
    planSelect.value = planName;
  }
};

window.submitProposal = function(event) {
  event.preventDefault();

  if (!hasSigned) {
    alert("Please sign the e-signature pad before accepting the proposal.");
    return;
  }

  const clientName = document.getElementById('client-name').value;
  const lodgeName = document.getElementById('lodge-name').value;
  const planName = document.getElementById('form-maintenance-plan').value;

  // Convert canvas signature to data URL for receipts
  const sigDataUrl = canvas.toDataURL();

  // Populate receipt screen
  document.getElementById('r-client-name').innerText = clientName;
  document.getElementById('r-lodge-name').innerText = lodgeName;
  document.getElementById('r-plan').innerText = planName + ' Plan';
  
  const today = new Date();
  document.getElementById('r-date').innerText = today.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  document.getElementById('sig-image-preview').src = sigDataUrl;

  // Switch views
  document.getElementById('proposal-acceptance-form').classList.add('hidden-element');
  document.getElementById('acceptance-success-screen').classList.remove('hidden-element');

  // Trigger acceptance confetti celebration!
  if (window.confetti) {
    var duration = 4 * 1000;
    var end = Date.now() + duration;

    (function frame() {
      window.confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      window.confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }
};

window.resetAcceptanceForm = function() {
  document.getElementById('proposal-acceptance-form').reset();
  clearSignature();
  document.getElementById('proposal-acceptance-form').classList.remove('hidden-element');
  document.getElementById('acceptance-success-screen').classList.add('hidden-element');
};

/* ==========================================================================
   8. Feature Modals Detail Content
   ========================================================================== */
const featureDetails = {
  'premium-design': {
    title: 'Premium Website Design',
    desc: 'We craft bespoke web platforms with cutting-edge styling. Your website will stand out with premium visual quality, ensuring that guests trust your brand immediately.',
    bullets: [
      'Luxurious hospitality layout tailored to high-end conversions.',
      '100% Mobile Responsive design conforming to all mobile and tablet viewports.',
      'High-performance optimization yielding PageSpeed scores above 90+.',
      'Structured HTML coding optimized for localized search engine crawlers (SEO-friendly).'
    ]
  },
  'room-management': {
    title: 'Room Booking Management',
    desc: 'Give guests an effortless checkout. Our filter systems ensure guests find their preferred rooms (A/C vs. Non-A/C) in seconds, with dynamic price adjustments and immediate availability calendars.',
    bullets: [
      'Instant search and filter options for A/C and Non-A/C layouts.',
      'Interactive room selection calendars showing live booking windows.',
      'Centralized admin dashboard to update room prices, block dates, and manage inventory.',
      'Guest profile generator compiling phone logs and room histories.'
    ]
  },
  'ai-brand': {
    title: 'AI Brand Protection System',
    desc: 'Protect your brand from cyber-squatting, scammers, and copycat websites. Our AI scanner continuously combs search indices to locate duplicates or fake reservation pages trading on your identity.',
    bullets: [
      'Automated scraper locating duplicate brand elements and listings.',
      'Image and logo similarity analysis measuring replica ratios.',
      'Security warnings trigger if suspicious proxy domains register matching your brand name.',
      'Expert review by Rubicorn engineers with formal domain abuse reports filed on your behalf.'
    ]
  },
  'advanced-security': {
    title: 'Advanced Security System',
    desc: 'Enterprise-grade firewalls shield client database entries. We protect booking channels and secure transactional flows against distributed breaches.',
    bullets: [
      'Standard Web Application Firewall (WAF) filtering malicious traffic.',
      'Weekly automated malware monitoring checks and database backup processes.',
      'Anti-Spam protections blocking fake reservations or bots from clogging inventories.',
      'Encrypted admin logins utilizing Secure Cryptography standards.'
    ]
  },
  'secure-payments': {
    title: 'Secure Payment Management',
    desc: 'Accept payments directly online via UPI, credit cards, or net banking. Transactions are processed through leading authorized providers, building customer confidence.',
    bullets: [
      'Gateway integration supporting standard payment structures.',
      'Secured ledger records logged on a private reservation panel.',
      'Automated transaction details generation for invoices.',
      'Instant notifications sent to managers upon deposit confirmation.'
    ]
  },
  'email-automation': {
    title: 'Automatic Email System',
    desc: 'Operate your lodge hands-free. The system automates routine guest communication so your desk staff can focus on physical hospitality.',
    bullets: [
      'Immediate Reservation Confirmation email sent upon booking success.',
      'Automated Invoice delivery attaching a clean PDF receipt of payment.',
      'Scheduled Booking Reminder sent to guests 24 hours prior to arrival.',
      'Post-stay automated thank you emails encouraging reviews.'
    ]
  },
  'customer-retention': {
    title: 'Customer Retention AI System',
    desc: 'Bring past guests back. Our retention module automatically alerts repeat customers of ongoing discounts, boosting occupancy during dry spells.',
    bullets: [
      'Integrated guest database tracking previous visits and preferences.',
      'Automatic recognition trigger identifying VIP repeat customers.',
      'Tailored promotional alerts and automated festival greetings.',
      'Intelligent re-engagement campaigns targeting inactive contacts.'
    ]
  },
  'ssl-benefits': {
    title: 'SSL Certificate Integration',
    desc: 'Build client confidence with green padlock security. SSL encryption guarantees that all payment info, credentials, and data are shielded during transmission.',
    bullets: [
      'Active HTTPS domain certificate showing secure padlock symbol.',
      'Protects client credentials against packet-sniffing on public Wi-Fi.',
      'Improves website rankings as search engines prioritize secure domains.',
      'Standardizes enterprise trust credentials for online payment validation.'
    ]
  }
};

function initFeatureModals() {
  // Modal closing hooks
  const modal = document.getElementById('feature-modal');
  if (!modal) return;
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeFeatureModal();
    }
  });

  // Esc key closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeFeatureModal();
    }
  });
}

window.openFeatureModal = function(featureKey) {
  const data = featureDetails[featureKey];
  if (!data) return;

  const contentArea = document.getElementById('modal-content-area');
  
  let bulletsHTML = '';
  data.bullets.forEach(b => {
    bulletsHTML += `<li>${b}</li>`;
  });

  contentArea.innerHTML = `
    <h3 class="modal-detail-title">${data.title}</h3>
    <p class="modal-detail-desc">${data.desc}</p>
    <h4 class="modal-list-title">What is included:</h4>
    <ul class="modal-detail-list">
      ${bulletsHTML}
    </ul>
  `;

  const modal = document.getElementById('feature-modal');
  modal.classList.add('active');
};

window.closeFeatureModal = function() {
  const modal = document.getElementById('feature-modal');
  if (modal) modal.classList.remove('active');
};
