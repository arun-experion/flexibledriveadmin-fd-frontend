$( document ).ready(function() {

  // Ripple Effect
  $.ripple(".btn", {
    debug: false, // Turn Ripple.js logging on/off
    on: 'mousedown', // The event to trigger a ripple effect
    opacity: 0.4, // The opacity of the ripple
    color: "auto", // Set the background color. If set to "auto", it will use the text color
    multi: false, // Allow multiple ripples per element
    duration: 0.5, // The duration of the ripple
    // Filter function for modifying the speed of the ripple
    rate: function(pxPerSecond) {
      return pxPerSecond;
    },
    easing: 'linear' // The CSS3 easing function of the ripple
  });

  // Mobile Menu 
  if ($('.site-header').length) {
    var $rigth_side = $('.site-header .top-navbar .right-side-block').clone();
    var $mobile_nav = $('.site-header .main-navbar').clone();
    $('.mobile-nav-panel').append($rigth_side,$mobile_nav);
    $('.mobile-nav-panel').append('<button id="mobile-nav-toggle" class="mobile-nav-toggle close-toggle flaticon-error" type="button" title="Close Menu Toggle"></button>');
    $(document).on('click', '#mobile-nav-toggle', function(e){
      $('body').toggleClass('mobile-nav-active');
      $('.full-body-overly').toggle();
      if($('body').hasClass('filter-nav-active')) {
        $('body').removeClass('filter-nav-active');
      }
    });
    $('.mobile-nav-panel .main-navbar .navbar-nav').unwrap();
    $('.mobile-nav-panel .main-navbar').removeClass('navbar-expand');
    $('.mobile-nav-panel .main-navbar .navbar-nav').removeClass('ml-auto');

    $('.mobile-nav-panel .showprice-block .custom-control-label').attr('for', $('.mobile-panel .showprice-block .custom-control-input').attr('id')+1);
    $('.mobile-nav-panel .showprice-block .custom-control-input').attr('id', $('.mobile-panel .showprice-block .custom-control-input').attr('id')+1);
  }

  // Filter Mobile
  $('.filter-sidebar').append('<button id="filter-nav-toggle" class="filter-nav-toggle close-toggle flaticon-error" type="button"></button>');
  $('.filter-sidebar #filter-nav-toggle').hide();
  $(document).on('click', '#filter-nav-toggle', function(e){
    $('body').toggleClass('filter-nav-active');
    $('.full-body-overly').toggle();
    $('.filter-sidebar #filter-nav-toggle').show();
    if($('body').hasClass('mobile-nav-active')) {
      $('body').removeClass('mobile-nav-active');
    }
  });

  // Scroll Container
  $(".scroll-container").length && $(".scroll-container").mCustomScrollbar({
    scrollInertia: 180,
    alwaysShowScrollbar: 1
  });

  // Wow Animate Effect
  var wow = new WOW(
    {
      boxClass:     'wow',      // animated element css class (default is wow)
      animateClass: 'animated', // animation css class (default is animated)
      offset:       0,          // distance to the element when triggering the animation (default is 0)
      mobile:       true,       // trigger animations on mobile devices (default is true)
      live:         true,       // act on asynchronously loaded content (default is true)
      callback:     function(box) {
        // the callback is fired every time an animation is started
        // the argument that is passed in is the DOM node being animated
      },
      scrollContainer: null,    // optional scroll container selector, otherwise use window,
      resetAnimation: true,     // reset animation on end (default is true)
    }
  );
  wow.init();

  $('.popup-section').hide();
  $('#compareCheck').on('change' , function(){
    if($(this).prop('checked')) {
      $('.popup-section').slideDown(150);
    } else {
      $('.popup-section').slideUp(150);
    }
  });

  $('#btn-close').on('click' , function(){
     $('.popup-section').slideUp(200);
  });

  window_resize();

  window.addEventListener('resize', function () {
      myFunction('resize');
  });

  window.addEventListener("orientationchange", function() {
      myFunction('orientation');
      
  });

  function myFunction(value) {
      if (value == 'resize') {
          window_resize();
      } else if (value == 'orientation') {
          window_resize();

      }
  }

  /**
   *
   * Window Resize Function
   *
   */
        
  function window_resize() {
      // offset calculation
      var col_offset = $('header .container').offset();  
      
      
        $('.popup-section').css('right', col_offset.left);
    
      
  }

  // Price Slider
  var tooltipSlider = document.getElementById('price-range-slider');
 

});

