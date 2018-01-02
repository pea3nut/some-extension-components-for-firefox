browser.runtime.onMessage.addListener(function (message) {
    if (!ExtensionMessage.is(message))
        return;
    if (message.dir !== 'content2background')
        return;
    switch (message.type) {
        case 'openUrl':
            browser.tabs.create({
                url: message.payload.url,
                active: Boolean(message.payload.active),
            });
            break;
        default:
            throw new Error(`Unknown message type ${message.type}`);
    }
    ;
});
