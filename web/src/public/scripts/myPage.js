import {getQR} from "./utils.js"
let voteCount=1;
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
    headVote();
    addVote(roomInfo,window.serverData.itemsPerPage);
});

function addVote(roomInfo,itemsPerPage){
    const voteList = $('#voteList');
    const pageCount = Math.ceil(roomInfo.length/itemsPerPage);
    for(let page=0;page<pageCount;page++){
        const voteObj = $('<div>').addClass(`justify-content-center page ${page===0? 'active': ''}`);
        for(let i=page*itemsPerPage; i<Math.min((page+1)*itemsPerPage,roomInfo.length); i++){
            
            const voteItem = $('<li>').addClass('vote-item row');
    
            const voteInfo = $('<div>').addClass('vote-info col-md-9');
    
            const voteNumber = $('<span>').addClass('vote-number rank-circle').text(voteCount);
    
            const roomName = $('<input>').addClass('vote vote-name m-4').attr('id',`vote-name-${voteCount}`).attr('readonly',true).val(roomInfo[i].name);
    
            const roomId = $('<input>').addClass('vote vote-id m-4').attr('id',`vote-id-${voteCount}`).attr('readonly',true).val(roomInfo[i].id);
    
            const roomImg = $('<img>').addClass('vote-img voteList-preview-img m-4').attr('src',roomInfo[i].img);
    
            voteInfo.append(voteNumber);
            voteInfo.append(roomImg);
            voteInfo.append(roomName);
            voteInfo.append(roomId);
    
            const buttonGroup = $('<div>').addClass('col-md-3 btn-group')
    
            const issueButton = $('<button>').addClass('btn btn-outline-secondary btn-sm btn-space').text('발급받기');
            issueButton.on('click',function(){
                const url = `/users/vote-right/${roomInfo[i].id}`;
                getQR(url);
            })
    
            const deleteButton = $('<button>').addClass('btn btn-outline-danger btn-sm').text('삭제하기').click(function() {
                voteItem.remove();
                updateCandidateCount();
            });
    
            buttonGroup.append(issueButton);
            buttonGroup.append(deleteButton);
    
            voteItem.append(voteInfo);
            voteItem.append(buttonGroup);
            
            voteObj.append(voteItem);
            voteCount+=1;
        }
        voteList.append(voteObj);
        $('#voteCount').text(voteCount-1).attr('name','vote-num');
    }
}

function headVote(){
    const voteList = $('#voteList');

    const voteItem = $('<li>').addClass('vote-item row');

    const voteInfo = $('<div>').addClass('vote-info col-md-9');

    const voteNumber = $('<span>').addClass('vote-number m-3').text("#");

    const roomName = $('<input>').addClass('vote vote-name m-4').attr('readonly',true).val("방 이름");

    const roomId = $('<input>').addClass('vote vote-age m-4').attr('readonly',true).val("방 번호");

    const roomImg = $('<span>').addClass('vote-img voteList-preview-img m-4').text("썸네일");

    const buttonGroup = $('<div>').addClass('col-md-3').text("발급/삭제");

    voteInfo.append(voteNumber);
    voteInfo.append(roomImg);
    voteInfo.append(roomName);
    voteInfo.append(roomId);

    voteItem.append(voteInfo);
    voteItem.append(buttonGroup);

    voteList.append(voteItem);
}