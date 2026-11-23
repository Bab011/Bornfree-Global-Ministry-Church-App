# Bornfree Global Ministry — Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Role Isolation**: Users can NEVER store or update their `role` on `/users/{userId}`. Roles live exclusively in `/roles/{userId}` and can only be written by a verified `SUPER_ADMIN` or the verified bootstrap owner.
2. **Prayer Privacy & Pastoral Note Separation**: Private prayer requests (`privacy == 'private'`) are readable only by the submitting user (`userId == request.auth.uid`) or authorized pastoral/prayer leadership. Internal pastoral notes live in `/prayerAssignments/{assignmentId}` and are NEVER readable by requesters or the public.
3. **No Automatic Public Exposure**: Submissions on `/prayerRequests` and `/testimonies` always start in non-public / unmoderated states (`status: 'Received'` or `status: 'pending'`). Public `/prayerWall` entries strip all PII (email, phone) and require moderator approval (`isApproved == true`).
4. **PII Protection**: `/users/{userId}`, `/visitors/{visitorId}`, `/visitorFollowUps/{followUpId}`, `/pastoralRequests/{requestId}`, and `/eventRegistrations/{registrationId}` restrict `read` and `list` strictly to the record owner (`resource.data.userId == request.auth.uid`) or authorized ministry staff roles.
5. **Strict Key & Size Bounds**: Every `create` validates exact required and allowed keys (`hasAll` + `hasOnly`), type safety, string lengths, and valid document IDs (`^[a-zA-Z0-9_\-]+$`). Every `update` validates `isValid[Entity]` and restricts `affectedKeys().hasOnly(...)` per action.
6. **Temporal Integrity**: `createdAt` and `updatedAt` are validated against `request.time`, and `createdAt` / `userId` are immutable after creation.

## 2. The "Dirty Dozen" Attack Payloads (Expected: PERMISSION_DENIED)
1. **Role Self-Elevation**: Member writes `/roles/{ownUid}` with `{ role: "SUPER_ADMIN" }`.
2. **Shadow Field Injection on User Profile**: User creates `/users/{ownUid}` including `{ isAdmin: true }` or `{ role: "PASTOR" }`.
3. **Cross-User PII Read**: Authenticated member reads `/users/{otherUid}` or `/visitors/{otherVisitorId}`.
4. **Blanket List Query Scraping**: Member queries `/prayerRequests` without `where('userId', '==', uid)`.
5. **Prayer Notes Leak**: Requester attempts to read `/prayerAssignments/{assignmentId}` for their own request.
6. **Direct Public Wall Injection**: Unprivileged member creates `/prayerWall/{id}` with `isApproved: true`.
7. **Status Shortcutting on Submission**: Visitor creates `/prayerRequests/{id}` with `status: "Closed"` or `assignedPastorId: "fake"`.
8. **Resource Exhaustion / ID Poisoning**: Attacker creates `/prayerRequests/{1500_char_id}` or 1MB `description`.
9. **Testimony Self-Approval**: Member creates `/testimonies/{id}` with `status: "approved"`.
10. **Consent Bypass on Visitor Registration**: Visitor creates `/visitors/{id}` with `consentGiven: false`.
11. **Unverified Admin Email Spoof**: User with unverified email matching bootstrap email attempts admin write (`email_verified == false`).
12. **Orphaned Event Registration**: Attacker creates `/eventRegistrations/{id}` referencing a non-existent or closed `eventId`.
