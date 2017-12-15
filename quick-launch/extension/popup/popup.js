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




//todo: can I use vue.js?
//todo: should only has 48x48 and 96x96 icons
//todo: miss 64x64 browser_action icon
//todo: default_locale