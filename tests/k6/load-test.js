import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom Metrics
const voteFailures = new Rate('failed_votes');
const voteSuccessCount = new Counter('successful_votes');
const voteDuration = new Trend('vote_submission_duration');

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp up to 50 concurrent voters
    { duration: '1m',  target: 150 },  // Sustained load at 150 concurrent voters
    { duration: '30s', target: 300 },  // Peak traffic burst up to 300 voters
    { duration: '30s', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<250', 'p(99)<500'], // 95% of requests under 250ms
    failed_votes: ['rate<0.01'],                    // Less than 1% failure rate
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:5000/api/v1';
const ORG_ID = __ENV.TEST_ORG_ID || 'org-metro-uni';
const ELECTION_ID = __ENV.TEST_ELECTION_ID || 'elec-inst-1';

export default function () {
  const voterIndex = __VU * 1000 + __ITER;
  const voterCode = `VTR-K6-${voterIndex}`;

  const headers = {
    'Content-Type': 'application/json',
    'x-organization-id': ORG_ID,
  };

  // 1. Check Voter Eligibility
  const eligibilityRes = http.get(
    `${BASE_URL}/elections/${ELECTION_ID}/voters/verify?voterCode=${voterCode}`,
    { headers }
  );

  check(eligibilityRes, {
    'eligibility status is 200 or 404': (r) => r.status === 200 || r.status === 404,
  });

  // 2. Submit Ballot
  const startTime = Date.now();
  const payload = JSON.stringify({
    electionId: ELECTION_ID,
    voterCode: voterCode,
    selections: [
      {
        positionId: 'pos-inst-1',
        candidateId: 'cand-inst-1',
      },
    ],
  });

  const voteRes = http.post(`${BASE_URL}/voting/submit`, payload, { headers });
  const latency = Date.now() - startTime;
  voteDuration.add(latency);

  const success = check(voteRes, {
    'vote response is 200 or handled duplicate (409/400)': (r) =>
      r.status === 200 || r.status === 409 || r.status === 400,
  });

  if (voteRes.status === 200) {
    voteSuccessCount.add(1);
    voteFailures.add(0);
  } else if (voteRes.status >= 500) {
    voteFailures.add(1);
  }

  // 3. Poll Real-time Tallies (simulating dashboard watcher)
  if (__ITER % 5 === 0) {
    const tallyRes = http.get(`${BASE_URL}/elections/${ELECTION_ID}/tallies`, { headers });
    check(tallyRes, {
      'tally status is 200': (r) => r.status === 200,
    });
  }

  sleep(0.5); // 500ms pacing between voter interactions
}

