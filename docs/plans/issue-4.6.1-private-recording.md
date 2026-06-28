# [Story 4.6.1] Record Private Audio Reference and Save to Cloud Storage

**Description:**
> **Story 4.6.1**
> As a Member, I want to record an audio reference of a song using my device's microphone and save it securely to private cloud storage so that I can practice and review my private rehearsals.

**Acceptance Criteria (Gherkin):**

```gherkin
Scenario: Render microphone recording controls
  Given I am logged in as a Member
  And I am viewing the Song Detail page
  Then I should see a "Record Rehearsal" button in the audio section

Scenario: Record and play back audio locally before saving
  Given I am logged in as a Member
  And I have clicked "Record Rehearsal" and granted microphone permissions
  When I record a rehearsal snippet
  And I click "Stop"
  Then I should be able to play back the recording locally before uploading

Scenario: Save private audio reference to cloud storage
  Given I have completed a local recording snippet
  When I click "Upload to Private Storage"
  Then the audio file (WebM/AAC format) should be uploaded to the Supabase Storage private bucket
  And the recording URL should be linked to the song metadata for my profile
  And only I (the owner) should see and play this recording on the song page

Scenario: Guest cannot record or see private rehearsals
  Given I am a Guest user
  When I view the Song Detail page
  Then the "Record Rehearsal" button should be hidden
  And I should not see any private rehearsal recordings
```

**Technical Specifications:**
1. **Frontend Recording**: Use browser native `MediaRecorder` API to capture microphone stream.
2. **Local Playback**: Construct a local `Blob` URL for pre-upload review.
3. **Storage Server**: Set up a new private storage bucket in Supabase (S3-compatible) with RLS policies restricting read/write access strictly to the authenticated creator (`auth.uid() = owner_id`).
4. **Metadata Schema**: Update database to track private recording reference URLs linked to compositions and user profiles.

**Labels:** `user-story`, `epic-4.6`
