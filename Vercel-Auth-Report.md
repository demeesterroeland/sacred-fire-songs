# Vercel Preview Deployment Authentication Report

## 1. Vercel CLI Installation
✅ Vercel CLI is installed (version 56.2.0)

## 2. Vercel Login Status
✅ Successfully logged in to Vercel

## 3. Preview URL Access
The preview URL is:
https://<parent-project>-3l9178gd5-roeland-de-meesters-projects.vercel.app

Without authentication, this URL returns a 302 redirect to Vercel's SSO authentication.

## 4. Authentication Method
The correct authentication method is via Bearer Token in the Authorization header:
```
Authorization: Bearer <TOKEN>
```

The token can be retrieved from:
```
~/.local/share/com.vercel.cli/auth.json
```

## 5. Configuration Files Created

### Authentication Script
Created: `testing/performance/tests/vercel-auth.sh`  
This script:
- Retrieves the Vercel token from the auth file
- Sets the correct environment variables for k6
- Runs the k6 performance test with proper authentication

### k6 Load Test Script
Created: `testing/performance/tests/scripts/load-test.js`  
This script:
- Uses the VERCEL_TOKEN environment variable
- Sets the Authorization header for requests
- Tests basic GET request to the preview URL

### Debug Script
Created: `testing/performance/tests/debug-auth.sh`  
This script helps debug authentication issues and validates the approach.

## 6. Usage Instructions

To run authenticated k6 tests:

```bash
# Run the authentication script
./testing/performance/tests/vercel-auth.sh

# Or manually:
export VERCEL_TOKEN=$(cat ~/.local/share/com.vercel.cli/auth.json | jq -r '.token')
export BASE_URL=https://<parent-project>-3l9178gd5-roeland-de-meesters-projects.vercel.app/
k6 run --header "Authorization: Bearer $VERCEL_TOKEN" testing/performance/tests/scripts/load-test.js
```

## 7. Notes
- The token-based authentication should work for accessing preview deployments
- The 302 redirect is expected behavior for preview deployments that require authentication
- Make sure to keep the Vercel token secure as it grants access to your deployments