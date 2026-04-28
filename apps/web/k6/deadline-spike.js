/**
 * k6 Load Test per Phase 15.
 * Simulate 500 concurrent submissions at a deadline spike.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp up
    { duration: '1m', target: 500 },    // Deadline spike
    { duration: '30s', target: 500 },   // Sustain
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95th percentile under 5s
    http_req_failed: ['rate<0.01'],    // Less than 1% failure
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Health check
  const healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, { 'health check OK': (r) => r.status === 200 });

  // Simulate submission upload
  const submitRes = http.post(
    `${BASE_URL}/api/trpc/submission.submit`,
    JSON.stringify({
      assignmentId: 'test-assignment',
      files: [{ name: 'submission.pdf', size: 1024 }],
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(submitRes, { 'submission accepted': (r) => r.status < 500 });

  sleep(1);
}
