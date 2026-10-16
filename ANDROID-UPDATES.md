# Android updates

## For collectors

Starting with 0.2.1, open My garage / Settings and use Check for updates. A newer official release also appears in a banner. Choose Download & install and approve Android's installer. Android may first ask you to allow installations from TomiTrack; return to the app afterwards. If you cancel, you can continue installation later. A normal update keeps your local collection. Backups are still recommended.

Check on launch is on by default and runs at most once per day. Disable it in Settings to check manually instead. The app does not install anything automatically.

### One-time migration from 0.1.0 or 0.2.0

The first builds used different development signing keys that were not retained. Android cannot update those installations with the new permanent key.

1. In the old app, export a JSON backup to Downloads or another location outside the app. Verify the file exists. JSON includes models, photos, notes and wishlist; CSV does not preserve photos.
2. Keep that backup safe, then uninstall the old APK. Uninstalling deletes its local storage.
3. Install the official 0.2.1 APK from the TomiTrack GitHub release.
4. Import the JSON backup and check your collection. Restore your appearance preferences if needed.

Future releases signed with the permanent key install over 0.2.1 without this migration. Backups are not a full copy of settings or value history.

## Release operations

Keep package ID `com.tomiking.tomitrack` and increase Android versionCode on every release. Bump all shared version fields together. Publish stable tags `vMAJOR.MINOR.PATCH`, with `TomiTrack-MAJOR.MINOR.PATCH.apk`. The updater accepts only that official repository and requires the GitHub asset SHA-256 digest.

`ANDROID_SIGNING_BUNDLE` is an encrypted repository Actions secret containing base64 JSON with a base64 PKCS12 keystore, alias and password. It is never part of source, release assets or logs. The workflow refuses to publish without it, verifies the APK certificate against `android/signing-certificate-sha256.txt`, and rejects debug APKs. Never generate a replacement identity for routine releases. Losing the permanent key prevents compatible updates; maintain the private backup separately.

The owner authorized the permanent signing identity and it is stored in the encrypted repository Actions secret ANDROID_SIGNING_BUNDLE. A private recovery backup is retained separately. Never copy it into this repository. The validation workflow builds an unsigned APK and runs native tests without accessing secrets.

The downloader checks size/digest and validates package ID, versionCode, versionName and signer against the installed app. Files are held in app-private cache and shared only with the system installer via a scoped FileProvider. Collection contents and account tokens are not sent to GitHub. There is no arbitrary download URL exposed to JavaScript. The OS performs the final installation and signature checks.
