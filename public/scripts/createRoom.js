// Dropzone configuration
Dropzone.autoDiscover = false;

const createDropzones=(dropzoneId,dropzoneContainerId,num)=>{
    dropzoneId = dropzoneId.replace(/^#/, '');
    const container = document.getElementById(dropzoneId);
    container.innerHTML = ''; // Clear existing dropzones
    const rowContainer = document.createElement('div');
    rowContainer.classList.add('row');
    container.appendChild(rowContainer);
    if(dropzoneId==='dropzoneCategory2'){
        acceptedFile=".json";
        url="/rooms/voter-upload"
    } else if(dropzoneId==='dropzoneCategory3'){
        acceptedFile=".json";
        url="/rooms/candidate-upload";
    }
    else{
        acceptedFile="image/*";
        url="/rooms/img-upload";
    } 

    for (let i = 0; i < num; i++) {
        const dropzoneForm = document.createElement('div');
        dropzoneForm.className = 'dropzone';
        dropzoneForm.id = `${dropzoneContainerId}-${i}`;
        const colContainer = document.createElement('div');

        if(dropzoneId==="category4") colContainer.classList.add('col-md-3','mb-3');

        colContainer.id=`colContainer-${i}`;
        colContainer.appendChild(dropzoneForm);
        rowContainer.appendChild(colContainer);
        
        const dropzone = new Dropzone(`#${dropzoneContainerId}-${i}`, {
            url: url, // 파일 업로드 URL
            method:"post",
            uploadMultiple: true, // 다중 파일 업로드 허용
            maxFiles: 1, // 최대 파일 수 제한
            maxFilesize: 5, // 파일 최대 크기 (MB)
            acceptedFiles: acceptedFile, // 지정된 파일만 허용
            addRemoveLinks: true, // 파일 삭제 링크 표시
            dictRemoveFile: '파일 삭제', // 파일 삭제 텍스트 설정
            dictMaxFilesExceeded: '최대 파일 수를 초과하였습니다.', // 최대 파일 수 초과 시 메시지 설정
            dictFileTooBig: '파일 크기가 너무 큽니다.', // 파일 크기 초과 시 메시지 설정
            dictInvalidFileType: '이미지 파일만 업로드할 수 있습니다.', // 허용되지 않는 파일 형식 시 메시지 설정
            paramName: 'file', // multer로 참조하기위한 file parameter의 name
            params:{
                limit:$('#personCount').val()
            },
            init: function() {
                this.on("removedfile", (file) =>{
                    console.log("File removed:", file);
                    $(`#${dropzoneId}-${i}`).remove();
                    // Handle file removal, e.g., notify the server
                });
                this.on("addedfile", (file)=>{
                    const previewContainer = document.createElement('div');
                    const newPreviewDiv = document.createElement('div');
                    const newmarkDiv = document.createElement('div');
        
                    newmarkDiv.classList.add("row");
        
                    file.previewElement.querySelector(".dz-success-mark").classList.add("col-md-3");
                    file.previewElement.querySelector(".dz-error-mark").classList.add("col-md-3");
                    newmarkDiv.appendChild(file.previewElement.querySelector(".dz-success-mark"))
                    newmarkDiv.appendChild(file.previewElement.querySelector(".dz-error-mark"))
                    file.previewElement.appendChild(newmarkDiv);
                    newPreviewDiv.appendChild(file.previewElement); // 파일의 미리보기 요소를 새로운 div에 추가
                    colContainer.appendChild(newPreviewDiv)
                    while (this.files.length > this.options.maxFiles) { //max값을 넘었을경우 삭제
                        this.removeFile(this.files[0]);
                    }

                });
                this.on("success", async (file,res)=>{
                    console.log(res)
                    if(res.error) {
                        alert(res.error);
                        createDropzones(dropzoneId, dropzoneContainerId,1);
                        return;
                    }
                    if(dropzoneId==='dropzoneCategory3'){
                        if (this.files.length === 0) {
                            alert('업로드된 파일이 없습니다.');
                            return;
                          }
                      
                          const file = this.files[0]; // 첫 번째 파일만 처리
                          const reader = new FileReader();
                      
                          reader.onload = async (event)=> {
                            try {
                              const jsonData = await JSON.parse(event.target.result); // JSON 파싱
                              const elementCount = Object.keys(jsonData).length; // 후보수 계산
                              const personCount = parseInt($("#personCount").val(), 10);
                              if(elementCount !== personCount){
                                alert(`Json 파일 후보수:${elementCount}, 선택한 후보수:${personCount}입니다. \n두 수가 같아야합니다.`);
                                createDropzones('#dropzoneCategory3', 'preview-container-category3',1);
                              }
                              else{
                                  alert('JSON 파일 내 후보 수: ' + elementCount);
                              }
                            } catch (error) {
                              console.error('JSON 파싱 오류:', error);
                            }
                          };
                      
                        await reader.readAsText(file); // 파일을 텍스트로 읽기
                        
                    }

                    const newUrlDiv = document.createElement('input');
                    newUrlDiv.type='hidden';
                    newUrlDiv.value=res;
                    newUrlDiv.name=`${dropzoneId}-${i}`;
                    newUrlDiv.id=`${dropzoneId}-${i}`;
                    const dropzonecategory = document.getElementById(dropzoneForm.id);
                    dropzonecategory.appendChild(newUrlDiv);
                });

            }
        });
    }

}

createDropzones('#dropzoneCategory1', 'preview-container-category1',1);
createDropzones('#dropzoneCategory2', 'preview-container-category2',1);
createDropzones('#dropzoneCategory3', 'preview-container-category3',1);

document.getElementById('personCount').addEventListener('change',()=>{
    const dropzonecategory3 = $('#dropzoneCategory3');
    dropzonecategory3.empty(); // 기존 내용 초기화
    createDropzones('#dropzoneCategory3', 'preview-container-category3',1);
    const num = parseInt($("#personCount").val(), 10);
    createDropzones('#category4','dropzoneCategory4',num);
});

// Initialize with default value
createDropzones('#category4','dropzoneCategory4',document.getElementById('personCount').value);
