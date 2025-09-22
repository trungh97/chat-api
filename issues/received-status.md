# Implement "Received" Status for Messages (Frontend + Backend)

Add full support for tracking and displaying the "received" delivery status for chat messages. "Received" indicates the message has been delivered to the recipient's device/app (not yet seen/read).

## Overview
- Persist "received" status in the backend for messages.
- Provide an API / subscription for clients to report delivery and receive updates.
- Show "received" status on the frontend in real-time for the message sender.
- Ensure correctness in single and group conversations.

## Backend Scope
- Database: add or reuse a field to track per-recipient delivery status or a system to store delivery entries.
- API: implement a mutation or endpoint `markMessageReceived({ messageId, userId })`.
- WebSocket: publish a `MESSAGE_RECEIVED` event for senders to update UI in real time.
- Use case layer: add `MarkMessageReceivedUseCase` and wire DI bindings.
- Repository: add `markMessageAsReceived(messageId, userId)` method in message repository.
- Tests: unit tests for use case and repository interaction; integration test for subscription event.

## Frontend Scope
- Event: when a client receives a new message (e.g., upon websocket delivery or local persistence), call `markMessageReceived` for that message and current user.
- Subscription: listen for `MESSAGE_RECEIVED` events and update local message state to "received" for the specific recipient(s).
- UI: render a small "received" indicator (e.g., single check mark) for sender messages.
- Tests: unit tests for hook/state update, and component snapshot or DOM tests for indicator rendering.

## Acceptance Criteria
- Backend persists per-recipient "received" status and publishes `MESSAGE_RECEIVED` events.
- Frontend updates and displays "received" status in real-time for senders.
- Functionality works in single and group conversations (per-recipient status tracked).
- Tests cover use-case logic and UI/state updates.

## Notes
- Prefer direct DB update for status (avoid queueing every status update unless scale requires it).
- For group conversations, consider storing an array of recipient delivery states to avoid massive write amplification.
