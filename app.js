const modal = document.querySelector('#detail-modal');
const modalContent = document.querySelector('#modal-content');
const toast = document.querySelector('#toast');
let toastTimer;

const plans = {
  beds: { title: 'Prepare 4 flex beds', description: 'The forecast shows Saturday arrivals may outpace staffed inpatient capacity. Preparing four flex beds gives the team a small buffer while preserving current ICU capacity.', metrics: [['+4', 'flex beds'], ['Sat, Oct 10', 'peak day'], ['87%', 'forecast confidence']], action: 'Mark as planned' },
  staff: { title: 'Request 2 additional nurses', description: 'Two extra nurses on the Saturday day shift would bring projected coverage back in line with the current staffing plan during the expected arrival peak.', metrics: [['+2', 'nurses'], ['Day shift', 'coverage window'], ['92%', 'current coverage']], action: 'Create staffing request' },
  admissions: { title: 'Review elective admissions', description: 'Review three non-urgent admissions currently scheduled for Saturday. If clinically appropriate, moving them to Friday or Sunday could reduce pressure on beds and staff.', metrics: [['3', 'admissions to review'], ['Saturday', 'current schedule'], ['16', 'projected shortfall']], action: 'Open admissions list' },
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function openModal(title, description, metrics, action = 'Done', kicker = 'OPERATIONS PLANNER') {
  modalContent.innerHTML = `<h3>${title}</h3><p>${description}</p><div class="modal-metrics">${metrics.map(([value, label]) => `<div class="modal-metric"><strong>${value}</strong><span>${label}</span></div>`).join('')}</div><div class="modal-actions"><button class="modal-cancel" data-close>Close</button><button class="modal-confirm" data-confirm>${action}</button></div>`;
  document.querySelector('.modal-kicker').textContent = kicker;
  modal.showModal();
}

document.querySelectorAll('.sparkline').forEach((el) => {
  const values = el.dataset.values.split(',').map(Number);
  const max = Math.max(...values);
  const points = values.map((v, i) => `${(i / (values.length - 1)) * 100},${22 - (v / max) * 18}`).join(' ');
  el.innerHTML = `<svg viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true"><polyline points="${points}" fill="none" stroke="#72b49c" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
});

document.querySelectorAll('.range-button').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.range-button').forEach((item) => item.classList.remove('selected'));
  button.classList.add('selected');
  const range = button.dataset.range;
  const chart = document.querySelector('.forecast-chart');
  const demand = chart.querySelector('.demand-line');
  const rangeArea = chart.querySelector('.range-area');
  if (range === '24h') {
    demand.setAttribute('d', 'M0 141 L116 134 L232 126 L348 107 L464 118 L580 91 L700 97');
    chart.querySelector('.demand-area').setAttribute('d', 'M0 141 L116 134 L232 126 L348 107 L464 118 L580 91 L700 97 L700 220 L0 220Z');
    chart.querySelector('.capacity-line').setAttribute('d', 'M0 62 L116 62 L232 62 L348 62 L464 62 L580 62 L700 62');
    rangeArea.setAttribute('d', 'M0 103 L116 98 L232 90 L348 73 L464 82 L580 58 L700 62 L700 125 L580 121 L464 151 L348 137 L232 156 L116 161 L0 168Z');
    chart.querySelector('.x-labels').innerHTML = '<span>12 AM</span><span>4 AM</span><span>8 AM</span><span>12 PM</span><span>4 PM</span><span>8 PM</span><span>12 AM</span>';
  } else if (range === '30d') {
    demand.setAttribute('d', 'M0 151 L116 137 L232 145 L348 110 L464 99 L580 76 L700 54');
    chart.querySelector('.demand-area').setAttribute('d', 'M0 151 L116 137 L232 145 L348 110 L464 99 L580 76 L700 54 L700 220 L0 220Z');
    chart.querySelector('.capacity-line').setAttribute('d', 'M0 62 L116 62 L232 62 L348 62 L464 62 L580 62 L700 62');
    rangeArea.setAttribute('d', 'M0 115 L116 103 L232 106 L348 79 L464 70 L580 47 L700 29 L700 92 L580 109 L464 132 L348 143 L232 163 L116 162 L0 175Z');
    chart.querySelector('.x-labels').innerHTML = '<span>Oct 7</span><span>Oct 12</span><span>Oct 17</span><span>Oct 22</span><span>Oct 27</span><span>Nov 1</span><span>Nov 6</span>';
  } else {
    demand.setAttribute('d', 'M0 136 L116 131 L232 124 L348 112 L464 105 L580 88 L700 75');
    chart.querySelector('.demand-area').setAttribute('d', 'M0 136 L116 131 L232 124 L348 112 L464 105 L580 88 L700 75 L700 220 L0 220Z');
    chart.querySelector('.capacity-line').setAttribute('d', 'M0 65 L116 65 L232 65 L348 65 L464 65 L580 65 L700 65');
    rangeArea.setAttribute('d', 'M0 100 L116 95 L232 88 L348 77 L464 68 L580 48 L700 36 L700 116 L580 127 L464 139 L348 147 L232 154 L116 159 L0 163Z');
    chart.querySelector('.x-labels').innerHTML = '<span>Mon, Oct 5</span><span>Tue, Oct 6</span><span>Wed, Oct 7</span><span>Thu, Oct 8</span><span>Fri, Oct 9</span><span>Sat, Oct 10</span><span>Sun, Oct 11</span>';
  }
  showToast(`Showing ${range === '24h' ? '24-hour' : range === '7d' ? '7-day' : '30-day'} demand forecast`);
}));

document.querySelectorAll('.rec-button').forEach((button) => button.addEventListener('click', () => {
  const plan = plans[button.dataset.action];
  openModal(plan.title, plan.description, plan.metrics, plan.action);
}));

document.querySelector('#scenario-open').addEventListener('click', () => openModal(
  'Scenario planner',
  'Adjust a few planning assumptions to see how a weekend arrival surge could affect hospital capacity. This illustrative scenario uses the current seven-day forecast.',
  [['+12%', 'arrival uplift'], ['4 beds', 'flex capacity'], ['2 nurses', 'extra coverage']],
  'Apply scenario', 'WHAT-IF ANALYSIS'
));

document.querySelector('#forecast-action').addEventListener('click', () => document.querySelector('#recommendations').scrollIntoView({ behavior: 'smooth', block: 'center' }));
document.querySelector('#capacity-details').addEventListener('click', () => openModal(
  'Capacity details',
  'Current utilization is highest in ICU, with two beds available. Inpatient and emergency capacity remain below the 85% planning threshold.',
  [['84%', 'inpatient'], ['90%', 'ICU'], ['80%', 'emergency']],
  'Got it', 'CAPACITY MONITOR'
));
document.querySelector('#all-alerts').addEventListener('click', () => openModal(
  'All active alerts',
  'Four operational alerts are active. Three are shown on the overview; one additional low-priority alert is being reviewed by facilities.',
  [['1', 'critical'], ['2', 'warning'], ['1', 'information']],
  'Acknowledge alerts', 'LIVE ALERTS'
));
document.querySelector('#all-recommendations').addEventListener('click', () => openModal(
  'Planning recommendations',
  'Recommendations are generated from the current demand estimate, staffed capacity, and configured planning thresholds. Confirm operational changes with the relevant department lead.',
  [['3', 'suggestions'], ['2', 'need review'], ['1', 'planning item']],
  'Done', 'RECOMMENDATIONS'
));
document.querySelector('#notification-button').addEventListener('click', () => document.querySelector('#alerts').scrollIntoView({ behavior: 'smooth', block: 'center' }));

document.querySelectorAll('[data-page]').forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.remove('active'));
  link.classList.add('active');
  const target = link.dataset.page;
  if (target === 'overview') window.scrollTo({ top: 0, behavior: 'smooth' });
  else document.querySelector(`#${target}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}));

document.querySelector('#export-button').addEventListener('click', () => {
  const rows = [
    ['Northstar General operations snapshot', 'October 7, 2026'],
    ['Metric', 'Current', 'Capacity / note'],
    ['Projected arrivals', '128', '12% above last Wednesday'],
    ['Inpatient beds', '86', '102 total; 16 available'],
    ['ICU beds', '18', '20 total; 2 available'],
    ['Emergency department', '32', '40 total; 8 available'],
    ['Staff coverage', '92%', '6 below planned staffing'],
    ['Forecast confidence', '87%', 'Weekend pressure expected'],
  ];
  const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = 'northstar-operations-snapshot.csv'; anchor.click();
  URL.revokeObjectURL(url);
  showToast('Operations report exported');
});

document.querySelector('#refresh-button').addEventListener('click', (event) => {
  const button = event.currentTarget;
  button.textContent = '↻ Refreshing…';
  setTimeout(() => { button.textContent = '↻ Refresh data'; showToast('Dashboard data is up to date'); }, 650);
});

document.querySelector('.modal-close').addEventListener('click', () => modal.close());
modal.addEventListener('click', (event) => { if (event.target === modal) modal.close(); });
modal.addEventListener('click', (event) => {
  if (event.target.matches('[data-close]')) modal.close();
  if (event.target.matches('[data-confirm]')) { const text = event.target.textContent; modal.close(); showToast(`${text} · demo action recorded`); }
});
document.querySelector('#facility-select').addEventListener('change', (event) => showToast(`Viewing ${event.target.value} · sample dashboard data`));
