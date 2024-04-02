export const LOGINAPI = `/login`;
export const LOGOUTAPI = `/logout`;
export const PRODUCTSAPI = `/products`;
export const PROFILEFORMREADONLY = true;
export const USERPROFILE = `/user/profile`;
export const MAKESAPI = `/makes`;
export const MODELSAPI = `/models`;
export const COUNTAPI = `/count`;
export const SEARCHAPI = `/search`;
export const DROPDOWNSAPI = `/dropdowns`;
export const CATEGORIESAPI = `/categories`;
export const POSITIONSAPI = `/positions`;
export const BRANDSAPI = `/brands`;
export const CONTACTAPI = `/contact`;
export const CARTAPI = `/cart`;
export const SIGNUPAPI = `/signup`;
export const RESETPASSWORDAPI = `/reset/password`;
export const USERPASSWORDAPI = `/user/password`;
export const TOASTRTIMEOUT = 5000;
export const ORDERSAPI = `/orders`;
export const ORDERAPI = `/order`;
export const EXPORORDERS = `${ORDERAPI}/export`;
export const BULKDELETE = `${ORDERAPI}/bulk/delete`;
export const REFERENCENUMBERAPI  = `${ORDERAPI}/reference-number`;
export const NOTEAPI = `/product/note`;
export const FAVOURITEAPI = `${ORDERAPI}/favourite`;
export const MARKETINTEL = `/market-intel`;
export const BANNERAPI = `/banner`;
export const SESSIONSTORAGECOMPARELIST = `compareList`;
export const SESSIONSTORAGECOMPARELISTIDS = `compareListIDs`;
export const BULKCARTADDAPI = `${CARTAPI}/add/bulk/product`;
export const USERISACTIVEAPI = `/user-is-active`;
export const COMPAREOVERLAYTIMEOUT = 1000;

export const SWIPERCONFIGINTERFACE = {
    direction: 'horizontal',
    slidesPerView: 4,
    spaceBetween: 15,
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    breakpoints: {
        1024: {
            slidesPerView: 4,
            spaceBetween: 15,
        },
        768: {
            slidesPerView: 3,
            spaceBetween: 15,
        },
        640: {
            slidesPerView: 1.3,
            spaceBetween: 15,
        },
        320: {
            slidesPerView: 1.2,
            spaceBetween: 15,
        }
    }
};

export const SWIPERCONFIGINTERBANNER = {
    direction: 'horizontal',
    slidesPerView: 1,
    spaceBetween: 15,
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    breakpoints: {
        1024: {
            slidesPerView: 1,
            spaceBetween: 15,
        },
        768: {
            slidesPerView: 1,
            spaceBetween: 15,
        },
        640: {
            slidesPerView: 1,
            spaceBetween: 15,
        },
        320: {
            slidesPerView: 1,
            spaceBetween: 15,
        }
    }
};
