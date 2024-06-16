// Dropzone configuration
Dropzone.autoDiscover = false;
const myDropzone = new Dropzone("#imageDropzone", {
    url: "/upload", // 파일 업로드 URL
    uploadMultiple: true, // 다중 파일 업로드 허용
    maxFiles: 8, // 최대 파일 수 제한
    parallelUploads: 8, // 병렬 업로드 수 제한
    maxFilesize: 5, // 파일 최대 크기 (MB)
    acceptedFiles: 'image/*', // 이미지 파일만 허용
    addRemoveLinks: true, // 파일 삭제 링크 표시
    dictRemoveFile: '파일 삭제', // 파일 삭제 텍스트 설정
    dictMaxFilesExceeded: '최대 파일 수를 초과하였습니다.', // 최대 파일 수 초과 시 메시지 설정
    dictFileTooBig: '파일 크기가 너무 큽니다.', // 파일 크기 초과 시 메시지 설정
    dictInvalidFileType: '이미지 파일만 업로드할 수 있습니다.', // 허용되지 않는 파일 형식 시 메시지 설정
    init: function() {
        this.on("addedfile", function(file) {
            // 파일이 추가될 때마다 번호를 부여합니다.
            const personCount = document.getElementById('personCount').value;
            const currentFileIndex = this.files.length;
            const fileNumber = currentFileIndex <= personCount ? currentFileIndex : '이상';

            const previewContainer = document.getElementById('preview-container');
            const newPreviewDiv = document.createElement('div');
            const newmarkDiv = document.createElement('div');

            newPreviewDiv.classList.add('col-md-3', 'mb-3'); // Bootstrap 그리드 클래스 추가
            newmarkDiv.classList.add("row");

            // 파일 이름을 변경하여 번호를 표시합니다.
            file.previewElement.querySelector(".dz-filename span").textContent = `${fileNumber}. ${file.name}`;
            // file.previewElement.classList.add("col-md-3");
            file.previewElement.querySelector(".dz-success-mark").classList.add("col-md-3");
            file.previewElement.querySelector(".dz-error-mark").classList.add("col-md-3");
            newmarkDiv.appendChild(file.previewElement.querySelector(".dz-success-mark"))
            newmarkDiv.appendChild(file.previewElement.querySelector(".dz-error-mark"))
            file.previewElement.appendChild(newmarkDiv);
            newPreviewDiv.appendChild(file.previewElement); // 파일의 미리보기 요소를 새로운 div에 추가
            previewContainer.appendChild(newPreviewDiv);
        });
    }
});

// Form submission
document.getElementById('imageUploadForm').addEventListener('submit', function(event) {
    event.preventDefault(); // 기본 제출 동작 방지
    const personCount = document.getElementById('personCount').value;
    if (myDropzone.getQueuedFiles().length !== Number(personCount)) {
        alert(`인원 수와 업로드된 사진 수가 일치해야 합니다. 현재 업로드된 사진 수: ${myDropzone.getQueuedFiles().length}`);
        return;
    }
    myDropzone.processQueue(); // 파일 업로드 처리
});