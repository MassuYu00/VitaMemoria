import test from 'node:test';
import assert from 'node:assert/strict';
import { withTimeout } from '../lib/async/withTimeout.ts';

test('rejects when an operation takes longer than the timeout', async () => {
  await assert.rejects(
    withTimeout(
      new Promise((resolve) => setTimeout(() => resolve('late'), 50)),
      { timeoutMs: 5, message: 'Timed out while generating plans' }
    ),
    /Timed out while generating plans/
  );
});

test('resolves when an operation completes before the timeout', async () => {
  const result = await withTimeout(Promise.resolve('done'), {
    timeoutMs: 50,
    message: 'Timed out',
  });

  assert.equal(result, 'done');
});
