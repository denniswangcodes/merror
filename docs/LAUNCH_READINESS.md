# Merror launch runbook

## Release gates

- All API, web, shared, and mobile TypeScript checks pass.
- All Prisma migrations are committed and `prisma migrate deploy` succeeds against staging.
- `/api/health` reports both `status: ok` and `database: connected`.
- Report, block, account deletion, and moderation flows are tested on physical iOS devices.
- Privacy, Terms, Community Guidelines, and Support URLs are publicly reachable.
- The support mailbox is monitored and has an owner and response target.
- Production contains no seeded demo accounts or shared passwords.
- A reviewer account, a sample QR code, and complete App Review notes are ready.

## Environment

Use unique production values for `JWT_SECRET` and `JWT_REFRESH_SECRET`. Keep database and service credentials out of source control. Set `WEB_ORIGIN` to the exact production web origin, `NEXT_PUBLIC_API_URL` and `EXPO_PUBLIC_API_URL` to the production API, and `NEXT_PUBLIC_SUPPORT_EMAIL` to a monitored mailbox.

The Render start command runs migrations but deliberately does not run the seed. Seed data is for local development only.

## Moderation operations

1. Give the designated moderator a database `ADMIN` role.
2. Open `/{locale}/admin/moderation`.
3. Review oldest reports first and preserve reporter details only as long as operationally necessary.
4. Remove violating reflections or suspend accounts when warranted.
5. Respond to safety and privacy messages through the published support mailbox.
6. Document escalation and appeal decisions outside free-form production logs.

Blocking removes existing friendships and notifications between the two accounts. Suspended accounts cannot authenticate. Text submissions receive a basic pre-publication safety/spam screen; human review remains required.

## Backups and recovery

- Enable automated PostgreSQL backups with the hosting provider before inviting external testers.
- Retain at least seven daily restore points during alpha.
- Perform and document a staging restore test before public launch and quarterly afterward.
- Alert on health-check failures, elevated HTTP 5xx responses, and database exhaustion.
- Never test restoration by overwriting the production database.

## Metrics

The admin moderation page includes the alpha North Star and supporting metrics:

- approved reflections per weekly active user;
- weekly active users;
- approved reflections in the last seven days;
- approval rate.

Review these alongside safety-report volume, time to first approved reflection, invitation conversion, and qualitative interviews. Do not optimize raw lumen totals.

## TestFlight sequence

1. Internal group: team-owned accounts and physical-device smoke testing.
2. Closed alpha: 20–50 people from one real community.
3. Expanded pilot: up to 200 only after moderation response and account deletion are proven.
4. Public App Store submission only after retention and safety gates are met.

Each build needs a unique iOS build number. `eas.json` enables automatic production build-number increments. Confirm the bundle identifier and production API URL before the first upload.

## Remaining external dependencies

- Branded 1024×1024 App Store icon and splash artwork.
- A monitored support mailbox at the configured address.
- A media-storage and image-moderation decision if photo reflections remain enabled.
- Crash/error monitoring provider and alert recipients.
- Apple Developer and App Store Connect ownership, agreements, metadata, screenshots, age rating, and reviewer credentials.
- Legal review of launch policies for the actual company and launch regions.
