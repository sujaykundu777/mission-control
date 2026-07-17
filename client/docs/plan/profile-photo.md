Profile Photo Upload (Web Worker–based)
Context
The /profile page (client/app/(postlogin)/profile/page.tsx) currently renders a static gray circle with a generic User icon instead of a real avatar. The app already has an unused shadcn Avatar component (client/components/ui/avatar.tsx) and a Prisma.User.image field that's never populated. There's no existing file-upload-to-avatar flow, no image-processing library, and no Web Worker usage anywhere in the codebase.

The goal: let a user pick a photo, interactively crop/zoom it, and have the resize + compression work happen off the main thread in a Web Worker so large images don't jank the UI. Per user decision, this iteration is client-side only — the processed photo becomes local preview state (updates the Avatar shown on screen); it is not persisted to the backend, Prisma, or the auth session. No Supabase Storage, no new API routes, no auth callback changes. That's a deliberate scope boundary, not an oversight, and should be called out with a code comment so it isn't "fixed" accidentally later.

Crop/zoom UX is required (not just auto center-crop), via the lightweight react-easy-crop library (new dependency, ~15KB, no SSR issues, gives pixel-space crop rects that feed directly into the worker).

Approach
New dependency
react-easy-crop — add to client/package.json.
New files
client/lib/profile/validate-photo.ts
Pure, synchronous validation — accepted mime types (image/jpeg, image/png, image/webp), max size (5MB). Returns a discriminated result ({ valid, error?, message? }) rather than throwing.

client/lib/profile/**tests**/validate-photo.test.ts
Vitest coverage for valid files, oversized files, wrong mime type, empty mime type — construct File objects directly, no mocking needed. This is the one fully-tested unit in the feature.

client/lib/profile/image-resize-protocol.ts
Shared message types between hook and worker (plain data only, no DOM/webworker-only types, so it's safe to import from both sides):

interface CropRectPixels { x: number; y: number; width: number; height: number }
interface ResizeRequestPayload { requestId: string; file: File; crop: CropRectPixels; targetSize: number; quality: number; mimeType: "image/webp" | "image/jpeg" }
type ResizeRequestMessage = { type: "resize"; payload: ResizeRequestPayload }
type ResizeResponseMessage =
| { type: "resize-success"; requestId: string; blob: Blob }
| { type: "resize-error"; requestId: string; message: string }
client/lib/profile/image-resize.worker.ts
/// <reference lib="webworker" /> at the top (scopes webworker lib types to this file only — do not touch the project-wide tsconfig.json "lib" array, which would conflict with the existing "dom" lib on the self global). next.config.mjs already has typescript: { ignoreBuildErrors: true }, so any residual editor-only type friction here is cosmetic, not a build blocker — note this in a comment.

Worker flow on onmessage:

const bitmap = await createImageBitmap(file, crop.x, crop.y, crop.width, crop.height, { resizeWidth: targetSize, resizeHeight: targetSize, resizeQuality: "high" }) — crops during decode, avoiding a full-resolution decode buffer for large source photos.
Draw into new OffscreenCanvas(targetSize, targetSize) (bridge from ImageBitmap to a Blob).
canvas.convertToBlob({ type: mimeType, quality }).
bitmap.close(), then postMessage({ type: "resize-success", requestId, blob }).
try/catch around the whole thing → postMessage({ type: "resize-error", requestId, message }).
export {} at the bottom to keep it an ES module (needed since new Worker(..., { type: "module" }) will be used to instantiate it).
client/hooks/use-image-resize-worker.ts (matches existing convention: hooks live flat under client/hooks/, e.g. use-currency.tsx, use-mobile.tsx)

useImageResizeWorker(): { resizeImage: (opts: ResizeImageOptions) => Promise<Blob>, isSupported: boolean }.
Lazily creates the worker on first resizeImage call, guarded by typeof window !== "undefined", stored in a useRef<Worker | null>.
Instantiate with a static, literal new Worker(new URL("../lib/profile/image-resize.worker.ts", import.meta.url), { type: "module" }) — must stay a literal path for bundler static analysis (works under both Turbopack, used by next dev --turbo, and webpack, used by next build).
Correlates concurrent requests via requestId (crypto.randomUUID()) and a Map<string, {resolve, reject}> ref, resolved/rejected from a shared onmessage handler.
useEffect cleanup: worker.terminate() on unmount.
isSupported = typeof Worker !== "undefined" for graceful fallback messaging.
client/hooks/**tests**/use-image-resize-worker.test.ts
Smoke test only: vi.stubGlobal("Worker", MockWorker) where MockWorker echoes a fake success/error response, verifying promise resolution/rejection wiring and terminate() on unmount. Do not attempt to test the worker's actual image logic under jsdom (no real OffscreenCanvas/createImageBitmap) — that's covered by manual browser verification instead.

client/components/profile/crop-dialog.tsx
Wraps shadcn Dialog/DialogContent (same pattern as client/components/contacts/import-contact-modal.tsx) around react-easy-crop's <Cropper>:

aspect={1}, cropShape="round" (visual only — output is still a square blob, matching the circular Avatar).
Local crop/zoom state, plus a shadcn Slider (@radix-ui/react-slider already installed, see client/components/ui/slider.tsx) bound to zoom as an accessible control alongside wheel/pinch/drag.
onCropComplete(croppedArea, croppedAreaPixels) stores the latest pixel rect; Confirm button passes it up via onCropConfirm(croppedAreaPixels). The dialog itself doesn't call the worker — purely presentational/interaction, parent owns processing.
isProcessing prop disables Confirm while the worker request is in flight.
client/components/profile/profile-photo-upload.tsx
Top-level component, replaces the static avatar block in the profile page.

Props: { name?: string | null; initialImageUrl?: string | null; className?: string }.
State: selectedFile, objectUrl (source image fed to the crop dialog), previewUrl (final processed result fed to the Avatar), isCropDialogOpen, isProcessing.
Hidden <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"> triggered by a circular edit/camera icon button (Button variant="outline" size="icon", lucide Pencil or Camera) absolutely positioned over the Avatar.
On file select: validatePhotoFile → on failure, toast.error(...) via sonner (matches existing app-wide toast usage and the mock already in client/lib/**tests**/setup.ts) and reset the input value so re-selecting the same file re-fires onChange. On success: URL.createObjectURL(file), open the crop dialog.
On crop confirm: call resizeImage({ file: selectedFile, crop }) from the hook; on resolve, revoke the previous previewUrl (if any), set the new one from URL.createObjectURL(blob), close the dialog, toast.success("Photo updated"); on reject, toast.error(...).
Two independent object-URL lifecycles (objectUrl for the crop source, previewUrl for the result) — both must be revoked on replacement and on unmount to avoid leaking blob URLs across repeated crop sessions.
Explicit code comment: previewUrl is local component state only; nothing here writes to session.user.image/Prisma — a refresh reverts to initialImageUrl/fallback initials. This is intentional scope for this iteration.
Renders <Avatar className={className ?? "h-16 w-16"}><AvatarImage src={previewUrl ?? initialImageUrl ?? undefined} /><AvatarFallback>{initials}</AvatarFallback></Avatar> plus the edit button and hidden input and <CropDialog>.
client/components/profile/**tests**/profile-photo-upload.test.tsx
RTL test via userEvent.upload on the hidden input: (a) oversized/wrong-type file → toast.error called (using the existing sonner mock), no dialog opens; (b) valid file → crop dialog opens. Mock useImageResizeWorker (via vi.mock) so no real Worker is needed; assert resizeImage is invoked with the crop rect passed up from a stubbed CropDialog.

Modified file
client/app/(postlogin)/profile/page.tsx — replace the static <div className="... bg-primary/10"><User .../></div> block (~lines 32–35) with:

<ProfilePhotoUpload name={user?.name} initialImageUrl={user?.image} className="h-16 w-16" />
user?.image reads from the Session.user.image type already declared in client/lib/auth.config.ts (currently always undefined — untouched this iteration).

Known risks (accepted for this iteration, not blockers)
HEIC/HEIF (default iPhone camera format) is rejected by the mime-type validator with a clean "unsupported file type" toast rather than attempting a decode that may silently fail in some browsers — no HEIC transcoding in scope.
createImageBitmap's combined crop+resize option has had inconsistent resizeQuality behavior on older Safari versions; the worker's try/catch → resize-error path handles failures gracefully, but a manual Safari check is worth doing.
Since ignoreBuildErrors: true is set, the "webworker" lib typing approach isn't validated by CI type-checking — manual browser verification is the real safety net here, not tsc.
Verification
cd client && npm install to pull in react-easy-crop.
npm run test (vitest) — confirm validate-photo.test.ts, use-image-resize-worker.test.ts, and profile-photo-upload.test.tsx pass.
npm run lint.
Start the dev server and drive it in a real browser (jsdom can't exercise Worker/OffscreenCanvas):
Navigate to /profile, click the edit button on the avatar, select a large JPEG/PNG — confirm the crop/zoom dialog opens smoothly (main thread not blocked).
Drag/zoom, confirm — verify the Avatar updates with the cropped, circular result and a success toast appears.
Check DevTools Network/Performance: verify the resize work happens on a worker thread (visible in the Sources/Threads panel), not the main thread.
Try an oversized file and a non-image file — confirm validation toasts fire and no dialog opens.
Reload the page — confirm the preview reverts (expected, since nothing is persisted) and no console errors/object-URL leak warnings appear after repeated upload/cancel cycles.
