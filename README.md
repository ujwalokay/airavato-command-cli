# Airavoto Command

AiravotoHead UI/UX and Business-Logic Prompt

Copy and paste the following prompt into your UI/UX or application-generation tool.

Prompt

Design and build AiravotoHead, a professional platform-owner control portal for managing up to 100 locally installed Airavoto POS systems and their connected AiravotoCafe customer platforms.

AiravotoHead is not the daily cafe POS. It is the central command center used by the Airavoto platform owner, support team, and authorized operations administrators to onboard cafes, register installations, monitor connection health, manage licenses, publish updates, review support diagnostics, and audit important actions.

The product must feel like a serious B2B SaaS operations console: clear, trustworthy, fast, highly structured, and suitable for managing many cafes without visual clutter. Use a modern dark-and-light compatible interface with a restrained purple accent, strong status colors, readable data tables, clear empty states, and responsive layouts for desktop and tablet. Avoid unnecessary decorative animations. Prioritize information density, hierarchy, accessibility, and safe destructive-action design.

Core product model

Airavoto has three connected products:

1.

Airavoto POS: A local-first Windows application installed at each cafe. It manages devices, bookings, timers, payments, inventory, settings, staff, and local reports.

2.

AiravotoCafe: The public customer-facing cafe page where gamers can view a cafe’s public information, amenities, prices, and availability, and optionally submit booking requests.

3.

AiravotoHead: This portal. It manages cafe accounts, installations, licenses, health, versions, support diagnostics, and platform-wide operations.

Each cafe must be isolated. Every cafe has a unique cafeId, public slug, installation ID, license, admin users, POS data, and AiravotoCafe page. AiravotoHead administrators may see platform-wide operational metadata, but cafe data must not be mixed between tenants.

Primary user roles

Implement role-based access control with these roles:

Platform Owner

The platform owner can create and manage cafes, assign plans, suspend or reactivate licenses, manage AiravotoHead administrators, publish software versions, view platform analytics, and access all support tools.

Platform Support Agent

A support agent can view cafe health, installation version, heartbeat history, sync status, backup status, and safe diagnostics. Support agents cannot permanently delete cafes, change ownership, or perform high-risk license actions without approval.

Platform Operations Manager

An operations manager can onboard cafes, approve installations, manage rollout rings, review incidents, and reactivate installations. Sensitive billing or ownership actions should require additional permission.

Cafe Owner

A cafe owner can see only their own cafe, installation, license status, public profile, usage summary, and support status. They cannot see other cafes.

Read-Only Auditor

A read-only auditor can view dashboards and audit logs but cannot modify cafes, licenses, installations, or software releases.

Global UI requirements

Use a persistent left sidebar on desktop and a collapsible drawer on smaller screens. The sidebar should include:

•

Overview

•

Cafes

•

Installations

•

Licenses

•

Health Monitor

•

Sync Center

•

Software Releases

•

Support Diagnostics

•

Audit Logs

•

Platform Settings

The top bar should include:

•

Global search

•

Current user and role

•

Notifications

•

Help and documentation

•

Theme switcher

•

Secure logout

Use consistent status badges:

•

Green: Active, Connected, Healthy, Synced, Licensed

•

Blue: Pending, Updating, In Progress

•

Amber: Offline Grace, Warning, Delayed, Needs Attention

•

Red: Suspended, Failed, Critical, Revoked

•

Gray: Archived, Disabled, Unknown

Every table must support sorting, pagination, search, filters, column visibility, row detail navigation, and export where appropriate. Tables must remain usable with 100 cafes and thousands of installations or audit records.

Every destructive or high-impact action must use a confirmation dialog showing the cafe name, installation ID, effect, reason field, and required confirmation text. Never use an unexplained one-click kill switch.

1. AiravotoHead Overview Dashboard

Create a dashboard showing platform health at a glance.

KPI cards

Display:

•

Total cafes

•

Active cafes

•

Cafes offline beyond grace period

•

Connected installations

•

Installations needing updates

•

Suspended licenses

•

Failed sync queues

•

Critical support incidents

Each card should be clickable and open the corresponding filtered list.

Main dashboard sections

Create these sections:

1.

Platform health timeline: Show connected, degraded, and offline installation counts over time.

2.

Cafe status table: Cafe name, city, plan, license state, POS version, AiravotoCafe state, last heartbeat, sync state, and attention flag.

3.

Recent incidents: Failed syncs, migration failures, suspended licenses, backup failures, and repeated heartbeat failures.

4.

Rollout progress: Current software version distribution by rollout ring.

5.

Recent platform activity: Recent administrator actions with actor, action, cafe, time, and result.

The dashboard must not display unnecessary customer personal information.

2. Cafe Directory

Create a full cafe management section.

Cafe list columns

Show:

•

Cafe name

•

Public slug

•

City and state

•

Owner

•

Plan

•

License state

•

Installation count

•

Last heartbeat

•

AiravotoCafe status

•

POS version

•

Created date

•

Attention status

Cafe actions

Available actions:

•

View cafe

•

Open cafe profile

•

View installations

•

View license

•

View support health

•

Open public AiravotoCafe page

•

Suspend license

•

Reactivate license

•

Archive cafe

Add cafe flow

Create a multi-step onboarding wizard:

1.

Cafe identity: name, legal name, slug, address, city, state, timezone, currency.

2.

Owner account: name, email, phone, role, invitation status.

3.

Plan: plan type, seat limit, installation limit, feature flags, grace period.

4.

Public profile: logo, cover image, description, amenities, games, contact details.

5.

Installation registration: generate registration code or QR code.

6.

Review and activate.

Validate the slug for uniqueness. Do not activate a cafe until required identity and owner information is complete.

3. Cafe Detail Page

The cafe detail page should use tabs:

•

Summary

•

Installations

•

License

•

AiravotoCafe

•

Usage

•

Support

•

Activity

Summary tab

Display cafe identity, owner, plan, license status, public URL, installation health, last sync, and quick actions.

Installations tab

Show all registered POS installations for that cafe, including installation ID, machine name, local service version, app version, operating system, last heartbeat, backup status, sync queue length, and connection state.

AiravotoCafe tab

Show public visibility, public slug, customer booking enabled/disabled, last public sync, public profile completion, and preview link.

Usage tab

Show device count, booking count, active sessions, inventory items, staff accounts, public page visits if available, and current plan limits.

4. Installation Registry

Create a global installation management page.

Installation list

Columns:

•

Installation ID

•

Cafe

•

Machine name

•

App version

•

Local service version

•

OS version

•

Last heartbeat

•

Last backup

•

Sync queue count

•

License token state

•

Health status

•

Rollout ring

Filters:

•

Cafe

•

Status

•

Version

•

Rollout ring

•

Last heartbeat range

•

Backup state

•

Sync state

Installation detail page

Show:

•

Installation identity

•

Cafe identity

•

Registration date

•

Current software versions

•

Last 24-hour heartbeat timeline

•

Last successful backup

•

Database health result

•

Pending sync count

•

Recent errors

•

License token history

•

Update history

•

Local network mode: local-only, connected, or sync-enabled

Do not expose raw customer data or database credentials.

5. License Management

Create a license management section with clear and reversible states.

License states

Use these states:

•

Active

•

Trial

•

Offline Grace

•

Limited

•

Suspended

•

Revoked

•

Expired

•

Archived

License data

Store and display:

•

Cafe

•

Plan

•

Start date

•

Renewal date

•

Grace period end

•

Installation limit

•

Device limit

•

Feature flags

•

Current token version

•

Last validation

•

Suspension reason

•

Reactivation history

Suspension flow

When an administrator suspends a license:

1.

Show the cafe name and license details.

2.

Require a reason.

3.

Show exactly what will be disabled.

4.

Show the offline grace behavior.

5.

Require confirmation text such as SUSPEND CAFE.

6.

Write an audit log.

7.

Notify the cafe owner.

8.

Revoke or rotate the license token.

The local POS must not delete data or become a destructive brick. It should enter a transparent limited mode according to the business policy. Existing records must remain available for export and support.

Reactivation flow

Require an authorized role, show the previous suspension reason, issue a new signed token, record the actor and timestamp, and notify the cafe owner.

6. Health Monitor

Create a monitoring page for all installations.

Health checks

Track:

•

Heartbeat received

•

Local API responding

•

Database readable

•

Database writable

•

Latest backup completed

•

Sync queue healthy

•

Current software supported

•

License token valid

•

Clock drift within allowed range

•

Disk space warning if reported

Health status logic

Use deterministic thresholds:

•

Healthy: heartbeat and backup within normal limits.

•

Warning: delayed heartbeat, pending queue, or outdated version.

•

Critical: repeated failures, backup failure, invalid token, or migration failure.

•

Offline Grace: installation has not connected but is still inside the approved grace period.

•

Suspended: license action has been intentionally applied by an authorized administrator.

Provide filters for critical, warning, offline, outdated, and backup-failed installations.

7. Sync Center

Create a synchronization operations page for local-first installations.

Sync queue table

Show:

•

Event ID

•

Cafe

•

Installation

•

Entity type

•

Operation

•

Created time

•

Retry count

•

Last error

•

Current state

States:

•

Queued

•

Sending

•

Acknowledged

•

Failed

•

Conflict

•

Ignored

•

Manually resolved

Sync actions

Allow authorized support users to:

•

Retry a safe failed event

•

View event details

•

Mark an event as ignored with a reason

•

Open a conflict-resolution workflow

•

Pause synchronization for an installation

•

Resume synchronization

Never allow silent overwriting of payments, completed bookings, or audit records.

8. Software Releases

Create a release management module.

Release list

Show:

•

Version

•

Release channel

•

Release notes

•

Compatible database migration range

•

Published date

•

Current rollout percentage

•

Failed installation count

•

Rollback availability

Rollout rings

Use staged deployment:

1.

Internal

2.

Pilot cafes

3.

Small commercial group

4.

Regional group

5.

General availability

A release should not progress automatically if critical error or rollback thresholds are exceeded.

Update safety

Before updating a local POS:

1.

Verify installation identity.

2.

Verify license state.

3.

Verify database backup.

4.

Verify migration compatibility.

5.

Download a signed package.

6.

Install with rollback support.

7.

Send update result to AiravotoHead.

8.

Keep the previous version available until health is confirmed.

9. Support Diagnostics

Create a safe support workspace where staff can investigate problems without accessing unnecessary cafe customer data.

Display:

•

Installation health

•

Version mismatch

•

Recent application errors

•

Sync errors

•

Backup result

•

Database migration state

•

Connection latency

•

License validation result

•

Suggested support action

Provide a Generate Support Bundle action that creates a sanitized diagnostic package. The bundle must exclude passwords, tokens, payment credentials, customer phone numbers, and raw database contents.

10. Audit Logs

Every important AiravotoHead action must create an append-only audit record.

Record:

•

Actor ID

•

Actor role

•

Action

•

Target type

•

Target ID

•

Cafe ID when applicable

•

Reason

•

Before summary

•

After summary

•

IP or installation context where appropriate

•

Timestamp

•

Result

Important actions include cafe creation, owner invitation, license activation, suspension, reactivation, token rotation, installation registration, update publication, sync retry, support access, and cafe archival.

Provide filters by actor, cafe, action, target type, date, and result. Add export for authorized auditors.

11. Platform Settings

Include:

•

Default license grace period

•

Heartbeat interval

•

Offline threshold

•

Backup warning threshold

•

Supported POS versions

•

Public booking defaults

•

Notification preferences

•

Rollout thresholds

•

Support contact information

•

Data retention rules

•

Platform administrator management

Sensitive settings should require re-authentication or elevated permission.

12. Notifications

Create in-app notifications and optional email notifications for:

•

New cafe registration

•

Installation activated

•

Installation offline beyond threshold

•

Backup failure

•

Sync conflict

•

License nearing expiry

•

License suspension

•

License reactivation

•

Update failure

•

Critical support incident

Notifications should be deduplicated and grouped to avoid alert fatigue.

13. API and business-logic requirements

Use server-side validation for every API request. Suggested endpoints include:

Plain Text

POST   /api/head/auth/login

GET    /api/head/me

GET    /api/head/cafes

POST   /api/head/cafes

GET    /api/head/cafes/:cafeId

PATCH  /api/head/cafes/:cafeId

POST   /api/head/cafes/:cafeId/archive

GET    /api/head/installations

POST   /api/head/installations/register

GET    /api/head/installations/:installationId

POST   /api/head/installations/:installationId/revoke

POST   /api/head/heartbeats

GET    /api/head/health

GET    /api/head/licenses

POST   /api/head/licenses/:licenseId/suspend

POST   /api/head/licenses/:licenseId/reactivate

POST   /api/head/licenses/:licenseId/rotate-token

GET    /api/head/sync/events

POST   /api/head/sync/events/:eventId/retry

POST   /api/head/sync/events/:eventId/resolve

GET    /api/head/releases

POST   /api/head/releases

POST   /api/head/releases/:releaseId/publish

GET    /api/head/audit-logs

GET    /api/public/cafes/:slug

GET    /api/public/cafes/:slug/availability

POST   /api/public/cafes/:slug/booking-requests

For every protected endpoint:

1.

Authenticate the caller.

2.

Authorize the caller’s role.

3.

Resolve the target cafe on the server.

4.

Validate the request schema.

5.

Apply the business rule.

6.

Write an audit record when appropriate.

7.

Return a safe response without secrets or private customer data.

14. Data model requirements

Use these core tables:

•

head_users

•

cafes

•

cafe_users

•

installations

•

licenses

•

license_tokens

•

heartbeats

•

health_checks

•

sync_events

•

software_releases

•

release_rollouts

•

support_incidents

•

support_bundles

•

head_audit_logs

•

public_cafe_profiles

•

public_booking_requests

All cafe-owned records must include cafeId. Use stable UUIDs, timestamps, revision numbers, and soft archival where appropriate. Do not physically delete audit logs or license history.

15. UX rules for risky operations

For suspension, revocation, archive, token rotation, forced update, and sync conflict resolution:

•

Use a full confirmation dialog.

•

Show the exact target cafe and installation.

•

Explain immediate and delayed effects.

•

Require a reason.

•

Require typed confirmation for destructive operations.

•

Show a final success or failure state.

•

Add a link to the audit record.

•

Provide a clear recovery or reactivation path.

Never hide business-critical consequences behind ambiguous labels such as “Disable.” Prefer explicit labels such as “Suspend license and disable new cloud bookings.”

16. Empty, loading, and error states

Every screen must handle:

•

Loading skeleton

•

No cafes yet

•

No installations yet

•

No heartbeat received

•

No sync events

•

No releases

•

Failed API request

•

Permission denied

•

Stale data

•

Offline AiravotoHead portal

•

Expired session

Error messages must explain what happened, what remains safe, and what action the user can take.

17. Design system

Use:

•

8px spacing system

•

Dense but readable data tables

•

Rounded cards with restrained shadows

•

Purple as the primary brand accent

•

High-contrast status badges

•

Monospace styling for installation IDs, event IDs, and versions

•

Tooltips for technical terms

•

Confirmation dialogs for high-impact actions

•

Keyboard-accessible controls

•

Visible focus states

•

Responsive layouts for desktop and tablet

The portal should look like an operations platform, not a consumer gaming landing page. Use gaming-related identity sparingly; the primary audience is platform operations and support staff.

18. Recommended first MVP

Build these modules first:

1.

Secure AiravotoHead login and role-based access.

2.

Cafe directory with add, view, activate, suspend, and reactivate.

3.

Installation registry with registration code and heartbeat.

4.

License page with active, grace, suspended, and revoked states.

5.

Overview dashboard with cafe and installation health.

6.

Audit Logs for every high-impact action.

7.

Public AiravotoCafe URL and public profile state.

Delay advanced analytics, automatic rollout, deep sync conflict resolution, and billing automation until the first pilot cafes are stable.

19. Definition of done

AiravotoHead is ready for pilot use when:

•

A new cafe can be onboarded without direct database editing.

•

A POS installation can be registered using a secure one-time code.

•

AiravotoHead receives and displays heartbeats.

•

The portal clearly shows connected, offline grace, warning, and suspended states.

•

A license can be suspended and reactivated with an audit record.

•

Cafe users cannot access another cafe’s data.

•

A support agent can diagnose health without viewing private customer data.

•

Software releases can be published to a pilot ring.

•

Audit logs cannot be edited or deleted through the UI.

•

AiravotoCafe public status can be enabled or disabled per cafe.

•

The local POS remains usable during a temporary Internet outage.

•

The UI is responsive, accessible, and usable with 100 cafes.

Build the application around these rules and workflows rather than creating only visual screens. The result should be a secure, multi-cafe control plane that manages local-first Airavoto POS installations without using destructive kill switches or exposing local cafe computers directly to the public Internet.

End of prompt

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/54bab43a-6d6c-49ef-a60c-a0f3574fba32).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
