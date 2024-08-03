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