(new HistoryDustman({
    endTime(){
        return new Date(new Date-30*1000);
    },
    interval:15,
})).start();