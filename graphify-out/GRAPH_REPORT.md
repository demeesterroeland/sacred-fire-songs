# Graph Report - sacred-fire-songs  (2026-10-30)

## Corpus Check
- 432 files · ~272,819 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 362 file(s) not represented in the graph (top: .cho 352, (none) 5, .example 2)

## Summary
- 2277 nodes · 4478 edges · 218 communities (130 shown, 88 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 459 edges (avg confidence: 0.86)
- Token cost: 1,448,868 input · 0 output

## Community Hubs (Navigation)
- UI Primitives & Auth Forms
- Rehearsal Audio & Recording
- Task Logbook Sessions
- Agent Rules & Sync Workflows
- Docker Build Workflow
- Song Form & Artist Input
- Song Cards & Tag Pills
- Performance CI Workflow
- E2E CI Workflow
- Categories Schema Migrations
- Gatekeeper Role Implementation
- Account Settings & Supabase Client
- Auth Hook & Playlist Pages
- Architecture Audit Remediation
- E2E Test Matrix (docs)
- Song Search & Filter UI
- Song Queries & Mapping
- E2E Test Matrix (testing)
- Server Queries & Artists
- Playlists Pages & Cards
- Playwright E2E Specs
- Playlist Actions & Validation
- Category Taxonomy Design
- Database Schema Design
- Runtime Dependencies
- Song Detail & React Query
- SDLC & CI/CD Guide
- Root Layout & Providers
- Preferences & Wake Lock
- Phase 4 Epics & Stories
- Dev Dependencies
- Application Analysis & Design
- Web Dev Curriculum & PWA
- Gatekeeper Role Stories
- TypeScript Config
- Code Review Agent Skills
- Docker Env: Core Secrets
- User Guide & Email Templates
- Library & Sidebar Stories
- Declarative Filter Hooks
- Package Manifest
- Screen Mockups: Core Screens
- Song Management Stories
- Release Please Workflow
- ChordPro Parsing
- Playlist Detail & Add Songs
- Songbook PDF Scripts
- ChordPro Import & Tests
- Test Cases Document
- Home Screenshot
- ChordPro Display Utils
- Auth Screen Mockups
- NPM Scripts
- Performance Benchmark Runner
- Story Lifecycle Commands
- Server Migration Walkthrough
- Story-to-GitHub Sync Scripts
- Docker Env: Storage
- Docker Env: Studio
- Add Song Screen Mockup
- Rehearsal Media Player Spec
- Library Screenshot
- Benchmark HTML Report
- Unified Audio PR
- Project Instructions & Doc Commands
- Playlist Context Menu
- Home Page & Last Seen
- Sidebar Context & Swipe
- Docker Service Dependencies
- Tag Filtering Mockup Logic
- Editor Screenshot
- Settings Screenshot
- Changelog Releases
- Sidebar Navigation
- Docker Healthchecks
- Docker Env: Auth (GoTrue)
- Account Settings Mockup
- Hearth Error Screens
- Search Modal Screenshot
- i18n Implementation Plan
- Review & Security Commands
- Header & User Profile
- Docker Env: Postgres Meta
- Error Page Template
- Phase 3 Epics & Stories
- Domain Types
- Playlist Picker
- Docker Compose Services
- Docker Env: Postgres
- Musician Profile & Music Tools
- E2E README & Fixtures
- Artifact Sync & Public Playlists
- README & Branch Rules
- Edit Own Song Stories
- Mobile Bottom Nav
- Docker Env: PostgREST
- Song Viewer & Media Links
- PWA Install Android
- ChordSheetJS Debug Scripts
- Supabase API Proxy Route
- User Preferences Context
- Categories SQL Script
- Delete Song Confirmation
- Wake Lock & Ceremony Mode
- Icon Generation Script
- GitHub Sync & Global Setup
- Docker Env: Imgproxy
- Testing Overview
- Issue 239 & Private Recording
- E2E Performance Fixtures
- Import My Songs Script
- Import Nina Urku Script
- Docker Env: Kong
- Tag Editing & Filtering Sessions
- ESLint Config
- Guest Favorites Hook
- MCP Config
- Brand Visual Assets
- Release Please Config
- Test DB Setup & Seeder
- Library Tabs Layout
- Song Card Mockup Variants
- PWA Install iOS
- Clone Prod to Staging
- Not Found Page
- Auth User Trigger
- Page Transition
- Gatekeeper & Musician Plans
- Run Migrations Script
- Supabase Rate Limits Script
- Guest Favorites Tests
- YouTube Embed
- Playlist Section Mockups
- ChordPro Rendering Sample
- Audit Images Config
- OpenCode Config
- Benchmark Shell Script
- Security Scan Script
- Chords/Melody Toggle
- Responsive Layout Pattern
- Walkthrough & Curriculum
- Issue Migration Tooling
- CI Glob & Preview Deploy
- Artists Page Spec
- dnd-kit Core
- Radix Dialog
- Radix Popover
- Supabase SSR
- PostCSS Config
- Preview2Prod Script
- Restart Script
- Start Issue Script
- Playlist Seeds
- Screen 16: Playlists (Mockup)
- Sort Dropdown (Newest First, Title A-Z, 
- Standardized Header Logo Component (flam
- Edit / Delete / Back Action Buttons
- Recordings Section with YouTube Embed
- Story 4.6.1 Private Recording Issue Spec

## God Nodes (most connected - your core abstractions)
1. `Master Tasks Logbook` - 88 edges
2. `react` - 77 edges
3. `next` - 75 edges
4. `lucide-react` - 64 edges
5. `cn()` - 63 edges
6. `createClient()` - 62 edges
7. `createClient()` - 57 edges
8. `Time Tracking Report (Dec 25, 2025 - Sep 27, 2026)` - 54 edges
9. `SongForm()` - 33 edges
10. `useAuth()` - 33 edges

## Surprising Connections (you probably didn't know these)
- `Melody Notation / ABC field (#60)` --references--> `SongDisplay()`  [EXTRACTED]
  docs/logbook/master-walkthrough.md → components/song/SongDisplay.tsx
- `Draft Auto-Save (localStorage form persistence)` --references--> `SongForm()`  [EXTRACTED]
  docs/logbook/master-walkthrough.md → components/song/SongForm.tsx
- `Import Song Metadata (.cho upload & paste parsing)` --references--> `SongForm()`  [EXTRACTED]
  docs/logbook/master-walkthrough.md → components/song/SongForm.tsx
- `Logout functionality in useAuth, Sidebar and MobileMenu` --references--> `useAuth()`  [EXTRACTED]
  docs/logbook/master-tasks.md → hooks/useAuth.tsx
- `Next.js 16 / React 19 Framework Audit` --references--> `useAuth()`  [EXTRACTED]
  docs/logbook/master-walkthrough.md → hooks/useAuth.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Brain-to-logbook artifact synchronization flow** — _agent_rules_artifact_sync_policy, _agent_workflows_sync_artifacts, _opencode_commands_sync_artifacts, _agents_agents, _agent_rules_artifact_sync_policy_brain_files, _agent_rules_artifact_sync_policy_master_logbook_files, _agent_skills_agent_flow_skill [EXTRACTED 1.00]
- **Documentation-code consistency governance (sync policy, changelog, schema, audit)** — _agent_rules_sync_policy, _agent_rules_doc_changelog_policy, _agent_rules_schema_migration_policy, _agent_workflows_sync_doc_and_code, _agent_workflows_update_doc_changelog, _agent_workflows_update_schema, _agent_rules_sync_policy_definition_of_done [INFERRED 0.95]
- **Code audit and review personas sharing severity-marker conventions** — _agent_senior_architect, _agent_skills_code_review_skill, _agents_skills_architecture_review_skill, _agent_skills_security_scanner_skills, _agent_senior_architect_severity_markers, _agent_skills_code_review_skill_feedback_markers [INFERRED 0.85]
- **Session Artifact Sync Flow (.brain files to docs/logbook master files)** — _brain_readme_session_brain_files, _brain_task_i18n_tasks_246, _brain_walkthrough_release_v1_0_0, _brain_time_tracking_report_story_3_4_6, _claude_commands_sync_artifacts_sync_artifacts, _claude_commands_sync_artifacts_append_only_policy, claude_artifact_synchronization_policy [EXTRACTED 1.00]
- **Quality Review & Audit Command Family** — _claude_commands_code_review_code_review, _claude_commands_senior_architect_senior_architect, _claude_commands_security_scan_security_scan, _claude_commands_audit_consistency_audit [INFERRED 0.85]
- **User Story Delivery Lifecycle (issue, branch, implement, sync, deploy)** — _claude_commands_create_issue_create_issue, _claude_commands_start_story_start_story, _claude_commands_sync_stories_sync_stories, claude_branch_protection, _brain_deploy_flow_deploy_flow, changelog_release_please [INFERRED 0.85]
- **Persistent Rehearsal Media Player Architecture (YouTube/SoundCloud/Spotify sync)** — docs_rehearsal_media_player_spec_capability_matrix, docs_rehearsal_media_player_spec_persistent_play_on_tab_change, docs_rehearsal_media_player_spec_auto_pause_others, docs_rehearsal_media_player_spec_bottom_mini_player, docs_rehearsal_media_player_spec_youtube_player_event_loop, docs_rehearsal_media_player_spec_soundcloud_player_event_loop, docs_rehearsal_media_player_spec_spotify_focus_blur_detection, docs_rehearsal_media_player_spec_e2e_intercept_mode [EXTRACTED 1.00]
- **E2E Test Infrastructure (global setup, DB wipe/seed, random seeder, per-role auth, CI workflow)** — docs_design_application_analysis_design_e2e_database_isolation, docs_design_application_analysis_design_global_setup, docs_design_application_analysis_design_setup_test_db_script, docs_design_application_analysis_design_random_seeder, docs_testing_e2e_test_overview_database_isolation, docs_testing_e2e_test_overview_ci_approach, docs_testing_e2e_test_overview_per_role_storagestate, e2e_readme_auth_setup, e2e_readme_roles_fixture, e2e_readme_ci_workflow [INFERRED 0.95]
- **GitHub Flow Release Pipeline (local -> preview -> QA -> PR smoke -> release)** — docs_guides_development_workflow_local_development, docs_guides_development_workflow_preview_environment, scripts_dev2preview, docs_guides_development_workflow_docker_workflow, docs_guides_development_workflow_qa_testing, docs_guides_development_workflow_pull_request_e2e_smoke, docs_guides_development_workflow_release_deployment, docs_guides_development_workflow_no_latest_tag_in_production [EXTRACTED 1.00]
- **Error screens built on the Hearth Error Page Template (500, 401, 429, 503, Offline)** — docs_design_screens_error_screen10_500_server_error_screen, docs_design_screens_error_screen11_401_unauthorized_screen, docs_design_screens_error_screen12_429_too_many_requests_screen, docs_design_screens_error_screen13_503_maintenance_screen, docs_design_screens_error_screen14_offline_screen [INFERRED 0.95]
- **Authentication & Registration Flow (Login -> Sign Up -> Email Verified -> Finish Registration)** — docs_design_screens_auth_screen3a_login_magic_screen, docs_design_screens_auth_screen3b_login_password_screen, docs_design_screens_auth_screen3c_signup_screen, docs_design_screens_auth_screen3f_finish_registration_screen, docs_design_screens_error_screen11_401_unauthorized_approach_the_hearth_cta [INFERRED 0.85]
- **Add Song Form Sections** — docs_design_screens_actions_screen4_song_add_lyrics_file_upload, docs_design_screens_actions_screen4_song_add_metadata_form, docs_design_screens_actions_screen4_song_add_key_capo_tuning, docs_design_screens_actions_screen4_song_add_language_selector, docs_design_screens_actions_screen4_song_add_categories_tags_input, docs_design_screens_actions_screen4_song_add_lyrics_chords_editor, docs_design_screens_actions_screen4_song_add_media_links, docs_design_screens_actions_screen4_song_add_save_draft_publish_footer [EXTRACTED 1.00]
- **Screens sharing the standard sidebar navigation (Dashboard, Explore, Songs, Library, Add Song)** — docs_design_screens_screen1_home, docs_design_screens_screen2_song_detail, docs_design_screens_screen7_explore_categories, docs_design_screens_screen8_category_detail, docs_design_screens_screen15_songs, docs_design_screens_screen16_library_playlists, docs_design_screens_screen17_filter_songs, docs_design_screens_screen1_home_sidebar_navigation [EXTRACTED 1.00]
- **Screens implementing the same JS tag-filtering system (availableTags, activeTags, autocomplete pills)** — docs_design_screens_screen8_category_detail_tag_filtering_system, docs_design_screens_screen15_songs_tag_filter_field, docs_design_screens_screen15_songs_available_tags_model, docs_design_screens_screen17_filter_songs_category_preselected_state [INFERRED 0.95]
- **UI elements that present the six-category song taxonomy with consistent tag colors** — docs_design_screens_screen7_explore_categories_category_taxonomy, docs_design_screens_screen7_explore_categories_category_card, docs_design_screens_screen8_category_detail_sidebar_filter_buttons, docs_design_screens_screen15_songs_sidebar_category_filters, docs_design_screens_screen15_songs_available_tags_model, docs_design_screens_screen17_filter_songs_match_any_category_filter, docs_design_screens_screen2_song_detail_category_tags [INFERRED 0.95]
- **ChordPro Rendering Pipeline (editor -> parser -> display)** — components_song_chordproeditor_chordproeditor, components_song_songform_songform, lib_chordproparsing_haschords, lib_chordutils_parsechordprofordisplay, components_song_songdisplay_songdisplay, docs_logbook_master_walkthrough_chordpro_parser [INFERRED 0.85]
- **Song Library Filtering Flow (URL state, filter config, tag UI)** — app_songs_songspagecontent_songspagecontent, hooks_usesongsfilter_usesongsfilter, lib_songs_filterconfig_songfilterconfig, components_library_tagselector_tagselector, components_library_searchfiltersmodal_searchfiltersmodal, components_library_librarysidebar_librarysidebar, docs_logbook_master_walkthrough_combinable_filters [INFERRED 0.85]
- **Rehearsal Recording & Unified Audio Playback Flow** — components_song_audiorecorder_audiorecorder, components_song_rehearsaldrawer_rehearsaldrawer, lib_actions_rehearsal_getuserrecordings, lib_actions_rehearsal_uploadrehearsalrecording, lib_actions_rehearsal_deleteuserrecording, components_song_audioprovider_useaudio, app_songs__id__page, docs_logbook_master_walkthrough_unified_audio_experience [EXTRACTED 1.00]
- **Gatekeeper curation capability set (Epic 3.4)** — docs_logbook_epic_user_stories_role_gatekeeper, docs_logbook_epic_user_stories_story_3_4_1_assign_gatekeeper, docs_logbook_epic_user_stories_story_3_4_2_flag_songs, docs_logbook_epic_user_stories_story_3_4_3_edit_metadata_any_song, docs_logbook_epic_user_stories_story_3_4_4_merge_duplicates, docs_logbook_epic_user_stories_story_3_4_5_featured_playlists, docs_logbook_epic_user_stories_story_3_4_6_public_playlist_curation [EXTRACTED 1.00]
- **Playlist / setlist feature set (Epic 4.1)** — docs_logbook_epic_user_stories_story_4_1_1_create_setlist, docs_logbook_epic_user_stories_story_4_1_2_reorder_setlist, docs_logbook_epic_user_stories_story_4_1_3_search_add_songs_sheet, docs_logbook_epic_user_stories_story_4_1_4_playlist_visibility_toggle, docs_logbook_epic_user_stories_story_4_1_5_shareable_link, docs_logbook_epic_user_stories_story_4_1_6_playlist_description, docs_logbook_epic_user_stories_story_4_1_7_presentation_mode, docs_logbook_epic_user_stories_story_4_1_8_duplicate_playlist, docs_logbook_epic_user_stories_story_4_1_9_per_song_transpose, docs_logbook_epic_user_stories_story_4_1_10_playlist_cover_color [EXTRACTED 1.00]
- **Private rehearsal recording & playback flow** — docs_logbook_epic_user_stories_story_4_6_1_private_rehearsal_recording, docs_logbook_master_tasks_private_rehearsal_recording, components_song_audiorecorder_audiorecorder, components_song_rehearsaldrawer_rehearsaldrawer, docs_logbook_master_tasks_rehearsal_playback_fix_230, docs_logbook_master_tasks_unified_audio_experience_237, docs_logbook_master_tasks_useaudio_context [INFERRED 0.95]
- **Gatekeeper server actions and dashboard sharing the gatekeeper/admin role gate** — docs_plans_2026_03_02_gatekeeper_implementation_flagsong_action, docs_plans_2026_03_02_gatekeeper_implementation_updatesongmetadata_action, docs_plans_2026_03_02_gatekeeper_implementation_featureplaylist_action, docs_plans_2026_03_02_gatekeeper_implementation_mergesongs_action, docs_plans_2026_03_02_gatekeeper_implementation_gatekeeper_dashboard, docs_plans_2026_03_02_gatekeeper_implementation_gatekeeper_permission_check [EXTRACTED 1.00]
- **Songs page hooks extracted from SongsPageContent** — docs_plans_2026_03_02_architecture_audit_usesongsquery, docs_plans_2026_03_02_architecture_audit_usefavoritesquery, docs_plans_2026_03_02_architecture_audit_usesongsfilter, docs_plans_2026_03_02_architecture_audit_design_component_extraction [EXTRACTED 1.00]
- **Musician role to is_musician profile flag migration flow** — docs_plans_2026_02_28_musician_to_profile_setting_task1_db_migration, docs_plans_2026_02_28_musician_to_profile_setting_useauth_is_musician, docs_plans_2026_02_28_musician_to_profile_setting_profilesettings_toggle, docs_plans_2026_02_28_musician_to_profile_setting_hide_chord_ui, docs_plans_2026_02_28_musician_to_profile_setting_onboarding_page, docs_plans_2026_02_28_musician_profile_setting_design_is_musician_flag [EXTRACTED 1.00]
- **Song creation form: metadata fields, ChordPro lyrics editor, and tag selection** — docs_screenshots_editor_song_title_field, docs_screenshots_editor_author_composer_field, docs_screenshots_editor_lyrics_chords_textarea, docs_screenshots_editor_key_capo_tuning_section, docs_screenshots_editor_categories_tags_section [EXTRACTED 1.00]
- **Home Screen Layout Composition** — docs_screenshots_home_top_app_bar, docs_screenshots_home_your_library_section, docs_screenshots_home_explore_by_category_section, docs_screenshots_home_bottom_tab_bar [EXTRACTED 1.00]
- **Song Tag Category Taxonomy** — docs_screenshots_home_category_the_elements, docs_screenshots_home_category_nature, docs_screenshots_home_category_languages, docs_screenshots_home_category_lineage_tradition, docs_screenshots_home_category_medicine_healing, docs_screenshots_home_category_spiritual_concepts [INFERRED 0.85]
- **Auto-generated smart playlists derived from user relationship to songs (favorited / contributed / drafted)** — docs_screenshots_library_smart_playlists_section, docs_screenshots_library_my_favorites_playlist, docs_screenshots_library_my_songs_playlist, docs_screenshots_library_my_drafts_playlist [EXTRACTED 1.00]
- **Mobile-first dark-theme layout: top app bar, pill tabs, stacked card sections, bottom nav** — docs_screenshots_library_top_app_bar, docs_screenshots_library_library_tab_bar, docs_screenshots_library_bottom_navigation_bar, docs_screenshots_library_library_screen [EXTRACTED 1.00]
- **PWA install flow on Chrome for Android** — docs_screenshots_pwa_install_android_part1_tap_three_dot_menu, docs_screenshots_pwa_install_android_chrome_three_dot_menu, docs_screenshots_pwa_install_android_part2_select_install_app, docs_screenshots_pwa_install_android_install_app_menu_item, docs_screenshots_pwa_install_android_add_to_home_screen_menu_item [EXTRACTED 1.00]
- **iOS PWA Install Flow (Share > Add to Home Screen)** — docs_screenshots_pwa_install_ios_step1_tap_share_button, docs_screenshots_pwa_install_ios_safari_share_sheet, docs_screenshots_pwa_install_ios_step2_add_to_home_screen, docs_screenshots_pwa_install_ios_progressive_web_app_install [EXTRACTED 1.00]
- **Song Library Search & Filter Flow** — docs_screenshots_search_search_text_input, docs_screenshots_search_category_tags_input, docs_screenshots_search_sort_by_dropdown, docs_screenshots_search_visibility_segmented_control, docs_screenshots_search_display_options_toggles, docs_screenshots_search_content_type_toggles, docs_screenshots_search_modal_footer_actions [INFERRED 0.85]
- **Stage performance preference set (screen awake, auto-scroll, chords, large font, offline)** — docs_screenshots_settings_keep_screen_awake, docs_screenshots_settings_auto_scroll_lyrics, docs_screenshots_settings_show_chords_by_default, docs_screenshots_settings_large_stage_font, docs_screenshots_settings_offline_mode [INFERRED 0.85]
- **Sacred Fire brand visual language (dark background, fire/ember glow, spiritual atmosphere)** — public_favicon_favicon_svg, public_icons_icon_icon_svg, public_images_feedback_spiritual_mist_landscape_spiritual_mist_landscape, public_icons_icon_ember_sparks [INFERRED 0.75]

## Communities (218 total, 88 thin omitted)

### Community 0 - "UI Primitives & Auth Forms"
Cohesion: 0.07
Nodes (57): FinishRegistrationPage(), ForgotPassword(), ForgotPasswordContent(), Login(), SignUp(), UpdatePassword(), UpdatePasswordContent(), AuthButton() (+49 more)

### Community 1 - "Rehearsal Audio & Recording"
Cohesion: 0.06
Nodes (34): app/songs/[id]/page.tsx (Song Detail Page), AudioContext, AudioContextType, useAudio(), AudioRecorder(), AudioRecorderProps, getSpotifyEmbedUrl(), getYouTubeEmbedUrl() (+26 more)

### Community 2 - "Task Logbook Sessions"
Cohesion: 0.06
Nodes (59): Story 1.1.3: Delete a song [Implemented], Master Tasks Logbook, Interlink and refine administrative screens; rename Settings to Playlists, Session Jan 29: Auth redesign, email templates, supabase_rate_limits.sh, Refactor base path from /songbook to /, Session Jun 9: Beta deployment guide and Vercel-migration tracking, Bug #30: RLS violation on Add Song (allow_public_inserts migration), Bug #31: Song update failure in mock mode (public update policy) (+51 more)

### Community 3 - "Agent Rules & Sync Workflows"
Cohesion: 0.07
Nodes (36): Artifact Synchronization Policy (rule), .brain session artifact files (task.md, walkthrough.md, time_tracking_report.md), Master logbook files (master-walkthrough.md, master-tasks.md, master-timetracking.md), Documentation Changelog Policy (glob rule doc/*.{md,sql,html}), Doc metadata triplet: Version, Date, Changelog entry, Branch Protection Policy (no commits to main), Branch naming convention feat/ fix/ chore/ docs/, Schema Migration Policy (glob rule supabase/migrations/*.sql) (+28 more)

### Community 4 - "Docker Build Workflow"
Cohesion: 0.05
Nodes (41): if, permissions, runs-on, steps, GH_TOKEN, version, jobs, build (+33 more)

### Community 5 - "Song Form & Artist Input"
Cohesion: 0.10
Nodes (27): AddSongPage(), ArtistSuggestion, ArtistTagInput(), loadArtists(), ArtistTagInputProps, CategorySelector(), CategorySelectorProps, ChordProEditor (+19 more)

### Community 6 - "Song Cards & Tag Pills"
Cohesion: 0.10
Nodes (25): CATEGORY_ORDER, CategoryGrid(), getColorClasses(), TagList(), SearchBar(), SearchBarProps, SongCard(), SongCardProps (+17 more)

### Community 7 - "Performance CI Workflow"
Cohesion: 0.05
Nodes (38): default, description, required, concurrency, cancel-in-progress, group, BASE_URL, VERCEL_PROTECTION_BYPASS_TOKEN (+30 more)

### Community 8 - "E2E CI Workflow"
Cohesion: 0.05
Nodes (36): concurrency, cancel-in-progress, group, env, runs-on, steps, timeout-minutes, DB_PASSWORD (+28 more)

### Community 9 - "Categories Schema Migrations"
Cohesion: 0.08
Nodes (22): public.categories, public.category_details, public.check_is_subcategory(), public.song_category_map, public.song_with_categories, trg_check_subcategory, idx_categories_parent_id, idx_compositions_owner_id (+14 more)

### Community 10 - "Gatekeeper Role Implementation"
Cohesion: 0.09
Nodes (26): compositions.flag_status Column, Gatekeeper Role, Notifications Table, QuickSwitch Dev Persona Switcher, Role Hierarchy Guest > Member > Gatekeeper > Admin, Features Gated by is_musician, Signup Onboarding Question, Hide Chord UI for Non-Musicians (+18 more)

### Community 11 - "Account Settings & Supabase Client"
Cohesion: 0.13
Nodes (18): SettingsPage(), SignupSuccess(), SignUpSuccessContent(), AccountSettings(), AccountSettingsProps, TabType, PrivacySettings(), PrivacySettingsProps (+10 more)

### Community 12 - "Auth Hook & Playlist Pages"
Cohesion: 0.09
Nodes (13): createPlaylist(), Error(), ErrorContent(), CreatePlaylistPage(), Ember, EditSongPage(), fetchSongForEdit(), AccessDenied() (+5 more)

### Community 13 - "Architecture Audit Remediation"
Cohesion: 0.11
Nodes (21): Three-Tier Test Coverage Plan, fetchSongsPage (client), fetchSongsPageServer, fetchSongsServer Refactor, IntersectionObserver Sentinel, mapCompositionToSong Mapper, playlistActions.test.ts Validation Tests, playlistActions Zod Validation (+13 more)

### Community 14 - "E2E Test Matrix (docs)"
Cohesion: 0.11
Nodes (24): E2E Test Overview & Matrix v1.4 (GH #142), No Seeded Gatekeeper Account Yet, 4.2 Account & Settings (ACC-01..06), 4.6 Favorites (FAV-01..03), 4.8 Gatekeeper Tools (GK-01..06), 4.7 Playlists / Setlists (PL-01..14), 4.5 Song Viewer (VIEW-01..08), Per-role storageState Auth Setup (e2e/auth.setup.ts, NEXT_PUBLIC_DEV_TEST_PASSWORD) (+16 more)

### Community 15 - "Song Search & Filter UI"
Cohesion: 0.15
Nodes (21): SongsPageContentProps, SortByType, GlobalSearchModalInner(), SortByType, SearchFiltersModal(), SearchFiltersModalProps, SortByType, ToggleCard() (+13 more)

### Community 16 - "Song Queries & Mapping"
Cohesion: 0.12
Nodes (18): NewSinceLastVisitProps, RecentlyViewedProps, UseSongsFilterOptions, CategoryRow, CompositionRow, mapCompositionToSong(), SongCategoryMapRow, SONGS_SELECT (+10 more)

### Community 17 - "E2E Test Matrix (testing)"
Cohesion: 0.10
Nodes (25): E2E Test Overview & Matrix v1.4 (GH #142), No Seeded Gatekeeper Account Yet, LIB-07 Library Refresh on Login/Logout (bug #62), 4.2 Account & Settings (ACC-01..06), 4.1 Authentication & Accounts (AUTH-01..10), 4.6 Favorites (FAV-01..03), 4.8 Gatekeeper Tools (GK-01..06), 4.4 Public Library & Discovery (LIB-01..13) (+17 more)

### Community 18 - "Server Queries & Artists"
Cohesion: 0.17
Nodes (17): recordSongView(), GET(), GET(), ArtistsPageContent(), ArtistsPage(), RecentlyViewedPage(), revalidate, SongsPage() (+9 more)

### Community 19 - "Playlists Pages & Cards"
Cohesion: 0.16
Nodes (22): accentClasses, GuestView(), PlaylistsPage(), PublicPlaylistsSection(), SmartPlaylistCard(), SmartPlaylistCardProps, SongCounts, SongCountSubtitle() (+14 more)

### Community 20 - "Playwright E2E Specs"
Cohesion: 0.13
Nodes (5): RoleKey, ROLES, STORAGE_DIR, TEST_PASSWORD, @playwright/test

### Community 21 - "Playlist Actions & Validation"
Cohesion: 0.21
Nodes (15): deleteSong(), deletePlaylist(), renamePlaylist(), toggleFavorite(), isSmartPlaylist(), SMART_PLAYLISTS, readIds(), toggle() (+7 more)

### Community 22 - "Category Taxonomy Design"
Cohesion: 0.11
Nodes (21): random-seeder.mjs (Programmatic Random Seeder, E2E_RANDOM_SEED=1), Real-time Search by Title and Author, Screen 8: Category Detail [DEPRECATED], Screen 7: Explore Categories, Screen 15: Search Songs app/songs/SongsPageContent.tsx, Taxonomy / Category Filtering, Song Categories Taxonomy, Icaros subcategory (+13 more)

### Community 23 - "Database Schema Design"
Cohesion: 0.17
Nodes (22): idx_compositions_is_public_true, idx_compositions_title_alphabetical, idx_setlists_is_public_true, public.categories, public.category_details, public.check_is_subcategory(), public.compositions, public.profiles (+14 more)

### Community 24 - "Runtime Dependencies"
Cohesion: 0.08
Nodes (25): dependencies, class-variance-authority@^0.7.1, @dnd-kit/sortable@^10.0.0, lucide-react@^0.562.0, next@^16.1.6, @radix-ui/react-checkbox@^1.3.3, @radix-ui/react-label@^2.1.8, @radix-ui/react-slot@^1.2.4 (+17 more)

### Community 25 - "Song Detail & React Query"
Cohesion: 0.18
Nodes (15): fetchSong(), SongDetailPage(), withTimeout(), SongsPageContent(), DeleteConfirmationModal(), DeleteConfirmationModalProps, SongDetailSkeleton(), SongTechnicalBadges() (+7 more)

### Community 26 - "SDLC & CI/CD Guide"
Cohesion: 0.12
Nodes (16): Playwright globalSetup hook (e2e/global-setup.ts), setup-test-db.mjs (DB wipe & seed script), Conventional Commits (feat:, fix:), GitHub Actions docker.yml (builds App & Migrator images, dual-tag branch + :preview), SDLC & CI/CD Workflow Guide, Local Development on Feature Branches (issue-first, npx supabase start), Preview Environment (dev2preview), Pull Request & Playwright E2E Smoke Tests in GitHub Actions (+8 more)

### Community 27 - "Root Layout & Providers"
Cohesion: 0.15
Nodes (13): geistMono, geistSans, metadata, RootLayout(), EnvironmentBanner(), GlobalSearchModal(), QueryProvider(), ServiceWorkerRegistrar() (+5 more)

### Community 28 - "Preferences & Wake Lock"
Cohesion: 0.14
Nodes (13): PreferenceRow(), PreferenceRowProps, PreferencesSettings(), THEME_OPTIONS, ThemeSelector(), themeOptions, ThemeToggle(), Switch() (+5 more)

### Community 29 - "Phase 4 Epics & Stories"
Cohesion: 0.11
Nodes (21): Epic 4.1: Setlists (Playlists), Epic 4.2: Print & Export, Epic 4.3: Offline Reliability, Epic 4.4: Desktop Experience, Epic 4.5: Progressive Web App - Offline Reliability, Epic 4.6: Private Rehearsal & Audio Storage, Phase 4: Professional Toolkit, Service worker cache / offline shell (+13 more)

### Community 30 - "Dev Dependencies"
Cohesion: 0.10
Nodes (21): devDependencies, pg-to-ts@^4.1.1, @playwright/test@^1.60.0, sharp@^0.34.5, supabase@^2.113.0, tailwindcss@^4, @tailwindcss/postcss@^4, @types/node@^20 (+13 more)

### Community 31 - "Application Analysis & Design"
Cohesion: 0.17
Nodes (19): compositions table, Application Analysis & Design Document v1.32, Mobile Spotify-style Slide-Up Bottom Sheet Context Menu, Private Rehearsal Audio Recording (Story 4.6.1), RehearsalDrawer (Slide-Up Bottom Sheet), Roadmap Phases (MVP, MLP, Future), Screen 2: Song Detail app/songs/[id]/page.tsx, Song (Composition Entity) (+11 more)

### Community 32 - "Web Dev Curriculum & PWA"
Cohesion: 0.14
Nodes (18): Lazy List Fetching, Progressive Web App (PWA), Screen 1: Home (Dashboard) app/page.tsx, Technology Stack (Next.js 15, Tailwind, Supabase, TanStack Query, Framer Motion), Day 10: AI-Assisted Debugging & Review (Cursor, DevTools), Day 2: React & Next.js Component Trees (Header, SearchBar, SongCard), Day 3: Tailwind CSS Utility First, Day 4: State Management with Hooks (useState, useEffect) (+10 more)

### Community 33 - "Gatekeeper Role Stories"
Cohesion: 0.17
Nodes (18): Epic 3.4: Gatekeeper Role, Role: Admin, Role: Gatekeeper, Roles & Permissions Summary table, Story 3.4.1: Admin assigns Gatekeeper role, Story 3.4.2: Gatekeeper flags songs (Needs Improvement / Duplicate), Story 3.4.3: Gatekeeper edits metadata and media links of any song, Story 3.4.4: Gatekeeper merges duplicate songs into versions (+10 more)

### Community 34 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules, jsx, lib (+11 more)

### Community 35 - "Code Review Agent Skills"
Cohesion: 0.15
Nodes (17): Senior Architect agent persona (staff-level audit & design), N+1 query risk detection, Row Level Security (RLS) policy verification, Audit severity markers [CRITICAL]/[WARNING]/[OPTIMIZATION], SOLID principles and Twelve-Factor App methodology, code-review skill (Advanced Code Review), Review feedback markers [CRITICAL]/[SUGGESTION]/[NIT]/[PROPS], Review pillars: Correctness, Performance, Security/RLS, Maintainability (+9 more)

### Community 36 - "Docker Env: Core Secrets"
Cohesion: 0.11
Nodes (19): API_JWT_SECRET, APP_NAME, DB_AFTER_CONNECT_QUERY, DB_ENC_KEY, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT (+11 more)

### Community 37 - "User Guide & Email Templates"
Cohesion: 0.18
Nodes (19): Screen 6: Access Denied components/common/AccessDenied.tsx, Screen 5: Edit Song app/songs/[id]/edit/page.tsx, Screen 3: Login (Mockup Only), User Personas (Guitarero, Singer, Guardian), Change Email Confirmation Template, Supabase Auth Email Template Variable {{ .ConfirmationURL }}, Dark Fire-Brand Email Theme (#141821 bg, #d9481e accent, Inter font), Magic Link Sign-In Email Template (+11 more)

### Community 38 - "Library & Sidebar Stories"
Cohesion: 0.16
Nodes (19): Epic 1.2: Public Library & Discovery, Epic 2.3: Taxonomy & Filtering, Phase 1: The Bare Essentials (MVP), Role: Guest, Story 1.2.1: Guest views song library with infinite scroll [Implemented], Story 1.2.2: Search songs by title or lyrics [Implemented], Story 1.2.3: Guest access to Explore and Playlists pages [Implemented], Story 1.2.4: Unified mobile search field with advanced filter popup [Implemented] (+11 more)

### Community 39 - "Declarative Filter Hooks"
Cohesion: 0.21
Nodes (10): useDeclarativeFilter(), useSongsFilter(), executeFilter(), FilterConfig, FilterFieldDef, FilterResult, Matcher, isDraftActive() (+2 more)

### Community 40 - "Package Manifest"
Cohesion: 0.11
Nodes (17): clsx@^2.1.1, @dnd-kit/utilities@^3.2.2, pg@^8.22.0, radash@^12.1.1, @radix-ui/react-dropdown-menu@^2.1.16, @radix-ui/react-switch@^1.2.6, tailwind-merge@^3.4.0, name (+9 more)

### Community 41 - "Screen Mockups: Core Screens"
Cohesion: 0.24
Nodes (16): Screen 15: Songs (unified search & filter hub), Favorites (amber) and My Songs (violet) Filter Pills, Visibility Tabs (All / Public / Draft), Screen 16: Library - Playlists, Create Playlist Button (disabled + 'Sign in to create' for guests), Library Tabs (Playlists / Albums / Artists), Smart Playlists: My Favorites, My Songs, My Drafts, Preview-as Guest / Logged In View Toggle (+8 more)

### Community 42 - "Song Management Stories"
Cohesion: 0.19
Nodes (17): Epic 1.1: Song Management, Role: Member, Story 1.1.1: Add song via web form [Implemented], Story 1.1.2-bis: Smart Paste of title/author metadata [Implemented], Story 1.1.2: Upload .cho file to auto-fill form [Implemented], Story 1.1.4: Secure login (magic link + password) [Implemented], Story 1.1.5: Guest prompted to join when clicking Add Song [Implemented], Story 1.1.6: Auto-convert Chords-over-Lyrics to ChordPro [Implemented] (+9 more)

### Community 43 - "Release Please Workflow"
Cohesion: 0.12
Nodes (16): jobs, release-please, name, on, push, permissions, contents, pull-requests (+8 more)

### Community 44 - "ChordPro Parsing"
Cohesion: 0.18
Nodes (4): convertChordsOverLyricsToChordPro(), isChordLine(), parseChordPro(), ParsedChordPro

### Community 45 - "Playlist Detail & Add Songs"
Cohesion: 0.21
Nodes (13): addSongToPlaylist(), checkPlaylistModifyAccess(), removeSongFromPlaylist(), reorderPlaylistSongs(), PlaylistDetailPage(), Props, SetlistItemRow, AddSongsSheet() (+5 more)

### Community 46 - "Songbook PDF Scripts"
Cohesion: 0.22
Nodes (5): compile_pdf(), main(), clean_filename(), format_to_chordpro(), main()

### Community 47 - "ChordPro Import & Tests"
Cohesion: 0.23
Nodes (16): ChordPro Format, Draft Auto-Save (Story 1.1.7), prod_songs_2_pdf.py (Production DB song sync & PDF compiler), Screen 4: Add Song app/songs/add/page.tsx (SongForm), TC-1.3.1 Render ChordPro Chords Above Lyrics, Smart Import (.cho/.txt drag-drop auto-detects Title, Author, Key, Capo), 4.3 Song Management (SONG-01..11), SONG-05 Chords-over-lyrics Conversion to ChordPro (Story 1.1.6) (+8 more)

### Community 48 - "Test Cases Document"
Cohesion: 0.14
Nodes (15): 2.4 Desktop Experience Test Case (TC-4.4.1), Desktop Sidebar Navigation (Dashboard, Explore, Library, Playlist, Add Song), Test Cases Document v1.9, Environment Label Pill ((local) blue / (preview) amber / none in prod), TC-1.1.4 Guest Add Song Prompt ('Please join our circle to share medicine'), Mobile Menu (slide-in from right, overlay backdrop), 2.1 Music Tools Test Cases (Transpose, ABC Notation, Melody Synth), 2.5 Navigation & UI Component Test Cases (TC-2.5.x) (+7 more)

### Community 49 - "Home Screenshot"
Cohesion: 0.16
Nodes (13): Bottom Tab Bar, Category Card, Category: Languages, Category: Lineage & Tradition, Category: Medicine & Healing, Category: Nature, Category: Spiritual Concepts, Category: The Elements (+5 more)

### Community 50 - "ChordPro Display Utils"
Cohesion: 0.24
Nodes (8): SongDisplay(), SongDisplayProps, Import Song Metadata (.cho upload & paste parsing), Production Songbook PDF Export (prod_songs_2_pdf.py, compile_songbook.py), ChordProItem, ChordProLine, ChordProSection, parseChordProForDisplay()

### Community 51 - "Auth Screen Mockups"
Cohesion: 0.19
Nodes (14): Settings Account Tab (Email, Password, Sessions), Change Email (requires re-verification), Log Out from All Devices, Update Password (new + confirm), Sidebar Guest State (Welcome Guest / Sign Up / Log in), Send Magic Link Form (email only), Sign in with password (secondary action), Screen 3a: Login (Magic Link) (+6 more)

### Community 52 - "NPM Scripts"
Cohesion: 0.13
Nodes (15): scripts, build, dev, start, test, test:e2e, test:e2e:headed, test:e2e:headless (+7 more)

### Community 53 - "Performance Benchmark Runner"
Cohesion: 0.21
Nodes (11): BASE_URL, benchmarkGroup(), __dirname, discoverSongIds(), fetchUrl(), loadSongIdsFromRun(), main(), measurePage() (+3 more)

### Community 54 - "Story Lifecycle Commands"
Cohesion: 0.16
Nodes (12): Deploy Flow (user 'deploy' / ship trigger), songbook-rocks (SR) engine Submodule pointing at SFS main, /create-issue Command, gh-sub-issue Extension (parent/sub-issue linking), Gherkin Acceptance Criteria (Given/When/Then), [Story X.X.X] Title and epic-X.X / user-story Label Convention, Implementation Plan (docs/plans/YYYY-MM-DD-<story-slug>.md), /start-story Command (+4 more)

### Community 55 - "Server Migration Walkthrough"
Cohesion: 0.21
Nodes (12): Kong API Gateway Credential Mapping (kong-runtime.yml), Walkthrough: Server Migration, Standalone Pipeline and Release v1.0.0, Next.js output: 'standalone' Build (next.config.ts), app/supabase-api/[...path]/route.ts Runtime Env Proxy, Self-hosted Stacks (supabase-prod, supabase-preview, songbook-prod, songbook-preview), Traefik tailscale-only@docker Middleware for Preview Subdomains, Vitest Test Runner (npx vitest run; tests alongside source or lib/unit-tests/), Supabase Auth (email OTP + magic link, onboarding flow) (+4 more)

### Community 56 - "Story-to-GitHub Sync Scripts"
Cohesion: 0.29
Nodes (10): buildIssueBody(), buildIssueTitle(), parseStories(), content, ensureLabel(), gh(), ghJson(), stories (+2 more)

### Community 57 - "Docker Env: Storage"
Cohesion: 0.14
Nodes (14): ANON_KEY, DATABASE_URL, FILE_SIZE_LIMIT, FILE_STORAGE_BACKEND_PATH, GLOBAL_S3_BUCKET, REGION, SERVICE_KEY, STORAGE_BACKEND (+6 more)

### Community 58 - "Docker Env: Studio"
Cohesion: 0.15
Nodes (14): AUTH_JWT_SECRET, KONG_DATABASE, KONG_DECLARATIVE_CONFIG, STUDIO_PG_META_URL, SUPABASE_ANON_KEY, SUPABASE_PUBLIC_URL, SUPABASE_SERVICE_KEY, SUPABASE_URL (+6 more)

### Community 59 - "Add Song Screen Mockup"
Cohesion: 0.18
Nodes (13): AI Auto-Tag Button, Categories / Tags Input (chip badges + search), ChordPro Format (bracket chords, {title}/{artist} directives), Key, Capo & Tuning (collapsible), Language Chip Selector (English, Sanskrit, Spanish, Portuguese, +), Lyrics & Chords Editor (monospace textarea), Lyrics File Upload (.cho / .txt, auto-detect title & author), Media Links (YouTube, Spotify, SoundCloud) (+5 more)

### Community 60 - "Rehearsal Media Player Spec"
Cohesion: 0.32
Nodes (12): Auto-Pause Other Players on Play, Bottom Mini-Player (progress sync, play/pause, seek), Behavior & Capability Matrix (YouTube / SoundCloud / Spotify), Persistent Rehearsal Media Players Technical Spec, 18 E2E Media Player Test Permutations (engine/e2e/tests/media-player.spec.ts), pauseSoundCloud(), pauseYouTube(), Persistent Play on Tab Change (players stay mounted) (+4 more)

### Community 61 - "Library Screenshot"
Cohesion: 0.22
Nodes (11): Bottom Navigation Bar (Home / Songs / Library / Create, Library active), Floating Side Action Button (right edge, partially visible), Library Screen (mobile, dark theme), Library Tab Bar (Playlists / History / Artists / Albums pill tabs), My Drafts smart playlist (work-in-progress songs, 1 song, 0 public / 1 draft), My Favorites smart playlist (heart icon, 8 songs, 7 public / 1 draft), My Private Playlists Section (with red '+ New Playlist' button), My Songs smart playlist (songs you've contributed, 43 songs, 42 public / 1 draft) (+3 more)

### Community 62 - "Benchmark HTML Report"
Cohesion: 0.19
Nodes (12): badge(), delta(), deltaBadge(), __dirname, generateHTML(), html, outFile, reportA (+4 more)

### Community 63 - "Unified Audio PR"
Cohesion: 0.26
Nodes (11): release-please + GitHub Actions GHCR Docker Build (docker.yml), Personal Rehearsal Recordings (v1.3.0 #221; file_size_bytes, position, download, diagnostics), release-please Semantic Versioning & GHCR Publishing (v1.0.0), Unified Audio Experience (v1.6.0, #237 / #247 / #256), Supabase Audio Storage (25MB limit, MP3/WAV/M4A/FLAC/OGG whitelist, inline renaming), useAudio() Context Re-architecture & useSongRecordings Hoisting, Dockerized Preview Pipeline (dev2preview.sh, workflow_dispatch, branch slug + :preview tags), Header Microphone Indicator (recording count, live equalizer) (+3 more)

### Community 64 - "Project Instructions & Doc Commands"
Cohesion: 0.26
Nodes (10): /audit Consistency Audit Command, Consistency Report (Passed Checks / Gaps / Contradictions), /tutor Teaching Assistant Mode, /update-doc-changelog Command, Doc Version/Date/Changelog Header Convention (.md, .sql, .html), db-schema.sql Single-File Fresh-Install Schema Document, /update-schema Command, Definition of Done (docs, tests, code 100% aligned) (+2 more)

### Community 65 - "Playlist Context Menu"
Cohesion: 0.27
Nodes (9): togglePlaylistVisibility(), updatePlaylistDescription(), PlaylistContextMenu(), PlaylistContextMenuProps, PlaylistDetailHeader(), Props, DropdownMenuContent, DropdownMenuItem (+1 more)

### Community 66 - "Home Page & Last Seen"
Cohesion: 0.24
Nodes (9): updateLastSeen(), Home(), revalidate, countMap, LibrarySummary(), LibrarySummaryProps, stats, UpdateLastSeen() (+1 more)

### Community 67 - "Sidebar Context & Swipe"
Cohesion: 0.23
Nodes (9): MainContent(), SidebarOverlay(), SidebarContext, SidebarContextType, SidebarProvider(), useSidebar(), EXCLUDED_PATHS, TAB_ORDER (+1 more)

### Community 68 - "Docker Service Dependencies"
Cohesion: 0.15
Nodes (13): condition, db, rest, depends_on, image, restart, depends_on, image (+5 more)

### Community 69 - "Tag Filtering Mockup Logic"
Cohesion: 0.21
Nodes (13): availableTags Data Model (name, category, color, isCategory), Free-Text Search Input ('Search 500+ medicine songs...'), Result Count Indicator ('24 songs found'), Sidebar Category Filter Links (headers to Screen 17, tags to Screen 15), Interactive Tag Field (active pills + autocomplete dropdown + Clear All), Pre-selected Category Filter State (activeTags = [The Elements]), Active Category Header with 'Match Any' Badge, Global Search Input (songs, lyrics, artists) (+5 more)

### Community 70 - "Editor Screenshot"
Cohesion: 0.21
Nodes (10): Author/Composer (optional) input field, Bendice la Tierra (example song: Traditional, tags Spanish/Air/Earth/Fire/Water), Categories / Tags section with toggleable tag chips, Chord syntax hint and help icon (Use brackets [] for chords), ChordPro format (bracket chords [Am], {title:}, {artist:}, {tag:} directives), Key, Capo & Tuning collapsible section, Lyrics & chords textarea with live chord highlighting, Song Editor Screen (dark theme form for creating/editing a song) (+2 more)

### Community 71 - "Settings Screenshot"
Cohesion: 0.23
Nodes (10): Account Settings Screen (Preferences tab), App Preferences Section, Appearance Theme Selector (light / dark / system), Auto-scroll Lyrics (Coming Soon), Keep Screen Awake Toggle (Wake Lock), Large Stage Font (Coming Soon), Mobile App Shell (top bar + bottom tab bar: Home / Songs / Library / Create), Offline Mode (Coming Soon) (+2 more)

### Community 72 - "Changelog Releases"
Cohesion: 0.24
Nodes (12): CHANGELOG (v1.0.0 to v1.6.0), 11-Service Docker Supabase Stack (v1.4.0; roles init, storage, studio, realtime, meta), 10-minute (600s) ISR Revalidation for Homepage and Song Library (v1.2.0), Multi-Artist Tagging & Autocomplete UI (v1.4.0, #195 / #228 / #231), Performance Benchmark Suite & HTML Report Generator (#210, v1.2.0 / v1.3.0), preview2prod Script (print PR url on failure, detached HEAD handling, kill dev servers), restart.sh Port Killing (fuser instead of lsof), Docs Security Sanitization of Private Deployment Info (v1.0.1) (+4 more)

### Community 73 - "Sidebar Navigation"
Cohesion: 0.24
Nodes (8): NavLink(), NavLinkProps, Sidebar(), useActivePath(), NAV_ITEMS, NAV_SECTIONS, NavItem, NavSection

### Community 74 - "Docker Healthchecks"
Cohesion: 0.21
Nodes (12): healthcheck, healthcheck, image, ports, restart, volumes, interval, retries (+4 more)

### Community 75 - "Docker Env: Auth (GoTrue)"
Cohesion: 0.17
Nodes (12): depends_on, environment, image, restart, GOTRUE_API_HOST, GOTRUE_API_PORT, GOTRUE_DB_DATABASE_URL, GOTRUE_DB_DRIVER (+4 more)

### Community 76 - "Account Settings Mockup"
Cohesion: 0.21
Nodes (12): Avatar Change/Remove (400x400 JPG/PNG/GIF), Request Data Take Out (.json), Settings Privacy & Data Tab, Settings Profile Tab (Avatar, Full Name), Make Profile Public Toggle, Screen 18: Account Settings, Show Activity Toggle (live-viewing presence), switchTab (JS tab switcher) (+4 more)

### Community 77 - "Hearth Error Screens"
Cohesion: 0.21
Nodes (12): Hearth / Sacred Fire Metaphor in Error Copy, Approach the Hearth (login CTA -> /auth/login), createEmber (401 page ember spawner), Screen 11: 401 Unauthorized ('Unauthorized Presence'), createEmber (429 wind-drift ember spawner), Rate Limiting (client-facing), Screen 12: 429 Too Many Requests ('The Winds are Too Strong'), Ember Generator (30 pre-seeded rising embers) (+4 more)

### Community 78 - "Search Modal Screenshot"
Cohesion: 0.20
Nodes (9): Category & Tags Input, Content Type Toggles (Chords / Melody), Display Options Toggles (Favorites / My Songs), Modal Footer Actions (Clear all / Show results), Search Options Modal (Song Library Filter Sheet), Search Text Input (Search 200+ songs), Song List Screen (dimmed behind modal), Sort By Dropdown (Title A-Z) (+1 more)

### Community 79 - "i18n Implementation Plan"
Cohesion: 0.29
Nodes (10): Dictionary Files as Pure Objects (messages/en.ts, messages/nl.ts), Hardcoded English String Audit (Phase 1 baseline), i18n Multi-Language Support Objective (audit then technical proposal), LocaleProvider (locale from localStorage post-hydration to avoid hydration mismatch), t(key, params) String Interpolation Function (lib/i18n/index.ts), Component-by-Component i18n Migration (auth, nav, song, library, settings, feedback), i18n Implementation Task Checklist (#246), Language Switcher (EN / NL) in UserProfile (+2 more)

### Community 80 - "Review & Security Commands"
Cohesion: 0.25
Nodes (9): /code-review Command, Review Feedback Markers (CRITICAL / SUGGESTION / NIT / PROPS), Review Pillars (Correctness, Performance, Security/RLS, Maintainability), Security Audit Artifacts (audit-npm.json, audit-trivy.json, audit-cicd.txt), security-scanner scan.sh Script (.agent/skills/security-scanner/scripts/scan.sh), /security-scan Command, Architect Finding Categories (CRITICAL / WARNING / OPTIMIZATION), RLS, IDOR, SQL Injection and Session Audit (+1 more)

### Community 81 - "Header & User Profile"
Cohesion: 0.33
Nodes (8): getSearchHistory(), Header(), saveSearchHistory(), themeOptions, ThemeToggle(), UserProfile(), UserProfileProps, AuthUser

### Community 82 - "Docker Env: Postgres Meta"
Cohesion: 0.18
Nodes (11): PG_META_DB_HOST, PG_META_DB_NAME, PG_META_DB_PASSWORD, PG_META_DB_PORT, PG_META_DB_USER, PG_META_PORT, depends_on, environment (+3 more)

### Community 83 - "Error Page Template"
Cohesion: 0.24
Nodes (9): createEmber (rising ember particle animation), createEmber (500 page ember spawner), Screen 10: 500 Internal Server Error ('The Fire has Flickered'), createEmber (503 page ember spawner), Screen 13: 503 Maintenance ('Tending the Sacred Fire'), createSnow (falling snow particle spawner), Offline Saved Songs Cache, Try to Relight the Fire (reload CTA) (+1 more)

### Community 84 - "Phase 3 Epics & Stories"
Cohesion: 0.20
Nodes (11): ChordPro format, Epic 3.1: User Accounts, Epic 3.2: Version Control, Epic 3.3: Progressive Web App - Installability, Phase 3: Community & Evolution, Story 3.1.2: Heart/favorite songs [Implemented], Story 3.2.1: Submit alternative song version, Story 3.2.2: Vote on song versions (+3 more)

### Community 85 - "Domain Types"
Cohesion: 0.18
Nodes (10): Category, CategoryType, Composition, CompositionCategory, Setlist, SetlistItem, SongUI, SongVersion (+2 more)

### Community 86 - "Playlist Picker"
Cohesion: 0.29
Nodes (6): fetchContainingPlaylists(), fetchUserPlaylists(), PlaylistPicker(), PlaylistPickerProps, PopoverContent(), PLAYLIST_KEYS

### Community 87 - "Docker Compose Services"
Cohesion: 0.20
Nodes (9): environment, image, ports, restart, services, app, volumes, db-data (+1 more)

### Community 88 - "Docker Env: Postgres"
Cohesion: 0.27
Nodes (10): environment, JWT_EXP, JWT_SECRET, MIGRATIONS_DIR, POSTGRES_DB, POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_PORT (+2 more)

### Community 89 - "Musician Profile & Music Tools"
Cohesion: 0.27
Nodes (9): Epic 2.1: Music Tools, Epic 3.5: Musician Profile Setting, Story 2.1.1: Transpose chords, Story 2.1.2: Render melody as sheet music (ABC notation), Story 2.1.3: Play melody notes with synthesizer, Story 3.5.1: Self-declared musician profile setting, Story 3.5.2: Onboarding question about playing an instrument, Story 4.1.9: Per-song transposition offset in playlist (+1 more)

### Community 90 - "E2E README & Fixtures"
Cohesion: 0.31
Nodes (8): auth.setup.ts (signs in seeded admin/musician/member, saves storageState), .github/workflows/e2e.yml @smoke vs staging (SUPABASE_PROJECT_ID_STAGING, SUPABASE_PUBLISHABLE_KEY_STAGING, E2E_TEST_PASSWORD), e2e/ Layout (auth.setup.ts, fixtures/roles.ts, tests/smoke.spec.ts, .auth/), E2E Tests (Playwright) README - Phase 0 foundation, No Seeded Gatekeeper Account Yet (add seed + roles.ts + auth.setup.ts for GK-* specs), Local Run Procedure (npx supabase start, env vars, playwright install, npm run test:e2e), fixtures/roles.ts (ROLES seeded accounts + storage paths), tests/smoke.spec.ts (P0 @smoke happy paths)

### Community 91 - "Artifact Sync & Public Playlists"
Cohesion: 0.36
Nodes (7): Session Brain Files (.brain/task.md, walkthrough.md, time_tracking_report.md), Story 3.4.6 Public Playlist Curation Session (RLS, server actions, gatekeeper seed, E2E), /sync-artifacts Command, Admin & Gatekeeper Public Playlist Curation (v1.0.0), Visibility Filter Default Fix for Logged-Out Users & 'My' to 'Your' Terminology, Playlists / Setlists (drag-and-drop, shareable links, visibility), Role-Based Access (Guest, Member, Gatekeeper, Admin)

### Community 92 - "README & Branch Rules"
Cohesion: 0.36
Nodes (7): feat/userstory-<epic-id> Branch Convention, ChordPro Editor (live auto-sizing, smart paste), ChordSheetJS Library, Installable PWA (standalone mode, branded splash), Sacred Fire Songs README (digital songbook for medicine music ceremonies), Screen Wake Lock, Music-Theory-Aware Transposition

### Community 93 - "Edit Own Song Stories"
Cohesion: 0.22
Nodes (8): AccessDenied (components/common/AccessDenied.tsx), Epics & User Stories: Sacred Fire Songs (v1.35), Epic 2.2: Rich Editing, Phase 2: Minimal Lovable Product (MLP), Story 2.2.1: Edit lyrics of own song [Implemented], Implement 'Edit Own Song' feature (SongForm create/edit modes, /songs/add route), GitHub Issue Migration (Jan 13): stories to issues, reconciliation, Restrict Edit Access (AccessDenied component, owner check)

### Community 94 - "Mobile Bottom Nav"
Cohesion: 0.31
Nodes (6): CreateSheet(), CreateSheetProps, BOTTOM_TABS, MobileBottomNav(), TabItem, UserPreferencesContext

### Community 95 - "Docker Env: PostgREST"
Cohesion: 0.22
Nodes (9): PGRST_DB_ANON_ROLE, PGRST_DB_SCHEMAS, PGRST_DB_URI, PGRST_JWT_SECRET, depends_on, environment, image, restart (+1 more)

### Community 96 - "Song Viewer & Media Links"
Cohesion: 0.25
Nodes (9): Epic 1.3: Basic Song Viewer, Story 1.1.7: Attach YouTube/Spotify/SoundCloud links [Implemented], Story 1.3.1: Render chords above lyrics (ChordPro) [Implemented], Story 1.3.2: Embedded SoundCloud audio player [Implemented], Story 1.3.3: Navigate back to home from any page [Implemented], Story 1.3.4: Embedded YouTube video player [Implemented], ChordPro stanza spacing bug (Issue #63) and whitespace-preservation fix, Mobile Layout Refinement (Feb 17): header overflow, lyrics hanging indent, lyric atomization (+1 more)

### Community 97 - "PWA Install Android"
Cohesion: 0.36
Nodes (8): 'Add to Home screen' menu item, Chrome address bar (site URL with lock icon), Chrome Android three-dot overflow menu, 'Install app' menu item, Step 1: Tap the three-dot menu icon, Step 2: Select 'Install app' or 'Add to Home screen', Progressive Web App (PWA), PWA Install Guide for Chrome on Android (infographic)

### Community 98 - "ChordSheetJS Debug Scripts"
Cohesion: 0.22
Nodes (7): chordsheetjs@^12.3.1, chordsheetjs, ChordSheetJS, parser, song, parser, song

### Community 99 - "Supabase API Proxy Route"
Cohesion: 0.25
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 100 - "User Preferences Context"
Cohesion: 0.36
Nodes (7): applyThemeClass(), defaultPreferences, getSystemTheme(), updateThemeColor(), UserPreferences, UserPreferencesContextType, UserPreferencesProvider()

### Community 101 - "Categories SQL Script"
Cohesion: 0.54
Nodes (6): categories, category_details, check_is_subcategory(), song_category_map, song_with_categories, trg_check_subcategory

### Community 102 - "Delete Song Confirmation"
Cohesion: 0.32
Nodes (7): Danger Zone: Delete My Account, Cancel action (returns to song detail), Yes, Delete action (returns to home), Delete Song? Modal Card, Screen 6: Delete Song Confirmation, Song Keeper Ownership (only owner may edit), Screen 2: Song Detail

### Community 103 - "Wake Lock & Ceremony Mode"
Cohesion: 0.36
Nodes (8): Screen Wake Lock API, Story 1.3.5: Screen Wake Lock on Song Detail page [Implemented], Story 4.1.7: Full-screen ceremony presentation mode, Session Jun 27: duplicate edit/delete actions fix (#175), Screen Wake Lock (feat/72): UserPreferencesContext, useWakeLock hook, Settings toggle, Session Jun 27: Spotify-style bottom drawer and bottom nav auto-hide (#179), UserPreferencesContext, useWakeLock hook

### Community 104 - "Icon Generation Script"
Cohesion: 0.25
Nodes (6): __dirname, outDir, root, sizes, svgBuffer, svgPath

### Community 105 - "GitHub Sync & Global Setup"
Cohesion: 0.29
Nodes (3): content, issues, result

### Community 106 - "Docker Env: Imgproxy"
Cohesion: 0.29
Nodes (7): IMGPROXY_BIND, IMGPROXY_LOCAL_FILESYSTEM_ROOT, environment, image, restart, volumes, imgproxy

### Community 107 - "Testing Overview"
Cohesion: 0.43
Nodes (7): Day 11: Automated UI Testing with Playwright & CI, Testing Pyramid (Unit vs Integration vs E2E), testing/ Directory Structure (unit, e2e, performance each with doc/tests/output/data/other), Testing Overview README, E2E Tests (Playwright; test:e2e, test:e2e:smoke, test:e2e:ui), Performance / Load Tests (k6; test:perf, test:perf:load), Test Result Output Locations

### Community 108 - "Issue 239 & Private Recording"
Cohesion: 0.33
Nodes (6): Issue 239 Resolution: Rehearsal Proxy API Key Missing, Kong API Gateway 401 No API Key, Next.js Supabase API Proxy Route, MediaRecorder Capture with Local Blob Playback, Private Supabase Storage Bucket with Owner RLS, Story 4.6.1 Record Private Rehearsal Audio

### Community 109 - "E2E Performance Fixtures"
Cohesion: 0.38
Nodes (3): PerformanceMetrics, PerformanceResult, performanceUtils

### Community 110 - "Import My Songs Script"
Cohesion: 0.33
Nodes (5): authorMap, files, fs, path, songsDir

### Community 111 - "Import Nina Urku Script"
Cohesion: 0.33
Nodes (5): files, fs, path, songsDir, tagToSlugMap

### Community 112 - "Docker Env: Kong"
Cohesion: 0.33
Nodes (6): entrypoint, image, ports, restart, volumes, kong

### Community 113 - "Tag Editing & Filtering Sessions"
Cohesion: 0.40
Nodes (6): Dedicated Artist Filtering (#165) and 'No Artist' grouping, Tag editing in Song Form (CategorySelector, song_category_map, RLS fixes), Tag Filtering UI (Feb 7): TagSelector.tsx, 3-row header, 12-color tag system in uiUtils.ts, Session Jul 26: Streamline Tag UX & Universal TagPill architecture (#210), TagSelector.tsx component, lib/uiUtils.ts category/tag color system

### Community 114 - "ESLint Config"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.1.1, eslint, eslint-config-next

### Community 115 - "Guest Favorites Hook"
Cohesion: 0.47
Nodes (5): GuestFavoritesReturn, NUDGE_THRESHOLDS, readFromStorage(), useGuestFavorites(), writeToStorage()

### Community 116 - "MCP Config"
Cohesion: 0.40
Nodes (5): npx, github, supabase-local, @modelcontextprotocol/server-github, @modelcontextprotocol/server-postgres

### Community 117 - "Brand Visual Assets"
Cohesion: 0.47
Nodes (3): Favicon (32px flame-and-note icon), App Icon (512px flame-and-note icon), Spiritual Mist Landscape (monochrome misty forest with glowing stone arch and floating sparks)

### Community 118 - "Release Please Config"
Cohesion: 0.33
Nodes (5): changelog-sections, include-component-in-tag, packages, release-type, $schema

### Community 119 - "Test DB Setup & Seeder"
Cohesion: 0.53
Nodes (3): main(), maskPassword(), wakeupSupabase()

### Community 120 - "Library Tabs Layout"
Cohesion: 0.60
Nodes (3): LibraryLayout(), LibraryTabs(), tabs

### Community 121 - "Song Card Mockup Variants"
Cohesion: 0.40
Nodes (5): Compact Song Card (title, artist, tag pills, has-chords icon, Key/Capo), Element-Filtered Results Grid (15 songs spanning Water/Fire/Earth/Air), Recent Additions Song Grid, Dashboard Song Card (title, artist pill, element tag, key badge, colored left accent), Key / Capo / Tuning Metadata Grid

### Community 122 - "PWA Install iOS"
Cohesion: 0.60
Nodes (4): PWA Install on iOS Safari Infographic, iOS Safari Share Sheet, Step 1: Tap the Share Button, Step 2: Select 'Add to Home Screen'

### Community 123 - "Clone Prod to Staging"
Cohesion: 0.70
Nodes (4): make_url(), prod_psql(), clone-prod-to-staging.sh script, stg_psql()

### Community 127 - "Gatekeeper & Musician Plans"
Cohesion: 0.83
Nodes (4): Gatekeeper Role Design Document, Musician to Profile Setting Design Document, Musician to Profile Setting Implementation Plan, Gatekeeper Role Implementation Plan

### Community 128 - "Run Migrations Script"
Cohesion: 0.67
Nodes (3): PGPASSWORD, run_psql(), run-migrations.sh script

### Community 129 - "Supabase Rate Limits Script"
Cohesion: 0.50
Nodes (3): PROJECT_REF, supabase_rate_limits.sh script, SUPABASE_ACCESS_TOKEN

### Community 130 - "Guest Favorites Tests"
Cohesion: 0.83
Nodes (3): readIds(), toggle(), writeIds()

### Community 133 - "ChordPro Rendering Sample"
Cohesion: 0.67
Nodes (3): Sample Song: 'Abre tus alas' by Nina (Em, capo 2, EADGBE), ChordPro Chord-over-Lyric Rendering, Verse / Chorus Section Labels (vertical on desktop)

### Community 134 - "Audit Images Config"
Cohesion: 0.67
Nodes (3): Architecture Audit Remediation Implementation Plan, Architecture Audit Remediation Design Document, Next.js images remotePatterns Config

## Ambiguous Edges - Review These
- `code-review skill (Advanced Code Review)` → `tutor skill (Teaching Assistant mode)`  [AMBIGUOUS]
  .agent/skills/tutor/SKILL.md · relation: conceptually_related_to
- `Component-by-Component i18n Migration (auth, nav, song, library, settings, feedback)` → `Visibility Filter Default Fix for Logged-Out Users & 'My' to 'Your' Terminology`  [AMBIGUOUS]
  pr_issue-237.txt · relation: conceptually_related_to
- `Vitest Test Runner (npx vitest run; tests alongside source or lib/unit-tests/)` → `testing/{unit,e2e,performance}/{doc,tests,output,data,other} Structure`  [AMBIGUOUS]
  SUMMARY.md · relation: conceptually_related_to
- `E2E Testing Environment & Database Isolation` → `18 E2E Media Player Test Permutations (engine/e2e/tests/media-player.spec.ts)`  [AMBIGUOUS]
  docs/rehearsal-media-player-spec.md · relation: references
- `Screen 4: Add Song` → `Duplicated/Nested Markup in Add Song Mockup`  [AMBIGUOUS]
  docs/design/screens/actions/screen4_song_add.html · relation: rationale_for
- `Yes, Delete action (returns to home)` → `Screen 1: Home (Dashboard)`  [AMBIGUOUS]
  docs/design/screens/actions/screen6_delete_confirmation.html · relation: references
- `Screen 5: Access Denied ('This Medicine is Not Yours to Edit')` → `Screen 1: Home (Dashboard)`  [AMBIGUOUS]
  docs/design/screens/error/screen5_access_denied.html · relation: references
- `My Private Playlists Section (with red '+ New Playlist' button)` → `Bottom Navigation Bar (Home / Songs / Library / Create, Library active)`  [AMBIGUOUS]
  docs/screenshots/library.png · relation: conceptually_related_to
- `Spiritual Mist Landscape (monochrome misty forest with glowing stone arch and floating sparks)` → `Feedback Page Decorative Background`  [AMBIGUOUS]
  public/images/feedback/spiritual_mist_landscape.png · relation: rationale_for

## Knowledge Gaps
- **141 isolated node(s):** `@modelcontextprotocol/server-postgres`, `@modelcontextprotocol/server-github`, `PGPASSWORD`, `BASE_URL`, `SUPABASE_ACCESS_TOKEN` (+136 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 675 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **88 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Account Settings & Supabase Client` to `UI Primitives & Auth Forms`, `Rehearsal Audio & Recording`, `Song Form & Artist Input`, `Song Cards & Tag Pills`, `Auth Hook & Playlist Pages`, `Song Search & Filter UI`, `Server Queries & Artists`, `Playlists Pages & Cards`, `Runtime Dependencies`, `Song Detail & React Query`, `Root Layout & Providers`, `Preferences & Wake Lock`, `Declarative Filter Hooks`, `Package Manifest`, `Playlist Detail & Add Songs`, `Playlist Context Menu`, `Home Page & Last Seen`, `Sidebar Context & Swipe`, `Header & User Profile`, `Playlist Picker`, `Mobile Bottom Nav`, `User Preferences Context`, `Guest Favorites Hook`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `@modelcontextprotocol/server-postgres`, `@modelcontextprotocol/server-github`, `PGPASSWORD` to the rest of the system?**
  _141 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Primitives & Auth Forms` be split into smaller, more focused modules?**
  _Cohesion score 0.07450980392156863 - nodes in this community are weakly interconnected._
- **Why does `next` connect `Auth Hook & Playlist Pages` to `UI Primitives & Auth Forms`, `Rehearsal Audio & Recording`, `Song Form & Artist Input`, `Song Cards & Tag Pills`, `Account Settings & Supabase Client`, `Song Search & Filter UI`, `Song Queries & Mapping`, `Server Queries & Artists`, `Playlists Pages & Cards`, `Playlist Actions & Validation`, `Runtime Dependencies`, `Song Detail & React Query`, `Root Layout & Providers`, `Declarative Filter Hooks`, `Package Manifest`, `Playlist Detail & Add Songs`, `Playlist Context Menu`, `Home Page & Last Seen`, `Sidebar Context & Swipe`, `Sidebar Navigation`, `Header & User Profile`, `Mobile Bottom Nav`, `Supabase API Proxy Route`, `Library Tabs Layout`, `Not Found Page`, `Page Transition`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Should `Rehearsal Audio & Recording` be split into smaller, more focused modules?**
  _Cohesion score 0.060285563194077206 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `code-review skill (Advanced Code Review)` and `tutor skill (Teaching Assistant mode)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Component-by-Component i18n Migration (auth, nav, song, library, settings, feedback)` and `Visibility Filter Default Fix for Logged-Out Users & 'My' to 'Your' Terminology`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._