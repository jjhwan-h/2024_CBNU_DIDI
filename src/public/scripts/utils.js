export const jsonToTable = (currentPage,json) =>{
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

export const renderTable= (totalPages,rowsPerPage,page,el)=> {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = el.data.slice(start, end);
    $(`#${el.tableList}`).html(jsonToTable(page-1,paginatedData));
    renderPagination(totalPages, page,el);
}

export const renderPagination = (totalPages, currentPage,el)=> {
    let paginationHtml = '';
    for (let i = 1; i <= totalPages; i++) {
        let active="";
        if(i===currentPage) active = "active";
        paginationHtml += `<span class="page-item ${active} "><a class="page-link" href="#" data-page="${i}">${i}</a></span>`;
    }
    $(`#${el.pagination}`).html(paginationHtml);
    $(`.page-link`).click(function(e) {
        e.preventDefault();
        currentPage = $(this).data('page');
        renderTable(currentPage);
    });
}

export const  paginate= (el)=> {
    const rowsPerPage = 10;
    const totalPages = Math.ceil(el.data.length / rowsPerPage);
    let currentPage = 1;

    renderTable(totalPages,rowsPerPage,currentPage,el);
}

export const getQR=(url,formData={})=>{
    $('#qrModal').modal('show');
    formData = JSON.stringify(formData);
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' 
        },
        body: formData
    }).then(response => {
        if(response.redirected){
            window.location.href=`${window.location.href}/?error=로그인이 필요한 서비스입니다.`;
            return;
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        // const output = document.getElementById('output');
        
        function read() {
            reader.read().then(({ done, value }) => {
                if (done) {
                    console.log('Stream complete');
                    return;
                }
                const chunk = decoder.decode(value, { stream: true });
                const message = JSON.parse(chunk);
                console.log(message)
                if (message.connection){
                   const newImg = $('<img>');
                   const newBtn = $('<button></button>', {
                    class: 'join_btn',
                    text:'url 클립보드로 복사'
                  });
                  newBtn.click(()=>{
                    navigator.clipboard.writeText(message.connection.url)
                      .then(function() {
                          alert('url이 성공적으로 복사되었습니다. 기기에서 url을 입력해주세요');
                      })
                      .catch(function(err) {
                          console.error('url 복사에 실패했습니다:', err);
                      });
                  });
                   newImg.attr('src',message.connection.qr);
                   $('.qr-info').hide();
                   $('.QR').append(newImg);
                   $('.url').append(newBtn);
                }
                else if(message.complete){
                    console.log(message.complete)
                    $('.QR').empty();
                    $('.url').empty();
                    $('#info').text("connection 생성중...")
                    window.location.href=message.complete
                }
                else if(message.progress){
                    $('.QR').empty();
                    $('.url').empty();
                    $('#info').text(message.progress)
                    $('.qr-info').show();
                }else if(message.url){
                    window.location.href=message.url
                }
                read(); 
            });
        }
        read();
    })
    .catch(error => console.error('Error:', error));
}