import assert from 'node:assert/strict';
import test from 'node:test';
import { bufferedBoundaryTarget } from './media-gap';

const parts = [{start:3300,end:3602},{start:3602,end:3902}];
test('bridges the observed 427ms hole at the one-hour part boundary', () => {
  assert.equal(bufferedBoundaryTarget(parts, [[3600.799333,3601.567333],[3601.994334,3652.008]],3601.520045),3601.995334);
});
test('does not jump over footage before the boundary or while downloading', () => {
  assert.equal(bufferedBoundaryTarget(parts, [[3300,3601.567333]],3601.52),null);
  assert.equal(bufferedBoundaryTarget(parts, [[3300,3601.567333],[3601.994334,3652]],3600),null);
  assert.equal(bufferedBoundaryTarget(parts, [[3300,3601.567333],[3601.994334,3652]],3602),null);
});
test('does not skip arbitrary holes inside a file or large gaps', () => {
  assert.equal(bufferedBoundaryTarget(parts, [[3300,3501.5],[3501.99,3550]],3501.5),null);
  assert.equal(bufferedBoundaryTarget(parts, [[3300,3600],[3602,3652]],3600),null);
  assert.equal(bufferedBoundaryTarget(parts, [[3300,3601.5],[3602,3602.05]],3601.5),null);
});
test('keeps explicit missing recording intervals separate from rounding gaps', () => {
  assert.equal(bufferedBoundaryTarget([{start:3300,end:3600},{start:3602,end:3902}],[[3300,3601.5],[3602,3652]],3601.5),null);
});
