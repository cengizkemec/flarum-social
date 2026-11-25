# Flarum Social 1.1.19

This release fixes media attachments in the Social post composer and the Social header logo link.

## Highlights

- **Media posts work again.** After a file upload finished, the composer called an undefined `parent.attrs` property. The resulting `Cannot read properties of undefined (reading 'onUploading')` error left the uploader stuck in the uploading state and the publish button disabled. The uploader now uses its own attrs and callbacks, so uploads complete normally.
- **Attachments appear immediately.** Each uploaded file is added to the composer and redrawn as soon as its upload finishes. Upload progress, the attachment preview and the publish button stay in sync.
- **Uploads fail safely.** A failed file resets the uploader, shows the API error and does not block the rest of the post. The configured maximum attachment count is enforced across overlapping uploads, with translated limit text.
- **Atomic media attachment.** The API now rejects unknown media IDs before creating a post, and post creation/editing runs in a database transaction. If an attachment is invalid or belongs to another user, the post is rolled back instead of being published without its media.
- **Logo goes home.** Clicking the Social header logo now opens the forum home page, like the normal Flarum header logo, instead of reloading the Social feed.

## Upgrade

```bash
composer update cengizkemec/flarum-social
php flarum cache:clear
php flarum assets:publish
```

No database changes are required.

## Verification

- Uploaded an image from the Social composer on Flarum 2.0.2, confirmed the attachment preview, published the post and verified the image rendered in the feed and opened through the media endpoint.
- Sent an invalid media ID with a post request and confirmed a 422 response without a new post record.
- Confirmed the Social logo points to the forum root and navigates there.
