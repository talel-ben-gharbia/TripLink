# TripLink — Agent System Foundations

**Document Version:** 1.0  
**Phase:** 0 — Foundation  
**Status:** ✅ Complete  
**Last Updated:** 2026-01-04

---

## PURPOSE

This document defines the **rules and foundations** for the Agent system in TripLink. This is **NOT implementation** — it is the contract that all future agent features must follow.

**Why This Exists:**

- Prevents refactors later
- Ensures consistency
- Documents governance rules
- Enables Phase 3 implementation

---

## 0.5 AGENT SYSTEM FOUNDATIONS

### 0.5.1 Agent Entry Rules

**MANDATORY RULES (Non-Negotiable):**

1. ✅ **Agents must apply** — Cannot self-assign agent role
2. ✅ **Agents cannot be created during signup** — Separate application flow required
3. ✅ **Admin approval is mandatory** — No automatic agent creation
4. ✅ **Approval is revocable** — Agent status can be suspended/revoked
5. ✅ **Existing users can apply later** — Not signup-only; users can apply after registration

**Why:**

- Professional platforms do not auto-create agents
- Legal & quality control requirement
- Explicitly implied in cahier des charges ("professionnels vérifiés")
- Prevents privilege escalation

**Reference:**
- [B2B Onboarding Best Practices — Intercom](https://www.intercom.com/blog/customer-onboarding-best-practices/)

**Industry Insight:**
> "Professional role onboarding must be explicit, gated, and reversible." — Intercom Product Research

---

### 0.5.2 Agent Lifecycle States

**Required States (State Machine):**

| State | Description | Who Can Set | Transitions From | Transitions To |
|-------|-------------|-------------|------------------|----------------|
| **Draft** | User started application but not submitted | User | (initial) | Submitted |
| **Submitted** | Application sent for review | User | Draft | Under Review |
| **Under Review** | Admin is reviewing | System (auto) | Submitted | Approved / Rejected |
| **Approved** | Agent role activated | Admin | Under Review | Active (Agent) / Revoked |
| **Rejected** | Application denied | Admin | Under Review | (final) / Draft (re-apply) |
| **Suspended** | Agent temporarily disabled | Admin | Approved | Active / Revoked |
| **Revoked** | Agent status removed post-approval | Admin | Approved / Suspended | (final) / Draft (re-apply) |

**State Transition Rules:**

```
Draft → Submitted (user action: submit application)
Submitted → Under Review (automatic: system assigns to admin queue)
Under Review → Approved (admin action: approve application)
Under Review → Rejected (admin action: reject application)
Approved → Active (automatic: role upgrade)
Approved → Suspended (admin action: suspend agent)
Approved → Revoked (admin action: revoke agent status)
Suspended → Active (admin action: reactivate)
Suspended → Revoked (admin action: revoke)
Rejected → Draft (user action: re-apply)
Revoked → Draft (user action: re-apply)
```

**Why:**

- Transparency — Users know application status
- Legal traceability — All state changes are audited
- Admin accountability — Clear approval workflow
- Prevents undefined states — No ambiguous agent status

---

### 0.5.3 Agent Application Data Requirements

**Required Fields (To Be Collected in Phase 3):**

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| **Legal Entity Name** | String | ✅ Yes | Company/agency name |
| **Business Registration** | String | ✅ Yes | Registration number or equivalent |
| **Country of Operation** | String | ✅ Yes | Primary operating country |
| **Contact Person** | String | ✅ Yes | Primary contact name |
| **Experience Summary** | Text | ✅ Yes | Professional background |
| **Specialization Tags** | Array | ✅ Yes | Regions, travel types |
| **Supporting Documents** | Metadata | ⚠️ Optional | Documents (metadata only if storage limited) |

**Why:**

- Required for verification
- Required for routing logic (specialization matching)
- Required for platform trust
- Legal compliance (business registration)

---

### 0.5.4 Agent Role Assignment Rules

**On Approval:**

1. ✅ User role upgraded → `ROLE_AGENT` added (user retains `ROLE_USER`)
2. ✅ Agent dashboard unlocked (UI shows agent tools)
3. ✅ Agent permissions activated (can create packages, view assigned travelers)
4. ✅ Notification sent to applicant (approved / rejected)
5. ✅ Application state → `Approved`
6. ✅ Agent status → `Active`

**On Suspension:**

1. ✅ Agent permissions revoked (cannot create packages, cannot access dashboard)
2. ✅ Active work frozen (packages hidden, bookings paused)
3. ✅ Data preserved (no deletion)
4. ✅ Notification sent to agent
5. ✅ Agent status → `Suspended`

**On Revocation:**

1. ✅ `ROLE_AGENT` removed (user reverts to `ROLE_USER`)
2. ✅ Agent dashboard locked
3. ✅ All permissions revoked
4. ✅ Active packages archived (not deleted)
5. ✅ Assigned travelers notified (reassignment logic)
6. ✅ Agent status → `Revoked`
7. ✅ User can re-apply (cooldown period may apply)

**Why:**

- Clean role boundary — No privilege leaks
- Prevents security issues — Role changes are explicit
- Ensures security consistency — No ambiguous permissions
- Data preservation — No data loss on role changes

---

### 0.5.5 Agent Re-Application & Appeals

**Re-Application Rules:**

- ✅ Users can re-apply after rejection
- ✅ Users can re-apply after revocation
- ⚠️ Cooldown period (to be defined in Phase 3)
- ✅ Admin override allowed (admin can bypass cooldown)

**Appeal Process:**

- ✅ Users can request appeal after rejection
- ✅ Admin can review appeals
- ✅ Appeal notes stored in application history

**Why:**

- Professional fairness — Users deserve second chance
- Reduces admin support burden — Clear process
- Legal protection — Appeals are standard practice

---

## 0.5.6 Agent Accountability & Quality Signals

**Required Signals (To Be Implemented in Phase 3):**

| Signal | Description | Visibility |
|--------|-------------|------------|
| **Verification Badge** | Platform-verified agent | Public |
| **Years of Experience** | Experience indicator | Public |
| **Specialization Tags** | Areas of expertise | Public |
| **Response Time** | Average response time | Public (later phase) |
| **Rating** | User ratings (if implemented) | Public (later phase) |

**Why:**

- User trust — Users need to know who they're dealing with
- Platform credibility — Verified agents build platform reputation
- Professional differentiation — Agents can showcase expertise

---

## 0.5.7 Agent Compliance & Traceability

**Required Logging (To Be Implemented in Phase 3):**

| Action | Logged By | Retention |
|--------|-----------|-----------|
| **Messages** | System | 1 year |
| **Package Edits** | System | Indefinite |
| **Booking Changes** | System | 7 years |
| **Commission Adjustments** | System | 7 years |
| **Role Transitions** | System | Indefinite |

**Audit Trail Requirements:**

- ✅ All agent actions must be logged
- ✅ Admin can view agent audit trail
- ✅ Agent can view own action history
- ✅ Dispute resolution uses audit logs

**Why:**

- Legal protection — Dispute resolution requires logs
- Quality enforcement — Monitor agent behavior
- Compliance — Required for professional platforms

---

## 0.5.8 Agent Deactivation & Exit Flow

**On Agent Removal (Revocation/Suspension):**

1. ✅ **Reassignment of Active Travelers**
   - Travelers assigned to agent are notified
   - Admin can reassign to another agent
   - Traveler can choose new agent (if multiple available)

2. ✅ **Freeze of Active Offers**
   - Active packages are hidden (not deleted)
   - Bookings in progress are paused
   - Admin can complete or cancel bookings

3. ✅ **Historical Data Preservation**
   - All agent data is preserved
   - Packages are archived (read-only)
   - Booking history remains intact

4. ✅ **Notification to Affected Parties**
   - Agent is notified
   - Assigned travelers are notified
   - Admin is notified

**Why:**

- Prevents data loss — No deletion of valuable data
- Ensures service continuity — Travelers are not abandoned
- Legal compliance — Historical data must be preserved

---

## IMPLEMENTATION NOTES

**Phase 3 Implementation Must:**

1. ✅ Enforce all rules defined in this document
2. ✅ Implement state machine as defined
3. ✅ Log all role transitions
4. ✅ Preserve data on role changes
5. ✅ Notify affected parties on status changes

**This Document Is:**

- ✅ A contract for Phase 3 implementation
- ✅ A reference for permission checks
- ✅ A guide for state management
- ✅ A foundation for agent governance

**This Document Is NOT:**

- ❌ Implementation code
- ❌ UI designs
- ❌ API specifications
- ❌ Database schemas

---

## DOCUMENT APPROVAL

**Phase 0 Agent Foundations Status:** ✅ Complete

**Next Phase:** Phase 3 — Professional & Agent Ecosystem

**This document must be referenced before implementing any agent feature.**

---

**Reference:**
- [B2B Onboarding Best Practices — Intercom](https://www.intercom.com/blog/customer-onboarding-best-practices/)
- [Platform Governance — Harvard Business Review](https://hbr.org/2016/04/the-ethics-of-digital-platforms)

