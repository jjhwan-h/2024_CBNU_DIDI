import { showToast } from "./toast.js";

$(document).ready(function() {
    $('input, textarea').prop('disabled', true);
    $('#editButton').click(function() {
        $('input, textarea').prop('disabled', function(i, v) {
            return !v;
        });
    });
    $('.page').hide(); // 페이지 숨김
    $('.page.active').show(); // 현재 페이지만 표시

    $('.pagination li').click(function() {
        $('.pagination li').removeClass('active');
        $(this).addClass('active');
        $('.page').hide();
        var pageNum = $(this).index();
        $('.page').eq(pageNum).show();
    });

    const roomInfo = JSON.parse(window.serverData.roomInfo);
    showToast(roomInfo)
});