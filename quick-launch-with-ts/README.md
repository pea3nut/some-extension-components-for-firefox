If you want install this extension, then:

- build&install extension
- build native application
- add regkey

# Build & Install Extension

To build, you need install node.js and npm first, then run it in CLI:

```cmd
cd extension
npm install
npm run build
```

and then, the extension file will be saved in `extension/dist`. about that how to install see [there](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Temporary_Installation_in_Firefox).

# Build Native

To build, you need install rust and cargo fist, then run it in CLI:

```cmd
cd native
cargo build
```

the above command will generate the `native_launcher.exe` in `natvie/target/debug`

# Add RegKey

Select `add-regkey.cmd`  file, run as administrator. The RegKey will added by automatic.