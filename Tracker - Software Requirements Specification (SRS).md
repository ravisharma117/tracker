# Software Requirements Specification (SRS)

## NAX IT Solutions Tracker — AI and External Integrations

**Document version:** 1.0  
**Status:** Proposed  
**Date:** 15 September 2026  
**Project:** NAX IT Solutions Tracker

---

## 1. Introduction

### 1.1 Purpose

This document defines the software requirements for extending the NAX IT Solutions Tracker into an AI-assisted project operations platform.

The system will support:

- Project, milestone, task, and subtask management.
- AI-powered content improvement using Claude AI.
- AI-generated project plans.
- Gmail email import and analysis.
- One-way synchronization with Teamwork Projects.
- Claude-powered task automation.
- Approval workflows for external actions.
- Audit logging, security, and staged deployment.

### 1.2 Project vision

The tracker will act as the central workspace for project planning and execution.

The system will allow users to convert unstructured notes and emails into structured project plans, then synchronize approved tasks to Teamwork Projects.

The initial synchronization direction will be:

```text
NAX IT Solutions Tracker → Teamwork Projects
```

Teamwork Projects will not update tracker data automatically in the initial release.

### 1.3 Goals

The system shall:

1. Improve productivity through AI-assisted writing and planning.
2. Convert emails and notes into actionable tasks.
3. Allow Claude AI to interact with tracker APIs.
4. Synchronize approved tracker tasks with Teamwork Projects.
5. Prevent accidental external changes.
6. Provide clear visibility into proposed and completed actions.
7. Maintain auditability and secure access to external services.

### 1.4 Out of scope for the initial release

The following items are excluded from the initial release:

- Full two-way Teamwork synchronization.
- Unrestricted AI access to the database.
- Automatic sending of Gmail replies without approval.
- Automatic permanent deletion without confirmation.
- Unreviewed execution of high-impact external actions.

---

## 2. System Overview

### 2.1 Proposed architecture

```text
User Interface
      |
      v
Tracker Backend
      |
      +--> Project and Task Services
      |
      +--> Claude AI Service
      |
      +--> Gmail Integration Service
      |
      +--> Teamwork Integration Service
      |
      +--> Approval and Audit Services
      |
      v
Database
```

Claude shall interact with the application through controlled backend APIs or tool-calling interfaces.

Claude shall not have direct access to the application database.

### 2.2 Primary components

- Web application and Markdown editor.
- Project and task management service.
- AI service.
- Claude automation service.
- Gmail integration service.
- Teamwork Projects integration service.
- Approval service.
- Audit logging service.
- Authentication and authorization service.
- Database and synchronization metadata store.

---

## 3. User Roles

### 3.1 Standard user

A standard user may:

- View projects and tasks.
- Create and edit tracker content.
- Request AI suggestions.
- Review proposed plans.
- Approve permitted task operations.
- Initiate synchronization.

### 3.2 Administrator

An administrator may:

- Configure integrations.
- Manage API credentials and OAuth connections.
- Configure permissions.
- Review audit logs.
- Enable or disable integration features.
- Manage synchronization settings.

---

## 4. Functional Requirements

## 4.1 Project and Task Management

### FR-001 — Project management

The system shall allow users to create, view, edit, archive, and manage projects.

### FR-002 — Milestone management

The system shall allow users to create milestones within projects.

### FR-003 — Task management

The system shall support:

- Tasks.
- Subtasks.
- Task descriptions.
- Task status.
- Priority.
- Due dates.
- Assignees.
- Notes and comments.
- Dependencies where required.

### FR-004 — Task status

The system shall support configurable task statuses, including at least:

- Not started.
- In progress.
- Blocked.
- Completed.
- Pending deletion.
- Deleted.
- Synchronization failed.

### FR-005 — External task mapping

The system shall store external integration information for synchronized tasks, including:

- External platform name.
- External project ID.
- External task ID.
- Synchronization status.
- Last synchronization timestamp.
- Last synchronization error.

### FR-006 — Source tracking

The system shall allow a task to reference its source, such as:

- Markdown content.
- AI-generated plan.
- Gmail message.
- User-created request.

---

## 4.2 AI Writing Assistant

### FR-007 — AI content improvement

The system shall allow users to submit selected Markdown content to Claude AI for improvement.

### FR-008 — Supported AI operations

The system shall support the following operations:

- Rewrite content.
- Improve clarity.
- Correct grammar.
- Make content more professional.
- Make content shorter.
- Expand content.
- Summarize content.
- Convert content into a checklist.
- Convert content into a project plan.

### FR-009 — Suggestion review

The system shall display AI-generated suggestions before applying them.

Users shall be able to:

- Accept a suggestion.
- Reject a suggestion.
- Edit a suggestion.
- Compare original and revised content.

### FR-010 — Original content preservation

The system shall preserve the original content until the user explicitly accepts a proposed change.

---

## 4.3 AI Project-Plan Generation

### FR-011 — Plan generation

The system shall allow Claude AI to generate a proposed project plan from:

- Markdown notes.
- Pasted text.
- User instructions.
- Imported Gmail messages.

### FR-012 — Generated plan structure

The generated plan may include:

- Project objective.
- Scope.
- Milestones.
- Tasks.
- Subtasks.
- Dependencies.
- Risks.
- Assumptions.
- Open questions.
- Suggested priorities.
- Suggested deadlines.

### FR-013 — Plan review

The user shall be able to review, modify, partially accept, or reject a generated plan.

### FR-014 — Plan creation

The system shall create tracker projects, milestones, tasks, and subtasks only after user approval.

### FR-015 — Duplicate prevention

The system shall detect and prevent duplicate task creation where reasonably possible.

---

## 4.4 Gmail Integration

### FR-016 — Gmail authentication

The system shall support Gmail OAuth authentication.

The system shall request only the permissions necessary for the enabled functionality.

### FR-017 — Gmail connection management

Users shall be able to:

- Connect Gmail.
- Reconnect Gmail.
- Disconnect Gmail.
- View connection status.
- Handle expired or revoked authorization.

### FR-018 — Email discovery

The system shall allow users to find newer emails using supported filters, such as:

- Date range.
- Gmail labels.
- Search criteria.
- Sender.
- Subject.

### FR-019 — Email display

The system shall display relevant email information, including:

- Sender.
- Recipients where permitted.
- Subject.
- Date and time.
- Message body.
- Thread information where supported.

### FR-020 — Email import

Users shall be able to select emails for import into the tracker.

The system shall store:

- Gmail message ID.
- Thread ID where available.
- Email metadata.
- Imported content.
- Import timestamp.
- Associated tracker project.
- Processing status.

### FR-021 — Duplicate email prevention

The system shall prevent the same Gmail message from being imported repeatedly.

### FR-022 — Email analysis

Claude AI shall be able to analyze selected emails and identify:

- Requirements.
- Instructions.
- Action items.
- Deadlines.
- Risks.
- Responsibilities.
- Questions requiring clarification.

### FR-023 — Email-to-plan conversion

The system shall allow selected email content to be converted into a proposed project plan.

### FR-024 — Reply drafting

The system shall allow Claude to prepare draft email replies.

The user shall be able to review and edit a draft before sending.

### FR-025 — Email sending approval

The system shall not send a Gmail reply without explicit user approval.

---

## 4.5 Teamwork Projects Integration

### FR-026 — Teamwork authentication

The system shall support secure authentication with Teamwork Projects.

### FR-027 — Teamwork project discovery

The system shall retrieve accessible Teamwork projects and allow the user to link one to a tracker project.

### FR-028 — Project mapping

The system shall store the relationship between:

- Tracker project ID.
- Teamwork project ID.

### FR-029 — Task creation synchronization

The system shall allow approved tracker tasks to be created in Teamwork Projects.

The system shall map supported fields, including:

- Task title.
- Description.
- Due date.
- Priority.
- Status.
- Assignee.
- Task list or milestone where supported.

### FR-030 — External task ID storage

After successful creation, the system shall store the Teamwork task ID against the tracker task.

### FR-031 — Task update synchronization

The system shall detect changes to tracker tasks and prepare corresponding Teamwork updates.

Updates shall be reviewed or approved according to configured permissions.

### FR-032 — One-way synchronization

The initial implementation shall synchronize in this direction only:

```text
Tracker → Teamwork Projects
```

Changes made directly in Teamwork shall not automatically update the tracker.

### FR-033 — Synchronization preview

Before synchronization, the system shall display:

- Tasks to create.
- Tasks to update.
- Tasks to delete.
- Unchanged tasks.
- Failed or unresolved mappings.

### FR-034 — Manual synchronization

The system shall provide a **Sync now** operation.

### FR-035 — Task deletion synchronization

The system shall detect tracker tasks marked for deletion and identify the linked Teamwork task.

### FR-036 — Deletion confirmation

The system shall require explicit confirmation before deleting a Teamwork task.

The confirmation shall identify:

- Tracker task.
- Teamwork project.
- Teamwork task.
- Proposed action.

### FR-037 — Deletion logging

The system shall record every approved external deletion in the audit log.

### FR-038 — Duplicate prevention

The system shall prevent a tracker task from creating multiple Teamwork tasks unintentionally.

### FR-039 — Synchronization failures

The system shall display synchronization failures and provide a retry mechanism where appropriate.

---

## 4.6 Claude AI Automation

### FR-040 — Claude backend integration

The system shall integrate Claude AI through a backend service.

### FR-041 — Controlled tool access

Claude shall interact with the tracker through explicitly defined tools or APIs.

### FR-042 — Initial read-only tools

The first automation release shall support read-only operations such as:

- Retrieve projects.
- Retrieve project details.
- Retrieve tasks.
- Retrieve task details.
- Search tasks.
- Summarize project information.

### FR-043 — Task-management tools

The system may expose controlled tools such as:

- `create_task`
- `update_task`
- `create_milestone`
- `generate_project_plan`
- `mark_task_for_deletion`
- `prepare_teamwork_sync`
- `sync_task_to_teamwork`

### FR-044 — Natural-language commands

Users shall be able to issue natural-language instructions, for example:

> Create a high-priority task called “Fix Navigator limit-line bug.”

### FR-045 — Action proposal

Before executing a write operation, Claude shall produce a structured proposed action.

### FR-046 — Action approval

The user shall be able to approve, reject, or edit a proposed action.

### FR-047 — Tool validation

The backend shall validate:

- Tool name.
- Required parameters.
- Parameter types.
- User permissions.
- Target project or task.
- Operation safety level.

### FR-048 — Restricted database access

Claude shall not be permitted to execute arbitrary database queries or unrestricted backend commands.

### FR-049 — Automation results

After execution, the system shall display:

- Requested operation.
- Actual operation performed.
- Result.
- Errors, if any.
- Related task or project.
- Audit reference.

---

## 4.7 Approval Workflow

### FR-050 — Proposed-actions screen

The system shall provide a centralized screen for reviewing proposed actions.

### FR-051 — Supported action categories

The approval center shall support:

- Create.
- Update.
- Delete.
- AI content replacement.
- Gmail draft.
- Gmail send.
- Teamwork synchronization.

### FR-052 — Before-and-after comparison

For updates, the system shall display the original and proposed values.

### FR-053 — Approval decisions

Users shall be able to:

- Approve.
- Reject.
- Edit.
- Defer.
- Retry failed actions where appropriate.

### FR-054 — High-risk actions

The following actions shall require explicit confirmation:

- Deleting tracker tasks.
- Deleting Teamwork tasks.
- Sending Gmail replies.
- Bulk external synchronization.
- Irreversible external changes.

---

## 4.8 Audit Logging

### FR-055 — Audit events

The system shall log important events, including:

- User instruction.
- AI request.
- AI response metadata.
- Proposed tool call.
- Approval decision.
- API execution.
- External synchronization.
- Deletion.
- Gmail import.
- Gmail reply action.
- Failure and retry.

### FR-056 — Audit information

Each audit record should contain:

- Event ID.
- User ID.
- Action type.
- Target entity.
- Source of request.
- Timestamp.
- Status.
- Relevant external ID.
- Error information where applicable.

### FR-057 — Sensitive data protection

Audit logs shall not expose API keys, OAuth tokens, or unnecessary private email content.

---

## 5. Non-Functional Requirements

### NFR-001 — Security

The system shall:

- Use secure authentication.
- Apply least-privilege permissions.
- Protect API credentials.
- Encrypt sensitive data where appropriate.
- Prevent unauthorized external operations.
- Avoid exposing credentials in logs.

### NFR-002 — Reliability

The system shall:

- Handle external API failures.
- Support retries where safe.
- Avoid duplicate operations.
- Preserve tracker data when synchronization fails.
- Clearly report partial failures.

### NFR-003 — Performance

The system should provide responsive feedback for ordinary tracker operations.

Long-running AI or synchronization operations shall display progress or status information.

### NFR-004 — Maintainability

Integrations shall be implemented as separate services or modules with clear interfaces.

### NFR-005 — Extensibility

The architecture should allow additional AI providers and external project-management platforms to be added later.

### NFR-006 — Observability

The system shall provide sufficient logs and status information to diagnose:

- Authentication failures.
- AI failures.
- API failures.
- Synchronization failures.
- Permission problems.
- Duplicate operations.

### NFR-007 — Privacy

The system shall minimize the amount of email and project data sent to external AI or integration services.

### NFR-008 — Recovery

The system shall provide procedures for recovering from failed synchronization and revoked external access.

---

## 6. Security and Permission Rules

| Action | Default behavior |
|---|---|
| Read tracker projects | Allowed |
| Read tracker tasks | Allowed |
| Search and summarize | Allowed |
| Generate AI suggestions | Review required |
| Create tracker task | Approval required initially |
| Update tracker task | Approval required initially |
| Synchronize to Teamwork | Approval required |
| Delete tracker task | Explicit confirmation |
| Delete Teamwork task | Explicit confirmation |
| Import Gmail message | User selection required |
| Draft Gmail reply | Allowed as a draft |
| Send Gmail reply | Explicit approval required |

---

## 7. Milestone and Delivery Plan

## Milestone 1 — Foundation and technical design

### Subtasks

- Define architecture.
- Define data model.
- Define task and milestone structure.
- Define integration interfaces.
- Define authentication and permissions.
- Define audit logging.
- Define synchronization metadata.
- Define development and staging environments.

## Milestone 2 — Project and task model enhancement

### Subtasks

- Add milestones.
- Add subtasks.
- Add task statuses.
- Add priorities.
- Add due dates and assignees.
- Add source references.
- Add external task mappings.
- Add synchronization states.
- Add deletion states.

## Milestone 3 — AI writing assistant

### Subtasks

- Integrate Claude backend service.
- Add rewrite functionality.
- Add grammar and clarity improvements.
- Add summarization.
- Add checklist conversion.
- Add original-versus-suggested comparison.
- Add approval before content replacement.

## Milestone 4 — AI project-plan generation

### Subtasks

- Convert notes into plans.
- Generate milestones and tasks.
- Generate subtasks and dependencies.
- Display proposed plans.
- Allow editing and partial approval.
- Create tracker tasks after approval.
- Prevent duplicate creation.

## Milestone 5 — Gmail integration

### Subtasks

- Implement Gmail OAuth.
- Retrieve newer emails.
- Add filtering and search.
- Import selected emails.
- Prevent duplicate imports.
- Link emails to projects.
- Analyze emails with Claude.
- Generate proposed plans.
- Draft replies.
- Require approval before sending.

## Milestone 6 — Teamwork Projects integration

### Subtasks

- Implement Teamwork authentication.
- Retrieve Teamwork projects.
- Map tracker projects to Teamwork projects.
- Create Teamwork tasks.
- Store external task IDs.
- Update Teamwork tasks.
- Preview synchronization.
- Add manual synchronization.
- Support deletion with confirmation.
- Add retry and failure handling.

## Milestone 7 — Claude automation

### Subtasks

- Define Claude tools.
- Implement read-only tools.
- Implement tool calling.
- Add natural-language commands.
- Add task creation tools.
- Add task update tools.
- Add plan-generation tools.
- Add permission checks.
- Add structured results.
- Add action logging.

## Milestone 8 — Unified approval center

### Subtasks

- Create proposed-actions screen.
- Display proposed changes.
- Add approve, reject, edit, and defer actions.
- Add individual and bulk approval.
- Add special deletion confirmation.
- Add Gmail-send confirmation.
- Display action history.

## Milestone 9 — Security and reliability

### Subtasks

- Secure credentials.
- Add role-based permissions.
- Add retries.
- Add idempotency controls.
- Add rate-limit handling.
- Add failure notifications.
- Add recovery procedures.
- Review privacy controls.

## Milestone 10 — Testing and staged deployment

### Subtasks

- Unit testing.
- Integration testing.
- AI tool validation testing.
- Gmail testing.
- Teamwork synchronization testing.
- Deletion safety testing.
- Permission testing.
- Audit-log testing.
- Staging deployment.
- Feature-flag rollout.
- Production hardening.
- User documentation.

---

## 8. Release Strategy

| Release | Scope |
|---|---|
| V1 | Foundation and enhanced task model |
| V2 | AI writing assistant |
| V3 | AI-generated project plans |
| V4 | Claude read-only automation |
| V5 | Approved task creation and updates |
| V6 | Gmail authentication and import |
| V7 | AI planning from Gmail |
| V8 | Teamwork project mapping and task creation |
| V9 | Teamwork updates and deletion confirmation |
| V10 | Unified approval center and production hardening |

---

## 9. First Development Slice

The first implementation shall demonstrate this workflow:

```text
User instruction
      ↓
Claude interprets the instruction
      ↓
Claude proposes an action
      ↓
User reviews and approves
      ↓
Tracker API executes the action
      ↓
Result is displayed
      ↓
Action is logged
```

### Example

User instruction:

> Create a high-priority task called “Fix Navigator limit-line bug.”

Expected behavior:

1. Claude interprets the instruction.
2. The system displays the proposed task.
3. The user reviews the task details.
4. The user approves the action.
5. The tracker API creates the task.
6. The created task is displayed.
7. The action is recorded in the audit log.
8. Teamwork synchronization remains a separate approved operation.

---

## 10. Acceptance Criteria

The project shall be considered ready for the first staged release when:

- Users can manage structured projects and tasks.
- Claude can provide writing suggestions.
- AI-generated plans can be reviewed before saving.
- Claude can read tracker data through controlled tools.
- Write operations require approval.
- Gmail imports can be selected and linked to projects.
- Teamwork projects can be mapped to tracker projects.
- Approved tasks can be pushed to Teamwork.
- Duplicate external tasks are prevented.
- Teamwork deletions require explicit confirmation.
- External failures are visible and recoverable.
- Important operations are recorded in an audit log.
- Sensitive credentials are protected.
- The system can be deployed incrementally.

---

## 11. Open Decisions

The following decisions must be finalized before implementation:

1. Which Claude model and API configuration will be used?
2. Which Gmail permissions are required?
3. Which Teamwork Projects API version and endpoints are available?
4. Which tracker task fields map to Teamwork fields?
5. Should task creation require approval permanently or only initially?
6. Should deleted Teamwork tasks be permanently deleted or archived where possible?
7. How long should audit records be retained?
8. Which users may configure integrations?
9. What is the preferred retry behavior for failed synchronization?
10. Which features should be enabled through feature flags?

---

## 12. Recommended Implementation Principle

The system should follow this rule:

> **AI may understand, suggest, and prepare actions, but the tracker backend controls execution and the user approves important external changes.**

This principle will help maintain security, traceability, and predictable behavior as Claude, Gmail, and Teamwork Projects are integrated.
