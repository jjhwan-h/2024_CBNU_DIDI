import { showToast } from "./toast.js";

$(document).ready(()=>{
    $('.page').hide(); // 페이지 숨김
    $('.page.active').show(); // 현재 페이지만 표시

    $('.pagination li').click(()=>{
        $('.pagination li').removeClass('active');
        $(this).addClass('active');
        $('.page').hide();
        var pageNum = $(this).index();
        $('.page').eq(pageNum).show();
    });

    const roomInfo = JSON.parse(window.serverData.roomInfo);
    if(roomInfo) showToast(roomInfo);
});

  


