export const showToast = (roomInfo)=>{
    window.addEventListener('load', function() {
        for (let v of roomInfo) {
            const newToast = $('#liveToast').clone();

            newToast.find('#toast-img').attr("src",`${v.img}`);
            newToast.find('#toast-room-id').val(`${v.name}`);
            newToast.find('#toast-right-id').val(`발급가능`);
            newToast.appendTo('.toast-container');
            newToast.toast('show');
        }
    });
}

