# Recruitment actions and dashboard visibility

## Goal
Make candidate actions look consistent and ensure scheduled interviews are visible to the recruiter, assigned interviewer, and leadership.

## Changes
- Replace the loose top status/actions with a clear stage control group using standard button sizes and distinct Hold, Withdraw, and Reject hierarchy.
- Improve the round progress strip so current, completed, scheduled, and pending rounds are immediately distinguishable on desktop and mobile.
- Update My Interviews to include interviews assigned to the signed-in user and interviews created by that recruiter, without duplicates.
- Add a Recruitment view within the leadership Employees section showing pipeline totals and upcoming interviews.
- Add hiring classification for blue-collar/white-collar and billable/non-billable openings, with existing openings defaulting to white-collar and non-billable.
- Show assigned upcoming interviews on the signed-in user's main dashboard.

## Technical details
- Keep recruitment access enforced in production data policies; leadership gets summary visibility while interview decisions remain restricted to recruiters and assigned interviewers.
- Reuse existing recruitment queries, pagination, activity logging, and system design components.
- Add the production schema change only under `db/prod-migrations/`, apply it to the production database, and run `bunx tsgo --noEmit`.
