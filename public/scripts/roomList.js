$(document).ready(function() {
    $('.page').hide(); // 페이지 숨김
    $('.page.active').show(); // 현재 페이지만 표시

    $('.pagination li').click(function() {
        $('.pagination li').removeClass('active');
        $(this).addClass('active');
        $('.page').hide();
        var pageNum = $(this).index();
        $('.page').eq(pageNum).show();
    });
});

function handleError(img) {
    img.onerror = null; // 무한 루프 방지
    img.src = '/imgs/vote3.jpg';
}

function modalBtnClickEvent(modalData){
    let limit;
    const {desc,Candidates,v} = modalData;
    for(let [idx,value] of Candidates.entries()){
        if(value.img!=="temp") $(`#image${idx+1}`).attr('src',value.img);
        else $(`#image${idx+1}`).attr('src','https://storage.googleapis.com/cbnu_didi/public/vote3.jpg');
        $(`#name${idx+1}`).text(`${value.name}`);
        $(`#age${idx+1}`).text(`만${value.age}세`);
        limit=idx+1;
    }
    
    for(let i=limit+1;i<9;i++){
        $(`#c${i}`).remove();
    }
    $(`#desc`).text(desc)



    $('#roomModal').modal('show');
}   
