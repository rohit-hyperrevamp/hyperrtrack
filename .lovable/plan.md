# Recruitment (HR) — Super Admin only

## Goal
A full recruitment funnel for non-billable (office/staff) hires, from adding a candidate to onboarding them with an employee ID. It sits under HR in the left menu and works the same way as Sales & Marketing. Only you as Super Admin can see it until you name roles.

## Menu
HR → **Recruitment**, with:
- **Dashboard**
- **Candidates**: list and stage board
- **Openings**: posts and their interview rounds
- **My Interviews**: for the people assigned to interview
- **Onboarding Requests**: the HR Head's queue

## Dashboard tiles
Open candidates, In pipeline, Closures this month (onboarded), Lost this month (rejected or withdrawn), and Closure % (onboarded ÷ (onboarded + lost) this month). It also shows:
- Stage tiles
- A funnel
- Upcoming interviews (next 7 days)
- Breakdowns by opening, department and source
- Overdue feedback

Every tile opens a filtered candidate list.

## Openings (round setup)
HR creates an opening with:
- Designation and department (non-billable only)
- Branch and number of positions
- Salary range
- Number of rounds (1, 2 or 3). Each round has a name (e.g. HR Screening, Technical, Final) and a default interviewer.

## Candidate
- **Details:** name, mobile, email, current location, experience, current and expected CTC, notice period, source and referred-by.
- **Resume:** uploaded as a private file and opened through a short-lived link.
- **Opening applied for**, plus notes and a timeline of every action.
- **Stages:** New → Screening → Round 1 → Round 2 → Round 3 → HR Approved → Pending Onboarding → Onboarded, plus Rejected, Withdrawn and On Hold.

## Interview flow
1. HR schedules each round: date and time, mode (in person, phone or video), location or link, and the interviewer, picked from employees.
2. The interviewer sees it in **My Interviews** and is notified in the app.
3. The interviewer selects **Approve** or **Reject** and must add feedback and a rating.
   - **Approve:** the candidate moves to the next round automatically, and HR is prompted to schedule it. If no rounds are left, the candidate moves to HR Approved.
   - **Reject:** the candidate moves to Rejected and the reason is recorded.
4. The candidate page shows a progress strip, e.g. Round 1 of 3 approved.

## HR approval → HR Head onboarding
1. HR finalises the offer: offered salary (monthly CTC and gross), date of joining, designation, department, branch, reporting manager and home unit. Home unit defaults to the Radiant Pune Office, non-billable.
2. HR selects **Send to HR Head**, which creates an onboarding request.
3. The HR Head sees every field, including salary, and can select **Onboard** or **Send back**.
4. **Onboard** creates the employee record. The existing employee code numbering generates the employee ID, and all candidate details are carried over. The candidate is then marked Onboarded and linked to the employee.
5. The approval chain uses the workflow setup, not hardcoded roles.

## Integration
- System Logs record every create, schedule, approval, rejection, send and onboard action.
- In-app notifications go to interviewers and the HR Head.
- All lists are paginated, with CSV export.

## Technical details
- Production migration `db/prod-migrations/<ts>_recruitment.sql`:
  - Tables `rec_openings`, `rec_opening_rounds`, `rec_candidates`, `rec_interviews` and `rec_onboarding_requests`, with grants and RLS.
  - Access gated by `current_user_can_recruit()`: Super Admin, or the `recruitment` RBAC module. Interviewers can read and act only on their own interviews.
  - Candidate code trigger (REC1001…) and a stage-history trigger.
  - Security-definer RPC `rec_submit_interview_result` handles round advance or reject.
  - Security-definer RPC `rec_onboard_candidate` inserts into `candidates` with status approved, so `set_employee_code` assigns the ID.
- Private storage bucket `recruitment` (`resumes/<candidate>/<file>`).
- `workflow_definitions` key `recruitment_onboarding`, with a step whose approver role is HR Head.
- `src/lib/recruitment.ts` data layer.
- Routes `/admin/hr/recruitment/*`.
- `recruitment` module registered in the role permission list and route guard. Sidebar entry under HR, Super Admin only.
- Add an AGENTS.md entry. `bunx tsgo --noEmit` must pass.
