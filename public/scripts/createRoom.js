let imgCount=0;
let candidateCount = 1;

$(document).ready(function() {
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

        const candidateNumber = $('<span>').addClass('candidate-number').text(candidateCount);

        const candidateName = $('<input>').addClass('candidate candidate-name m-4').attr('name',`candidate-name-${candidateCount}`).val($('#candidate-name').val());

        const candidateGender = $('<input>').addClass('candidate candidate-gender m-4').attr('name',`candidate-gender-${candidateCount}`).val($('#candidate-gender').val());

        const candidateAge = $('<input>').addClass('candidate candidate-age m-4').attr('name',`candidate-age-${candidateCount}`).val($('#candidate-age').val());

        const candidateDesc = $('<input>').addClass('candidate-desc').attr('name',`candidate-desc-${candidateCount}`).val($('#candidate-desc').val()).attr('hidden',true);;

        const candidateImg = $('<img>').addClass('candidate-img candidateList-preview-img m-4').attr('src',$('#candidate-imagePreview').attr('src'));

        const candidateImgUrl = $('<input>').addClass('candidate-img-url').attr('name',`candidate-img-${candidateCount}`).val($('#candidate-img').val()).attr('hidden',true);

        candidateInfo.append(candidateNumber);
        candidateInfo.append(candidateImg);
        candidateInfo.append(candidateName);
        candidateInfo.append(candidateGender);
        candidateInfo.append(candidateAge);
        candidateInfo.append(candidateDesc);
        candidateInfo.append(candidateImgUrl);

        const buttonGroup = $('<div>').addClass('col-md-3 btn-group')

        const editButton = $('<button>').addClass('btn btn-outline-secondary btn-sm btn-space').text('수정하기');

        const deleteButton = $('<button>').addClass('btn btn-outline-danger btn-sm').text('삭제하기').click(function() {
            candidateItem.remove();
            updateCandidateCount();
        });

        buttonGroup.append(editButton);
        buttonGroup.append(deleteButton);

        candidateItem.append(candidateInfo);
        candidateItem.append(buttonGroup);

        candidateList.append(candidateItem);

        updateCandidateCount();

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
        const candidateList = $('#candidateList');
        $('#candidateCount').text(candidateCount).attr('name','candidate-num');
        candidateCount = candidateList.children().length+1;
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
                paginate(jsonContent);
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


function jsonToTable(currentPage,json) {
    let keys = Object.keys(json[0]);
    let table = '<table class="table table-bordered">';
    
    // Table header
    table += '<thead><tr>';
    table += '<th>#</th>'; // Index column
    for (let key of keys) {
        table += `<th>${key}</th>`;
    }
    table += '</tr></thead>';

    // Table body
    table += '<tbody>';
    for (let [index, row] of json.entries()) {
        table += '<tr>';
        table += `<td>${currentPage*10+index + 1}</td>`; // Adding index
        for (let key of keys) {
            table += `<td>${row[key]}</td>`;
        }
        table += '</tr>';
    }
    table += '</tbody>';

    table += '</table>';
    return table;
}

function paginate(data) {
    const rowsPerPage = 10;
    const totalPages = Math.ceil(data.length / rowsPerPage);
    let currentPage = 1;

    function renderTable(page) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedData = data.slice(start, end);

        $('#voterList').html(jsonToTable(page-1,paginatedData));
        renderPagination(totalPages, page);
    }

    function renderPagination(totalPages, currentPage) {
        let paginationHtml = '';
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `<span class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></span>`;
        }
        $('#pagination').html(paginationHtml);

        $('.page-link').click(function(e) {
            e.preventDefault();
            currentPage = $(this).data('page');
            renderTable(currentPage);
        });
    }

    renderTable(currentPage);
}