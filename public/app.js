jQuery(document).on('click', '.pdf-link', function(clickEv) {
  var startTime     = new Date();
  var targetEl      = $(clickEv.target);
  var modalEl       = $('#pdf-loading');
  var ajaxRequest   = new XMLHttpRequest();

  clickEv.preventDefault();

  ajaxRequest.addEventListener('load', function(ev) {
    modalEl.modal('hide');
    modalEl.off('hide.bs.modal');

    window.location = ev.currentTarget.responseURL;
  })

  modalEl.on('hide.bs.modal', function() {
    modalEl.off('hide.bs.modal');

    if (ajaxRequest.readyState != 4) {
      ajaxRequest.abort();
    }
  });

  modalEl.modal('show');

  ajaxRequest.open('GET', targetEl.attr('href'));
  ajaxRequest.send();
})
