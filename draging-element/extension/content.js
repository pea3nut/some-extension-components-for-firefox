new (_a = class App {
        constructor() {
            this.dev = true; //todo: set false when release
            this.log('app run');
            this.init();
        }
        ;
        log(...args) { this.dev && console.log(...args); }
        ;
        init() {
            const app = this;
            /**
             * When drag a local file to web-page, it dose have dragstart and dragend event.
             * So:
             *  - Use dragover event and thisEventIsDragStart variable to hacks dragstart
             *  - Use drag to hacks dragend. Each Listener will be called by be bound order.
             * */
            var thisEventIsDragStart = true;
            document.addEventListener('dragover', function (event) {
                if (!thisEventIsDragStart)
                    return app.log('deny dragover as dragstart');
                else {
                    thisEventIsDragStart = false;
                    document.addEventListener('drop', function () {
                        app.log('reset thisEventIsDragStart');
                        thisEventIsDragStart = true;
                    });
                }
                event.preventDefault();
                var beDraggedElt = event.target;
                var dropTargetElt = function () {
                    document.addEventListener('drop', event => { dropTargetElt = event.target; }, { once: true });
                    return null;
                }();
                var dataType = null;
                var callWithDropped = null;
                for (let [type, fn] of Object.entries(App.additionalActionMap)) {
                    if (event.dataTransfer.types.includes(type)) {
                        callWithDropped = fn;
                        dataType = type;
                        break;
                    }
                    ;
                }
                ;
                if (callWithDropped === null)
                    return;
                {
                    let dragoverListener = function (event) {
                        event.preventDefault();
                    };
                    document.addEventListener('dragover', dragoverListener);
                    document.addEventListener('drop', () => document.removeEventListener('dragover', dragoverListener), { once: true });
                }
                ;
                document.addEventListener('drop', function (event) {
                    if (event.defaultPrevented)
                        return app.log('have been consumed by other listener');
                    if (App.browserDefaultActions.some(fn => fn({
                        beDraggedElt,
                        dropTargetElt,
                        dataTypes: event.dataTransfer.types,
                        data: event.dataTransfer,
                    })))
                        return app.log('can be consumed by browser');
                    event.preventDefault();
                    app.log('run callback', dataType);
                    callWithDropped({
                        beDraggedElt,
                        dropTargetElt,
                        dataItem: Array.from(event.dataTransfer.items).find(i => i.type === dataType),
                        data: event.dataTransfer,
                    });
                }, { once: true });
            });
        }
        ;
        static openNewTab({ url, active = false }) {
            browser.runtime.sendMessage({
                dir: 'content2background',
                type: 'openUrl',
                payload: { url, active },
            });
        }
        ;
    },
    _a.additionalActionMap = {
        'text/uri-list'(data) {
            data.dataItem.getAsString(url => _a.openNewTab({ url }));
        },
        'Files'(data) {
            var items = Array.from(data.data.items);
            for (let item of items) {
                let file = item.getAsFile();
                console.log(file);
                let url = URL.createObjectURL(file);
                _a.openNewTab({ url });
            }
            ;
        },
    },
    _a.browserDefaultActions = [
        function (data) {
            if (!data.dataTypes.includes('text/plain'))
                return false;
            var elt = data.dropTargetElt;
            while (elt !== document.documentElement) {
                if (elt.tagName.toLowerCase() === 'textarea')
                    return true;
                elt = elt.parentElement;
            }
            ;
            return false;
        },
        function (data) {
            if (!data.dataTypes.includes('text/plain'))
                return false;
            var elt = data.dropTargetElt;
            while (elt !== document.documentElement) {
                if (elt.tagName.toLowerCase() === 'input'
                    && elt.type === 'text')
                    return true;
                elt = elt.parentElement;
            }
            ;
            return false;
        },
        function (data) {
            if (!data.dataTypes.includes('text/plain'))
                return false;
            var elt = data.dropTargetElt;
            while (elt !== document.documentElement) {
                if (elt.contentEditable === 'true')
                    return true;
                elt = elt.parentElement;
            }
            ;
            return false;
        },
    ],
    _a);
var _a;
