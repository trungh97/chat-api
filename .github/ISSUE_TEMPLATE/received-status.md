---
name: 'Received status task'
about: Template for implementing message received status (FE + BE)
---

## Overview
Add full support for tracking and displaying the "received" delivery status for chat messages. "Received" indicates the message has been delivered to the recipient's device/app (not yet seen/read).

## Acceptance Criteria
- Backend persists per-recipient "received" status and publishes `MESSAGE_RECEIVED` events.
- Frontend updates and displays "received" status in real-time for senders.
- Functionality works in single and group conversations (per-recipient status tracked).
- Tests cover use-case logic and UI/state updates.

