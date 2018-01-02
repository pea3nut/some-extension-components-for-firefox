class ExtensionMessage {
    static is(message) {
        return 'type' in message
            && 'dir' in message
            && 'payload' in message;
    }
    ;
}
