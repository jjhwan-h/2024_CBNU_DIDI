import { paginate } from "./utils.js";

let imgCount=0;
let candidateCount = 1;

$(document).ready(function() {
    getCurrentDateTime();
    const currentYear = new Date().getFullYear();
    const startYear = 1900;
    const endYear = currentYear;

    for (let year = endYear; year >= startYear; year--) {
        $('#candidate-age').append(new Option(year, year));
    }

    $('#nextToCandidates').click(function() {
        $('#voteInfoContainer').removeClass('active');
        $('#candidateContainer').addClass('active');
    });

    $('#backToVoteInfo').click(function() {
        $('#candidateContainer').removeClass('active');
        $('#voteInfoContainer').addClass('active');
    });

    $('#nextAddCandidate').click(function() {
        $('#candidateContainer').removeClass('active');
        $('#addCandidateContainer').addClass('active');
    });

    $('#backToCandidateInfo').click(function() {
        $('#voterContainer').removeClass('active');
        $('#candidateContainer').addClass('active');
    });

    $('#nextAddVoter').click(function() {
        $('#candidateContainer').removeClass('active');
        $('#voterContainer').addClass('active');
    });

    $('#cancel').click(function() {
        $('#addCandidateContainer').removeClass('active');
        $('#candidateContainer').addClass('active');
    });

    $('#addCandidate').click(function() {
        const candidateList = $('#candidateList');

        const candidateItem = $('<li>').addClass('candidate-item row');

        const candidateInfo = $('<div>').addClass('candidate-info col-md-9');

        const candidateNumber = $('<input>').addClass('candidate candidate-number m-4 rank-circle').attr('name',`candidate-num-${candidateCount}`).attr('readonly',true).val(candidateCount);

        const candidateName = $('<input>').addClass('candidate candidate-name m-4').attr('name',`candidate-name-${candidateCount}`).attr('readonly',true).val($('#candidate-name').val());

        const candidateGender = $('<input>').addClass('candidate candidate-gender m-4').attr('name',`candidate-gender-${candidateCount}`).attr('readonly',true).val($('#candidate-gender').val());

        const candidateAge = $('<input>').addClass('candidate candidate-age m-4').attr('name',`candidate-age-${candidateCount}`).attr('readonly',true).val($('#candidate-age').val());

        const candidateDesc = $('<input>').addClass('candidate-desc').attr('name',`candidate-desc-${candidateCount}`).attr('readonly',true).attr('hidden',true).val($('#candidate-desc').val());

        const candidateImg = $('<img>').addClass('candidate-img candidateList-preview-img m-4').attr('src',$('#candidate-imagePreview').attr('src'));

        const candidateImgUrl = $('<input>').addClass('candidate-img-url').attr('name',`candidate-img-${candidateCount}`).attr('hidden',true).attr('readonly',true).val($('#candidate-img').val());

        candidateInfo.append(candidateNumber);
        candidateInfo.append(candidateImg);
        candidateInfo.append(candidateName);
        candidateInfo.append(candidateGender);
        candidateInfo.append(candidateAge);
        candidateInfo.append(candidateDesc);
        candidateInfo.append(candidateImgUrl);

        const buttonGroup = $('<div>').addClass('col-md-3 btn-group')

        const editButton = $('<button>').addClass('btn btn-outline-secondary btn-sm btn-space').attr('type','button').text('수정하기');

        const deleteButton = $('<button>').addClass('btn btn-outline-danger btn-sm').text('삭제하기').attr('type','button').click(function() {
            candidateItem.remove();
            updateCandidateCount();
        });

        buttonGroup.append(editButton);
        buttonGroup.append(deleteButton);

        candidateItem.append(candidateInfo);
        candidateItem.append(buttonGroup);

        candidateList.append(candidateItem);

        candidateCount = candidateList.children().length+1;
        $('#candidateCount').text(candidateCount-1).attr('name','candidate-num');

        $('#candidate-name').val('');
        $('#candidate-gender').val('');
        $('#candidate-age').val('');
        $('#candidate-img').val('').removeAttr('name');
        $('#candidate-desc').val('');
        $('#candidate-imagePreview').attr('src','').css('display', 'none');
        $(`#candidate-input-explain`).attr('hidden',false);

        $('#addCandidateContainer').removeClass('active');
        $('#candidateContainer').addClass('active');
    });

    function updateCandidateCount() {
        $('.candidate-list').each(function(index, element) {
            const childCount = $(element).children().length;
            $('#candidateCount').text(childCount).attr('name','candidate-num');
        });
    }

    $('input[class$="-img-input"]').change(function(event) {
        const input = event.target;
        let imgName = $(input).attr('id').split('-')[0];
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $(`#${imgName}-input-explain`).attr('hidden',true);
                $(`#${imgName}-imagePreview`).attr('src', e.target.result).show();
            }
            reader.readAsDataURL(input.files[0]);
            const formData = new FormData();
            formData.append('image', input.files[0]);
            formData.append('attr',imgName);
            $.ajax({
                url: '/rooms/img-upload',
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    $(`#${imgName}-img`).val(response).attr('name',`${imgName}-img`);
                    console.log($(`#${imgName}-img`).val())
                },
                error: function(xhr, status, error) {
                    alert(status,error);
                }
            });
            }
        $(input).val('');
    });


    $('.img-file-input').click(function(event){
        const input = event.target;
        const btnName = $(input).attr('id').split('-')[0];
        $(`.${btnName}-img-input`).click();
    });

    $('#room-form').on('submit', async function(event) {
        event.preventDefault();
    
        const formData = new FormData(this);
        for (const [key,value] of formData.entries()){
            console.log(key, value);
        }
        $.ajax({
            url: '/rooms',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                window.location.href="/vote-rooms?message=방 생성이 완료되었습니다.";
            },
            error: function(xhr, status, error) {
                const errorData = xhr.responseJSON;
                alert(`${errorData.error}: ${errorData.message}`);
            }
        });
    });
});

$('.voter-input').change(function(event) {
    const input = event.target;
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    if (input.files && input.files[0]) {
        const file = input.files[0];

         // 파일 크기 확인
         if (file.size > maxSize) {
            $('#voterList').html('<div class="alert alert-danger">File size exceeds 2MB limit.</div>');
            return;
        }

        const reader = new FileReader()
        reader.onload = function(e) {
            try {
                const jsonContent = JSON.parse(e.target.result);
                const jsonLength = jsonContent.length;
                const el = {
                    data:jsonContent,
                    pagination:"pagination",
                    tableList:"voterList"
                }
                paginate(el);
                $('#voterCount').text(jsonLength);
            } catch (error) {
                $('#voterList').html('<div class="alert alert-danger">Invalid JSON file.</div>');
            }
        };
        reader.readAsText(file);
    }
});

$('.file-input').click(function(event){
    const input = event.target;
    const btnName = $(input).attr('id').split('-')[0];
    $(`.${btnName}-input`).click();
});

$('#start-date').on('change',function(){
    let startDate = new Date($(this).val());

    startDate.setDate(startDate.getDate() + 1);

    // ISO 형식으로 변환하여 종료 시간 필드의 min 값 설정
    var year = startDate.getFullYear();
    var month = ('0' + (startDate.getMonth() + 1)).slice(-2);
    var day = ('0' + startDate.getDate()).slice(-2);
    var hours = ('0' + startDate.getHours()).slice(-2);
    var minutes = ('0' + startDate.getMinutes()).slice(-2);

    var minEndDate = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
    $('#end-date').attr('min', minEndDate); 
});

const getCurrentDateTime=()=>{
    const startTime = window.serverData.startTime;
    const startTimeEnd = window.serverData.startTimeEnd;
    const endTime = window.serverData.endTime;
    const endTimeEnd = window.serverData.endTimeEnd;

    $('#start-date').attr('min',startTime);
    $('#start-date').attr('max',startTimeEnd);
    $('#end-date').attr('max',endTimeEnd);
}