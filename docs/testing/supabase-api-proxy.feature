# Version: 1.0 | Date: Nov 23, 2026
# Changelog
# 1.0 | Nov 23, 2026 | #623: the Supabase API proxy passes redirects to the browser (magic link, recovery).
@bug-623
Feature: The Supabase API proxy passes redirects to the browser
  As someone signing in with an email link
  I want the verify redirect to reach my browser
  So that /auth/callback receives the code and I am signed in

  @unit
  Scenario: Magic link verification redirects the browser
    Given the auth server answers a verify request with 303 and a Location to "/auth/callback?code=abc"
    When the browser opens the verify link through the app's proxy
    Then the proxy answers 303 with the Location "/auth/callback?code=abc"
    And the proxy does not request the Location itself

  @unit
  Scenario: Normal responses are unchanged
    Given the auth server answers 200 with the JSON body '{"ok":true}'
    When a request goes through the app's proxy
    Then the proxy answers 200 with the JSON body '{"ok":true}'
