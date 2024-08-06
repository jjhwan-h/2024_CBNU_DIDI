export const showToast = (roomInfo)=>{
    window.addEventListener('load', function() {
        let cnt=0;
        for (let v of roomInfo) {
            if(cnt<2){
                const newToast = $('#liveToast').clone();

                newToast.find('#toast-img').attr("src",`${v.img}`);
                newToast.find('#toast-room-id').val(`${v.name}`);
                newToast.find('#toast-right-id').val(`발급가능`);
                newToast.appendTo('.toast-container');
                newToast.toast('show');
                cnt++;
            }
            else break;  
        }
    });
}

