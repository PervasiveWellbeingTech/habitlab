let scroll_buffer = []

const checkScrollSpeed = (function(settings){
    settings = settings || {};

    let lastPos, newPos, timer, delta,
        delay = settings.delay || 50;

    function clear() {
        lastPos = null;
        delta = 0;
    }

    clear();

    return function(){
        newPos = window.scrollY;
        if ( lastPos != null ){ // && newPos < maxScroll
            delta = newPos -  lastPos;
        }
        lastPos = newPos;
        clearTimeout(timer);
        timer = setTimeout(clear, delay);
        return delta;
    };
})();


document.addEventListener('scroll', function() {
    //console.log(scroll_buffer);
    scroll_buffer.push(checkScrollSpeed());
    if (scroll_buffer.length > 100){
      //console.log(scroll_buffer);
      let message = {type: 'log_scroll', data: scroll_buffer};
      chrome.runtime.sendMessage(message);
      scroll_buffer = []
    }
});
