export const showToast = (roomInfo)=>{
    window.addEventListener('load', function() {
        let cnt=0;
        for (let v of roomInfo) {
            if(cnt<2){
                console.log(this.localStorage.getItem(`${v.id}box`));
                if(this.localStorage.getItem(`${v.id}box`)=="true") {
                    continue
                }
                const newToast = $('#liveToast').clone();
                const doNotShowAgain = newToast.find('#doNotShowAgain').text('다시보지 않기');
                const box = $('<input>').attr('type',"checkbox").attr('id',`${v.id}box`);
                doNotShowAgain.append(box);
                newToast.find('#toast-img').attr("src",`${v.img}`);
                newToast.find('#toast-room-id').val(`${v.name}`);
                newToast.find('#toast-right-id').val(`발급가능`);
                newToast.appendTo('.toast-container');
                newToast.toast('show');
                newToast.on('hidden.bs.toast', function () {
                    if (box.is(':checked')) {
                        localStorage.setItem(`${v.id}box`, "true");
                    }
                });
                cnt++;
            }
            else break;  
        }
    });
}
