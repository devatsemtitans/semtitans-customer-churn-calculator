// SEMTITANS Customer Churn Rate & Retention Calculator
// Standalone Client App with Niche-Specific Logic Engine

(function () {
  const INDUSTRIES = [
    {
      id: "saas",
      name: "SaaS / B2B Subscription",
      shortLabel: "SaaS",
      isRecurring: true,
      starting: 1000,
      lost: 45,
      arpu: 120,
      ltv: 2400,
      estCac: 180,
      healthyMax: 3.5,
      warningMax: 6.0,
      typicalRange: "3.5% – 5.0% / mo",
      benchmarkDesc: "Top-quartile B2B SaaS companies maintain monthly churn below 2.5%.",
      retentionFocus: "Onboarding feature adoption & automated dunning",
      fieldLabels: {
        starting: "Active Paying Customers",
        startingDesc: "Total active accounts or subscriptions at the start of the month.",
        lost: "Canceled Accounts / Month",
        lostDesc: "Subscribers who canceled or churned this month.",
        arpu: "Monthly Revenue per Account (MRR / User)",
        arpuDesc: "Average subscription fee billed per customer each month.",
        ltv: "Customer Lifetime Value (LTV)",
        ltvDesc: "Leave blank to auto-calculate from monthly retention (MRR × Lifespan)."
      }
    },
    {
      id: "ecom",
      name: "E-commerce & D2C Retail",
      shortLabel: "E-commerce",
      isRecurring: false,
      starting: 1200,
      lost: 108,
      arpu: 159,
      ltv: 159,
      estCac: 45,
      healthyMax: 5.5,
      warningMax: 8.5,
      typicalRange: "5.5% – 8.0% / mo",
      benchmarkDesc: "Standard retail: 70–80% of buyers purchase once. Subscriptions/reorders churn at ~6–8%/mo.",
      retentionFocus: "Pre-purchase cart retargeting & post-purchase reorder flows",
      fieldLabels: {
        starting: "Active Monthly Buyers / Customers",
        startingDesc: "Total purchasing customers or active repeat pool in your store.",
        lost: "Lost / Non-Reordering Buyers",
        lostDesc: "Past customers who did not place another order within expected window.",
        arpu: "Average Order Value (AOV)",
        arpuDesc: "Average total dollar amount spent per single cart/checkout.",
        ltv: "Customer Lifetime Value (Total Lifetime Spend)",
        ltvDesc: "Leave blank if customers buy once (defaults to 1st Order AOV). Enter repeat LTV if tracked."
      }
    },
    {
      id: "agency",
      name: "Agency / B2B Retainer Services",
      shortLabel: "Agency",
      isRecurring: true,
      starting: 35,
      lost: 1,
      arpu: 3000,
      ltv: 36000,
      estCac: 2500,
      healthyMax: 2.5,
      warningMax: 5.0,
      typicalRange: "2.0% – 4.0% / mo",
      benchmarkDesc: "High-ticket service retainers require >95% monthly client retention for healthy compounding.",
      retentionFocus: "Quarterly business reviews (QBRs) & proactive ROI reporting",
      fieldLabels: {
        starting: "Active Retainer Clients",
        startingDesc: "Total active business clients on ongoing monthly retainers.",
        lost: "Retainer Clients Lost / Paused",
        lostDesc: "Client contracts canceled or paused this month.",
        arpu: "Average Monthly Client Retainer",
        arpuDesc: "Average monthly fee paid per active client.",
        ltv: "Client Lifetime Value (Total Contract Value)",
        ltvDesc: "Leave blank to auto-calculate from retainer length (Retainer × Lifespan)."
      }
    },
    {
      id: "apps",
      name: "Mobile App / Consumer Membership",
      shortLabel: "Consumer App",
      isRecurring: true,
      starting: 5000,
      lost: 320,
      arpu: 15,
      ltv: 180,
      estCac: 35,
      healthyMax: 4.5,
      warningMax: 8.0,
      typicalRange: "5.0% – 8.0% / mo",
      benchmarkDesc: "Consumer apps face aggressive 30-day drop-offs; push notifications & onboarding are critical.",
      retentionFocus: "Day 1-7 in-app engagement & win-back push flows",
      fieldLabels: {
        starting: "Active Paid Subscribers",
        startingDesc: "Total active paying members or premium app subscribers.",
        lost: "Paid Subscriptions Canceled",
        lostDesc: "Paying users who canceled or failed payment renewal this month.",
        arpu: "Monthly Spend per Paying User",
        arpuDesc: "Average monthly subscription or in-app spend per subscriber.",
        ltv: "Subscriber Lifetime Value (LTV)",
        ltvDesc: "Leave blank to auto-calculate from subscription lifespan."
      }
    },
    {
      id: "custom",
      name: "Custom / Other Business Model",
      shortLabel: "Custom",
      isRecurring: true,
      starting: 500,
      lost: 25,
      arpu: 100,
      ltv: 1500,
      estCac: 150,
      healthyMax: 3.5,
      warningMax: 6.0,
      typicalRange: "3.0% – 6.0% / mo",
      benchmarkDesc: "Custom business model metrics.",
      retentionFocus: "Lifecycle marketing & customer feedback loops",
      fieldLabels: {
        starting: "Active Customers / Accounts",
        startingDesc: "Total active customers at the start of the measurement period.",
        lost: "Lost Customers per Month",
        lostDesc: "Customers who stopped buying or canceled their account.",
        arpu: "Average Spend / Order Value",
        arpuDesc: "Average revenue generated per customer per transaction/month.",
        ltv: "Customer Lifetime Value (LTV)",
        ltvDesc: "Leave blank to auto-calculate lifespan from churn rate."
      }
    },
  ];

  let currentIndustry = INDUSTRIES[0];
  let targetReduction = 1.5;

  const money = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Math.max(0, n || 0));

  const moneyPrecise = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.max(0, n || 0));

  const num = (n) =>
    new Intl.NumberFormat("en-US").format(Math.round(Math.max(0, n || 0)));

  function showToast(title, message) {
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toast-container";
      toastContainer.className = "fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4";
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    toast.className = "pointer-events-auto flex items-start gap-3 rounded-2xl border border-opportunity/40 bg-card p-4 shadow-2xl text-foreground transition-all transform duration-300 translate-y-2 opacity-0";
    toast.innerHTML = `
      <div class="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-opportunity/15 text-opportunity">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-display text-sm font-bold text-navy">${title}</p>
        <p class="mt-0.5 text-xs text-muted-foreground leading-relaxed">${message || ""}</p>
      </div>
      <button type="button" class="text-muted-foreground hover:text-foreground text-sm cursor-pointer p-1" aria-label="Close">✕</button>
    `;

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-2", "opacity-0");
      toast.classList.add("translate-y-0", "opacity-100");
    });

    const removeToast = () => {
      toast.classList.remove("translate-y-0", "opacity-100");
      toast.classList.add("translate-y-2", "opacity-0");
      setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector("button")?.addEventListener("click", removeToast);
    setTimeout(removeToast, 5000);
  }

  function updateUrlParams(starting, lost, arpu, ltv) {
    try {
      const params = new URLSearchParams();
      params.set("industry", currentIndustry.id);
      params.set("starting", starting);
      params.set("lost", lost);
      params.set("arpu", arpu);
      if (ltv > 0) params.set("ltv", ltv);
      params.set("reduction", targetReduction.toFixed(1));

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, "", newUrl);
    } catch {
      // Ignore if history API restricted
    }
  }

  function recalculate() {
    const startingInput = document.getElementById("starting");
    const lostInput = document.getElementById("lost");
    const arpuInput = document.getElementById("arpu");
    const ltvInput = document.getElementById("ltv");

    const starting = Math.max(0, parseFloat(startingInput.value) || 0);
    const lost = Math.max(0, parseFloat(lostInput.value) || 0);
    const arpu = Math.max(0, parseFloat(arpuInput.value) || 0);
    const ltv = Math.max(0, parseFloat(ltvInput.value) || 0);

    const churn = starting > 0 ? (lost / starting) * 100 : 0;
    const annualLost = lost * 12;
    const annualRisk = lost * arpu * 12;
    const estCac = currentIndustry.estCac || 150;
    const annualAdSpend = annualLost * estCac;
    const retentionCost = annualAdSpend * 0.2;

    const maxReduction = Math.max(1, Math.min(10, Math.floor(churn * 10) / 10));
    const slider = document.getElementById("target-reduction");
    if (slider) {
      slider.max = maxReduction;
      if (parseFloat(slider.value) > maxReduction) {
        slider.value = maxReduction;
        targetReduction = maxReduction;
      }
      const percent = ((targetReduction - 0.1) / (maxReduction - 0.1 || 1)) * 100;
      slider.style.setProperty("--fill", `${Math.max(0, Math.min(100, percent))}%`);
    }

    const currentTargetChurn = Math.max(0, churn - targetReduction);
    const savedPerMonth =
      currentTargetChurn === 0
        ? lost
        : Math.min(lost, Math.max(0, starting * (targetReduction / 100)));
    const annualProtected =
      currentTargetChurn === 0 ? annualRisk : savedPerMonth * arpu * 12;
    const adSpendSaved = savedPerMonth * 12 * estCac;

    // Status and Gauge
    let statusText = "Healthy Retention";
    let bgTone = "bg-opportunity/10 border-opportunity/30 text-opportunity";
    let badgeColor = "var(--color-opportunity)";
    let msgText = `Your churn rate is within top-quartile standards for ${currentIndustry.shortLabel}. Retaining these accounts allows your advertising spend to compound effectively.`;

    if (churn > currentIndustry.warningMax) {
      statusText = "Critical Leaking Bucket";
      bgTone = "bg-risk/10 border-risk/30 text-risk";
      badgeColor = "var(--color-risk)";
      msgText = `High churn is eroding your ${currentIndustry.shortLabel} customer base faster than paid advertising can sustainably replenish it.`;
    } else if (churn > currentIndustry.healthyMax) {
      statusText = "Needs Attention";
      bgTone = "bg-warning/10 border-warning/30 text-warning";
      badgeColor = "var(--color-warning)";
      msgText = `Churn is creeping above optimal thresholds for ${currentIndustry.shortLabel}. You are likely losing profit margin on newly acquired customers.`;
    }

    // Metric Cards
    const cardChurn = document.getElementById("card-churn");
    if (cardChurn) cardChurn.textContent = `${churn.toFixed(1)}%`;
    const cardChurnSub = document.getElementById("card-churn-sub");
    if (cardChurnSub) cardChurnSub.textContent = `${num(lost)} of ${num(starting)} buyers / mo`;

    const cardLoss = document.getElementById("card-loss");
    if (cardLoss) cardLoss.textContent = num(annualLost);
    const cardLossSub = document.getElementById("card-loss-sub");
    if (cardLossSub) cardLossSub.textContent = `${num(lost)} buyers lost / month`;

    const cardRisk = document.getElementById("card-risk");
    if (cardRisk) cardRisk.textContent = money(annualRisk);

    // Niche-Aware LTV & Lifetime Calculation
    let computedLtv = 0;
    let lifetimeMonths = 1;
    let isSinglePurchase = false;

    if (currentIndustry.id === "ecom") {
      if (ltv > 0) {
        computedLtv = ltv;
        isSinglePurchase = computedLtv <= arpu * 1.15;
        lifetimeMonths = arpu > 0 ? Math.max(1, Math.round(computedLtv / arpu)) : 1;
      } else {
        // E-Commerce with blank LTV defaults strictly to 1 Order (AOV) to prevent false SaaS compounding
        computedLtv = arpu;
        isSinglePurchase = true;
        lifetimeMonths = 1;
      }
    } else {
      // Recurring Subscription Models (SaaS, Agency, Apps, Custom)
      if (ltv > 0) {
        computedLtv = ltv;
        lifetimeMonths = arpu > 0 ? Math.max(1, Math.round(computedLtv / arpu)) : (churn > 0 ? 100 / churn : 36);
        isSinglePurchase = computedLtv <= arpu * 1.15;
      } else {
        lifetimeMonths = churn > 0 ? Math.min(120, Math.max(1, 100 / churn)) : 36;
        computedLtv = arpu * lifetimeMonths;
        isSinglePurchase = false;
      }
    }

    const targetCpaCeiling = computedLtv / 3;
    const firstOrderTargetCpa = arpu / 3;
    const breakevenCpaCeiling = computedLtv;

    // Scalability Score
    let scaleScore = Math.round(100 - (churn / currentIndustry.healthyMax) * 35);
    if (isSinglePurchase && scaleScore > 65) scaleScore = 65;
    scaleScore = Math.max(15, Math.min(98, scaleScore));

    let scaleBadgeText = "🟢 Ready to Scale";
    let scaleBadgeClass = "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border bg-opportunity/10 border-opportunity/30 text-opportunity";
    let scaleBarColor = "var(--color-opportunity)";
    let scaleDescText = `Your churn is low and retention is healthy. Every $1 invested in Google & Meta Ads compounds with high customer lifetime value.`;
    let scaleActionText = "Scale Google & Meta Ads";

    if (isSinglePurchase) {
      scaleBadgeText = "🟡 Scale via Remarketing";
      scaleBadgeClass = "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border bg-warning/10 border-warning/30 text-warning";
      scaleBarColor = "var(--color-warning)";
      scaleDescText = "Single-order store model detected. Prioritize pre-purchase remarketing (cart abandoners at $15–$25 CPA) to profit on Day 1, and post-purchase email/SMS to turn 1-time buyers into repeat orders.";
      scaleActionText = "Pair Cold Ads with Remarketing";
    } else if (churn > currentIndustry.warningMax) {
      scaleBadgeText = "🔴 Fix Churn First";
      scaleBadgeClass = "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border bg-risk/10 border-risk/30 text-risk";
      scaleBarColor = "var(--color-risk)";
      scaleDescText = "High churn will erode ad margins rapidly. Prioritize remarketing and customer retention before scaling cold ad budgets.";
      scaleActionText = "Focus on Retention & Search Ads";
    } else if (churn > currentIndustry.healthyMax) {
      scaleBadgeText = "🟡 Scale with Remarketing";
      scaleBadgeClass = "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border bg-warning/10 border-warning/30 text-warning";
      scaleBarColor = "var(--color-warning)";
      scaleDescText = "Paid ads will generate sales, but early drop-offs weaken ROAS. Implement precision Meta remarketing alongside new ad spend.";
      scaleActionText = "Pair Paid Ads with Remarketing";
    }

    const scaleScoreEl = document.getElementById("scale-score");
    if (scaleScoreEl) scaleScoreEl.textContent = `${scaleScore}/100`;

    const scaleBadgeEl = document.getElementById("scale-badge");
    if (scaleBadgeEl) {
      scaleBadgeEl.textContent = scaleBadgeText;
      scaleBadgeEl.className = scaleBadgeClass;
    }

    const scaleBarEl = document.getElementById("scale-bar");
    if (scaleBarEl) {
      scaleBarEl.style.width = `${scaleScore}%`;
      scaleBarEl.style.backgroundColor = scaleBarColor;
    }

    const scaleDescEl = document.getElementById("scale-desc");
    if (scaleDescEl) scaleDescEl.textContent = scaleDescText;

    const scaleActionEl = document.getElementById("scale-action");
    if (scaleActionEl) scaleActionEl.textContent = scaleActionText;

    // Max Allowable CAC Ceiling - Niche Dynamic Customization
    const cacTitleEl = document.getElementById("cac-card-title");
    if (cacTitleEl) {
      cacTitleEl.textContent = isSinglePurchase
        ? "Max Ad Spend per 1st Order (Day 1 Profit)"
        : "Max Ad Spend per Customer (LTV Target)";
    }

    const cacCardBadgeEl = document.getElementById("cac-card-badge");
    if (cacCardBadgeEl) {
      cacCardBadgeEl.textContent = isSinglePurchase
        ? "Target: 33% Ad Cost (3x Day 1 ROI)"
        : "Target: 3x Ad ROI (30%+ Margin)";
    }

    const cacValEl = document.getElementById("cac-ceiling-val");
    if (cacValEl) cacValEl.textContent = isSinglePurchase ? moneyPrecise(targetCpaCeiling) : money(targetCpaCeiling);

    const cacCeilingSub = document.getElementById("cac-ceiling-sub");
    if (cacCeilingSub) {
      cacCeilingSub.textContent = isSinglePurchase
        ? "Max Ad Spend (3x ROI on 1st Order)"
        : "Max Ad Spend (3x ROI Target)";
    }

    const cacFirstOrderEl = document.getElementById("cac-first-order-val");
    if (cacFirstOrderEl) cacFirstOrderEl.textContent = moneyPrecise(firstOrderTargetCpa);

    const cacMonthsEl = document.getElementById("cac-lifetime-months");
    if (cacMonthsEl) cacMonthsEl.textContent = `${Math.round(lifetimeMonths)} months`;

    const cacLtvEl = document.getElementById("cac-ltv-val");
    if (cacLtvEl) cacLtvEl.textContent = money(computedLtv);

    const cacBreakevenEl = document.getElementById("cac-breakeven-val");
    if (cacBreakevenEl) cacBreakevenEl.textContent = money(breakevenCpaCeiling);

    const cacRow1Label = document.getElementById("cac-row1-label");
    if (cacRow1Label) {
      cacRow1Label.textContent = isSinglePurchase
        ? "Target Ad Spend (33% of Order):"
        : "Max Ad Cost for 1st Order Only:";
    }

    const cacDescEl = document.getElementById("cac-ceiling-desc");
    if (cacDescEl) {
      if (isSinglePurchase) {
        cacDescEl.innerHTML = `<strong>Single-Order Store Model:</strong> Because customers currently buy once (Average Order Value: <strong class="text-navy">${money(
          arpu
        )}</strong>), keep your Day 1 ad spend below <strong class="text-opportunity font-bold">${moneyPrecise(
          targetCpaCeiling
        )}</strong> to guarantee immediate profit. Use remarketing &amp; email flows to convert 10%+ into repeat buyers.`;
      } else if (currentIndustry.id === "agency") {
        cacDescEl.innerHTML = `Each client spends <strong class="text-navy">${money(
          computedLtv
        )}</strong> across an average <strong class="text-navy">${Math.round(
          lifetimeMonths
        )} months</strong> retainer. To maintain a healthy 30%+ profit margin, never spend more than <strong class="text-opportunity font-bold">${money(
          targetCpaCeiling
        )}</strong> on outbound/ads to acquire a client.`;
      } else {
        cacDescEl.innerHTML = `Each customer spends <strong class="text-navy">${money(
          computedLtv
        )}</strong> over <strong class="text-navy">${Math.round(
          lifetimeMonths
        )} months</strong>. To maintain a healthy 30%+ profit margin (the 3x Golden Ratio), never spend more than <strong class="text-opportunity font-bold">${money(
          targetCpaCeiling
        )}</strong> on ads to acquire them.`;
      }
    }

    // Retention Simulator
    const lblReduction = document.getElementById("lbl-target-reduction");
    if (lblReduction) {
      lblReduction.innerHTML = `Lower churn by: <span class="font-extrabold text-primary">-${targetReduction.toFixed(
        1
      )}%</span> (New Target: ${currentTargetChurn.toFixed(1)}%)`;
    }
    const lblCurrent = document.getElementById("lbl-current-churn");
    if (lblCurrent) lblCurrent.textContent = `Current Churn: ${churn.toFixed(1)}%`;

    const simTarget = document.getElementById("sim-target-churn");
    if (simTarget) simTarget.textContent = `${currentTargetChurn.toFixed(1)}%`;
    const simSavedMo = document.getElementById("sim-saved-mo");
    if (simSavedMo) simSavedMo.textContent = `+${num(savedPerMonth)}`;
    const simAnnualSaved = document.getElementById("sim-annual-saved");
    if (simAnnualSaved) simAnnualSaved.textContent = money(annualProtected);

    const simBanner = document.getElementById("sim-callout-text");
    if (simBanner) {
      simBanner.innerHTML = `Lowering churn from <strong>${churn.toFixed(1)}%</strong> to <strong>${currentTargetChurn.toFixed(
        1
      )}%</strong> saves <strong>+${num(savedPerMonth)} buyers/month</strong> and protects <strong class="text-opportunity font-bold">${money(
        annualProtected
      )}/year</strong> in revenue with zero extra ad spend.`;
    }

    // Gauge
    drawGauge(churn, statusText, badgeColor, msgText);

    // Matrix rows
    const matrixBody = document.getElementById("matrix-tbody");
    if (matrixBody) {
      const rows = [0.5, 1.0, 2.0, 3.0].filter((p) => p <= Math.max(0.5, churn));
      matrixBody.innerHTML = rows
        .map((pts) => {
          const newRate = Math.max(0, churn - pts);
          const savedMo =
            newRate === 0
              ? lost
              : Math.min(lost, Math.max(0, starting * (pts / 100)));
          const revSaved =
            newRate === 0 ? annualRisk : savedMo * arpu * 12;

          return `
            <tr class="hover:bg-muted/40 transition">
              <td class="py-3 px-3 font-bold text-primary font-display whitespace-nowrap">-${pts.toFixed(1)}% <span class="text-xs font-normal text-muted-foreground">(${newRate.toFixed(1)}%)</span></td>
              <td class="py-3 px-3 font-semibold text-navy whitespace-nowrap">+${num(savedMo)} / mo</td>
              <td class="py-3 px-3 font-extrabold text-opportunity font-display whitespace-nowrap">+${money(revSaved)}</td>
            </tr>
          `;
        })
        .join("");
    }

    // Dynamic Strategy Card Text
    const insightStrat = document.getElementById("insight-strategy-text");
    if (insightStrat) {
      if (isSinglePurchase) {
        insightStrat.textContent = `Your business has a single-order model. Paid advertising must be profitable on Day 1 (CPA < $${(
          arpu / 3
        ).toFixed(
          0
        )}). Pair cold Meta/Google campaigns with post-purchase email & SMS to unlock repeat purchases.`;
      } else if (churn <= currentIndustry.healthyMax) {
        insightStrat.textContent = `Retention is rock solid at ${churn.toFixed(
          1
        )}%. You can aggressively scale cold Meta and Google Search campaigns up to a target CAC of ${money(
          targetCpaCeiling
        )}.`;
      } else {
        insightStrat.textContent = `At ${churn.toFixed(
          1
        )}% churn, customer drop-offs are reducing ad ROI. Focus paid ads on high-intent Google Search and precision retargeting while optimizing onboarding.`;
      }
    }

    updateUrlParams(starting, lost, arpu, ltv);
  }

  function drawGauge(churn, statusText, badgeColor, msgText) {
    const maxScale = Math.max(12, currentIndustry.warningMax * 1.5);
    const fraction = Math.min(1, Math.max(0, churn / maxScale));

    const cx = 140,
      cy = 135,
      r = 95;
    const startAngle = Math.PI;
    const endAngle = 2 * Math.PI;
    const currentAngle = startAngle + fraction * (endAngle - startAngle);

    const nx = cx + (r - 15) * Math.cos(currentAngle);
    const ny = cy + (r - 15) * Math.sin(currentAngle);

    const circumference = Math.PI * r;

    const arc = document.getElementById("gauge-arc");
    if (arc) {
      arc.setAttribute("stroke", badgeColor);
      arc.setAttribute("stroke-dasharray", `${fraction * circumference} ${circumference}`);
    }
    const needle = document.getElementById("gauge-needle");
    if (needle) {
      needle.setAttribute("x2", nx);
      needle.setAttribute("y2", ny);
    }
    const gaugeText = document.getElementById("gauge-val-text");
    if (gaugeText) gaugeText.textContent = `${churn.toFixed(1)}%`;

    const gaugeBadge = document.getElementById("gauge-status-badge");
    if (gaugeBadge) {
      gaugeBadge.style.color = badgeColor;
      gaugeBadge.style.backgroundColor = `color-mix(in oklab, ${badgeColor} 12%, white)`;
      gaugeBadge.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg> ${statusText}`;
    }

    const gaugeDesc = document.getElementById("gauge-desc-text");
    if (gaugeDesc) gaugeDesc.textContent = msgText;

    const gaugeRanges = document.getElementById("gauge-ranges");
    if (gaugeRanges) {
      gaugeRanges.innerHTML = `
        <div class="flex items-center gap-2.5">
          <span class="h-3 w-3 shrink-0 rounded-full" style="background-color: var(--color-opportunity)" aria-hidden="true"></span>
          <dt class="font-semibold text-navy">Healthy:</dt>
          <dd class="text-muted-foreground font-medium">≤ ${currentIndustry.healthyMax}% monthly churn</dd>
        </div>
        <div class="flex items-center gap-2.5">
          <span class="h-3 w-3 shrink-0 rounded-full" style="background-color: var(--color-warning)" aria-hidden="true"></span>
          <dt class="font-semibold text-navy">Needs Attention:</dt>
          <dd class="text-muted-foreground font-medium">${currentIndustry.healthyMax}% – ${currentIndustry.warningMax}% churn</dd>
        </div>
        <div class="flex items-center gap-2.5">
          <span class="h-3 w-3 shrink-0 rounded-full" style="background-color: var(--color-risk)" aria-hidden="true"></span>
          <dt class="font-semibold text-navy">Critical Risk:</dt>
          <dd class="text-muted-foreground font-medium">&gt; ${currentIndustry.warningMax}% monthly churn</dd>
        </div>
      `;
    }
  }

  function setIndustry(id, overwriteValues = true) {
    const ind = INDUSTRIES.find((i) => i.id === id);
    if (!ind) return;
    currentIndustry = ind;

    // Update Dropdown & Preset buttons
    const dropdown = document.getElementById("businessType");
    if (dropdown) dropdown.value = ind.id;

    document.querySelectorAll(".preset-btn").forEach((btn) => {
      const match = btn.getAttribute("data-industry") === ind.id;
      btn.className = match
        ? "preset-btn rounded-full px-4 py-2 text-sm font-semibold transition-all bg-primary text-primary-foreground shadow-md shadow-primary/30"
        : "preset-btn rounded-full px-4 py-2 text-sm font-semibold transition-all bg-panel hover:bg-panel/80 text-foreground border border-border";
    });

    // Populate inputs if not custom and overwrite requested
    if (overwriteValues && ind.id !== "custom") {
      document.getElementById("starting").value = ind.starting;
      document.getElementById("lost").value = ind.lost;
      document.getElementById("arpu").value = ind.arpu;
      document.getElementById("ltv").value = ind.ltv;
    }

    // Dynamic Field Labels & Helper Descriptions
    if (ind.fieldLabels) {
      const lblStarting = document.getElementById("lbl-starting");
      const descStarting = document.getElementById("desc-starting");
      if (lblStarting) lblStarting.textContent = ind.fieldLabels.starting;
      if (descStarting) descStarting.textContent = ind.fieldLabels.startingDesc;

      const lblLost = document.getElementById("lbl-lost");
      const descLost = document.getElementById("desc-lost");
      if (lblLost) lblLost.textContent = ind.fieldLabels.lost;
      if (descLost) descLost.innerHTML = `${ind.fieldLabels.lostDesc} <span class="text-primary font-medium">(Annual tracker? Divide annual losses by 12)</span>`;

      const lblArpu = document.getElementById("lbl-arpu");
      const descArpu = document.getElementById("desc-arpu");
      if (lblArpu) lblArpu.textContent = ind.fieldLabels.arpu;
      if (descArpu) descArpu.textContent = ind.fieldLabels.arpuDesc;

      const lblLtv = document.getElementById("lbl-ltv");
      const descLtv = document.getElementById("desc-ltv");
      if (lblLtv) lblLtv.innerHTML = `${ind.fieldLabels.ltv} <span class="text-xs font-normal text-muted-foreground">(Optional)</span>`;
      if (descLtv) descLtv.textContent = ind.fieldLabels.ltvDesc;
    }

    // Benchmark card
    const bTitle = document.getElementById("benchmark-label");
    if (bTitle) bTitle.textContent = `${ind.shortLabel} Benchmark:`;
    const bRange = document.getElementById("benchmark-range");
    if (bRange) bRange.textContent = ind.typicalRange;
    const bDesc = document.getElementById("benchmark-desc");
    if (bDesc) bDesc.textContent = ind.benchmarkDesc;
    const bFocus = document.getElementById("benchmark-focus");
    if (bFocus) bFocus.textContent = ind.retentionFocus;

    recalculate();
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Inputs listener
    ["starting", "lost", "arpu", "ltv"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", recalculate);
    });

    // Slider listener
    const slider = document.getElementById("target-reduction");
    if (slider) {
      slider.addEventListener("input", (e) => {
        targetReduction = parseFloat(e.target.value) || 1.5;
        recalculate();
      });
    }

    // Business Type Dropdown
    const dropdown = document.getElementById("businessType");
    if (dropdown) {
      dropdown.addEventListener("change", (e) => setIndustry(e.target.value));
    }

    // Preset Buttons
    document.querySelectorAll(".preset-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const indId = btn.getAttribute("data-industry");
        if (indId) setIndustry(indId);
      });
    });

    // Reset button
    const resetBtn = document.getElementById("btn-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        setIndustry("saas");
        targetReduction = 1.5;
        recalculate();
        showToast("Reset completed", "Loaded default SaaS benchmarks.");
      });
    }

    // 3-Step Guide Toggle
    const guideBtn = document.getElementById("btn-toggle-guide");
    const guideBanner = document.getElementById("guide-banner");
    const guideDismiss = document.getElementById("btn-dismiss-guide");
    if (guideBtn && guideBanner) {
      guideBtn.addEventListener("click", () => {
        const isHidden = guideBanner.classList.contains("hidden");
        if (isHidden) {
          guideBanner.classList.remove("hidden");
          guideBtn.innerHTML = `<span>Hide Guide</span>`;
        } else {
          guideBanner.classList.add("hidden");
          guideBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-opportunity" aria-hidden="true"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path><path d="M20 2v4"></path><path d="M22 4h-4"></path><circle cx="4" cy="20" r="2"></circle></svg> <span>⚡ 3-Step Guide</span>`;
        }
      });
    }
    if (guideDismiss && guideBanner && guideBtn) {
      guideDismiss.addEventListener("click", () => {
        guideBanner.classList.add("hidden");
        guideBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-opportunity" aria-hidden="true"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path><path d="M20 2v4"></path><path d="M22 4h-4"></path><circle cx="4" cy="20" r="2"></circle></svg> <span>⚡ 3-Step Guide</span>`;
      });
    }

    // Share Button - Smart Executive Brief Formatter
    const shareBtn = document.getElementById("btn-share");
    if (shareBtn) {
      shareBtn.addEventListener("click", async () => {
        const starting = document.getElementById("starting")?.value || "1000";
        const lost = document.getElementById("lost")?.value || "45";
        const arpu = document.getElementById("arpu")?.value || "120";
        const churn = ((parseFloat(lost) / (parseFloat(starting) || 1)) * 100).toFixed(1);
        const annualLoss = money(parseFloat(lost) * parseFloat(arpu) * 12);

        const shareText = `📊 SEMTITANS Customer Churn & Retention Analysis
• Business Model: ${currentIndustry.name}
• Monthly Churn Rate: ${churn}% (${lost}/${starting} accounts)
• Annual Revenue at Risk: ${annualLoss}
• View & simulate this model live:
${window.location.href}`;

        try {
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(shareText);
            showToast("Summary & Link Copied!", "Copied executive brief + direct link to clipboard.");
          } else {
            showToast("Share Tool", window.location.href);
          }
        } catch {
          showToast("Share Tool", window.location.href);
        }
      });
    }

    // FAQ Accordion
    document.querySelectorAll(".faq-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const content = btn.nextElementSibling;
        const icon = btn.querySelector(".faq-icon");
        const isHidden = content.classList.contains("hidden");

        document.querySelectorAll(".faq-content").forEach((el) => el.classList.add("hidden"));
        document.querySelectorAll(".faq-icon").forEach((el) => (el.style.transform = "rotate(0deg)"));

        if (isHidden) {
          content.classList.remove("hidden");
          if (icon) icon.style.transform = "rotate(180deg)";
        }
      });
    });

    // WPForms Submission Form & Inline Feedback State
    const leadForm = document.getElementById("lead-form");
    const successCard = document.getElementById("lead-success-card");
    const successName = document.getElementById("lead-success-name");
    const successCompany = document.getElementById("lead-success-company");
    const successEmail = document.getElementById("lead-success-email");

    if (leadForm) {
      leadForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById("lead-submit-btn");
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Submitting Review Request...";
        }

        const name = document.getElementById("lead-name")?.value || "Valued Prospect";
        const email = document.getElementById("lead-email")?.value || "";
        const company = document.getElementById("lead-company")?.value || "Your Company";
        const spend = document.getElementById("lead-spend")?.value || "$10,000 – $50,000 / month";
        const isNewsletter = document.getElementById("lead-newsletter")?.checked ? "Yes" : "No";
        const type = currentIndustry.name;

        const starting = document.getElementById("starting")?.value || "1000";
        const lost = document.getElementById("lost")?.value || "45";
        const arpu = document.getElementById("arpu")?.value || "120";

        const churn = (parseFloat(lost) / (parseFloat(starting) || 1)) * 100;
        const annualLoss = parseFloat(lost) * parseFloat(arpu) * 12;

        const summary = `Customer Churn Calculator Lead
Industry: ${type}
Starting Accounts: ${starting}
Lost/Month: ${lost}
Monthly Churn: ${churn.toFixed(1)}%
ARPU: $${arpu}
Annual Revenue Drag: $${Math.round(annualLoss).toLocaleString()}
Newsletter Subscriber: ${isNewsletter}
Model URL: ${window.location.href}`;

        const payload = new URLSearchParams();
        payload.append("action", "wpforms_submit");
        payload.append("wpforms[id]", "32856");
        payload.append("wpforms[fields][0]", name);
        payload.append("wpforms[fields][1]", email);
        payload.append("wpforms[fields][2]", company);
        payload.append("wpforms[fields][3]", spend);
        payload.append("wpforms[fields][4]", "Both");
        payload.append("wpforms[fields][5]", summary);

        try {
          await fetch("https://vold.semtitans.com/wp-admin/admin-ajax.php", {
            method: "POST",
            body: payload,
            headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
          });
        } catch (err) {
          console.warn("WPForms fetch notice:", err);
        }

        // Show Inline Success Card
        if (successCard && leadForm) {
          leadForm.classList.add("hidden");
          successCard.classList.remove("hidden");

          if (successName) successName.textContent = name;
          if (successCompany) successCompany.textContent = company;
          if (successEmail) successEmail.textContent = email;

          document.getElementById("lead-form-wrapper")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        // Trigger Floating Toast
        showToast(
          "✓ Inquiry Successfully Received!",
          `Thank you, ${name}. A SEMTITANS strategist will email your review to ${email} shortly.`
        );

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg> Get My Free Ad &amp; Retention Audit ➔`;
        }
      });
    }

    // Reset Form Handler (Submit Another Inquiry)
    const resetFormBtn = document.getElementById("lead-reset-btn");
    if (resetFormBtn) {
      resetFormBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const lf = document.getElementById("lead-form");
        const sc = document.getElementById("lead-success-card");
        const sb = document.getElementById("lead-submit-btn");
        if (lf) {
          lf.reset();
          lf.classList.remove("hidden");
        }
        if (sc) {
          sc.classList.add("hidden");
        }
        if (sb) {
          sb.disabled = false;
          sb.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg> Get My Free Ad &amp; Retention Audit ➔`;
        }
        document.getElementById("lead-form-wrapper")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }

    // URL Query Parameter Initializer
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlInd = urlParams.get("industry");
      const urlStarting = urlParams.get("starting");
      const urlLost = urlParams.get("lost");
      const urlArpu = urlParams.get("arpu");
      const urlLtv = urlParams.get("ltv");
      const urlRed = urlParams.get("reduction");

      if (urlInd && INDUSTRIES.some((i) => i.id === urlInd)) {
        setIndustry(urlInd, false);
      } else {
        setIndustry("saas", false);
      }

      if (urlStarting) document.getElementById("starting").value = urlStarting;
      if (urlLost) document.getElementById("lost").value = urlLost;
      if (urlArpu) document.getElementById("arpu").value = urlArpu;
      if (urlLtv) document.getElementById("ltv").value = urlLtv;
      if (urlRed) targetReduction = parseFloat(urlRed) || 1.5;

      recalculate();
    } catch {
      setIndustry("saas", true);
    }
  });
})();
