new class App{
    constructor(){
        this.qrcodeSize =200;
        this.qrcodeEl =document.getElementById("qrcode");

        this._qrcode =null;

        this.init();
    };
    init(){
        this.renderQrcode();
        this.renderI18n();
    };
    async renderQrcode(){
        this.qrcodeEl.style.width =this.qrcodeSize+'px';
        this.qrcodeEl.style.height =this.qrcodeSize+'px';

        this._qrcode =new QRCode(this.qrcodeEl,{
            width :this.qrcodeSize,
            height :this.qrcodeSize
        });

        var activeInfo =(await browser.tabs.query({active :true}))[0];
        this._qrcode.makeCode(activeInfo.url);
    };
    renderI18n(){
        Array.from(
            document.querySelectorAll('[data-i18n]')
        ).forEach(
            elt=>elt.textContent=browser.i18n.getMessage(elt.dataset.i18n)
        );
    };
};