import { parentPort, workerData } from 'node:worker_threads';
import { fingerprint, matchFingerprints } from './audio-fingerprint';

if (parentPort && workerData) {
  const reference = fingerprint(new Float32Array(workerData.reference));
  const candidate = fingerprint(new Float32Array(workerData.candidate));
  parentPort.postMessage(matchFingerprints(reference, candidate));
}
