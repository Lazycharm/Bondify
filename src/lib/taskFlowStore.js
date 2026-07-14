const FLOW_KEY = 'bondify_task_flow';
const ELIGIBLE_KEY = 'bondify_sales_eligible';

export function getTaskFlow() {
  return localStorage.getItem(FLOW_KEY) || 'daily';
}

export function setTaskFlow(flow) {
  localStorage.setItem(FLOW_KEY, flow);
}

export function isSalesEligible() {
  return localStorage.getItem(ELIGIBLE_KEY) === '1';
}

// Called with approved deposits array — marks eligible if any deposit >= 250k
export function checkAndSetSalesEligibility(approvedDeposits) {
  const MAX = 250000;
  const hasLargeDeposit = approvedDeposits.some((d) => (parseInt(d.amount, 10) || 0) >= MAX);
  if (hasLargeDeposit) {
    localStorage.setItem(ELIGIBLE_KEY, '1');
    return true;
  }
  return false;
}

export function activateSalesFlow() {
  localStorage.setItem(FLOW_KEY, 'sales');
  localStorage.setItem(ELIGIBLE_KEY, '1');
}
