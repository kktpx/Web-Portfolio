import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateResumeFile, formatBytes, MAX_RESUME_BYTES } from '../src/services/resumeFile.js';

const file = (name, type, size) => ({ name, type, size });

test('validateResumeFile accepts a PDF by MIME type or extension', () => {
  assert.equal(validateResumeFile(file('cv.pdf', 'application/pdf', 1000)), null);
  assert.equal(validateResumeFile(file('CV.PDF', '', 1000)), null);
});

test('validateResumeFile rejects missing, non-PDF, empty and oversized files', () => {
  assert.equal(validateResumeFile(null), 'No file selected');
  assert.equal(validateResumeFile(file('cv.docx', 'application/msword', 1000)), 'Only PDF files are allowed');
  assert.equal(validateResumeFile(file('cv.png', 'image/png', 1000)), 'Only PDF files are allowed');
  assert.equal(validateResumeFile(file('cv.pdf', 'application/pdf', 0)), 'File is empty');
  assert.equal(validateResumeFile(file('cv.pdf', 'application/pdf', MAX_RESUME_BYTES + 1)), 'File is larger than 5 MB');
});

test('validateResumeFile allows exactly the size limit', () => {
  assert.equal(validateResumeFile(file('cv.pdf', 'application/pdf', MAX_RESUME_BYTES)), null);
});

test('formatBytes renders KB below 1 MB and MB above', () => {
  assert.equal(formatBytes(200), '1 KB');
  assert.equal(formatBytes(150 * 1024), '150 KB');
  assert.equal(formatBytes(2.5 * 1024 * 1024), '2.50 MB');
  for (const v of [0, -1, NaN, undefined]) assert.equal(formatBytes(v), '0 KB');
});
