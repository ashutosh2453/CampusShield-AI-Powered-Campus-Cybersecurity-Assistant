/**
 * CampusShield API Client
 * Centralized service for communicating with the FastAPI ML backend.
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001').replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = 30000;

export class ApiError extends Error {
  constructor(message, secondary = '', status = null) {
    super(message);
    this.name = 'ApiError';
    this.secondary = secondary;
    this.status = status;
  }
}

/**
 * Checks if the backend API is online.
 * @returns {Promise<{online: boolean, message?: string, version?: string}>}
 */
export async function checkBackendHealth() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json().catch(() => null);
      return {
        online: true,
        message: data?.message || 'Server online',
        version: data?.version || '1.0.0',
      };
    }
    return { online: false, message: `Server responded with status ${res.status}` };
  } catch (err) {
    clearTimeout(timeoutId);
    return { online: false, message: err.message || 'Offline' };
  }
}

/**
 * Sends an email message to the backend ML model for phishing and risk analysis.
 *
 * @param {Object} params
 * @param {string} params.sender_email
 * @param {string} params.subject
 * @param {string} params.body
 * @param {boolean} params.has_external_form
 * @param {boolean} params.has_payment_request
 * @returns {Promise<Object>} Safe and validated analysis result
 */
export async function analyzeMessage({
  sender_email = '',
  subject = '',
  body = '',
  has_external_form = false,
  has_payment_request = false,
}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;

  try {
    response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        sender_email: typeof sender_email === 'string' ? sender_email.trim() : '',
        subject: typeof subject === 'string' ? subject.trim() : '',
        body: typeof body === 'string' ? body : '',
        has_external_form: Boolean(has_external_form),
        has_payment_request: Boolean(has_payment_request),
      }),
    });
  } catch (networkError) {
    clearTimeout(timeoutId);

    if (networkError.name === 'AbortError') {
      throw new ApiError(
        'The analysis took too long. Please try again.',
        'Request timed out after 30 seconds.',
        'TIMEOUT'
      );
    }

    throw new ApiError(
      'CampusShield analysis server is unavailable.',
      `Make sure the FastAPI backend is running at ${API_BASE_URL}.`,
      'NETWORK_ERROR'
    );
  }

  clearTimeout(timeoutId);

  // Handle HTTP errors
  if (!response.ok) {
    const status = response.status;

    if (status === 422) {
      throw new ApiError(
        'Some of the submitted information could not be processed. Please check the fields and try again.',
        'FastAPI validation error occurred.',
        422
      );
    }

    if (status === 400) {
      throw new ApiError(
        'The request was invalid. Please check your message content and try again.',
        'Bad Request',
        400
      );
    }

    if (status === 404) {
      throw new ApiError(
        'The analysis endpoint could not be found. Please check the backend configuration.',
        `Route POST ${API_BASE_URL}/analyze was not found.`,
        404
      );
    }

    if (status === 500) {
      throw new ApiError(
        'CampusShield encountered a server error while analyzing this message. Please try again.',
        'Internal Server Error (500)',
        500
      );
    }

    if (status === 502 || status === 503 || status === 504) {
      throw new ApiError(
        'The analysis service is temporarily unavailable. Please try again.',
        `Server returned status ${status}`,
        status
      );
    }

    throw new ApiError(
      `Server returned an error (${status}). Please try again.`,
      '',
      status
    );
  }

  // Parse JSON response safely
  let rawData;
  try {
    rawData = await response.json();
  } catch {
    throw new ApiError(
      'The server returned an unexpected response.',
      'Could not parse response as valid JSON.',
      'INVALID_JSON'
    );
  }

  if (!rawData || typeof rawData !== 'object') {
    throw new ApiError(
      'The analysis result was incomplete.',
      'Response payload is not a valid object.',
      'MALFORMED_RESPONSE'
    );
  }

  // Defensively validate required fields
  const hasPrediction = typeof rawData.prediction === 'string' && rawData.prediction.length > 0;
  const hasProbability = typeof rawData.phishing_probability === 'number' && !isNaN(rawData.phishing_probability);
  const hasRiskScore = typeof rawData.risk_score === 'number' && !isNaN(rawData.risk_score);

  if (!hasPrediction && !hasProbability && !hasRiskScore) {
    throw new ApiError(
      'The analysis result was incomplete.',
      'Required analysis fields were missing from the backend response.',
      'MISSING_FIELDS'
    );
  }

  // Sanitize and return verified data structure
  return {
    prediction: rawData.prediction || 'UNKNOWN',
    phishing_probability: hasProbability ? rawData.phishing_probability : null,
    risk_score: hasRiskScore ? Math.max(0, Math.min(100, Math.round(rawData.risk_score))) : 0,
    risk_level: typeof rawData.risk_level === 'string' ? rawData.risk_level.toUpperCase() : 'UNKNOWN',
    reasons: Array.isArray(rawData.reasons) ? rawData.reasons.filter((r) => typeof r === 'string' && r.trim().length > 0) : [],
    recommendation: typeof rawData.recommendation === 'string' && rawData.recommendation.trim().length > 0
      ? rawData.recommendation
      : 'Verify any unexpected request through verified campus channels before taking action.',
  };
}

/**
 * Sends a conversational query to the CampusShield LLM assistant (Grok).
 *
 * @param {string} message User's cybersecurity question or message
 * @returns {Promise<{response: string}>} Assistant response text
 */
export async function sendChatMessage(message, imageFile = null, history = []) {
  const trimmed = typeof message === 'string' ? message.trim() : '';
  if (!trimmed && !imageFile) {
    throw new ApiError('Message cannot be empty.', 'Please enter a cybersecurity question or attach an image.', 400);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  let response;
  try {
    if (imageFile) {
      const formData = new FormData();
      formData.append('message', trimmed);
      formData.append('image', imageFile);
      if (Array.isArray(history) && history.length > 0) {
        formData.append('history', JSON.stringify(history));
      }

      response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
        body: formData,
      });
    } else {
      response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          message: trimmed,
          history: Array.isArray(history) ? history : [],
        }),
      });
    }
  } catch (networkError) {
    clearTimeout(timeoutId);
    if (networkError.name === 'AbortError') {
      throw new ApiError(
        'CampusShield assistant took too long to respond. Please try again.',
        'Request timed out after 60 seconds.',
        'TIMEOUT'
      );
    }
    throw new ApiError(
      'CampusShield assistant is currently unreachable.',
      `Ensure FastAPI backend is running at ${API_BASE_URL}.`,
      'NETWORK_ERROR'
    );
  }

  clearTimeout(timeoutId);

  if (!response.ok) {
    const status = response.status;
    let detail = '';
    try {
      const errJson = await response.json();
      detail = errJson?.detail || '';
    } catch {
      // ignore JSON parse error on non-ok status
    }

    if (status === 400) {
      throw new ApiError(detail || 'Invalid message content.', '', 400);
    }
    if (status === 503) {
      throw new ApiError(
        detail || 'The campus cybersecurity assistant is temporarily busy. Please try again.',
        'High demand or temporary server limitation.',
        503
      );
    }
    if (status === 500) {
      throw new ApiError(
        detail || 'CampusShield encountered an internal error while processing your request.',
        '',
        500
      );
    }
    throw new ApiError(detail || `Server returned error status ${status}.`, '', status);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new ApiError('Unexpected response format from CampusShield assistant.', '', 'INVALID_JSON');
  }

  if (!data || typeof data.response !== 'string') {
    throw new ApiError('Incomplete response received from assistant.', '', 'MALFORMED_RESPONSE');
  }

  return { response: data.response };
}

export { API_BASE_URL };
