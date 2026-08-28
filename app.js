/**
 * FORECOURT WORKS LTD – Digital Technical Service Work Order App
 * Progressive web form with auto-population, GPS, camera, signatures & PDF export
 */

(function () {
  'use strict';

  // ---------- State ----------
  const state = {
    currentStep: 0,
    totalSteps: 10,
    photos: [],          // {id, dataUrl, name}
    signatures: {},      // canvas id → dataUrl
    autoPopulated: false,
    pdfBlob: null,
    pdfFileName: ''
  };

  // Signature pads
  const sigPads = {};

  // ---------- Templates for auto-population ----------
  const TEMPLATES = {
    'Fuel Dispenser|Diagnosis & On-Site Corrective Repair + Calibration Verification': {
      hazards: [
        { hazard: 'Flammable fuel vapors / fire & explosion', risk: 'High', control: 'Continuous LEL monitoring; no ignition sources within 25 ft; fire extinguisher & spill kit staged; hot-work prohibited', verified: true },
        { hazard: 'Electrical energy (dispenser power)', risk: 'High', control: 'Lockout/Tagout of dispenser power supply; verified zero energy state before opening panels', verified: true },
        { hazard: 'Pressurized product lines', risk: 'Medium', control: 'Isolation of product supply where required; controlled depressurization; secondary containment monitored', verified: true },
        { hazard: 'Vehicle / public traffic on forecourt', risk: 'Medium', control: 'Work zone cones & barrier tape; high-visibility PPE; spotter during critical lifts', verified: true },
        { hazard: 'Manual handling / awkward postures', risk: 'Low-Med', control: 'Two-person lift for meter assembly; correct body mechanics; mechanical aids used where available', verified: true },
        { hazard: 'Slip / trip on wet or contaminated surfaces', risk: 'Medium', control: 'Immediate clean-up of any product; absorbent available; good housekeeping enforced', verified: true }
      ],
      safetyDeclaration: 'I confirm that the Job Hazard Analysis was completed, all identified controls were implemented, and the work area was verified safe before commencement of diagnostic and repair activities.',
      toolboxTime: '09:05',
      scopeSummary: 'The scope was limited to diagnosis of the reported volumetric over-issuance, identification of root cause, corrective action on the flowmetering system, post-repair calibration verification, and return of the dispenser to safe, accurate service. No additional work outside this scope was performed without client authorization.',
      scopeSteps: `1. Arrival briefing, site induction compliance, and completion of Job Hazard Analysis / Pre-Job Safety Checklist.
2. Isolation of electrical power and product supply to the dispenser under LOTO.
3. Visual and functional inspection of the diesel metering system, associated piping, filters, and electronic interfaces.
4. Quantitative verification of meter performance using approved volumetric proving / master meter methodology.
5. Diagnosis of root cause of the reported over-issuance.
6. Removal of the defective flowmeter assembly under controlled conditions.
7. Installation of new OEM-equivalent flowmeter, correct torque, seals, and orientation.
8. System reassembly, restoration of power and product, leak checks, and functional testing.
9. Post-repair calibration / accuracy verification to confirm performance within statutory and manufacturer tolerance.
10. Documentation of all findings, parts, test results, and recommendations; client handover.`,
      deliverables: `• Completed and signed Technical Service Work Order (this document)
• Photographic evidence of nameplate, as-found condition, removed component, installed component, and final condition
• Calibration / accuracy test results (before and after)
• Parts traceability records and warranty information
• Recommendations for ongoing reliability`,
      findingsArrival: 'The team arrived on site, reported to the Station Manager / Duty Supervisor, completed site induction requirements, and conducted a toolbox talk. The Job Hazard Analysis was completed and signed off. The dispenser was taken out of service, isolated under Lockout/Tagout, and a clear work zone was established.',
      findingsDiagnosis: 'Visual inspection revealed no external leakage at the meter or associated joints. The diesel filter was within service life and showed normal differential pressure. Electronic totalizer and pulser signals were present and coherent. A controlled volumetric accuracy test was performed using a certified prover / master meter method. Results confirmed the reported condition of volumetric over-issuance outside acceptable tolerance under Weights & Measures / metrology practice (typically ±0.25% to ±0.5% depending on jurisdiction and meter class).',
      findingsRootCause: 'Internal wear and loss of volumetric accuracy within the flowmeter measuring chamber was determined to be the primary cause. No evidence of unauthorized adjustment, electronic manipulation, or external interference was found. The meter had reached the end of its reliable service life for accurate fiscal measurement.',
      findingsAction: 'The existing flowmeter was carefully removed, tagged, and retained for client inspection if required. A new OEM-specification flowmeter was installed in accordance with manufacturer torque and orientation requirements. All sealing faces were cleaned and new seals fitted. The assembly was leak-tested under pressure. Electrical connections and pulser interface were verified. Power and product supply were restored under controlled conditions.',
      findingsVerification: 'After stabilization, a full series of accuracy tests was conducted across the normal operating flow range. The dispenser was confirmed to be operating within acceptable tolerance. Functional tests of the nozzle, interlock, emergency stop, and totalizer were satisfactory. The work area was restored to a clean and safe condition. The dispenser was formally returned to service after client representative acknowledgment.',
      qcIntro: 'All tests were performed using calibrated reference equipment traceable to national standards. Environmental conditions were within acceptable limits for metering work. Results are summarized below.',
      qcRows: [
        { test: 'Volumetric Accuracy – Diesel (mid flow)', asFound: '+0.60% over-issuance', asLeft: '+0.12% (within tolerance)', criterion: 'Typically ±0.25% to ±0.50%', result: 'PASS' },
        { test: 'Volumetric Accuracy – Diesel (low flow)', asFound: 'Consistent trend', asLeft: '+0.18%', criterion: 'Within applicable tolerance', result: 'PASS' },
        { test: 'Leak Test – Meter & Joints', asFound: 'No external leaks observed', asLeft: 'No leaks under pressure', criterion: 'Zero visible leakage', result: 'PASS' },
        { test: 'Pulser / Electronic Interface', asFound: 'Signal present & coherent', asLeft: 'Signal present & coherent', criterion: 'Stable, correct pulse count', result: 'PASS' },
        { test: 'Nozzle, Interlock & E-Stop Function', asFound: 'Functional', asLeft: 'Fully functional', criterion: 'Correct operation', result: 'PASS' },
        { test: 'Totalizer Continuity', asFound: 'Reading continuous', asLeft: 'Reading continuous & consistent', criterion: 'No loss of count', result: 'PASS' }
      ],
      qcConclusion: 'All critical quality control tests passed. The dispenser now meets the required accuracy and functional standards for safe return to commercial service. Calibration certificate / test record is retained in the job file and a copy is available to the client upon request.',
      parts: [
        { desc: 'Diesel Flowmeter Assembly (OEM-spec, compatible with Encore / equivalent platform) – complete with seals', qty: '1', status: 'New', vendor: 'Authorized Distributor', installDate: '', warrantyStart: '', warrantyEnd: '' },
        { desc: 'Meter seals / gasket kit (as required for installation)', qty: '1 set', status: 'New', vendor: 'Same as above', installDate: '', warrantyStart: '', warrantyEnd: '' }
      ],
      partsTrace: 'Removed flowmeter retained and tagged with Work Order number for client inspection or further analysis if required. New part serial number and batch details are recorded in the job file and on the photographic evidence pack. Warranty is subject to correct operation and exclusion of damage from misuse, contamination, or unauthorized adjustment.',
      recommendations: `1. Immediate: The dispenser has been returned to service within tolerance. Continue normal commercial operation.
2. Short-term (next 30–60 days): Monitor the newly installed meter for any drift or unusual noise/vibration. Report any anomaly immediately.
3. Preventive Maintenance: Include this dispenser in the next scheduled quarterly PM cycle. Particular attention should be paid to filter condition, pulser cleanliness, and verification of accuracy at least annually or as required by local Weights & Measures regulations.
4. Fleet-wide Opportunity: Consider a systematic accuracy audit of remaining diesel dispensers at this station and sister sites to identify any other meters approaching end-of-life accuracy limits. Proactive replacement prevents revenue loss from over-issuance and protects the client from under-delivery claims.
5. Record Keeping: This Work Order and associated calibration data should be retained in the site equipment history file for the life of the asset and for regulatory audit readiness.`,
      finalStatus: 'REPAIRED AND RETURNED TO SERVICE',
      finalStatusText: 'The diesel flowmeter has been successfully diagnosed, replaced, and verified. All quality control tests have been passed. The dispenser has been functionally tested, leak-checked, and is hereby declared REPAIRED AND RETURNED TO SERVICE in a safe, accurate, and commercially usable condition. The equipment is NOT locked out. It is released for normal customer fuelling operations under the supervision of the site operator.',
      techDeclaration: 'I, the undersigned Lead Technician, confirm that the work described herein was performed in accordance with the applicable Standard Operating Procedure, manufacturer guidelines, and all site safety requirements. All statements of fact are true and accurate to the best of my knowledge. The equipment has been left in a safe condition.',
      acceptanceText: `I, the undersigned authorized representative of the Client at this Station, acknowledge that:
• The work described in this Work Order has been explained to me.
• I have been given the opportunity to inspect the completed work and the photographic / test evidence.
• The dispenser has been returned to service in my presence (or with my knowledge).
• I accept the equipment back into operational control of the Station.
• Any outstanding recommendations have been noted for management attention.`
    }
  };

  // Generic fallback template
  const GENERIC = {
    hazards: [
      { hazard: 'Flammable fuel vapors / fire & explosion', risk: 'High', control: 'Continuous gas monitoring; ignition source control; fire extinguisher staged', verified: true },
      { hazard: 'Electrical energy', risk: 'High', control: 'LOTO applied and verified', verified: true },
      { hazard: 'Vehicle / public traffic', risk: 'Medium', control: 'Work zone barriers and high-visibility PPE', verified: true }
    ],
    safetyDeclaration: 'I confirm that the Job Hazard Analysis was completed and all controls were implemented before work commenced.',
    toolboxTime: '',
    scopeSummary: 'Scope limited to the work type selected and the equipment identified. All work performed under controlled conditions.',
    scopeSteps: '1. Site arrival, induction and toolbox talk.\n2. Isolation and LOTO where required.\n3. Diagnosis / inspection as applicable.\n4. Corrective or preventive actions.\n5. Testing and verification.\n6. Documentation and handover.',
    deliverables: '• Completed Work Order\n• Photos of work\n• Test / calibration results (if applicable)\n• Recommendations',
    findingsArrival: 'Team arrived, completed induction and toolbox talk. Work area established and equipment isolated as required.',
    findingsDiagnosis: 'Inspection and diagnosis performed as per applicable SOP.',
    findingsRootCause: 'Root cause determined from diagnostic findings.',
    findingsAction: 'Corrective / preventive actions completed.',
    findingsVerification: 'Functional and safety checks completed. Equipment returned to service or left in safe state as recorded.',
    qcIntro: 'Quality control checks performed with calibrated equipment where applicable.',
    qcRows: [
      { test: 'Visual / Functional Check', asFound: 'As found', asLeft: 'Satisfactory', criterion: 'Safe & functional', result: 'PASS' }
    ],
    qcConclusion: 'All required QC checks completed satisfactorily.',
    parts: [],
    partsTrace: 'Any removed components tagged and retained as required. New parts recorded with warranty information.',
    recommendations: '1. Continue normal operation.\n2. Include equipment in next scheduled PM cycle.\n3. Retain this Work Order in the site equipment history file.',
    finalStatus: 'REPAIRED AND RETURNED TO SERVICE',
    finalStatusText: 'Work completed. Equipment returned to service in a safe condition.',
    techDeclaration: 'I confirm the work was performed in accordance with applicable SOPs and safety requirements. The equipment has been left in a safe condition.',
    acceptanceText: `I acknowledge that:
• The work has been explained to me.
• I have had the opportunity to inspect the completed work.
• I accept the equipment back into operational control.
• Recommendations have been noted.`
  };

  // ---------- Helpers ----------
  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }

  function toast(msg, type = '') {
    const el = $('#toast');
    el.textContent = msg;
    el.className = 'toast show' + (type ? ' ' + type : '');
    setTimeout(() => el.classList.remove('show'), 3200);
  }

  function showOverlay(text) {
    $('#overlay-text').textContent = text || 'Please wait…';
    $('#overlay').classList.add('show');
  }
  function hideOverlay() {
    $('#overlay').classList.remove('show');
  }

  function generateWONumber() {
    const now = new Date();
    const y = now.getFullYear();
    const r = String(Math.floor(Math.random() * 9000) + 1000);
    return `WO-${y}-${r}`;
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function updateProgress() {
    const pct = ((state.currentStep + 1) / state.totalSteps) * 100;
    $('#progress-fill').style.width = pct + '%';
  }

  function showStep(n) {
    $$('.step-card').forEach(c => c.classList.remove('active'));
    const card = $(`#step-${n}`);
    if (card) card.classList.add('active');
    state.currentStep = n;
    updateProgress();
    $('#btn-prev').disabled = n === 0;
    $('#btn-next').style.display = n === 9 ? 'none' : 'inline-flex';
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- GPS ----------
  function getGPS() {
    const status = $('#gps-status');
    if (!navigator.geolocation) {
      status.textContent = 'Geolocation not supported on this device.';
      return;
    }
    status.textContent = 'Locating…';
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        status.textContent = `Coordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        // Attempt reverse geocode via free OpenStreetMap Nominatim (no key required)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.display_name) {
              $('#site-address').value = data.display_name;
              toast('Address filled from GPS', 'success');
            }
          }
        } catch (e) {
          $('#site-address').value = `Lat ${latitude.toFixed(5)}, Lon ${longitude.toFixed(5)} (reverse geocode unavailable)`;
          toast('Coordinates captured. Please refine address manually.');
        }
      },
      (err) => {
        status.textContent = 'Location access denied or unavailable.';
        toast('Could not get location. Enter address manually.', 'error');
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  // ---------- Auto-populate ----------
  function getTemplateKey() {
    const cat = $('#equip-category').value;
    const wt = $('#work-type').value;
    return `${cat}|${wt}`;
  }

  function getTemplate() {
    const key = getTemplateKey();
    return TEMPLATES[key] || GENERIC;
  }

  function fillHazards(list) {
    const container = $('#hazards-container');
    container.innerHTML = '';
    list.forEach((h, i) => {
      const div = document.createElement('div');
      div.className = 'form-group';
      div.style.border = '1px solid var(--border)';
      div.style.padding = '10px';
      div.style.borderRadius = '8px';
      div.style.marginBottom = '8px';
      div.innerHTML = `
        <div class="row">
          <div class="form-group" style="margin:0">
            <label>Hazard</label>
            <input type="text" class="haz-hazard auto-filled" value="${escapeAttr(h.hazard)}" />
          </div>
          <div class="form-group" style="margin:0">
            <label>Risk</label>
            <select class="haz-risk auto-filled">
              <option ${h.risk==='High'?'selected':''}>High</option>
              <option ${h.risk==='Medium'?'selected':''}>Medium</option>
              <option ${h.risk==='Low-Med'?'selected':''}>Low-Med</option>
              <option ${h.risk==='Low'?'selected':''}>Low</option>
            </select>
          </div>
        </div>
        <div class="form-group" style="margin-top:8px;margin-bottom:0">
          <label>Control / Mitigation</label>
          <textarea class="haz-control auto-filled" rows="2">${escapeHtml(h.control)}</textarea>
        </div>
        <label class="check-item" style="margin-top:6px">
          <input type="checkbox" class="haz-verified" ${h.verified ? 'checked' : ''}> Verified
        </label>
      `;
      container.appendChild(div);
    });
  }

  function fillQC(rows) {
    const container = $('#qc-table-container');
    let html = `<table class="data-table"><thead><tr>
      <th>Test Description</th><th>As-Found</th><th>As-Left</th><th>Criterion</th><th>Result</th>
    </tr></thead><tbody>`;
    rows.forEach(r => {
      html += `<tr>
        <td><input class="qc-test auto-filled" value="${escapeAttr(r.test)}" /></td>
        <td><input class="qc-found auto-filled" value="${escapeAttr(r.asFound)}" /></td>
        <td><input class="qc-left auto-filled" value="${escapeAttr(r.asLeft)}" /></td>
        <td><input class="qc-crit auto-filled" value="${escapeAttr(r.criterion)}" /></td>
        <td>
          <select class="qc-result auto-filled">
            <option ${r.result==='PASS'?'selected':''}>PASS</option>
            <option ${r.result==='FAIL'?'selected':''}>FAIL</option>
            <option ${r.result==='N/A'?'selected':''}>N/A</option>
          </select>
        </td>
      </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  }

  function fillParts(parts) {
    const container = $('#parts-container');
    container.innerHTML = '';
    const today = todayISO();
    const oneYear = new Date();
    oneYear.setFullYear(oneYear.getFullYear() + 1);
    const endDate = oneYear.toISOString().slice(0, 10);

    if (!parts.length) {
      container.innerHTML = '<p class="help">No parts auto-suggested. Add any parts used.</p>';
      return;
    }
    parts.forEach(p => {
      const div = document.createElement('div');
      div.style.border = '1px solid var(--border)';
      div.style.padding = '10px';
      div.style.borderRadius = '8px';
      div.style.marginBottom = '10px';
      div.innerHTML = `
        <div class="form-group"><label>Description</label>
          <input type="text" class="part-desc auto-filled" value="${escapeAttr(p.desc)}" /></div>
        <div class="row">
          <div class="form-group"><label>Qty</label>
            <input type="text" class="part-qty auto-filled" value="${escapeAttr(p.qty)}" /></div>
          <div class="form-group"><label>Status</label>
            <select class="part-status auto-filled">
              <option ${p.status==='New'?'selected':''}>New</option>
              <option ${p.status==='Reconditioned'?'selected':''}>Reconditioned</option>
              <option>Used</option>
            </select></div>
        </div>
        <div class="form-group"><label>Vendor / Source</label>
          <input type="text" class="part-vendor auto-filled" value="${escapeAttr(p.vendor)}" /></div>
        <div class="row">
          <div class="form-group"><label>Install Date</label>
            <input type="date" class="part-install auto-filled" value="${p.installDate || today}" /></div>
          <div class="form-group"><label>Warranty Start</label>
            <input type="date" class="part-wstart auto-filled" value="${p.warrantyStart || today}" /></div>
        </div>
        <div class="form-group"><label>Warranty End</label>
          <input type="date" class="part-wend auto-filled" value="${p.warrantyEnd || endDate}" /></div>
      `;
      container.appendChild(div);
    });
  }

  function escapeHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function escapeAttr(s) {
    return String(s || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function runAutoPopulate() {
    // Validate compulsory basics first
    const required = [
      ['client-name', 'Client name'],
      ['site-name', 'Site / Station'],
      ['site-address', 'Site address'],
      ['equip-id', 'Equipment ID'],
      ['equip-category', 'Equipment category'],
      ['equip-desc', 'Equipment description'],
      ['work-type', 'Work type'],
      ['reported-problem', 'Reported problem'],
      ['work-date', 'Date of work'],
      ['tech-lead', 'Lead Technician']
    ];
    for (const [id, label] of required) {
      const el = $(`#${id}`);
      if (!el || !el.value.trim()) {
        toast(`Please complete: ${label}`, 'error');
        el && el.focus();
        return false;
      }
    }

    // Generate WO number if empty
    {
      let num = $('#wo-number').value.trim();
      if (!num) {
        num = generateWONumber();
        $('#wo-number').value = num;
      }
      $('#wo-number-display').textContent = num;
    }
    $('#wo-date-display').textContent = $('#doc-date').value || todayISO();
    $('#wo-status-display').textContent = $('#wo-status').value;

    const t = getTemplate();
    const workDate = $('#work-date').value || todayISO();

    // Part B
    fillHazards(t.hazards);
    $('#toolbox-time').value = t.toolboxTime || '';
    $('#safety-declaration').value = t.safetyDeclaration;

    // Part C
    $('#scope-summary').value = t.scopeSummary;
    $('#scope-steps').value = t.scopeSteps;
    $('#deliverables').value = t.deliverables;

    // Part D – inject reported problem into diagnosis if present
    let diagnosis = t.findingsDiagnosis;
    const problem = $('#reported-problem').value;
    if (problem && diagnosis.indexOf(problem) === -1) {
      diagnosis = diagnosis.replace(
        'reported condition of volumetric over-issuance',
        `reported condition: "${problem}"`
      );
    }
    $('#findings-arrival').value = t.findingsArrival;
    $('#findings-diagnosis').value = diagnosis;
    $('#findings-rootcause').value = t.findingsRootCause;
    $('#findings-action').value = t.findingsAction;
    $('#findings-verification').value = t.findingsVerification;

    // Part E
    $('#qc-intro').value = t.qcIntro;
    fillQC(t.qcRows);
    $('#qc-conclusion').value = t.qcConclusion;

    // Part F
    fillParts(t.parts);
    $('#parts-traceability').value = t.partsTrace;

    // Part G
    $('#recommendations').value = t.recommendations;

    // Part H
    $('#final-status').value = t.finalStatus;
    $('#final-status-text').value = t.finalStatusText;
    $('#tech-declaration').value = t.techDeclaration;

    // Part I
    $('#acceptance-text').value = t.acceptanceText;
    $('#sig-tech-name').value = $('#tech-lead').value;
    $('#sig-tech-date').value = workDate;
    $('#sig-client-date').value = workDate;

    state.autoPopulated = true;
    toast('Technical sections auto-populated. Review each step and Confirm.', 'success');
    showStep(1);
    return true;
  }

  // ---------- Photos ----------
  function addPhotos(fileList) {
    Array.from(fileList).forEach(file => {
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const id = 'ph_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        state.photos.push({ id, dataUrl: e.target.result, name: file.name });
        renderPhotos();
      };
      reader.readAsDataURL(file);
    });
  }

  function renderPhotos() {
    const grid = $('#photo-grid');
    grid.innerHTML = '';
    state.photos.forEach(p => {
      const div = document.createElement('div');
      div.className = 'photo-thumb';
      if (p.dataUrl.startsWith('data:image')) {
        div.innerHTML = `<img src="${p.dataUrl}" alt="${escapeAttr(p.name)}" /><button class="remove" data-id="${p.id}">×</button>`;
      } else {
        div.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:0.7rem;padding:4px;text-align:center;">${escapeHtml(p.name)}</div><button class="remove" data-id="${p.id}">×</button>`;
      }
      grid.appendChild(div);
    });
    grid.querySelectorAll('.remove').forEach(btn => {
      btn.addEventListener('click', () => {
        state.photos = state.photos.filter(x => x.id !== btn.dataset.id);
        renderPhotos();
      });
    });
  }

  // ---------- Signatures ----------
  function initSignatures() {
    ['sig-tech', 'sig-assist', 'sig-client'].forEach(id => {
      const canvas = document.getElementById(id);
      if (!canvas) return;
      // Clear previous
      if (sigPads[id]) {
        try { sigPads[id].off(); } catch(e) {}
      }
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const w = canvas.offsetWidth || 300;
      const h = 150;
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d');
      ctx.scale(ratio, ratio);
      // White background for print
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      sigPads[id] = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255,255,255)',
        penColor: 'rgb(20,20,20)',
        minWidth: 1.2,
        maxWidth: 3.0
      });
    });
  }

  function clearSig(id) {
    if (sigPads[id]) sigPads[id].clear();
  }

  function getSigData(id) {
    if (!sigPads[id] || sigPads[id].isEmpty()) return null;
    try {
      const canvas = document.getElementById(id);
      if (!canvas) return sigPads[id].toDataURL('image/jpeg', 0.92);
      const tmp = document.createElement('canvas');
      tmp.width = canvas.width;
      tmp.height = canvas.height;
      const ctx = tmp.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, tmp.width, tmp.height);
      ctx.drawImage(canvas, 0, 0);
      return tmp.toDataURL('image/jpeg', 0.92);
    } catch (e) {
      try { return sigPads[id].toDataURL('image/jpeg', 0.9); } catch (_) { return null; }
    }
  }

  // ---------- Validation for compulsory fields per step ----------
  function validateStep(step) {
    if (step === 0) return true; // handled in autofill
    if (step === 7) {
      if (!$('#final-status').value) {
        toast('Select final equipment status', 'error');
        return false;
      }
    }
    if (step === 8) {
      if (sigPads['sig-tech'] && sigPads['sig-tech'].isEmpty()) {
        toast('Lead Technician signature is required', 'error');
        return false;
      }
      if (!$('#client-rep-name').value.trim()) {
        toast('Site Representative name is required', 'error');
        return false;
      }
      if (sigPads['sig-client'] && sigPads['sig-client'].isEmpty()) {
        toast('Site Representative signature is required', 'error');
        return false;
      }
    }
    return true;
  }

  // ---------- Review summary ----------
  function buildReview() {
    const el = $('#review-summary');
    const wo = $('#wo-number').value;
    const client = $('#client-name').value;
    const site = $('#site-name').value;
    const equip = $('#equip-id').value + ' – ' + $('#equip-desc').value;
    const status = $('#final-status').value;
    el.innerHTML = `
      <div class="review-section"><h4>Header</h4>
        <div class="content"><strong>${wo}</strong> · ${$('#doc-date').value} · Status: ${$('#wo-status').value}</div></div>
      <div class="review-section"><h4>Client & Site</h4>
        <div class="content">${escapeHtml(client)} · ${escapeHtml(site)}<br/>${escapeHtml($('#site-address').value)}</div></div>
      <div class="review-section"><h4>Equipment</h4>
        <div class="content">${escapeHtml(equip)}<br/>Work: ${escapeHtml($('#work-type').value)}</div></div>
      <div class="review-section"><h4>Reported Problem</h4>
        <div class="content">${escapeHtml($('#reported-problem').value)}</div></div>
      <div class="review-section"><h4>Final Status</h4>
        <div class="content"><strong>${escapeHtml(status)}</strong></div></div>
      <div class="review-section"><h4>Technicians</h4>
        <div class="content">Lead: ${escapeHtml($('#tech-lead').value)}<br/>Assist: ${escapeHtml($('#tech-assist').value || '—')}</div></div>
      <div class="review-section"><h4>Photos attached</h4>
        <div class="content">${state.photos.length} file(s)</div></div>
      <div class="review-section"><h4>Signatures</h4>
        <div class="content">
          Tech: ${getSigData('sig-tech') ? '✓ Captured' : '✗ Missing'} ·
          Client: ${getSigData('sig-client') ? '✓ Captured' : '✗ Missing'}
        </div></div>
    `;
  }

  // ---------- PDF Generation ----------
  async function generatePDF() {
    showOverlay('Building professional PDF…');
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 14;
      let y = 12;

      const navy = [13, 38, 77];
      const accent = [217, 115, 13];
      const grey = [100, 100, 100];

      function checkPage(need) {
        if (y + need > 280) {
          doc.addPage();
          y = 14;
          // footer-ish line
          doc.setDrawColor(...navy);
          doc.setLineWidth(0.3);
        }
      }

      function sectionHeader(title) {
        checkPage(12);
        doc.setFillColor(...navy);
        doc.rect(margin, y, pageW - margin * 2, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(title, margin + 2, y + 4.8);
        y += 10;
        doc.setTextColor(30, 30, 30);
      }

      function labelValue(label, value, maxW) {
        checkPage(8);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(...grey);
        doc.text(label, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(20, 20, 20);
        const lines = doc.splitTextToSize(String(value || '—'), maxW || pageW - margin * 2 - 2);
        doc.text(lines, margin, y + 4);
        y += 4 + lines.length * 4 + 2;
      }

      // Header bar
      doc.setFillColor(...navy);
      doc.rect(0, 0, pageW, 22, 'F');
      doc.setFillColor(...accent);
      doc.rect(0, 22, pageW, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('FORECOURT WORKS LTD', margin, 10);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Fueling Systems: Installation, Repair, Routine Maintenance, Calibration & Regulatory Compliance', margin, 15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('TECHNICAL SERVICE WORK ORDER', pageW - margin, 10, { align: 'right' });
      y = 28;

      // Meta
      doc.setFillColor(232, 238, 247);
      doc.rect(margin, y, pageW - margin * 2, 8, 'F');
      doc.setTextColor(20, 20, 20);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`WO: ${$('#wo-number').value}`, margin + 2, y + 5.2);
      doc.text(`Date: ${$('#doc-date').value}`, margin + 55, y + 5.2);
      doc.setTextColor(...( $('#wo-status').value === 'COMPLETED' ? [26,115,70] : grey));
      doc.text(`Status: ${$('#wo-status').value}`, pageW - margin - 2, y + 5.2, { align: 'right' });
      y += 12;

      // PART A
      sectionHeader('PART A — JOB & EQUIPMENT PARTICULARS');
      labelValue('Client / Asset Owner', $('#client-name').value);
      labelValue('Site / Station', $('#site-name').value + '  |  Contact: ' + ($('#site-contact').value || '—'));
      labelValue('Site Address', $('#site-address').value);
      labelValue('Equipment', `${$('#equip-id').value} – ${$('#equip-desc').value}`);
      labelValue('Manufacturer / Model / Serial', `${$('#equip-mfr').value || '—'}  |  SN: ${$('#equip-serial').value || '—'}`);
      labelValue('Product / Location', `${$('#product-handled').value || '—'}  |  ${$('#equip-location').value || '—'}`);
      labelValue('Work Type', $('#work-type').value);
      labelValue('Reported Problem', $('#reported-problem').value);
      labelValue('Date & Times', `Work date: ${$('#work-date').value}  |  Arrival: ${$('#time-arrival').value || '—'}  |  Start: ${$('#time-start').value || '—'}  |  Complete: ${$('#time-complete').value || '—'}  |  Departure: ${$('#time-departure').value || '—'}`);
      labelValue('Technicians', `Lead: ${$('#tech-lead').value}  |  Assist: ${$('#tech-assist').value || '—'}`);

      // PART B
      sectionHeader('PART B — JOB HAZARD ANALYSIS & MITIGATION');
      const hazNodes = $$('#hazards-container > div');
      hazNodes.forEach((node, i) => {
        const h = node.querySelector('.haz-hazard')?.value || '';
        const r = node.querySelector('.haz-risk')?.value || '';
        const c = node.querySelector('.haz-control')?.value || '';
        const v = node.querySelector('.haz-verified')?.checked ? 'Yes' : 'No';
        checkPage(14);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(`${i + 1}. ${h}  [${r}]  Verified: ${v}`, margin, y);
        y += 4;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        const clines = doc.splitTextToSize('Control: ' + c, pageW - margin * 2);
        doc.text(clines, margin, y);
        y += clines.length * 3.5 + 3;
      });
      labelValue('PPE Confirmed', Array.from($$('#ppe-list input:checked')).map(c => c.value).join(', ') || '—');
      labelValue('Toolbox Talk', $('#toolbox-time').value || '—');
      labelValue('Safety Declaration', $('#safety-declaration').value);

      // PART C
      sectionHeader('PART C — SCOPE OF WORK & DELIVERABLES');
      labelValue('Scope Summary', $('#scope-summary').value);
      labelValue('Scope Steps', $('#scope-steps').value);
      labelValue('Deliverables', $('#deliverables').value);

      // PART D
      sectionHeader('PART D — SUMMARY OF WORK DONE AND FINDINGS');
      labelValue('Arrival & Preparation', $('#findings-arrival').value);
      labelValue('As-Found & Diagnosis', $('#findings-diagnosis').value);
      labelValue('Root Cause', $('#findings-rootcause').value);
      labelValue('Corrective Action', $('#findings-action').value);
      labelValue('Post-Repair Verification', $('#findings-verification').value);

      // PART E
      sectionHeader('PART E — QUALITY CONTROL TESTS AND RESULTS');
      labelValue('Method', $('#qc-intro').value);
      const qcRows = $$('#qc-table-container tbody tr');
      qcRows.forEach(tr => {
        const cells = tr.querySelectorAll('input, select');
        const line = Array.from(cells).map(c => c.value).join('  |  ');
        checkPage(6);
        doc.setFontSize(7.5);
        const lines = doc.splitTextToSize(line, pageW - margin * 2);
        doc.text(lines, margin, y);
        y += lines.length * 3.5 + 2;
      });
      labelValue('QC Conclusion', $('#qc-conclusion').value);

      // PART F
      sectionHeader('PART F — LIST OF SPARE PARTS USED');
      $$('#parts-container > div').forEach(node => {
        const desc = node.querySelector('.part-desc')?.value || '';
        const qty = node.querySelector('.part-qty')?.value || '';
        const st = node.querySelector('.part-status')?.value || '';
        const vend = node.querySelector('.part-vendor')?.value || '';
        const inst = node.querySelector('.part-install')?.value || '';
        const ws = node.querySelector('.part-wstart')?.value || '';
        const we = node.querySelector('.part-wend')?.value || '';
        labelValue('Part', `${desc}  |  Qty: ${qty}  |  ${st}  |  Vendor: ${vend}`);
        labelValue('Dates', `Installed: ${inst}  |  Warranty: ${ws} → ${we}`);
      });
      labelValue('Traceability', $('#parts-traceability').value);

      // PART G
      sectionHeader('PART G — TECHNICIAN\'S RECOMMENDATIONS');
      labelValue('Recommendations', $('#recommendations').value);

      // PART H
      sectionHeader('PART H — EQUIPMENT FINAL STATUS');
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(26, 115, 70);
      doc.setLineWidth(0.6);
      const statusText = $('#final-status-text').value;
      const stLines = doc.splitTextToSize(statusText, pageW - margin * 2 - 6);
      const boxH = stLines.length * 4 + 10;
      checkPage(boxH + 6);
      doc.roundedRect(margin, y, pageW - margin * 2, boxH, 2, 2, 'FD');
      doc.setTextColor(26, 115, 70);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text($('#final-status').value, margin + 3, y + 5);
      doc.setTextColor(20, 20, 20);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(stLines, margin + 3, y + 10);
      y += boxH + 6;
      labelValue('Technician Declaration', $('#tech-declaration').value);

      // Signatures
      sectionHeader('SIGNATURES');
      const techSig = getSigData('sig-tech');
      const clientSig = getSigData('sig-client');
      const assistSig = getSigData('sig-assist');

      checkPage(40);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Lead Technician', margin, y);
      y += 3;
      if (techSig) {
        doc.addImage(techSig, 'JPEG', margin, y, 55, 18);
      } else {
        doc.setDrawColor(180);
        doc.rect(margin, y, 55, 18);
      }
      y += 20;
      doc.setFont('helvetica', 'normal');
      doc.text(`${$('#sig-tech-name').value || $('#tech-lead').value}  ·  ${$('#sig-tech-date').value}`, margin, y);
      y += 8;

      if (assistSig) {
        doc.setFont('helvetica', 'bold');
        doc.text('Assisting Technician', margin, y);
        y += 3;
        doc.addImage(assistSig, 'JPEG', margin, y, 55, 18);
        y += 22;
      }

      // PART I
      sectionHeader('PART I — SITE REPRESENTATIVE ACCEPTANCE');
      labelValue('Acknowledgement', $('#acceptance-text').value);
      labelValue('Representative', `${$('#client-rep-name').value}  ·  ${$('#client-rep-title').value || ''}`);
      checkPage(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Signature', margin, y);
      y += 3;
      if (clientSig) {
        doc.addImage(clientSig, 'JPEG', margin, y, 55, 18);
      } else {
        doc.setDrawColor(180);
        doc.rect(margin, y, 55, 18);
      }
      y += 20;
      doc.setFont('helvetica', 'normal');
      doc.text(`Date/Time: ${$('#sig-client-date').value} ${$('#sig-client-time').value || ''}`, margin, y);
      y += 6;
      if ($('#client-comments').value) {
        labelValue('Comments', $('#client-comments').value);
      }

      // Closing
      checkPage(20);
      y += 4;
      doc.setFillColor(232, 238, 247);
      doc.roundedRect(margin, y, pageW - margin * 2, 18, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...navy);
      doc.text('FORECOURT WORKS LTD – COMMITMENT TO EXCELLENCE', margin + 3, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(40, 40, 40);
      const close = 'This Work Order forms part of our formal documentation regime. Every intervention is executed under controlled procedures, documented in full, and subject to internal quality review.';
      doc.text(doc.splitTextToSize(close, pageW - margin * 2 - 6), margin + 3, y + 10);

      // Footer on last page
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(6.5);
        doc.setTextColor(...grey);
        doc.text(`CONTROLLED DOCUMENT  |  ${$('#wo-number').value}  |  Rev 1.0  |  CONFIDENTIAL`, margin, 290);
        doc.text(`Page ${i} of ${pageCount}`, pageW - margin, 290, { align: 'right' });
      }

      // Photos as extra pages if any
      for (const p of state.photos) {
        if (!p.dataUrl.startsWith('data:image')) continue;
        doc.addPage();
        doc.setFontSize(10);
        doc.setTextColor(...navy);
        doc.text('Photographic Evidence – ' + p.name, margin, 15);
        try {
          doc.addImage(p.dataUrl, 'JPEG', margin, 20, pageW - margin * 2, 0);
        } catch (e) {
          try { doc.addImage(p.dataUrl, 'PNG', margin, 20, pageW - margin * 2, 0); } catch (_) {}
        }
      }

      const fileName = `${$('#wo-number').value}_${($('#site-name').value || 'WorkOrder').replace(/\s+/g, '_')}.pdf`;
      state.pdfBlob = doc.output('blob');
      state.pdfFileName = fileName;

      // Trigger download
      doc.save(fileName);

      $('#btn-share').style.display = 'inline-flex';
      $('#pdf-status').textContent = `PDF generated: ${fileName}`;
      toast('PDF generated successfully', 'success');

      // Update status
      $('#wo-status').value = 'COMPLETED';
      $('#wo-status-display').textContent = 'COMPLETED';
    } catch (err) {
      console.error(err);
      toast('PDF generation failed: ' + err.message, 'error');
    } finally {
      hideOverlay();
    }
  }

  async function sharePDF() {
    if (!state.pdfBlob) {
      toast('Generate the PDF first', 'error');
      return;
    }
    const file = new File([state.pdfBlob], state.pdfFileName, { type: 'application/pdf' });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: state.pdfFileName,
          text: `Technical Service Work Order – ${$('#wo-number').value}`,
          files: [file]
        });
      } catch (e) {
        if (e.name !== 'AbortError') fallbackShare(file);
      }
    } else {
      fallbackShare(file);
    }
  }

  function fallbackShare(file) {
    // Download again + open WhatsApp / mailto tips
    const url = URL.createObjectURL(state.pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = state.pdfFileName;
    a.click();
    toast('PDF downloaded. You can attach it in WhatsApp, Email or any app.');
  }

  // ---------- Local draft save ----------
  function saveDraft() {
    const data = {
      wo: $('#wo-number').value,
      fields: {}
    };
    $$('input, select, textarea').forEach(el => {
      if (el.id) data.fields[el.id] = el.type === 'checkbox' ? el.checked : el.value;
    });
    data.photos = state.photos;
    data.step = state.currentStep;
    try {
      localStorage.setItem('fw_wo_draft', JSON.stringify(data));
      toast('Draft saved on this device', 'success');
    } catch (e) {
      toast('Could not save draft (storage full?)', 'error');
    }
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem('fw_wo_draft');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.fields) {
        Object.entries(data.fields).forEach(([id, val]) => {
          const el = document.getElementById(id);
          if (!el) return;
          if (el.type === 'checkbox') el.checked = !!val;
          else el.value = val;
        });
      }
      if (data.wo) {
        $('#wo-number-display').textContent = data.wo;
      }
      if (data.photos) {
        state.photos = data.photos;
        renderPhotos();
      }
      toast('Draft restored', 'success');
    } catch (_) {}
  }

  // ---------- Init & Events ----------
  function init() {
    // Defaults
    $('#doc-date').value = todayISO();
    $('#work-date').value = todayISO();
    $('#wo-number').value = generateWONumber();
    $('#wo-number-display').textContent = $('#wo-number').value;
    $('#wo-date-display').textContent = todayISO();

    // GPS
    $('#btn-gps').addEventListener('click', getGPS);

    // Auto-fill
    $('#btn-autofill').addEventListener('click', runAutoPopulate);

    // Confirm buttons
    $$('[data-confirm]').forEach(btn => {
      btn.addEventListener('click', () => {
        const step = parseInt(btn.dataset.confirm, 10);
        if (!validateStep(step)) return;
        showStep(step + 1);
        if (step + 1 === 9) buildReview();
      });
    });

    // Nav
    $('#btn-prev').addEventListener('click', () => {
      if (state.currentStep > 0) showStep(state.currentStep - 1);
    });
    $('#btn-next').addEventListener('click', () => {
      // On step 0 force autofill path
      if (state.currentStep === 0) {
        runAutoPopulate();
        return;
      }
      const next = state.currentStep + 1;
      if (!validateStep(state.currentStep)) return;
      showStep(next);
      if (next === 9) buildReview();
    });

    // Photos
    $('#photo-input').addEventListener('change', e => addPhotos(e.target.files));
    $('#file-input').addEventListener('change', e => addPhotos(e.target.files));

    // Clear sigs
    $$('[data-clear-sig]').forEach(btn => {
      btn.addEventListener('click', () => clearSig(btn.dataset.clearSig));
    });

    // PDF
    $('#btn-generate-pdf').addEventListener('click', generatePDF);
    $('#btn-share').addEventListener('click', sharePDF);
    $('#btn-save-draft').addEventListener('click', saveDraft);

    // Add hazard / qc / part
    $('#btn-add-hazard').addEventListener('click', () => {
      fillHazards([{ hazard: '', risk: 'Medium', control: '', verified: false },
        ...Array.from($$('#hazards-container .haz-hazard')).map((_, i) => {
          const node = $$('#hazards-container > div')[i];
          return {
            hazard: node.querySelector('.haz-hazard').value,
            risk: node.querySelector('.haz-risk').value,
            control: node.querySelector('.haz-control').value,
            verified: node.querySelector('.haz-verified').checked
          };
        })
      ]);
    });

    // Resize sig pads on orientation change
    window.addEventListener('resize', () => {
      // re-init only if empty to avoid wiping
    });

    // Init signature pads after layout
    setTimeout(initSignatures, 300);

    // Restore draft?
    loadDraft();
    showStep(0);
  }

  document.addEventListener('DOMContentLoaded', init);
})();


// ===== FIXES OVERRIDE =====
(function() {
  // Re-bind Add QC
  const btnQc = document.getElementById('btn-add-qc');
  if (btnQc) {
    btnQc.onclick = function() {
      const container = document.getElementById('qc-table-container');
      if (!container) return;
      let tbody = container.querySelector('tbody');
      if (!tbody) {
        container.innerHTML = `<table class="data-table"><thead><tr>
          <th>Test Description</th><th>As-Found</th><th>As-Left</th><th>Criterion</th><th>Result</th>
        </tr></thead><tbody></tbody></table>`;
        tbody = container.querySelector('tbody');
      }
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input class="qc-test" value="" placeholder="Test name" /></td>
        <td><input class="qc-found" value="" /></td>
        <td><input class="qc-left" value="" /></td>
        <td><input class="qc-crit" value="" /></td>
        <td><select class="qc-result"><option>PASS</option><option>FAIL</option><option>N/A</option></select></td>`;
      tbody.appendChild(tr);
    };
  }

  // Re-bind Add Part
  const btnPart = document.getElementById('btn-add-part');
  if (btnPart) {
    btnPart.onclick = function() {
      const container = document.getElementById('parts-container');
      if (!container) return;
      const today = new Date().toISOString().slice(0,10);
      const end = new Date(); end.setFullYear(end.getFullYear()+1);
      const endDate = end.toISOString().slice(0,10);
      const div = document.createElement('div');
      div.className = 'item-card';
      div.innerHTML = `
        <div class="form-group"><label>Description</label>
          <input type="text" class="part-desc" value="" /></div>
        <div class="row">
          <div class="form-group"><label>Qty</label><input type="text" class="part-qty" value="1" /></div>
          <div class="form-group"><label>Status</label>
            <select class="part-status"><option>New</option><option>Reconditioned</option><option>Used</option></select></div>
        </div>
        <div class="form-group"><label>Vendor / Source</label>
          <input type="text" class="part-vendor" value="" /></div>
        <div class="row">
          <div class="form-group"><label>Install Date</label>
            <input type="date" class="part-install" value="${today}" /></div>
          <div class="form-group"><label>Warranty Start</label>
            <input type="date" class="part-wstart" value="${today}" /></div>
        </div>
        <div class="form-group"><label>Warranty End</label>
          <input type="date" class="part-wend" value="${endDate}" /></div>
        <button type="button" class="btn btn-outline btn-sm" onclick="this.parentElement.remove()">Remove</button>`;
      container.appendChild(div);
    };
  }

  // Force re-init signatures when step 8 is shown
  const origShowStep = window.showStep;
  // Hook into confirm buttons for step 7 -> 8
  document.querySelectorAll('[data-confirm="7"]').forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeout(() => {
        if (typeof initSignatures === 'function') initSignatures();
      }, 200);
    });
  });

  // Also re-init on DOM ready with delay
  setTimeout(() => {
    if (typeof initSignatures === 'function') initSignatures();
  }, 600);

  // Fix Save Draft to actually download a file
  const btnSave = document.getElementById('btn-save-draft');
  if (btnSave) {
    btnSave.onclick = function() {
      const data = { version: 1, savedAt: new Date().toISOString(), fields: {} };
      document.querySelectorAll('input, select, textarea').forEach(el => {
        if (el.id) data.fields[el.id] = el.type === 'checkbox' ? el.checked : el.value;
      });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (document.getElementById('wo-number')?.value || 'WorkOrder') + '_draft.json';
      a.click();
      URL.revokeObjectURL(a.href);
      if (typeof toast === 'function') toast('Draft downloaded to your device', 'success');
    };
  }

  // Improve PDF signature handling – convert to JPEG to avoid PNG corruption
  // (jsPDF sometimes fails on certain PNG signatures)
  const origGetSig = window.getSigData;
  window.getSigDataSafe = function(id) {
    const pad = (typeof sigPads !== 'undefined') ? sigPads[id] : null;
    if (!pad || pad.isEmpty()) return null;
    try {
      // Force white background JPEG
      const canvas = document.getElementById(id);
      if (!canvas) return pad.toDataURL('image/png');
      const tmp = document.createElement('canvas');
      tmp.width = canvas.width;
      tmp.height = canvas.height;
      const ctx = tmp.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, tmp.width, tmp.height);
      ctx.drawImage(canvas, 0, 0);
      return tmp.toDataURL('image/jpeg', 0.92);
    } catch (e) {
      return pad.toDataURL('image/png');
    }
  };
})();
