# Release checklists: Capacitor app to Google Play and the App Store

> **Problem:** "Build succeeded" does not mean the package is right; store pipelines accept valid-looking artifacts with the wrong content.
>
> **Practice:** Look inside the artifact before shipping, read the build's own output path, verify version stamps both ways, and answer store review honestly.
>
> **Evidence:** A demo-ads bundle reached closed testing because a piped build script died of SIGPIPE before flipping the flag; a hard-coded file name shipped the previous version. [`tools/verify_bundle.js`](../../tools/verify_bundle.js) is the generic guard.

Lessons from shipping a Capacitor (vanilla JS) app with ads and subscriptions, iOS built in the cloud
(Codemagic) from a Windows machine. The common thread: **"build succeeded" does not mean the package is
right.** Every item below is a trap that produced a valid-looking artifact with the wrong content.

## Before any build

- [ ] **Target API requirement checked FIRST**, not as the last step. Play raises the required
      `targetSdk` every August (new apps and updates must target API 36 since 31 Aug 2026). The mismatch is
      only rejected at upload. Raising compileSdk may require a newer Android Gradle Plugin.
- [ ] After a target API bump, check predictive back (`enableOnBackInvokedCallback`) first - it is the
      flag the platform will stop honouring.
- [ ] Web assets versioned: JS/CSS cache-busting stamp **and** the service-worker version constant bumped
      together. Otherwise the shell cache keeps serving the old JS.
- [ ] `.gitignore` dependency rules anchored to root (`/vendor/`, not `vendor/`, which also ignored
      `js/vendor/` and left a runtime library out of git).

## Android (AAB)

- [ ] **Ad test flag:** source keeps `TEST: true` forever; only the release build step flips it in the
      output copy and verifies it. Both directions are expensive: demo ads in production = zero revenue for
      weeks unnoticed; real ads in development = one accidental self-click can permanently close the ad
      account.
- [ ] **Never pipe the build script into something that closes early** (`| head -3`, `grep -m`). The
      reader closes, the script gets SIGPIPE, `set -eu` kills it right before the step that flips the flag;
      `dist/` is already populated and looks fine. A demo-ads AAB went to closed testing this way. Write the
      log to a file and read it afterwards.
- [ ] **Last line of defence = look inside the artifact.** The packaging tool opens the AAB (zip) and
      reads the ad-ids file inside it; if `TEST: false` is not there it refuses to produce the upload folder.
      Counter-test it once with a deliberately bad AAB.
- [ ] **Packaging reads the build's own output path**, never a hard-coded file name. A hard-coded
      `...v5.6-play.aab` shipped the previous version inside a perfect-looking folder. versionCode/Name come
      from the Gradle file, dates from the system clock.
- [ ] **Second inside check:** the web version stamp inside the AAB equals the one in the repo (catches a
      skipped `cap sync` or stale Gradle assets). Counter-tested by bumping the stamp on purpose.
- [ ] Copy the AAB under a versioned name (`app-v<web>-vc<code>-play.aab`); Gradle always calls it
      `app-release.aab`.
- [ ] After producing a test APK, return the project to release state (the test build writes `TEST: true`
      into native assets; the next `bundleRelease` would silently ship demo ads).
- [ ] With R8/minify on, compare plugin calls (including permission checks) against a non-R8 build. R8
      stripped annotation classes the framework reads by reflection and `checkPermissions` returned empty;
      fixed with keep rules for the framework package.
- [ ] Native end-to-end test on a real APK whenever the framework or a plugin version changes, on at least
      two WebView paths (< 140 and >= 140 behave differently for system bars) plus the oldest supported
      Android. 41 checks: plugins, onboarding, safe-area measurement, system-bar colour measured in pixels,
      back button, tap-through lesson, sound, vibration, notification lands in tray, rewarded ad,
      background/foreground, kill-and-reopen persistence.
- [ ] Test-tool trap: ad SDKs open a separate WebView in the same process - select the app page by origin,
      or the test runs inside the ad page.
- [ ] Notifications: newer plugin versions default to exact alarms; without the permission `schedule()`
      sends the user to settings and the promise never resolves. Set inexact explicitly.
- [ ] Store screenshots: Play sides 320-3840 px **and** long side <= 2x short side.

## Store console work done by someone else

If the person who owns console access uploads (or the console is off-limits to the AI), ship **one folder**:
AAB, screenshots numbered in upload order, every paste-in text as its own `.txt`, plus a guide. Guide
format per step: (1) the term to type into the console's search box, (2) "you are in the right place if you
see...", (3) the answer to the question asked. Never "click the third item in the left menu" - console
layouts change within months; the search box and the answers do not.

## iOS (cloud build)

- [ ] **Marketing version (CFBundleShortVersionString) increases on every App Store submission**, not
      only the build number. The trap fires only after the first version is approved: the next upload fails
      with "train version closed". Set it from a CI variable, write it, read it back, fail the build if the
      read-back differs.
- [ ] iOS and Android version names do not have to match; the two stores' histories diverge.
- [ ] Cloud CI raw logs may not be readable via API; the per-step endpoint usually is - that is where the
      upload error was found.
- [ ] Prove what is in a build by downloading the artifact (IPA) and opening it, not by reasoning.
- [ ] TestFlight: internal groups get every build automatically (assigning a build to them returns 422);
      external groups need explicit assignment and pass Beta App Review first. Beta review needs a
      description, review contact details **including phone**, and a processed (VALID) build. After the
      first beta approval, later builds were usually approved instantly - not guaranteed.

## App Store review

- [ ] First submission of a new account: expect Guideline 2.1 "Information Needed". It is not a bug
      rejection. Prepare the answer in advance: what the app is, which accounts/content/payments/backend it
      does or does not have, a screen recording.
- [ ] Order: edit the version (build, notes, attachment) -> Save -> reply to App Review -> Submit. Replying
      can push the version into review; it must already carry the right build.
- [ ] Reply and Notes fields are 4000 characters. Write paste-in files with **LF** line endings - some
      counters count CRLF as 2 and a 3,965-char answer showed as 4,010. Keep only one version of the long
      answer so the wrong one cannot be pasted later.
- [ ] Screen recording as an unlisted video link (messenger apps downscale video until text is unreadable).
- [ ] Recorded on Android? **Say so.** Claiming "physical iPhone" is a false statement that can move the
      issue from 2.1 to accurate-metadata territory (account level). The honest argument: Capacitor, same
      HTML/CSS/JS on both platforms, list the only platform-specific branches, offer an iOS recording.
- [ ] **Never change the build attached to a submission while it is in review** - it leaves the queue.
      Ship fixes to TestFlight meanwhile.
- [ ] Cancelling a submission to swap assets can take > 2.5 min to settle; resubmitting earlier fails
      with "part of another submission". Same version name can take a new build.
- [ ] Description characters: some emoji (e.g. a lightning bolt) are rejected as invalid; simple bullets pass.
- [ ] Exact screenshot sizes for the largest iPhone class are required (e.g. 1320x2868).

## Data and privacy declarations

- [ ] The mobile ad SDK's own disclosure page lists four collected-and-shared data types, not just the
      advertising id: approximate location (from IP), in-app interactions, diagnostics, device/other ids.
      Declare all four on both stores. Under-declaring is a suspension reason; over-declaring is not.
- [ ] "Approximate location" does not contradict "no location permission" in the privacy policy - the
      app never asks for location; the ad network estimates it from IP, which the policy should state.
- [ ] Ad consent (UMP) and iOS tracking prompt (ATT) present before ads.
