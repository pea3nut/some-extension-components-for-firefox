const ActionMap ={
    openNotepad :App.createOpenAction('notepad'),
    openMspaint :App.createOpenAction('mspaint'),
    openCalc :App.createOpenAction('calc'),
    openMyComputer :App.createOpenAction('explorer'),
};
new App({
    actionMap :ActionMap,
    el :document.querySelector('body > .panel'),
});
App.debug =false;


//todo: provide 16*16 and 32*32 images of images/skin/ rather than 48*48
//todo: provide 48*48 and 96*96 images of icons key in manifest.json