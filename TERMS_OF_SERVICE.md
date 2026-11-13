# Votexa Platform Terms of Service

**Last Updated:** November 13, 2026  
**Effective Date:** November 13, 2026  

Welcome to **Votexa** ("Votexa", "we", "us", or "our"). Votexa is an enterprise multi-tenant electronic voting and audience engagement Software-as-a-Service (SaaS) platform accessible via [https://votexa-nu.vercel.app](https://votexa-nu.vercel.app) and associated application programming interfaces (APIs).

Please read these Terms of Service ("Terms") carefully. By creating an account, accessing, browsing, creating an election workspace, casting a ballot, or purchasing voting credits on Votexa, you agree to be bound by these Terms and our [Privacy Policy](file:///C:/My%20Web%20Sites/Votexa/PRIVACY_POLICY.md). If you do not agree to these Terms, you must not use or access the Votexa platform.

---

## 1. Eligibility & Account Registration

1. **Age Requirement:** You must be at least 18 years of age, or the legal age of majority in your jurisdiction, to create an organizer account or authorize financial transactions on Votexa.
2. **Account Accuracy:** You agree to provide true, accurate, current, and complete information during registration and to keep this information updated at all times.
3. **Account Security:** You are solely responsible for maintaining the confidentiality of your credentials (including passwords and authentication tokens) and for all activities that occur under your account. You must immediately notify Votexa of any unauthorized use or security compromise.
4. **Organizational Authority:** If you register on behalf of a university, union, corporation, NGO, or media production entity, you represent and warrant that you possess the full legal authority to bind that entity to these Terms.

---

## 2. Platform Architecture & Multi-Tenant Workspaces

1. **Workspace Isolation:** Votexa operates as a multi-tenant platform. Each organization operates within an isolated workspace governed by Role-Based Access Control (Owner, Admin, Member, Auditor).
2. **Organizer Role:** An **Organizer** is an authorized tenant administrator who configures voting workspaces, sets election categories, enrolls voters or sets public rules, registers candidates, and manages treasury withdrawals.
3. **Voter Role:** A **Voter** is an individual eligible to cast a ballot in an election, either through an authorized institutional roll or via public participation rules.

---

## 3. Election Categories & Electoral Rules

Votexa provides distinct election engines. Organizers must select the appropriate category and comply with its specific rules:

### 3.1 Institutional & Governance Elections
* **Purpose:** Student government, trade unions, corporate shareholder votes, and professional associations.
* **One Person, One Vote:** Every eligible voter is strictly restricted to casting exactly one vote per office or question. Duplicate votes are programmatically rejected.
* **No Paid Voting:** Institutional elections are 100% free for voters. Organizers may not charge fees or require payments for casting ballots in institutional elections.
* **Voter Verification:** Organizers may restrict voting to verified email domains (e.g., `@university.edu`) or pre-enrolled voter rolls.

### 3.2 Paid Competitions & Talent Contests
* **Purpose:** Audience-choice competitions, music and arts showcases, entertainment pageants, and creator contests.
* **Multiple Voting:** In paid competitions, voters may cast multiple votes up to the organizer's configured maximum cap (e.g., 50 votes per voter) by purchasing authorized voting packages.
* **Live Tallying:** Results visibility may be set to live real-time tallies or held until the close of voting.

### 3.3 Public Opinion Polls
* **Purpose:** Civic surveys, podcast community topics, and media sentiment polling.
* **Open Participation:** Allows public participation with optional self-registration, rate-limiting, and bot-mitigation safeguards.

---

## 4. Payments, Voting Credits & Financial Terms

### 4.1 Payment Gateway Processing
* Paid voting transactions and package purchases are securely processed through integrated third-party licensed payment service providers, including **Paystack Payments Limited** (for Visa, Mastercard, and bank channels) and **Safaricom M-Pesa** (Daraja STK push and C2B mobile money).
* Votexa does not store or process raw payment card numbers or mobile money security PINs. All payment processing is subject to the respective gateway terms and compliance standards (PCI-DSS Level 1).

### 4.2 Voting Packages & Credit Wallets
* Voting credits purchased for an election are non-refundable, non-transferable between different elections, and possess no monetary cash surrender value once purchased.
* In the event of an unresolvable technical disruption or confirmed fraudulent billing, refund requests must be submitted to Votexa support within fourteen (14) days of the transaction.

### 4.3 Commercial Revenue Sharing
* **Standard Commercial Split:** For paid voting competitions, gross voter payments (after statutory deductions and payment gateway processing levies) are apportioned according to the platform agreement:
  * **60% Organizer Earnings:** Credited to the organizer's verified treasury wallet.
  * **40% Platform Retainage:** Retained by Votexa for infrastructure, security, fraud prevention, and platform maintenance.
* Custom revenue share percentages may be agreed upon in writing between enterprise organizers and Votexa.

### 4.4 Organizer Payouts & Disbursements
* Organizers may request withdrawals from their available earnings balance through the Organizer Treasury dashboard.
* Payouts are disbursed via automated mobile money (M-Pesa B2C) or direct electronic bank transfer.
* **Verification & Anti-Fraud Hold:** Votexa reserves the right to place a temporary administrative hold (up to 72 hours) on pending disbursements to perform anti-fraud verification, ballot integrity review, and compliance auditing.
* Organizers are solely responsible for all applicable national and local taxes arising from their earnings.

---

## 5. Electoral Integrity & Prohibited Conduct

Users, organizers, candidates, and voters must not engage in any of the following prohibited activities:

1. **Botting & Manipulation:** Utilizing automated scripts, headless browsers, artificial intelligence bots, or distributed networks to inflate vote tallies, bypass rate limits, or forge voter tokens.
2. **Credential Buying & Selling:** Purchasing, selling, or coercively acquiring voter credentials, student ID numbers, or single-use authorization links.
3. **Illegal Lotteries & Gambling:** Using paid competitions as an unlicensed lottery, raffle, or form of gambling under applicable national laws (e.g., Betting, Lotteries and Gaming Act of Kenya).
4. **Infringing & Defamatory Content:** Publishing candidate profiles, manifesto videos, or logos that infringe upon third-party intellectual property rights, or that contain hate speech, defamation, obscenity, or incitement to violence.
5. **System Interference:** Attempting to reverse engineer, decompile, probe, penetrate, or compromise Votexa's cryptographic validation, API endpoints, or database infrastructure.

**Enforcement:** Votexa reserves the right to immediately freeze elections, disqualify tainted votes, suspend organizer workspaces, or terminate accounts found in violation of this section, without prior notice or liability.

---

## 6. Ballot Confidentiality & Secret Ballot Guarantee

1. **Separation of Identity and Ballot:** Votexa adheres to the fundamental principle of the secret ballot. When an authorized voter casts a vote, the cryptographic verification token decouples voter identity from the selected candidate or choice.
2. **Receipt Verification:** Voters are issued a cryptographic receipt code upon ballot submission. This receipt code permits the voter to verify that their ballot was included in the election tally without exposing who they voted for to any organizer, employer, or third party.

---

## 7. Intellectual Property

1. **Votexa Property:** All software, algorithms, user interfaces, branding, trademarks, logos, and cryptographic voting architecture comprising the Votexa platform are the exclusive property of Votexa Inc. and its licensors.
2. **User & Organizer Content:** You retain ownership of all contest materials, candidate descriptions, photographs, and logos uploaded to your election workspace. You grant Votexa a worldwide, non-exclusive, royalty-free license to host, display, and transmit such content solely for operating the election.

---

## 8. Warranties & Disclaimers

1. **"As-Is" Service:** Votexa is provided on an "AS IS" and "AS AVAILABLE" basis. To the maximum extent permitted by applicable law, Votexa expressly disclaims all warranties of any kind, whether express, implied, or statutory, including warranties of merchantability, fitness for a particular purpose, and non-infringement.
2. **Third-Party Telecommunications:** Votexa is not liable for network latency, telecommunication failures, SMS delivery delays, or payment gateway downtime outside its direct operational control.

---

## 9. Limitation of Liability

To the maximum extent permitted by applicable law:
1. In no event shall Votexa, its directors, employees, partners, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, goodwill, or business interruption.
2. Votexa's total aggregate liability arising out of or relating to these Terms or your use of the platform shall not exceed the greater of: (a) the total platform fees collected by Votexa from your account in the three (3) months preceding the incident; or (b) KES 10,000 (ten thousand Kenyan Shillings).

---

## 10. Indemnification

You agree to defend, indemnify, and hold harmless Votexa, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable legal fees) arising from:
1. Your violation of these Terms or any applicable electoral or financial laws;
2. Candidate disputes or contest outcome challenges instituted by your voters or candidates;
3. Any content uploaded to your organization workspace.

---

## 11. Termination

1. **Termination by User:** You may delete your account at any time via Workspace Settings > Delete Account, provided you have no active elections or pending payout balances.
2. **Termination by Votexa:** We may terminate or suspend your access immediately if you breach these Terms, commit fraud, or fail compliance reviews.
3. **Surviving Provisions:** Sections 4.3, 4.4, 7, 8, 9, 10, 12, and 13 shall survive termination of these Terms.

---

## 12. Governing Law & Dispute Resolution

1. **Jurisdiction:** These Terms shall be governed by and construed in accordance with the laws of the Republic of Kenya, without regard to its conflict of law provisions.
2. **Amicable Settlement:** In the event of any dispute, controversy, or claim, the parties agree to first attempt resolution through good-faith mutual negotiations for a period of thirty (30) days.
3. **Arbitration:** Any dispute unresolved through negotiation shall be submitted to binding arbitration under the Rules of the Nairobi Centre for International Arbitration (NCIA). The seat of arbitration shall be Nairobi, Kenya, and proceedings shall be conducted in English.

---

## 13. Modifications to Terms

Votexa reserves the right to modify these Terms at any time. When modifications are made, we will update the "Last Updated" date at the top of this document and notify active organizers via email or dashboard notification. Continued use of Votexa following the posting of revised Terms constitutes your acceptance of the changes.

---

## 14. Contact Us

If you have questions, feedback, or legal notices regarding these Terms of Service, please contact our Legal & Compliance Team:

* **Email:** [legal@votexa.io](mailto:legal@votexa.io) / [support@votexa.io](mailto:support@votexa.io)
* **Website:** [https://votexa-nu.vercel.app](https://votexa-nu.vercel.app)
* **Headquarters:** Votexa Inc., Nairobi, Kenya
