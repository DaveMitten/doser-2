# Doser — Privacy Policy

**Status: DRAFT. This is not legal advice.**
This document was drafted by describing what the Doser app and its backend actually do, as
implemented in this repository. It has **not** been reviewed by a lawyer. It must be reviewed
and approved by a qualified legal professional before it is published or referenced from the
App Store listing. See `OWNER_TASKS.md` O-2.2.

Anything in `[SQUARE BRACKETS]` is a placeholder the owner must fill in before publication.

**Last updated:** [DATE OF PUBLICATION]
**Applies to:** the Doser mobile app for iOS (bundle identifier `com.doser.mobile`).

---

## 1. Who we are

Doser is operated by **[LEGAL ENTITY NAME]**, **[REGISTERED ADDRESS]**
(“we”, “us”, “Doser”). For the purposes of UK/EU data protection law we are the **data
controller** for the personal data described in this policy.

If you have any question about this policy or about your data, contact us at
**[PRIVACY CONTACT EMAIL]**.

---

## 2. The short version

- Doser stores **health data**: a record of your cannabis prescriptions and of each
  consumption session you choose to log.
- That data is stored against your account — it is **not anonymous**.
- We do **not** sell your data, share it with advertisers, or use it for advertising.
- There is **no analytics SDK, no advertising SDK and no cross-app tracking** in the app.
- You can **delete your account and all of its data from inside the app**, at any time,
  without contacting us.

---

## 3. Health data — read this part

The whole purpose of Doser is to track medical cannabis use. That means the data you enter is
**health data**, which is “special category” personal data under UK/EU GDPR and sensitive
personal information under laws such as the California Consumer Privacy Act.

We process it on the basis of your **explicit consent**, which you give by creating an account
and choosing to enter this information. You can withdraw that consent at any time by deleting
your account (section 8).

We treat this data as confidential. We do not disclose it to employers, insurers, advertisers,
or data brokers.

---

## 4. What we collect

We only collect what you type into the app, plus what is technically required to run an
account. There is no background collection.

### 4.1 Account data

Handled by Supabase Auth on our behalf:

- **Email address** — your login identifier, and where account emails (such as email
  confirmation) are sent.
- **Password** — stored only as a salted hash by Supabase. We never see or store your
  plaintext password.
- **Display name** — optional, supplied by you at sign-up.
- **Account identifier and timestamps** — an internal user ID, account creation time, and
  email confirmation status.

### 4.2 Prescriptions

For each prescription you add:

- Strain or product name
- Product type (flower, oil or capsule)
- Total prescribed amount and current remaining stock
- THC and CBD percentages
- Your low-stock threshold and whether restock reminders are enabled
- Created / updated / deleted timestamps

### 4.3 Sessions (consumption logs)

For each session you log:

- Which prescription and which device it used
- Loading method (chamber or capsule) and quantity
- Peak temperature
- Material weight, and the THC/CBD content recorded for that session
- Effects you selected (for example: focused, calm, sleepy)
- **Your free-text journal entry, if you write one** — please note that anything you type
  here is stored as you wrote it, so avoid including details you would not want stored
- The date and time of the session, and when the record was created

### 4.4 Devices

For each vaporiser or device you add: its name, chamber capacity, capsule capacity, and
minimum and maximum temperature.

### 4.5 Preferences

Your default loading method, default device, temperature scale (Celsius or Fahrenheit),
restock date, and whether low-inventory alerts and critical reminders are switched on.

### 4.6 Data stored only on your phone

- Your **login session token**, stored by the operating system’s app storage so you stay
  signed in between launches.
- A **local cache** of the data above, so screens can render without waiting for the network.
- Your **18+ age confirmation**, stored as a single flag.

This on-device data is removed when you sign out or delete the app.

### 4.7 What we do NOT collect

To be explicit, Doser does **not** collect or access:

- Your location
- Your contacts, photos, camera or microphone
- Your device advertising identifier (IDFA), and we do not ask for tracking permission
- Analytics or usage-behaviour telemetry — there is no analytics SDK in the app
- Performance telemetry or session recordings
- Any health data held by Apple Health or any other app

> **Reviewer note:** items 4.7 must be re-checked before each App Store submission.

### 4.8 Crash reports

When the app crashes or hits an unexpected error, it sends a crash report to our
error-tracking provider (section 5) so we can fix it. A report contains the technical error
and stack trace, your device model and operating system version, the app version, and your
**internal account ID**, so we can tell whether one person hits a problem repeatedly. It does
**not** include your email, name, IP address, or any prescription, session or journal
content.

---

## 5. Who else processes your data

We use a small number of service providers (“processors”). We do not sell data to anyone, and
none of these providers is permitted to use your data for their own purposes.

| Provider | What they do | What they receive |
|---|---|---|
| **Supabase** | Hosts our Postgres database and handles authentication | Everything in sections 4.1–4.5 |
| **Adapty** | Manages subscription status and entitlements | A subscription profile identifier and your purchase/entitlement status. **No health data.** |
| **Sentry** (Functional Software, Inc.) | Error and crash reporting | The crash reports described in section 4.8. **No health data** |
| **Apple** | Processes App Store payments | Your payment details, which go to Apple directly — **we never see or store card details** |

If we are running without a subscription provider configured, no data is sent to Adapty at
all and all users are treated as being on the free tier.

Hosting region: **[HOSTING REGION — e.g. Supabase project region]**. Depending on that region,
your data may be transferred outside the UK/EEA; where it is, the transfer is covered by
**[TRANSFER MECHANISM — e.g. UK IDTA / EU Standard Contractual Clauses]**.

---

## 6. Why we process it (legal bases)

| Purpose | Legal basis (UK/EU GDPR) |
|---|---|
| Running your account and letting you sign in | Performance of a contract |
| Storing your prescriptions, sessions, devices and preferences | Explicit consent (Art. 9(2)(a)), as this is health data |
| Managing your subscription and entitlements | Performance of a contract |
| Keeping the service secure and preventing abuse | Legitimate interests |

---

## 7. How long we keep it

We keep your data for as long as your account exists. When you delete your account, the
associated records are deleted immediately (see section 8).

Deleted prescriptions are held briefly as “soft-deleted” records so that they can be restored
from within the app; they are removed permanently when you clear your data or delete your
account.

Backups taken by our hosting provider may retain a copy for up to **[BACKUP RETENTION PERIOD]**
before they expire on their normal rotation.

---

## 8. Your rights, and how to exercise them in the app

You have the right to access, correct, delete, restrict, object to and port your personal
data, and to withdraw consent at any time. If you are in California you also have the right
not to be discriminated against for exercising these rights — we do not do so.

Two of these rights are built into the app and take effect immediately:

- **Delete your account.** Profile → Delete Account. This permanently deletes every
  prescription, session, device and preference record we hold for you, and then deletes the
  account itself from our authentication provider. It cannot be undone, and it does not
  require you to contact us.
- **Clear your data but keep your account.** Profile → Clear Inventory History. This deletes
  your prescriptions and session logs while keeping your account, devices and preferences.

You can correct or export any other data by editing it in the app, or by writing to us at
**[PRIVACY CONTACT EMAIL]**. We will respond within one month.

If you are unhappy with how we have handled your data, you can complain to the UK Information
Commissioner’s Office (ico.org.uk) or your local supervisory authority.

---

## 9. Security

Access to your data is authenticated: every request to our servers must carry a valid session
token issued by our authentication provider, and each request is checked against the account
it belongs to before any data is read or written. Data is encrypted in transit (HTTPS) and
encrypted at rest by our hosting provider.

No system is perfectly secure. If a breach affects your personal data and creates a risk to
you, we will notify you and the relevant regulator as the law requires.

---

## 10. Children

Doser is not for children. You must be **18 or over** to use it, and the app asks you to
confirm this before you can use any logging feature. We do not knowingly collect data from
anyone under 18. If you believe a minor has created an account, contact
**[PRIVACY CONTACT EMAIL]** and we will delete it.

---

## 11. Doser is not medical advice

Doser is a tracking and record-keeping tool. It does not provide medical advice, diagnosis or
treatment, and its calculations are estimates only. Always follow your prescriber’s
instructions. See the Terms of Service for the full disclaimer.

---

## 12. Changes to this policy

If we change this policy we will update the “Last updated” date above, and — where the change
is significant, for example if we start using a new processor or collect a new category of
data — we will tell you in the app before the change takes effect.

---

## 13. Contact

**[LEGAL ENTITY NAME]**
**[REGISTERED ADDRESS]**
**[PRIVACY CONTACT EMAIL]**
