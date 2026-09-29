# Fix OTP screen transition

## Goal
After a registered phone number successfully requests an OTP, immediately replace the phone form with the OTP entry box.

## Changes
- Make the MSG91 send wrapper recognize every successful callback shape, including callbacks that do not return a request ID.
- Move the sign-in screen to OTP entry as soon as MSG91 confirms the send, without waiting indefinitely for optional response data.
- Preserve a valid request identifier when MSG91 provides one so verification remains secure.
- Show a clear send error instead of leaving the Send OTP button spinning when MSG91 does not complete its callback.

## Verification
- Run the TypeScript check.
- Test the phone-to-OTP transition on the sign-in page and confirm failures return control to the phone form.
