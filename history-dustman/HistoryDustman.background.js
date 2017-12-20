class HistoryDustman{
    /**
     * clear history
     * @param {number} [interval=1Day] - clear up interval by second
     * @param {function<Date>} [startTime]
     * @param {function<Date>} [endTime=now]
     * @param {boolean} [dev=true] - print log.
     * */
    constructor({startTime=()=>0,endTime=()=>new Date,dev=false,interval=60}){
        this.startTime =startTime;
        this.endTime =endTime;
        this.interval =interval;
        this.dev =dev;
        this.handleOnStateChanged =this.handleOnStateChanged.bind(this);
        this.log('init');
    };
    /**
     * stop periodic cleaning
     * @public
     * */
    stop(){
        this.log('stop');
        browser.idle.onStateChanged.removeListener(this.handleOnStateChanged);
    };
    start(){
        this.log('start');
        this.clearUp();
        browser.idle.setDetectionInterval(this.interval);
        browser.idle.onStateChanged.addListener(console.log);
        browser.idle.onStateChanged.addListener(this.handleOnStateChanged);
    };
    handleOnStateChanged(newState){
        this.log('state:',newState);
        if(newState !=='idle')return;
        this.clearUp();
    };
    async clearUp(){
        await browser.history.deleteRange({
            startTime :this.startTime(),
            endTime :this.endTime(),
        });
        this.log('clear history.');
        this.log('send of clear');
    };
    log(){
        this.dev &&console.log(...arguments);
    };
};
