# Decky BSSID Locker Plugin

Simple plugin with two buttons: Lock BSSID and Clear BSSID. 
Lock BSSID find the BSSID for the current wifi connection and locks it to it. 
Clear BSSID button clears out the bssid if needed
Needs root access

### Dependencies

This plugin relies on the user having Node.js v16.14+ and `pnpm` (v9) installed on their system.  
Please make sure to install pnpm v9 to prevent issues with CI during plugin submission.  
`pnpm` can be downloaded from `npm` itself which is recommended.

#### Linux

```bash
sudo npm i -g pnpm@9
```

### Build

1. Clone repo
2. In your local run these commands:
   1. ``pnpm i``
   2. ``pnpm run build``
   - These setup pnpm and build the frontend code for testing.
3. Consult the [decky-frontend-lib](https://github.com/SteamDeckHomebrew/decky-frontend-lib) repository for ways to accomplish your tasks.
   - Documentation and examples are still rough, 
   - Decky loader primarily targets Steam Deck hardware so keep this in mind when developing your plugin.

#### Other important information

Everytime you change the frontend code (`index.tsx` etc) you will need to rebuild using the commands from step 2 above or the build task if you're using vscode or a derivative.

Note: If you are receiving build errors due to an out of date library, you should run this command inside of your repository:

```bash
pnpm update @decky/ui --latest
```
