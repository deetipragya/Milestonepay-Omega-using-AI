// Initial Application State (from project verification dataset)
const initialData = {
    project: {
        name: "E-commerce Website Redesign",
        baseBudget: 100000,
        contingency: 10000,
        escrow: 60000,
        released: 40000
    },
    requirements: [
        {
            id: "REQ-01",
            title: "User Auth & JWT Session",
            task: "PR #102 - Auth Engine",
            status: "Passed",
            evidence: "git commit 8f3c21a (Verified)"
        },
        {
            id: "REQ-02",
            title: "Product Catalog & Filters",
            task: "PR #105 - Catalog UI",
            status: "Passed",
            evidence: "git commit 4b9e11f (Verified)"
        },
        {
            id: "REQ-03",
            title: "Secure Checkout & Payment Gateway",
            task: "PR #112 - Gateway Integration",
            status: "Failed",
            evidence: "test_checkout_timeout.log (FAILED)"
        },
        {
            id: "REQ-04",
            title: "Order History & Invoicing",
            task: "PR #118 - Order Ledger",
            status: "Unverified",
            evidence: "NOT VERIFIED (Missing proof)"
        }
    ],
    tests: [
        {
            id: "TST-01",
            name: "JWT Token Generation & Expiry",
            category: "Unit Test",
            status: "Passed",
            time: "2026-03-30 10:14",
            logs: "Assertion ok: token expires in 3600s\nPayload signature valid\nKey rotation interval: 86400s\nResult: 1 passed, 0 failed"
        },
        {
            id: "TST-02",
            name: "Catalog Search & Facet Filters",
            category: "Integration Test",
            status: "Passed",
            time: "2026-03-30 11:20",
            logs: "Fetched 45 items in 84ms\nElasticsearch latency: 12ms\nAggregations: categories, price_range, ratings\nResult: 1 passed, 0 failed"
        },
        {
            id: "TST-03",
            name: "Checkout Payment Gateway Timeout",
            category: "Regression Test",
            status: "Failed",
            time: "2026-03-30 14:05",
            logs: "CRITICAL: Error 504 Gateway Timeout on Stripe webhook handshake.\nPOST /api/v1/payments/webhook -> timeout after 5000ms.\nRetry attempt 1 failed.\nResult: 0 passed, 1 failed"
        }
    ],
    scopeChanges: [
        {
            id: "CR-01",
            title: "Multi-currency Support",
            cost: 12000,
            timeline: "3 Days",
            status: "Approved",
            desc: "Added currency switcher for USD/EUR with real-time ECB exchange rate feed."
        },
        {
            id: "CR-02",
            title: "Express Apple Pay Integration",
            cost: 6400,
            timeline: "2 Days",
            status: "Pending",
            desc: "One-click Apple Pay checkout button on cart page and product detail modal."
        }
    ],
    milestones: [
        {
            id: "M1",
            title: "Milestone 1: Setup, Auth & Catalog",
            amount: 40000,
            status: "Released",
            evidenceUploaded: true,
            humanApproved: true,
            evidenceNote: "All auth and catalog test suites passed cryptographic verification.",
            reviewer: "Sarah Jenkins (Lead Client Reviewer)"
        },
        {
            id: "M2",
            title: "Milestone 2: Checkout, Payment Gateway & QA",
            amount: 50000,
            status: "Blocked",
            evidenceUploaded: false,
            humanApproved: false,
            evidenceNote: "BLOCKED: Checkout payment gateway timeout test failed. Missing test verification for REQ-04.",
            reviewer: "Sarah Jenkins (Lead Client Reviewer)"
        },
        {
            id: "M3",
            title: "Milestone 3: Final Deployment & Handover",
            amount: 10000,
            status: "Locked",
            evidenceUploaded: false,
            humanApproved: false,
            evidenceNote: "Awaiting Milestone 2 clearance and staging penetration tests.",
            reviewer: "Sarah Jenkins (Lead Client Reviewer)"
        }
    ],
    auditLogs: [
        {
            time: "14:05",
            type: "error",
            text: "Automated test TST-03 failed: Gateway Timeout."
        },
        {
            time: "12:30",
            type: "info",
            text: "New scope change proposal CR-02 submitted (+₹6,400)."
        },
        {
            time: "10:15",
            type: "success",
            text: "Milestone 1 payment of ₹40,000 successfully released from escrow."
        }
    ]
};

// Deep clone to allow in-memory mutations
let appState = JSON.parse(JSON.stringify(initialData));

// Utility: Currency Formatter
const formatCurrency = (val) => {
    return "₹" + Number(val).toLocaleString("en-IN");
};

// Status Badge Helper
function getStatusBadge(status) {
    const s = status.toLowerCase();
    if (s === "passed" || s === "approved" || s === "released") {
        return `<span class="badge badge-success"><i class="fa-solid fa-check"></i> ${status}</span>`;
    } else if (s === "failed" || s === "blocked") {
        return `<span class="badge badge-danger"><i class="fa-solid fa-triangle-exclamation"></i> ${status}</span>`;
    } else if (s === "pending" || s === "unverified") {
        return `<span class="badge badge-warning"><i class="fa-solid fa-clock"></i> ${status}</span>`;
    } else {
        return `<span class="badge badge-neutral">${status}</span>`;
    }
}

// Render Top KPIs and Header Info
function renderKPIs() {
    const { project } = appState;
    const totalBudget = project.baseBudget + project.contingency;

    document.getElementById("kpi-total-budget").textContent = formatCurrency(totalBudget);
    document.getElementById("kpi-released").textContent = formatCurrency(project.released);
    document.getElementById("kpi-escrow").textContent = formatCurrency(project.escrow);

    const failedTests = appState.tests.filter(t => t.status === "Failed").length;
    const blockerEl = document.getElementById("kpi-blockers");
    const failedBadgeEl = document.getElementById("failed-test-count");

    if (failedTests > 0) {
        blockerEl.textContent = `${failedTests} Blocker${failedTests > 1 ? 's' : ''}`;
        blockerEl.className = "kpi-value highlight-red";
        failedBadgeEl.textContent = `${failedTests} Fail`;
        failedBadgeEl.className = "badge badge-danger";
    } else {
        blockerEl.textContent = "0 Blockers";
        blockerEl.className = "kpi-value highlight-green";
        failedBadgeEl.textContent = "All Passed";
        failedBadgeEl.className = "badge badge-success";
    }

    const hasBlockedMilestone = appState.milestones.some(m => m.status === "Blocked");
    const globalStatus = document.getElementById("global-status");
    if (hasBlockedMilestone) {
        globalStatus.innerHTML = `<span class="pulse-dot"></span> In Progress (M2 Blocked)`;
        globalStatus.className = "status-pill status-blocked";
    } else {
        globalStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> Clean Pipeline (Ready for Release)`;
        globalStatus.className = "status-pill status-passed";
    }
}

// Render Overview View
function renderOverview() {
    // Mini Audit List
    const miniAuditContainer = document.getElementById("mini-audit-list");
    miniAuditContainer.innerHTML = appState.auditLogs.slice(0, 3).map(log => `
        <div class="mini-audit-item">
            <div class="audit-icon ${log.type}">
                <i class="fa-solid ${log.type === 'error' ? 'fa-xmark' : (log.type === 'success' ? 'fa-check' : 'fa-info')}"></i>
            </div>
            <div class="mini-audit-content">
                <p>${log.text}</p>
            </div>
            <span class="mini-audit-time">${log.time}</span>
        </div>
    `).join("");

    // Quick Requirements Preview
    const reqPreview = document.getElementById("overview-req-preview");
    reqPreview.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Requirement</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${appState.requirements.map(req => `
                    <tr>
                        <td><strong>${req.id}</strong></td>
                        <td>${req.title}</td>
                        <td>${getStatusBadge(req.status)}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;

    // Quick Test Preview
    const testPreview = document.getElementById("overview-test-preview");
    testPreview.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Test ID</th>
                    <th>Name</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${appState.tests.map(test => `
                    <tr>
                        <td><strong>${test.id}</strong></td>
                        <td>${test.name}</td>
                        <td>${getStatusBadge(test.status)}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
}

// Render Milestones
function renderMilestones() {
    const container = document.getElementById("milestones-container");
    container.innerHTML = appState.milestones.map((m, idx) => {
        const borderClass = m.status === 'Released' ? 'status-released-border' : (m.status === 'Blocked' ? 'status-blocked-border' : 'status-locked-border');
        return `
            <div class="milestone-card ${borderClass}">
                <div class="milestone-header">
                    <div class="milestone-title-area">
                        <h3>${m.title}</h3>
                        <div class="milestone-meta">
                            <span>ID: <strong>${m.id}</strong></span>
                            <span>Reviewer: <strong>${m.reviewer}</strong></span>
                        </div>
                    </div>
                    <div>
                        <div class="milestone-amount">${formatCurrency(m.amount)}</div>
                        <div style="text-align: right; margin-top: 4px;">${getStatusBadge(m.status)}</div>
                    </div>
                </div>

                <div class="milestone-body">
                    <p>${m.evidenceNote}</p>
                </div>

                <div class="milestone-checks">
                    <div class="check-item ${m.evidenceUploaded ? 'verified' : 'pending'}">
                        <i class="fa-solid ${m.evidenceUploaded ? 'fa-circle-check' : 'fa-circle-notch'}"></i>
                        <span>Cryptographic Evidence Uploaded</span>
                    </div>
                    <div class="check-item ${m.humanApproved ? 'verified' : 'pending'}">
                        <i class="fa-solid ${m.humanApproved ? 'fa-circle-check' : 'fa-clock'}"></i>
                        <span>Client Verification Sign-off</span>
                    </div>
                </div>

                <div class="milestone-footer">
                    <span>Smart Contract Condition: All associated requirements & test suites must pass 100%.</span>
                    ${m.status === 'Blocked' ? `
                        <button class="btn btn-secondary btn-sm" onclick="showEvidenceModal('${m.id} Blocker Note', '${escapeHtml(m.evidenceNote)}')">
                            <i class="fa-solid fa-bug"></i> Inspect Blocker
                        </button>
                    ` : ''}
                    ${m.status === 'Ready' ? `
                        <button class="btn btn-primary btn-sm" onclick="releaseMilestone('${m.id}')">
                            <i class="fa-solid fa-money-bill-transfer"></i> Disburse Escrow Funds
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join("");
}

// Render Requirements Table
function renderRequirements(filter = "all", searchQuery = "") {
    const tbody = document.getElementById("requirements-table-body");
    let list = appState.requirements;

    if (filter !== "all") {
        list = list.filter(r => r.status.toLowerCase() === filter.toLowerCase());
    }

    if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        list = list.filter(r => 
            r.id.toLowerCase().includes(q) || 
            r.title.toLowerCase().includes(q) || 
            r.task.toLowerCase().includes(q) ||
            r.status.toLowerCase().includes(q)
        );
    }

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">No requirements match your filter.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(req => `
        <tr>
            <td><strong>${req.id}</strong></td>
            <td><strong>${req.title}</strong></td>
            <td><span class="mono-code">${req.task}</span></td>
            <td>${getStatusBadge(req.status)}</td>
            <td><span class="mono-code">${req.evidence}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="showEvidenceModal('Requirement ${req.id} Evidence', '${escapeHtml(req.evidence)}')">
                    <i class="fa-solid fa-eye"></i> View Proof
                </button>
            </td>
        </tr>
    `).join("");
}

// Render Tests Table
function renderTests(searchQuery = "") {
    const tbody = document.getElementById("tests-table-body");
    let list = appState.tests;

    if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        list = list.filter(t => 
            t.id.toLowerCase().includes(q) || 
            t.name.toLowerCase().includes(q) || 
            t.category.toLowerCase().includes(q)
        );
    }

    tbody.innerHTML = list.map(t => `
        <tr>
            <td><strong>${t.id}</strong></td>
            <td>${t.name}</td>
            <td><span class="badge badge-neutral">${t.category}</span></td>
            <td>${getStatusBadge(t.status)}</td>
            <td><span class="mono-code">${t.time}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="showLogsModal('${t.id}: ${escapeHtml(t.name)}', '${escapeHtml(t.logs)}')">
                    <i class="fa-solid fa-code"></i> View Raw Logs
                </button>
            </td>
        </tr>
    `).join("");
}

// Render Scope Changes
function renderScopeChanges() {
    const container = document.getElementById("scope-cards-container");
    container.innerHTML = appState.scopeChanges.map(sc => `
        <div class="scope-card">
            <div>
                <div class="scope-card-header">
                    <div>
                        <span class="badge badge-neutral" style="margin-bottom: 6px;">${sc.id}</span>
                        <h3>${sc.title}</h3>
                    </div>
                    <div>${getStatusBadge(sc.status)}</div>
                </div>
                <div class="scope-meta-grid">
                    <div class="scope-meta-item">
                        <span>Cost Impact</span>
                        <strong>+${formatCurrency(sc.cost)}</strong>
                    </div>
                    <div class="scope-meta-item">
                        <span>Schedule Delta</span>
                        <strong>${sc.timeline}</strong>
                    </div>
                </div>
                <p class="scope-desc">${sc.desc}</p>
            </div>
            
            <div class="scope-actions">
                ${sc.status === 'Pending' ? `
                    <button class="btn btn-primary btn-sm" onclick="approveScope('${sc.id}')">
                        <i class="fa-solid fa-check"></i> Approve & Fund
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="rejectScope('${sc.id}')">
                        <i class="fa-solid fa-xmark"></i> Reject
                    </button>
                ` : `
                    <span style="font-size: 0.8rem; color: var(--success); font-weight: 600;">
                        <i class="fa-solid fa-circle-check"></i> Approved & Added to Budget Ledger
                    </span>
                `}
            </div>
        </div>
    `).join("");
}

// Render Audit Logs
function renderAuditLogs() {
    const container = document.getElementById("full-audit-timeline");
    container.innerHTML = appState.auditLogs.map(log => `
        <div class="audit-entry">
            <div class="audit-marker ${log.type}"></div>
            <div style="flex-grow: 1;">
                <strong>${log.text}</strong>
            </div>
            <span class="mini-audit-time" style="font-size: 0.82rem;">${log.time}</span>
        </div>
    `).join("");
}

// Show Toast
function showToast(message) {
    const toast = document.getElementById("toast");
    const msg = document.getElementById("toast-message");
    msg.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3800);
}

// Modal Handlers
function showEvidenceModal(title, evidenceContent) {
    const modal = document.getElementById("detail-modal");
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-content").innerHTML = `
        <p><strong>Cryptographic Evidence Attestation:</strong></p>
        <div class="code-block">${evidenceContent}</div>
        <p style="margin-top: 14px; font-size: 0.8rem; color: var(--text-muted);">
            SHA256 signature verified against repository main branch git tree.
        </p>
    `;
    modal.classList.add("show");
}

function showLogsModal(title, logsContent) {
    const modal = document.getElementById("detail-modal");
    document.getElementById("modal-title").textContent = `CI/CD Execution Log: ${title}`;
    document.getElementById("modal-content").innerHTML = `
        <p><strong>Console Output from Test Runner:</strong></p>
        <div class="code-block">${logsContent}</div>
    `;
    modal.classList.add("show");
}

function closeModal() {
    document.getElementById("detail-modal").classList.remove("show");
}

// Escape HTML helper
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

// Actions & Simulations
function simulateFix() {
    // 1. Fix TST-03
    const t3 = appState.tests.find(t => t.id === "TST-03");
    if (t3) {
        t3.status = "Passed";
        t3.logs = "Assertion ok: Stripe webhook received 200 OK signature verified.\nRetry policy: Success on attempt 1.\nLatency: 142ms.\nResult: 1 passed, 0 failed";
        t3.time = "Just now";
    }

    // 2. Fix REQ-03 & REQ-04
    const r3 = appState.requirements.find(r => r.id === "REQ-03");
    if (r3) {
        r3.status = "Passed";
        r3.evidence = "git commit c92b83e (Verified: Webhook Handler Fixed)";
    }
    const r4 = appState.requirements.find(r => r.id === "REQ-04");
    if (r4) {
        r4.status = "Passed";
        r4.evidence = "git commit 7d11f02 (Verified: Ledger Schema Unit Tests)";
    }

    // 3. Unblock Milestone 2
    const m2 = appState.milestones.find(m => m.id === "M2");
    if (m2) {
        m2.status = "Ready";
        m2.evidenceUploaded = true;
        m2.humanApproved = true;
        m2.evidenceNote = "All checkout payment and order ledger test suites passed. Verification complete. Escrow release unlocked.";
    }

    // 4. Append to Audit Logs
    appState.auditLogs.unshift({
        time: "Just now",
        type: "success",
        text: "Automated test suite re-run PASSED: Stripe Webhook 200 OK. Milestone 2 unlocked."
    });

    renderAll();
    showToast("Stripe timeout resolved! Test suite passed and Milestone 2 escrow release unlocked.");
}

function releaseMilestone(milestoneId) {
    const m = appState.milestones.find(item => item.id === milestoneId);
    if (!m) return;

    m.status = "Released";
    appState.project.released += m.amount;
    appState.project.escrow -= m.amount;

    // Check next milestone
    const m3 = appState.milestones.find(item => item.id === "M3");
    if (m3 && m3.status === "Locked") {
        m3.status = "In Progress";
        m3.evidenceNote = "Deployment pipeline running. Verification pending staging clearance.";
    }

    appState.auditLogs.unshift({
        time: "Just now",
        type: "success",
        text: `Milestone 2 payment of ${formatCurrency(m.amount)} released to contractor.`
    });

    renderAll();
    showToast(`${m.title} funds of ${formatCurrency(m.amount)} successfully disbursed!`);
}

function approveScope(scopeId) {
    const sc = appState.scopeChanges.find(s => s.id === scopeId);
    if (!sc) return;

    sc.status = "Approved";
    appState.project.baseBudget += sc.cost;

    appState.auditLogs.unshift({
        time: "Just now",
        type: "info",
        text: `Scope change ${sc.id} (${sc.title}) approved. Contract increased by ${formatCurrency(sc.cost)}.`
    });

    renderAll();
    showToast(`Approved ${sc.id}: Added ${formatCurrency(sc.cost)} to active budget.`);
}

function rejectScope(scopeId) {
    const sc = appState.scopeChanges.find(s => s.id === scopeId);
    if (!sc) return;

    sc.status = "Rejected";

    appState.auditLogs.unshift({
        time: "Just now",
        type: "error",
        text: `Scope change proposal ${sc.id} was rejected by client.`
    });

    renderAll();
    showToast(`Scope change proposal ${sc.id} rejected.`);
}

function exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "escrow-assurance-ledger.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Downloaded updated ledger JSON file.");
}

// Master Render
function renderAll() {
    renderKPIs();
    renderOverview();
    renderMilestones();
    renderRequirements();
    renderTests();
    renderScopeChanges();
    renderAuditLogs();
}

// Tab Switching
function switchTab(tabId) {
    document.querySelectorAll(".nav-item").forEach(item => {
        if (item.getAttribute("data-tab") === tabId) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    document.querySelectorAll(".tab-pane").forEach(pane => {
        if (pane.id === `tab-${tabId}`) {
            pane.classList.add("active");
        } else {
            pane.classList.remove("active");
        }
    });
}

// Event Listeners Initialization
document.addEventListener("DOMContentLoaded", () => {
    renderAll();

    // Tab buttons
    document.querySelectorAll(".nav-item").forEach(btn => {
        btn.addEventListener("click", () => {
            const tabId = btn.getAttribute("data-tab");
            switchTab(tabId);
        });
    });

    // Simulate fix button
    document.getElementById("retest-btn").addEventListener("click", simulateFix);

    // Export button
    document.getElementById("export-json-btn").addEventListener("click", exportJSON);

    // Modal Close buttons
    document.getElementById("modal-close").addEventListener("click", closeModal);
    document.getElementById("modal-close-action").addEventListener("click", closeModal);
    document.getElementById("detail-modal").addEventListener("click", (e) => {
        if (e.target.id === "detail-modal") closeModal();
    });

    // Requirements search & filter
    const reqSearch = document.getElementById("req-search");
    let currentReqFilter = "all";

    reqSearch.addEventListener("input", (e) => {
        renderRequirements(currentReqFilter, e.target.value);
    });

    document.querySelectorAll(".filter-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            currentReqFilter = chip.getAttribute("data-filter");
            renderRequirements(currentReqFilter, reqSearch.value);
        });
    });

    // Test Search
    const testSearch = document.getElementById("test-search");
    testSearch.addEventListener("input", (e) => {
        renderTests(e.target.value);
    });
});
