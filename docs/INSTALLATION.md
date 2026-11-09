# Installation

## Requirements

- Flarum 2.0.x
- PHP 8.3 or newer
- MySQL 8+, MariaDB 10.6+, PostgreSQL 13+ or SQLite
- HTTPS in production (required for microphone access outside localhost)

## Install

Place the extension in `packages/cengizkemec/flarum-social` and add it to the root `composer.json` repositories, or install a published Composer package. Then run:

```bash
composer require cengizkemec/flarum-social
php flarum extension:enable cengizkemec-social
php flarum migrate
php flarum cache:clear
php flarum assets:publish
```

The extension ships prebuilt `js/dist` assets.

## First setup

1. Open **Administration → Flarum Social → General** and confirm the extension is enabled.
2. Open **Rooms** and create or review permanent rooms. Each room has a public slug such as `general-chat` and a capacity between 2 and the global maximum.
3. Open **Voice** and enter LiveKit credentials if voice is wanted.
4. Optionally enable `flarum/messages`, `fof/forum-widgets-core`, `fof/news-widget` or `datlechin/flarum-link-preview`; Social detects them automatically.
5. Visit `/social`.

## Scheduled cleanup

The scheduler runs a one-minute temporary-room safety net:

```cron
* * * * * cd /var/www/flarum && php flarum schedule:run
```

Browser presence heartbeats normally delete an empty temporary room within ten seconds. For cleanup even when no browser is open, run `php flarum social:purge-rooms` from a supervisor or systemd timer more frequently.

## LiveKit

A minimal local LiveKit server uses:

- URL: `ws://127.0.0.1:7880`
- API key and secret: the values configured on the LiveKit server

The browser must be able to reach the URL. In production use `wss://livekit.example.com` and open the required UDP/TCP ports or TURN. Never put the API secret in client code.

## Permissions

Social adds permissions under the `social.*` namespace. Grant them to the appropriate Flarum groups in **Administration → Permissions**. Guest browsing is controlled by the Social guest settings; every write endpoint still calls `assertRegistered()`.
