/**
 * CampusShield Local History Storage
 * Manages locally stored analysis records in the browser's localStorage.
 * Privacy-first: Data never leaves this device or browser.
 */

const STORAGE_KEY = 'campusshield_history_v1';
const MAX_HISTORY_ITEMS = 50;

/**
 * Safely retrieves history list from localStorage.
 * If data is corrupted, resets history safely and returns empty array.
 * @returns {Array<Object>}
 */
export function getStoredHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    
    // Filter and sanitize entries
    return parsed.filter(item => item && typeof item === 'object' && item.id);
  } catch {
    // Corrupted JSON in localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore if localStorage access is blocked (e.g. strict private mode)
    }
    return [];
  }
}

/**
 * Saves a new analysis entry to local storage.
 * @param {Object} entryData
 */
export function saveHistoryEntry({
  sender_email = '',
  subject = '',
  body = '',
  has_external_form = false,
  has_payment_request = false,
  analysisResult,
}) {
  if (!analysisResult) return;

  try {
    const current = getStoredHistory();

    const newRecord = {
      id: `cs_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      sender_email: typeof sender_email === 'string' ? sender_email.trim() : '',
      subject: typeof subject === 'string' ? subject.trim() : '',
      body_snippet: typeof body === 'string' ? body.slice(0, 160).trim() : '',
      has_external_form: Boolean(has_external_form),
      has_payment_request: Boolean(has_payment_request),
      prediction: analysisResult.prediction,
      phishing_probability: analysisResult.phishing_probability,
      risk_score: analysisResult.risk_score,
      risk_level: analysisResult.risk_level,
      reasons: Array.isArray(analysisResult.reasons) ? analysisResult.reasons : [],
      recommendation: analysisResult.recommendation || '',
    };

    const updated = [newRecord, ...current].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newRecord;
  } catch {
    // Handle localStorage quota or disabled errors gracefully
    return null;
  }
}

/**
 * Deletes a single history record by ID.
 * @param {string} id
 */
export function deleteStoredHistoryEntry(id) {
  try {
    const current = getStoredHistory();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

/**
 * Clears all local history records.
 */
export function clearStoredHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch {
    return [];
  }
}
