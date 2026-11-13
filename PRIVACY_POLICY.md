# Votexa Platform Privacy Policy

**Last Updated:** November 13, 2026  
**Effective Date:** November 13, 2026  

At **Votexa** ("Votexa", "we", "our", or "us"), we believe that privacy is a fundamental human right, and electoral confidentiality is essential to genuine democratic expression and fair competition.

This Privacy Policy explains how Votexa collects, processes, stores, and protects personal data when you visit our website ([https://votexa-nu.vercel.app](https://votexa-nu.vercel.app)), create an organization workspace, manage an election, or cast a ballot as a voter.

This Privacy Policy complies with the **Kenya Data Protection Act, 2019 (KDPA)**, the **General Data Protection Regulation (GDPR - EU/UK)**, and international privacy standards.

---

## 1. The Fundamental Principle: Cryptographic Secret Ballot

The core of Votexa's architecture is the **Secret Ballot Guarantee**:

1. **Decoupled Identity:** When you participate in an election on Votexa, your identity (such as your name, student ID, email address, or phone number) is used **only** to authenticate that you are eligible to cast a ballot and to verify that you have not already voted.
2. **One-Time Authorization Token:** Upon verification, Votexa issues a cryptographically randomized, single-use authorization token.
3. **Anonymous Ballot Submission:** When your vote is submitted, it is accompanied **only** by the one-time token. Your candidate or choice selection is recorded in an encrypted election tally with **zero permanent linkage** to your personal identifier, email, IP address, or payment profile.
4. **Receipt Verification Without Exposure:** You receive a tamper-evident receipt code. This allows you to verify that your ballot is included in the final verified count, without exposing your candidate choice to the organizer, your institution, or third parties.

---

## 2. Personal Information We Collect

### 2.1 Information Collected from Organizers & Administrators
* **Registration Details:** Full name, business email address, account password (cryptographically hashed), and workspace name.
* **Organization Profile:** Organization title, industry, logo URL, contact email, and primary operational timezone.
* **Treasury & Payout Details:** Mobile money disbursement phone number (M-Pesa) or official commercial bank account details (bank name, account title, account number) required to disburse contest revenue.
* **Audit Logs:** Timestamps and action logs of administrative operations (such as opening polls, modifying candidate details, or approving withdrawals) required for governance compliance.

### 2.2 Information Collected from Candidates
* **Profile Information:** Full name, biographical summary, manifesto, position sought, and optional candidate photograph.

### 2.3 Information Collected from Voters
* **Institutional Verification:** Email address (e.g., student or corporate domain), phone number, or voter roll identifier uploaded by the organizer for voter roll verification.
* **Participation State:** A boolean status flag (`hasVoted = true`) associated with the voter code to prevent double-voting. **Your actual ballot selections are stored separately from this flag.**
* **Device & Security Telemetry:** IP address, browser type, and timestamp used during the authorization request solely for bot mitigation, DDOS protection, and rate limiting.

### 2.4 Information Collected for Paid Voting & Packages
* **Transactions:** Amount, transaction currency (KES or USD), payment gateway reference, payment timestamp, and transaction status.
* **Third-Party Gateways:** Payments are processed directly by licensed financial service providers (**Paystack Payments Limited** and **Safaricom M-Pesa**). Votexa **never** collects, sees, or stores your credit card CVV/CVC, full 16-digit card number, or M-Pesa personal PIN.

---

## 3. Lawful Bases for Processing (KDPA & GDPR)

We only collect and process personal data when we have a valid legal basis:

1. **Performance of a Contract:** Processing necessary to operate the Votexa service, authenticate accounts, verify ballots, and disburse contest earnings.
2. **Consent:** When you explicitly choose to participate in a public poll, register as a candidate, or sign up for platform communications.
3. **Legal & Regulatory Compliance:** Processing necessary to comply with financial reporting, anti-money laundering (AML), and tax requirements.
4. **Legitimate Interests:** Operating secure systems, mitigating bot fraud, ensuring electoral integrity, and defending against unauthorized tampering.

---

## 4. How We Use Your Information

We process personal data strictly for the following purposes:
* **Operating Voting Workspaces:** Enabling organizers to schedule contests, enroll eligible rolls, and tabulate results.
* **Voter Eligibility Verification:** Validating institutional credentials and preventing duplicate votes.
* **Financial Accounting & Disbursements:** Crediting organizer treasury wallets, deducting gateway fees, executing automated M-Pesa B2C payouts, and maintaining ledger accuracy.
* **Security & Threat Mitigation:** Detecting malicious botting, credential-stuffing attacks, and system tampering.
* **Customer Support & Service Notices:** Sending important security alerts, payout confirmations, and system notifications.

**We never sell, rent, or monetize your personal data or voter records to advertisers or third-party data brokers.**

---

## 5. Information Sharing & Third-Party Disclosures

We only disclose information to trusted third-party service providers who adhere to strict data protection standards:

* **Payment Processors:** Safaricom PLC (M-Pesa API) and Paystack Payments Limited for processing voter payments and organizer disbursements.
* **Infrastructure & Database Hosting:** Vercel Inc. (serverless edge hosting) and Supabase / AWS (database infrastructure with encryption at rest).
* **Legal Authorities:** When required by enforceable court order, subpoena, or statutory mandate under the laws of the Republic of Kenya or other competent jurisdiction.

---

## 6. Data Security & Storage

1. **Encryption Standards:** All data in transit between your browser and Votexa servers is protected using **TLS 1.3** encryption. All stored database records and credentials are encrypted at rest using **AES-256**.
2. **Password Security:** User passwords are encrypted using one-way cryptographic hashing (HMAC-SHA256 with platform secrets); passwords cannot be read by Votexa personnel.
3. **Access Controls:** Only authorized technical personnel bound by non-disclosure agreements may access database systems, solely for maintenance and system recovery.

---

## 7. Data Retention & Erasure

* **Active Accounts:** Organizer and user account details are retained for as long as your account remains active.
* **Account Deletion:** You may delete your account at any time via **Settings > Workspace Settings > Delete Account**. Upon confirmation, all personal profiles and user associations are permanently deleted from the database.
* **Electoral Audit Logs:** Summarized election tallies, timestamps, and cryptographic receipt hashes are maintained in verified audit records to protect the historical integrity of contested elections, in accordance with applicable statutory limitation periods.
* **Financial Records:** Transaction and disbursement logs are retained for seven (7) years to comply with statutory accounting and tax regulations.

---

## 8. Your Data Protection Rights

Under the Kenya Data Protection Act, 2019 and the GDPR, you have the following rights:

1. **Right of Access:** You have the right to request a copy of the personal information Votexa holds about you.
2. **Right to Rectification:** You have the right to request correction of inaccurate, incomplete, or outdated information.
3. **Right to Erasure ("Right to Be Forgotten"):** You have the right to request deletion of your account and personal identifiers, subject to statutory legal and accounting retention duties.
4. **Right to Object or Restrict:** You may object to or restrict processing of your personal data under certain conditions.
5. **Right to Data Portability:** Organizers may export their election results, candidate registries, and audit reports in standard RFC 4180 CSV or JSON formats.
6. **Right to Withdraw Consent:** Where processing is based on consent, you may withdraw your consent at any time without affecting the lawfulness of processing prior to withdrawal.

To exercise any of these rights, please contact our Data Protection Team at [privacy@votexa.io](mailto:privacy@votexa.io).

---

## 9. Cookies & Local Storage

Votexa uses browser local storage and essential cookies strictly to:
* Maintain your authenticated session token (`votexa_auth_token`);
* Preserve your selected workspace identifier (`votexa_active_org_id`);
* Remember your UI theme preferences (dark/light mode).

We do not use tracking cookies, third-party analytics pixels, or cross-site tracking scripts.

---

## 10. Children's Privacy

Votexa is designed for organizations, institutions, and adult audiences. We do not knowingly collect personal data from children under the age of 16 without verified parental or institutional consent. If you believe a child has provided us with personal data, please contact us immediately for prompt deletion.

---

## 11. International Data Transfers

When data is transferred across borders (for example, between cloud hosting regions in Europe and East Africa), Votexa ensures that such transfers comply with applicable data protection legislation through the use of Standard Contractual Clauses (SCCs) and high-assurance encryption.

---

## 12. Updates to this Privacy Policy

We may update this Privacy Policy from time to time to reflect technological advancements, operational changes, or statutory amendments. When changes occur, the "Last Updated" date at the top of this document will be revised. Significant modifications will be accompanied by an in-app notice or email notification.

---

## 13. Contact Our Data Protection Office

If you have questions, concerns, or requests regarding this Privacy Policy or Votexa’s data handling practices, please contact us:

* **Data Protection Officer (DPO):** [privacy@votexa.io](mailto:privacy@votexa.io)
* **General Support:** [support@votexa.io](mailto:support@votexa.io)
* **Website:** [https://votexa-nu.vercel.app](https://votexa-nu.vercel.app)
* **Office Address:** Votexa Inc., Data Protection Office, Nairobi, Kenya
