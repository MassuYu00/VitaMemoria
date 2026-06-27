import test from 'node:test';
import assert from 'node:assert/strict';
import { isGeminiNetworkError, isGeminiQuotaError, isGeminiTimeoutError } from '../lib/gemini/errors.ts';

test('detects Gemini quota errors from SDK messages', () => {
  const error = new Error(
    '[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent: [429 Too Many Requests] You exceeded your current quota'
  );

  assert.equal(isGeminiQuotaError(error), true);
});

test('detects Gemini quota errors from status fields', () => {
  const error = {
    status: 429,
    statusText: 'Too Many Requests',
  };

  assert.equal(isGeminiQuotaError(error), true);
});

test('does not treat unrelated errors as quota errors', () => {
  const error = new Error('Invalid JSON response');

  assert.equal(isGeminiQuotaError(error), false);
});

test('detects Gemini timeout errors', () => {
  const error = new Error('Gemini API search request timed out');

  assert.equal(isGeminiTimeoutError(error), true);
});

test('detects Gemini network errors', () => {
  const error = new Error(
    '[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent: fetch failed'
  );

  assert.equal(isGeminiNetworkError(error), true);
});
