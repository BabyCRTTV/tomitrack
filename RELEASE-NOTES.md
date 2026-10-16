TomiTrack 0.2.1 — easier Android updates.

- Check for updates in Settings, or let TomiTrack check on launch once a day. Turn automatic checks off at any time.
- Download the official APK with progress, then approve installation using Android. Updates preserve the existing collection.
- Downloads are checked against their release digest, package, newer version and the installed signing identity. Release builds use one permanent signing key.

**Moving from 0.1.0 or 0.2.0:** these early APKs used incompatible development keys. Export your JSON backup to a location outside the app before uninstalling, install 0.2.1, then import the backup. This is a one-time migration; keep using updates signed with the permanent identity afterwards. Do not uninstall before verifying your backup file exists.

Android may ask you to allow installs from TomiTrack before showing its installation confirmation. No silent installation. Physical-device testing remains needed. Windows automatic updates are not included.

Accounts remain awaiting backend activation. Collections work locally; manual estimates, no live market pricing or automatic cloud sync.
