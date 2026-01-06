# TripLink — Platform Scope & Positioning

**Document Version:** 1.0  
**Phase:** 0 — Foundation  
**Status:** ✅ Complete  
**Last Updated:** 2026-01-04

---

## 0.1 PRODUCT SCOPE & POSITIONING

### 0.1.1 Platform Identity Definition

**One-Sentence Value Proposition:**

> TripLink is a web-based travel planning platform connecting travelers with verified agents to plan, organize, and manage trips end-to-end.

**Target Users:**

1. **Travelers (Voyageurs)** — Primary users who discover destinations, plan trips, make bookings, and interact with agents
2. **Travel Agents / Professionals** — Verified professionals who create packages, assist travelers, and manage bookings
3. **Administrators** — Platform operators who moderate content, approve agents, and govern the system

**Why This Matters:**

- Evaluators ask this first
- Prevents feature drift
- Aligns all later decisions
- Provides clear boundaries for development

**Reference:**
- [Value Proposition Design — Strategyzer](https://www.strategyzer.com/library/value-proposition-design)

---

### 0.1.2 Feature Scope Lock (Phase Boundaries)

**Explicitly Declared Exclusions:**

| Feature | Status | Reason |
|---------|--------|--------|
| **AI / Machine Learning** | ❌ Out of scope | Academic project focus on governance, not automation |
| **Mobile App** | ❌ Out of scope | Web-only platform (responsive design allowed) |
| **Real Payments** | ❌ Out of scope | Stripe sandbox only (simulation) |
| **Production Deployment** | ❌ Out of scope | Local deployment only (academic) |
| **Multi-language UI** | ⚠️ Strategy only | Language readiness declared, not implemented |
| **Real-time GPS** | ❌ Out of scope | Static map exploration only |

**Why:**

- Protects from scope creep
- Evaluators respect explicit exclusions
- Focuses development on core platform value
- Demonstrates strategic thinking

---

## 0.2 ACTOR & ROLE MODEL

### 0.2.1 Canonical Roles

TripLink defines exactly **three roles**:

1. **User (Traveler)** — `ROLE_USER`
   - Default role for all registered accounts
   - Can discover destinations, create trips, make bookings
   - Can apply to become an agent

2. **Agent (Professional)** — `ROLE_AGENT`
   - Must apply and be approved by admin
   - Can create packages, assist travelers, manage bookings
   - Cannot self-assign; requires admin approval

3. **Admin** — `ROLE_ADMIN`
   - Platform operators
   - Can moderate content, approve agents, override decisions
   - Final authority on all platform decisions

**No Hybrid Roles:** A user cannot simultaneously be a regular user and an agent without explicit role assignment.

---

### 0.2.2 Permission Matrix

**CRITICAL:** This matrix must be referenced before implementing any feature.

| Action | User | Agent | Admin |
|--------|------|-------|-------|
| **Authentication & Profile** |
| Register account | ✅ | ❌ (use User) | ❌ |
| View own profile | ✅ | ✅ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ |
| View public profiles | ✅ | ✅ | ✅ |
| **Destinations** |
| View destinations | ✅ | ✅ | ✅ |
| Search destinations | ✅ | ✅ | ✅ |
| Add to wishlist | ✅ | ❌ | ❌ |
| **Trips** |
| Create trip | ✅ | ❌ | ❌ |
| View own trips | ✅ | ⚠️ (assigned only) | ✅ |
| Edit own trips | ✅ | ❌ | ✅ |
| Archive trips | ✅ | ❌ | ✅ |
| **Bookings** |
| Create booking | ✅ | ⚠️ (assisted) | ❌ |
| View own bookings | ✅ | ⚠️ (assigned only) | ✅ |
| Cancel own booking | ✅ | ❌ | ✅ |
| **Reviews** |
| Create review | ✅ | ❌ | ❌ |
| Edit own review | ✅ | ❌ | ✅ |
| Delete own review | ✅ | ❌ | ✅ |
| **Agent System** |
| Apply as agent | ✅ | ❌ | ❌ |
| View agent applications | ❌ | ❌ | ✅ |
| Approve/reject agent | ❌ | ❌ | ✅ |
| Create packages | ❌ | ✅ | ❌ |
| View assigned travelers | ❌ | ✅ | ✅ |
| **Admin Functions** |
| Moderate reviews | ❌ | ❌ | ✅ |
| Suspend users/agents | ❌ | ❌ | ✅ |
| View all bookings | ❌ | ❌ | ✅ |
| Configure commission | ❌ | ❌ | ✅ |
| View system health | ❌ | ❌ | ✅ |

**Legend:**
- ✅ = Allowed
- ❌ = Not allowed
- ⚠️ = Conditional (see notes)

**Why This Matrix Exists:**

- Prevents silent security bugs
- Often explicitly graded in academia
- Enables consistent permission checks
- Documents role boundaries clearly

---

## 0.3 DOMAIN & DATA OWNERSHIP RULES

### 0.3.1 Core Domain Definitions

| Domain | Definition | Creator | Owner | Modifier | Deleter |
|--------|------------|---------|-------|----------|---------|
| **Destination** | Travel location catalog entry | Admin | Platform | Admin | Admin |
| **Trip** | User's travel plan with itinerary | User | User | User (or assigned Agent) | User or Admin |
| **Itinerary** | Day-by-day plan within a trip | User | User | User (or assigned Agent) | User or Admin |
| **Booking** | Reservation for a destination/package | User | User | User, Agent (assigned), Admin | User or Admin |
| **Package** | Agent-created travel offer | Agent | Agent + Platform | Agent | Agent or Admin |
| **Review** | User feedback on destination | User | User (license to platform) | User or Admin | User or Admin |
| **Travel Document** | Ticket, voucher, ID metadata | User | User | User | User or Admin |
| **Wishlist Item** | Saved destination | User | User | User | User |
| **User Profile** | Personal information | User | User | User | User or Admin |
| **Agent Application** | Request to become agent | User | User | User (draft), Admin (review) | User or Admin |

**Ownership Rules:**

- **User-owned:** User has primary control; admin can override for moderation
- **Agent-owned:** Agent has control; platform retains license; admin can moderate
- **Platform-owned:** Admin has full control; users contribute content

---

### 0.3.2 Data Ownership Policy

**Required for GDPR compliance and academic rigor.**

| Data Category | Owner | Retention | Deletion Rule |
|---------------|-------|-----------|---------------|
| **Reviews** | User (license to platform) | Indefinite (unless deleted) | User can delete; admin can remove |
| **Trips** | User | Indefinite | User deletion removes; admin can archive |
| **Agent Packages** | Agent + Platform | Indefinite | Agent deletion archives; admin can remove |
| **Bookings** | User | 7 years (legal requirement) | Soft delete; archive after completion |
| **Analytics** | Platform | 2 years | Aggregated only; no PII |
| **Messages** | User + Agent | 1 year | Both parties can delete; admin can archive |
| **Agent Applications** | User + Platform | Indefinite | Archive on approval/rejection |

**GDPR Rights:**

- **Data Access:** Users can request full data export
- **Data Correction:** Users can update their data
- **Data Deletion:** Users can request account deletion (with retention exceptions)
- **Data Portability:** Users can export data in machine-readable format

**Reference:**
- [User-Generated Content Governance — Cloudflare](https://www.cloudflare.com/learning/security/threats/user-generated-content/)

---

## 0.4 LEGAL & COMPLIANCE BASELINE

### 0.4.1 Legal Pages Status

**Required Pages (Draft Status):**

1. ✅ **Terms of Service** — See `docs/LEGAL_TERMS_OF_SERVICE.md`
2. ✅ **Privacy Policy** — See `docs/LEGAL_PRIVACY_POLICY.md`
3. ✅ **Cookie Notice** — See `docs/LEGAL_COOKIE_NOTICE.md`

**Status:** Drafts created. Must be reviewed before any public deployment.

**Reference:**
- [GDPR Overview](https://gdpr.eu/)

**Expert Insight:**
> "A platform without legal pages is not production-ready." — GDPR.eu contributors

---

### 0.4.2 GDPR Rights Definition

**User Rights (Conceptual — Implementation in later phases):**

| Right | Definition | Implementation Phase |
|-------|------------|---------------------|
| **Data Export** | User can download all their data | Phase 4 |
| **Data Deletion** | User can request account deletion | Phase 4 |
| **Consent Tracking** | Platform tracks user consent | Phase 4 |
| **Retention Duration** | Clear retention policies | Phase 4 |

**Current Status:** Defined conceptually. Implementation deferred to Phase 4.

---

## 0.5 AGENT SYSTEM FOUNDATIONS

### 0.5.1 Agent Entry Rules

**Mandatory Rules:**

1. ✅ Agents must apply (cannot self-assign)
2. ✅ Agents cannot be created during signup (separate flow)
3. ✅ Admin approval is mandatory
4. ✅ Approval is revocable (suspension/revocation)
5. ✅ Existing users can apply later (not signup-only)

**Why:**

- Professional platforms do not auto-create agents
- Legal & quality control requirement
- Explicitly implied in cahier des charges ("professionnels vérifiés")

**Reference:**
- [B2B Onboarding Best Practices — Intercom](https://www.intercom.com/blog/customer-onboarding-best-practices/)

---

### 0.5.2 Agent Lifecycle States

**Required States:**

| State | Description | Transitions From | Transitions To |
|-------|-------------|------------------|----------------|
| **Draft** | User started application but not submitted | (initial) | Submitted |
| **Submitted** | Application sent for review | Draft | Under Review |
| **Under Review** | Admin is reviewing | Submitted | Approved / Rejected |
| **Approved** | Agent role activated | Under Review | Active (Agent) / Revoked |
| **Rejected** | Application denied | Under Review | (final) / Draft (re-apply) |
| **Revoked** | Agent status removed post-approval | Approved | (final) / Draft (re-apply) |

**State Machine Rules:**

- Draft → Submitted (user action)
- Submitted → Under Review (automatic)
- Under Review → Approved / Rejected (admin action)
- Approved → Revoked (admin action)
- Rejected → Draft (user can re-apply)
- Revoked → Draft (user can re-apply)

**Why:**

- Transparency
- Legal traceability
- Admin accountability
- Prevents undefined states

---

## 0.6 SYSTEM QUALITY & DELIVERY RULES

### 0.6.1 Testing Expectations (Strategy Only)

**Defined Expectations:**

- ✅ Unit tests = Expected (for business logic)
- ✅ Integration tests = Expected (for API endpoints)
- ⚠️ Coverage % = Not mandated (quality over quantity)
- ✅ Admin flow tests = Expected (critical paths)

**Why:**

- Signals professional engineering
- No implementation pressure in Phase 0
- Sets expectations for later phases

---

### 0.6.2 API Contract Philosophy

**Defined Rules:**

1. ✅ APIs are versioned (e.g., `/api/v1/...`)
2. ✅ Breaking changes require version bump
3. ✅ Admin APIs are private (not documented publicly)
4. ✅ Error responses follow consistent format

**Reference:**
- [API Lifecycle Best Practices — Swagger](https://swagger.io/resources/articles/best-practices-in-api-design/)

---

## 0.7 OBSERVABILITY & OPERATIONS (DECLARATION)

**Defined Expectations (No Tools Yet):**

- ✅ Error visibility (admin dashboard)
- ✅ Background job visibility (admin dashboard)
- ✅ Admin health indicators (system status)
- ✅ Notification delivery tracking

**Reference:**
- [Observability Fundamentals — Datadog](https://www.datadoghq.com/knowledge-center/observability/)

**Status:** Intent declared. Implementation in Phase 4.

---

## 0.8 ACADEMIC SAFETY NET

### 0.8.1 Feature Traceability Matrix

**Status:** Structure created. See `docs/TRACEABILITY_MATRIX.md`

**Purpose:**

- Maps requirements → features → phases
- Proves "nothing was built randomly"
- Required for academic evaluation

**Reference:**
- [Software Traceability in Academia — SEI](https://www.sei.cmu.edu/our-work/software-requirements/)

---

### 0.8.2 Demo Strategy Declaration

**Planned Demo Accounts:**

- ✅ User (empty state)
- ✅ Power user (with trips/bookings)
- ✅ Agent (approved, with packages)
- ✅ Admin (moderator)

**Planned Demo Data:**

- ✅ Sample destinations
- ✅ Sample trips
- ✅ Sample bookings
- ✅ Sample reviews

**Planned Demo Flows:**

- ✅ First-time user journey
- ✅ Agent application → approval
- ✅ Booking flow
- ✅ Admin moderation

**Status:** Strategy declared. Implementation in Phase 5.

---

## DOCUMENT APPROVAL

**Phase 0 Foundation Status:** ✅ Complete

**Next Phase:** Phase 1 — Core Travel Product

**This document must be referenced before implementing any feature.**

