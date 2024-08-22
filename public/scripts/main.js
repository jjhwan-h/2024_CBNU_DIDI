$(document).ready(()=>{
    slide()
})

const slide =()=>{
    const sliderWrapper = $('#slider');
    let modalItemsPerPage = 1; 
    let currentSlide = 0;

    function initSlider() {
       const imgList = ["/imgs/vote3.jpg"];
        const html = imgList.map(img => `
            <div class="main-slider-item">
                <div class="card">
                    <img src="${img}" class="card-img-top" onerror="handleError(this)"">
                </div>
            </div>
        `).join('');
        sliderWrapper.html(html)
    }

    function slideTo(index) {
        currentSlide = index;
        const maxIndex = Math.max(0, 1);
        currentSlide = Math.max(0, Math.min(currentSlide, maxIndex));
        sliderWrapper.css('transform',`translateX(-${currentSlide * (100/modalItemsPerPage)}vw)`);
    }

    $('#prevBtn').on('click', () => {
        slideTo(currentSlide - 1);
    });

    $('#nextBtn').on('click', () => {
        slideTo(currentSlide + 1);
    });
    initSlider();
    slideTo(0);


    function calculateItemsPerPage() {
        const containerWidth = $('.slider-container').width();
        const slideWidth = $('.slider-item').outerWidth(true); 
        return Math.floor(containerWidth / slideWidth);
    }

    $(window).on('resize', function () {
        modalItemsPerPage = calculateItemsPerPage();
        slideTo(currentSlide);
    });
}
