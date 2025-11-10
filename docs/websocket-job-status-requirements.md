# WebSocket Job Status Update Requirements

## Issue
When a photo upload job completes, the frontend upload progress panel shows "PROCESSING 100%" and doesn't update to "COMPLETED". The photo list also doesn't refresh to show the newly uploaded photo.

## Root Cause
The frontend expects a `JobStatusUpdate` WebSocket message when a job completes, but this message may not be sent or may be in an incorrect format.

## CORS Configuration Required

**IMPORTANT**: The WebSocket endpoint (`/ws`) must be configured to allow CORS with credentials:

```java
// Spring WebSocket CORS configuration
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*") // Or specific origins like "http://localhost:3000"
            .withSockJS();
    }
    
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Configure for auth headers in STOMP CONNECT frame
    }
}
```

**Key CORS Requirements**:
- The `/ws/info` endpoint (used by SockJS for negotiation) must return `Access-Control-Allow-Credentials: true` header
- The `/ws` endpoint must allow the frontend origin (e.g., `http://localhost:3000`)
- Auth is passed via STOMP CONNECT headers (`Authorization: Bearer <token>`), not HTTP cookies

## Required WebSocket Message Format

### Topic
The backend must send job status updates to:
```
/topic/job/{jobId}
```

Example: `/topic/job/job_985503ab71434db4a1aadf6716570f36`

### Message Type: JobStatusUpdate

When a job status changes (especially when it becomes `COMPLETED`), send a JSON message with the following structure:

```json
{
  "jobId": "job_985503ab71434db4a1aadf6716570f36",
  "status": "COMPLETED",
  "totalCount": 1,
  "completedCount": 1,
  "failedCount": 0,
  "timestamp": "2025-11-09T22:31:19.663Z"
}
```

### Required Fields

- **jobId** (string): The job ID
- **status** (string): One of `"QUEUED"`, `"IN_PROGRESS"`, `"COMPLETED"`, `"FAILED"`, `"CANCELLED"`
- **totalCount** (number): Total number of photos in the job
- **completedCount** (number): Number of successfully completed photos
- **failedCount** (number): Number of failed photos
- **timestamp** (string): ISO 8601 timestamp

### Important Notes

1. **Message Type Detection**: The frontend detects `JobStatusUpdate` messages by checking if `totalCount !== undefined`. The message should NOT include a `photoId` field (which would make it be classified as a `ProgressUpdate` instead).

2. **When to Send**: Send a `JobStatusUpdate` message whenever:
   - Job status changes (QUEUED → IN_PROGRESS → COMPLETED/FAILED)
   - **Especially important**: When the job status becomes `COMPLETED` after all photos are processed

3. **STOMP Protocol**: The message should be sent via STOMP over SockJS to the topic `/topic/job/{jobId}`

## Current Backend Behavior

Based on the logs, the backend logs:
```
Updated job progress: jobId=job_985503ab71434db4a1aadf6716570f36, status=COMPLETED, completed=1/1, failed=0
```

This suggests the backend is tracking job completion, but we need to verify:
1. Is a WebSocket message actually being sent?
2. Is it being sent to the correct topic (`/topic/job/{jobId}`)?
3. Does the message format match the expected structure above?

## Frontend Debugging

The frontend now includes console logging (in development mode) that will show:
- When subscriptions are created
- All received WebSocket messages
- Message type classification
- Job status update handling

Check the browser console for messages prefixed with:
- `[WebSocket]` - WebSocket client messages
- `[useUploadWebSocket]` - Upload WebSocket hook messages

## Testing

To verify the fix:
1. Upload a photo
2. Wait for processing to complete
3. Check browser console for WebSocket messages
4. Verify the upload progress panel shows "COMPLETED" instead of "PROCESSING"
5. Verify the photo appears in the photo list

## Example Message Flow

1. **During Upload**: Backend sends `ProgressUpdate` messages:
   ```json
   {
     "jobId": "job_123",
     "photoId": "ph_456",
     "status": "UPLOADING",
     "progressPercent": 50,
     "timestamp": "2025-11-09T22:31:15.000Z"
   }
   ```

2. **After Processing**: Backend sends `JobStatusUpdate` message:
   ```json
   {
     "jobId": "job_123",
     "status": "COMPLETED",
     "totalCount": 1,
     "completedCount": 1,
     "failedCount": 0,
     "timestamp": "2025-11-09T22:31:19.663Z"
   }
   ```

The frontend will then:
- Update all photos in the job to "COMPLETED" status
- Refresh the photo list to show the new photo

