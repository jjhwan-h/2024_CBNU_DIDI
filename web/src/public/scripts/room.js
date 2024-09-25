import {getQR} from "./utils.js"
$(document).ready(()=>{
    window.modalBtnClickEvent=(modalData)=>{
        modalBtnClickEvent(modalData);
    }
    window.voteBtnClickEvent=(roomId)=>{
        const url = `/users/vote/${roomId}`;
        getQR(url);
    }
});

const modalBtnClickEvent = (data)=>{
    console.log(data);
    $('#candidate-num').text(`후보 ${data.num}`);
    $('.profile-pic').attr('src',data.img);
    $('.profile-name').text(`이름 | ${data.name}`);
    $('.profile-age').text(`나이 | ${data.age}`);
    $('.profile-desc').text(data.desc);
    $('#candidateModal').modal('show');
}
