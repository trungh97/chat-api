# Implement "Received" Status for Messages (Frontend + Backend)

Add full support for tracking and displaying the "received" delivery status for chat messages. "Received" indicates the message has been delivered to the recipient's device/app (not yet seen/read).

## Overview
- Persist "received" status in the backend for messages.
- Provide an API / subscription for clients to report delivery and receive updates.
- Show "received" status on the frontend in real-time for the message sender.
- Ensure correctness in single and group conversations.

## Acceptance Criteria
- Backend persists per-recipient "received" status and publishes `MESSAGE_RECEIVED` events.
- Frontend updates and displays "received" status in real-time for senders.
- Functionality works in single and group conversations (per-recipient status tracked).
- Tests cover use-case logic and UI/state updates.
