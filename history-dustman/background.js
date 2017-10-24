class HistoryDustman{
    /**
     * clear history
     * @param {number} [interval=1Day] - clear up interval by second
     * @param {function<Date>} [startTime]
     * @param {function<Date>} [endTime=now]
     * @param {boolean} [dev=true] - print log.
     * */
    constructor({interval=24*60*60,startTime=()=>0,endTime=()=>new Date,dev=true}){
        this.interval =interval;
        this.startTime =startTime;
        this.endTime =endTime;
        this.dev =dev;
        this._timer =null;
        this.init();
    };
    /**
     * stop periodic cleaning
     * @public
     * */
    stop(){
        clearInterval(this._timer);
    };
    init(){
        this.clearUp();
        this._timer =setInterval(
            this.clearUp.bind(this),
            this.interval*1000
        );
    };
    clearUp(){
        this.log('clear up');
        browser.history.deleteRange({
            startTime :this.startTime(),
            endTime :this.endTime(),
        });
    };
    log(){
        this.dev &&console.log(...arguments);
    };
};
