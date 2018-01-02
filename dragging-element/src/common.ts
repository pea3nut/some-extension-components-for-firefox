abstract class ExtensionMessage{
    dir:'content2background';
    type:string;
    payload:any;
    static is(message):message is ExtensionMessage{
        return 'type' in message
            && 'dir'  in message
            && 'payload'  in message
        ;
    };
}