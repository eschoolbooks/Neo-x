# Prediction Issues - Troubleshooting Guide

## Changes Made to Improve Debugging

I've enhanced the error handling and logging throughout the prediction flow to help identify and resolve issues:

### 1. Enhanced Error Logging in Prediction Flow
**File: `src/ai/flows/predictExamFlow.ts`**

Added comprehensive logging and error handling:
- ✅ API key validation with clear error messages
- ✅ Input validation logging (exam type, document count)
- ✅ Success logging with result counts
- ✅ Specific error handling for common issues:
  - Quota exceeded (429 errors)
  - Authentication failures (401/403 errors)
  - Timeout errors
  - Generic errors with fallback messages

### 2. Improved Client-Side Error Handling
**File: `src/app/ai-hub/page.tsx`**

Enhanced the file upload and prediction submission:
- ✅ PDF file type validation
- ✅ File size validation with formatted size display
- ✅ Console logging for upload and conversion process
- ✅ Detailed error logging with stack traces
- ✅ User-friendly toast notifications for success and errors

### 3. Better User Feedback
- Success toast when file is uploaded showing filename and size
- Clear error messages for invalid file types
- File size displayed in human-readable format
- Console logs for debugging (check browser DevTools Console)

## How to Debug Prediction Issues

### Step 1: Check Browser Console
Open your browser's Developer Tools (F12) and look for:
```
Starting prediction with exam type: [exam type]
Number of documents: [count]
Processing file: [filename] Size: [size] Type: [type]
File converted to data URI, length: [length]
Prediction successful, topics count: [count]
```

### Step 2: Common Error Messages and Solutions

| Error Message | Likely Cause | Solution |
|---------------|--------------|----------|
| "Invalid File Type" | Non-PDF file uploaded | Upload only PDF files |
| "File Too Large" | File exceeds 15MB | Compress PDF or split into smaller files |
| "AI service quota exceeded" | API quota limit reached | Wait and try again later, or check API quota in Google Cloud Console |
| "AI service authentication failed" | Invalid API key | Verify `GOOGLE_GEMINI_API_KEY` in `.env` file |
| "Request timed out" | Large file processing | Try with a smaller document (under 5MB) |
| "AI model did not return an output" | Model processing failed | Check console for detailed errors |

### Step 3: Verify API Key Configuration

Check your `.env` file:
```bash
# Should be present and valid
GOOGLE_GEMINI_API_KEY=AIza...
```

Test API key validity:
1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Verify your API key is active
3. Check quota limits

### Step 4: Test with Sample File

Create a simple test case:
1. Use a small PDF (< 1MB)
2. Select "Plus 2" as exam type
3. Submit and check console logs
4. If it works, the issue is likely file-specific

### Step 5: Network Tab Inspection

In DevTools Network tab, check:
- Request to AI endpoint is being sent
- Response status code (200 = success, 4xx/5xx = error)
- Response payload contains data

## File Requirements

- **Format**: PDF only (.pdf extension)
- **Size**: Maximum 15MB
- **Content**: Should contain educational content (textbooks, question papers)
- **Encoding**: Must be readable text (not scanned images without OCR)

## Expected Behavior

### Normal Flow:
1. User uploads PDF file → Success toast appears
2. User selects exam type → Radio button selected
3. User clicks "Predict My Exam" → Loading spinner appears
4. Console shows: "Starting prediction..." logs
5. After 10-60 seconds: Results display with topics and recommendations
6. Results saved to Firestore (if authenticated)

### If Prediction Fails:
1. Error message displays in toast notification
2. Console shows detailed error in red
3. Upload form remains visible for retry
4. User can upload different file and try again

## Next Steps for Debugging

If issues persist after these improvements:

1. **Check exact error message** in browser console (copy the full error)
2. **Try with a different PDF** to rule out file-specific issues
3. **Verify API quota** hasn't been exhausted
4. **Test in incognito mode** to rule out browser extension conflicts
5. **Check network connectivity** to Google AI services

## Console Commands for Testing

```javascript
// Check if API key is loaded (run in browser console)
console.log('Keys available:', {
  hasGeminiKey: !!process.env.GOOGLE_GEMINI_API_KEY,
  hasNextPublicUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL
});

// Test file upload
const input = document.querySelector('input[type="file"]');
input.addEventListener('change', (e) => {
  console.log('File selected:', e.target.files[0]);
});
```

## Build Status
✅ Application builds successfully with no TypeScript or linting errors
✅ All routes compile correctly
✅ Production build ready for deployment

---

**Note**: All enhancements maintain backward compatibility and don't change the user interface or expected behavior.
