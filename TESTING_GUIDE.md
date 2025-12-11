# Testing Guide 🧪

## Pre-flight Checklist

Before testing, ensure:

- [ ] MongoDB is running
- [ ] Dependencies are installed (`npm install`)
- [ ] Database is seeded (`npm run seed`)
- [ ] Dev server is running (`npm run dev`)

## Test Scenarios

### 1. Login Flow ✅

**Test Valid Login:**
1. Go to http://localhost:3000
2. Enter code: `PARTY2024`
3. Click "LET'S VOTE! 🎉"
4. ✅ Should see confetti
5. ✅ Should redirect to /vote

**Test Invalid Login:**
1. Go to http://localhost:3000
2. Enter code: `INVALID123`
3. Click "LET'S VOTE! 🎉"
4. ✅ Should see red error message
5. ✅ Should NOT redirect

**Test Empty Code:**
1. Go to http://localhost:3000
2. Leave code field empty
3. Try to submit
4. ✅ HTML5 validation should prevent submission

### 2. Voting Flow ✅

**Test Vote Selection:**
1. Login with `COOL123`
2. ✅ Should see first award category
3. Click on a nominee
4. ✅ Border should turn green with checkmark
5. ✅ Mini confetti should trigger

**Test Vote Navigation:**
1. Vote on first award
2. Click "Next →"
3. ✅ Should show second award
4. Click "← Previous"
5. ✅ Should go back to first award

**Test Quick Jump:**
1. Scroll to bottom
2. Click any award emoji button
3. ✅ Should jump to that award

**Test Vote Submission:**
1. Vote on at least one award
2. Navigate to last award
3. Click "Submit All Votes"
4. ✅ Should see massive confetti
5. ✅ Should redirect to /thank-you

**Test Progress Tracking:**
1. Note the "X/6 Votes Cast" counter
2. Vote on an award
3. ✅ Counter should increment
4. Change a vote
5. ✅ Counter should stay the same

### 3. Admin Dashboard ✅

**Test Participants Tab:**
1. Go to http://localhost:3000/admin
2. ✅ Should see 8 participants
3. ✅ Should see their codes and vote status

**Test Add Participant:**
1. Enter name: "Test User"
2. Enter code: "TEST2024"
3. Click "Add"
4. ✅ Should see success alert
5. ✅ New participant appears in list

**Test Duplicate Code:**
1. Try to add participant with code: "PARTY2024"
2. ✅ Should see error about duplicate code

**Test Delete Participant:**
1. Click "Delete" on a participant
2. Confirm the prompt
3. ✅ Participant should disappear from list

**Test Votes Tab:**
1. Switch to "All Votes" tab
2. ✅ Should see votes if any have been cast
3. ✅ Should show participant name, award, and nominee

**Test Results Tab:**
1. Switch to "Results" tab
2. ✅ Should see all award categories
3. ✅ Should see vote counts per nominee
4. ✅ Should see winner highlighted in yellow
5. ✅ Progress bars should reflect vote percentages

### 4. Responsive Design ✅

**Test Mobile View:**
1. Open browser dev tools
2. Toggle device toolbar (mobile view)
3. Test on iPhone/Android sizes
4. ✅ Login page should be readable
5. ✅ Voting cards should stack vertically
6. ✅ Admin tables should scroll horizontally

**Test Tablet View:**
1. Test on iPad/tablet size
2. ✅ Everything should remain usable

### 5. Edge Cases 🔍

**Test No Votes Submitted:**
1. Login with new user
2. Don't vote on anything
3. Try to submit
4. ✅ Should see alert "Please vote for at least one award!"

**Test Browser Back Button:**
1. Complete voting flow
2. On thank-you page, click browser back
3. ✅ Should go back to vote page
4. Login data might be lost (expected behavior with localStorage)

**Test Direct URL Access:**
1. Without logging in, visit http://localhost:3000/vote
2. ✅ Should redirect to login page

**Test Multiple Tabs:**
1. Login in one tab
2. Open another tab to same site
3. ✅ Both should work independently

**Test Refresh During Voting:**
1. Login and vote on some awards
2. Refresh the page
3. ⚠️ Votes will be lost (this is expected - data is in component state)

### 6. Performance ✅

**Test Load Times:**
1. Open browser dev tools Network tab
2. Login
3. ✅ API responses should be < 500ms
4. ✅ Page transitions should be smooth

**Test Confetti Performance:**
1. Submit votes to trigger confetti
2. ✅ Should not lag or freeze
3. ✅ Animation should be smooth

### 7. Data Integrity 🔒

**Test Vote Updates:**
1. Login and vote on an award
2. Change vote to different nominee
3. Submit all votes
4. Check admin dashboard
5. ✅ Should show only the latest vote

**Test Unique Code Constraint:**
1. Via admin, try to add duplicate code
2. ✅ Should fail with error

**Test Vote Count Accuracy:**
1. Have multiple people vote
2. Check Results tab
3. ✅ Vote counts should be accurate
4. ✅ Winner should be correct

## Automated Testing Commands

### Check TypeScript Compilation
```bash
npx tsc --noEmit
```
✅ Should have no errors

### Check Linting
```bash
npm run lint
```
✅ Should pass with no errors

### Build Test
```bash
npm run build
```
✅ Should build successfully

## Common Issues & Solutions

### Issue: White screen after login
**Solution**: Check browser console for errors. Likely MongoDB connection issue.

### Issue: Votes not saving
**Solution**: Check MongoDB is running: `sudo systemctl status mongod`

### Issue: Confetti not showing
**Solution**: Check browser compatibility. Works best on Chrome/Firefox/Safari.

### Issue: Admin page showing no data
**Solution**: Run seed script again: `npm run seed`

## Success Criteria ✅

The app is working correctly if:

- [x] Login works with valid codes
- [x] Invalid codes show error
- [x] Voting UI is responsive and fun
- [x] Confetti triggers at right moments
- [x] Admin can add/delete participants
- [x] Results show accurate vote counts
- [x] No console errors
- [x] Mobile view is usable
- [x] Data persists in MongoDB

## Report Template

When reporting issues, include:

```
**Issue**: Brief description

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected**: What should happen

**Actual**: What actually happened

**Browser**: Chrome/Firefox/Safari
**Screen size**: Desktop/Mobile
**Console errors**: Any errors shown
```

---

**Happy Testing!** 🎉 Report any issues you find!
