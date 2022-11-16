(function($) {
   $.fn.customSelect = function(_options = {}) {
      return this.each(function() {
         let __options = $.extend({}, {
            search: true,
            hover: false,
            responsive: true,
            checkboxes: true,
            scrollToSelect: true,
            closeAfterSelect: false,
            beforeRenderList: (item) => {},
            onSelect: (element, item) => {}
         }, _options)

         if (isMobile()) {
            __options.hover = false
            __options.closeAfterSelect = true
         }

         let select = $(this)
         let options = select.find('option')
         let selected = select.find('option:selected')

         if (select.next().attr('id') == 'select') {
            select.next().remove()
         }

         let _htmlTemplate = `
            <div id="select" name="${select.attr('name')}">
               <li class="down ${__options.hover ? 'hover' : ''}">
                  <span class="select-label">${select.find('option:selected').text()}</span>
                  <ul class="select-menu">
                     <div class="select-search">
                        <div class="select-inline">
                              <span class="select-close">×</span>
                        </div>
                        <input type="text" name="select-search" placeholder="Search list" />
                     </div>
                     <ul class="select-list" />
                  </ul>
                  <div class="overlay" />
               </li>
            </div>
         `;

         select.after(_htmlTemplate)

         let $select = select.next()
         let $label = $select.find('.select-label')
         let $menu = $select.find('.select-menu')
         let $list = $select.find('.select-list')

         let $searchContainer = $select.find('.select-search')
         let $search = $menu.find('[name=select-search]')

         if (__options.search) {
            $search.on('keyup', (e) => {
               let find = $(e.currentTarget).val().toLowerCase()

               if (find.length < 2) {
                  $list.find('li').show()
               }

               $list.find('li').each((i, element) => {
                  let value = $(element).text().toLowerCase()
                  if (value.indexOf(find) == -1) {
                     $(element).hide()
                  } else {
                     $(element).show()
                  }
               })
            })
         }
         options.each((i, element) => {
            let opt = $(element)

            if (!opt.attr('value')) {
               $searchContainer.find('.select-inline').prepend(`
                  <span class="select-title">${opt.text()}</p></span>
               `)
               return
            }

            let listItem = `<li 
               ${!opt.attr('title') ? '' : `title="${opt.text()}"`}
               ${!opt.attr('value') ? '' : `data-value="${opt.val()}"`}
               ${!opt.is(':selected') && !opt.is(':disabled') ? '' : `class="${opt.is(':selected') ? 'selected' : 'disabled'}"`}
            />${__options.checkboxes ? `<span><p>${opt.text()}</p></span>` : opt.text()}`

            if (__options.beforeRenderList && typeof __options.beforeRenderList === 'function' && __options.beforeRenderList.toString().includes('return')) {
               if (opt.prop('value').length) {
                  let res = __options.beforeRenderList.call(this, {
                     id: opt.index(),
                     value: opt.val(),
                     text: opt.text()
                  })

                  listItem = `<li 
                        ${!opt.attr('title') ? '' : `title="${opt.text()}"`}
                        ${!opt.attr('value') ? '' : `data-value="${opt.val()}"`}
                        ${!opt.is(':selected') && !opt.is(':disabled') ? '' : `class="${opt.is(':selected') ? 'selected' : 'disabled'}"`}
                     />${__options.checkboxes ? `<span><p>${res}</p></span>` : res}`
               }
            }

            $list.append(listItem)
         })
         $list.find('li').each((i, element) => {
            $(element).bind('click', (e) => {
               let current = $(e.currentTarget)

               if (current.hasClass('disabled'))
                  return

               if (current.hasClass('selected')) {
                  current.removeClass('selected')
                  let firstOption = options.first()
                  firstOption.prop('selected', true)
                  $label.text(selected.text())
                  return
               }

               $list.find('li').removeClass('selected');
               current.addClass('selected');

               $label.text(current.text())
               select.val(!current.data('value') ? current.text() : current.data('value'))

               if (typeof __options.onSelect === 'function') {
                  return __options.onSelect.call(this, $select, {
                     id: current.index(),
                     value: current.data('value'),
                     text: current.text()
                  })
               }
            })
         })

         $label.on(__options.hover ? 'mouseover' : 'click', (e) => {
            let parent = $(e.currentTarget).parent();

            if (__options.hover) {
               parent.addClass('hover')
            } else {
               parent.toggleClass('visible')
            }
            if (__options.scrollToSelect) {
               let scrollTo = parent.find('.selected');
               if (scrollTo.length > 0) {
                 $menu.scrollTop(parent.find('.selected').get(0).offsetTop)
               }
            }
            if (isMobile()) {
               if (__options.responsive) {
                  $menu.addClass('responsive')
                  $('body').addClass('select-overflow-hidden')
               } else {
                  $('body').removeClass('select-overflow-hidden')
               }
            } else {
               selectPositionFix()
               $menu.removeClass('responsive')
            }
            if (!__options.search) {
               $searchContainer.remove()
            }
            let firstListEntry = $list.find('li:first');
            if (firstListEntry.text() == options.first().text()) {
               firstListEntry.hide()
            }
         })

         $(document).mouseup((e) => {
            if (!$menu.is(':visible')) {
                  e.preventDefault()
            }
            let selectMenu = $menu
            if (!__options.hover) {
               if (__options.closeAfterSelect) {
                  if ((!selectMenu.is(e.target) &&
                           $(e.target).attr('name') !== 'select-search' &&
                           $(e.target).attr('class') !== 'select-list' &&
                           $(e.target).attr('class') !== 'select-title' &&
                           !$(e.target).hasClass('disabled') &&
                           !$(e.target).hasClass('selected')
                     )) {
                     $('body').removeClass('select-overflow-hidden')
                     $select.find('li:first').removeClass('visible');
                     $search.val('').trigger('keyup')
                  }
               } else {
                  if ((!selectMenu.is(e.target) &&
                        $(e.target).attr('name') !== 'select-search' &&
                        $(e.target).attr('class') !== 'select-list' &&
                        $(e.target).attr('class') !== 'select-title' &&
                        $(e.target).prop('tagName') !== 'LI' &&
                        $(e.target).prop('tagName') !== 'P' &&
                        $(e.target).prop('tagName') !== 'SPAN' &&
                        !$(e.target).hasClass('disabled') &&
                        !$(e.target).hasClass('selected') ||
                        $(e.target).hasClass('select-close')
                  )) {
                     $('body').removeClass('select-overflow-hidden')
                     $select.find('li:first').removeClass('visible');
                     $search.val('').trigger('keyup')
                  }
               }
            } else {
               if (__options.closeAfterSelect) {
                  $('body').removeClass('select-overflow-hidden')
                  selectMenu.parent().removeClass('hover')
                  $select.find('li:first').removeClass('visible');
               }
               $search.val('').trigger('keyup')
            }
            if ($label.text() != selected.text()) {
               $label.text(select.find('option:selected').text())
            }
         })

         select.on('change', () => {
            let value = $(this).val()
            $list.find('li').each((i, element) => {
               if (value == $(element).data('value')) {
                  $(element).click()
               }
            })
         })
         select.on('deselect', () => {
            $list.find('li:first').click()
         })
         select.on('select', (e, newValue) => {
            $(this).val(newValue)
            $list.find('li').each((i, element) => {
               if (newValue == $(element).data('value')) {
                  if (!$(element).hasClass('selected')) $(element).click()
               }
            })
         })
         select.on('destroy', () => {
            if ($(this).next().attr('id') == 'select')
               $(this).next().remove();
         })
         select.on('rebuild', (e, o) => {
            if (!$(this).next().length) {
               if (!o) o = __options
               $(this).customSelect(o);
            }
         })

         select.on('close', (e, o) => {
            if ($menu.is(':visible')) {
               $label.click()
            }
         })

         select.on('open', (scrollIntoView) => {
            if ($menu.is(':hidden')) {
               $label.click()
               if (scrollIntoView && !isMobile()) {
                  $select.get(0).scrollIntoView({
                     behavior: 'smooth',
                     block: 'nearest'
                  });
               }
            }
         })

         $(window).on('resize scroll', selectPositionFix)

         function isMobile() {
            return window.matchMedia(`(max-width: 600px)`).matches
         }

         function selectPositionFix() {
            let watch = $select
            let offset = 25

            let elementTop = watch.offset().top
            let windowHeight = $(window).height()
            let elementBottom = elementTop + watch.outerHeight() + offset
            let viewportTop = $(window).scrollTop() - offset
            let viewportBottom = viewportTop + windowHeight

            let isInViewport = elementBottom > viewportTop && elementTop < viewportBottom
            let menuBottom = elementTop < viewportBottom - $menu.outerHeight()
            let menuTop = elementTop > viewportBottom - $menu.outerHeight()

            if (windowHeight < 500) {
               $searchContainer.css('position', 'static')
            } else {
               $searchContainer.css('position', 'sticky')
            }

            if (isInViewport) {
               let elem = $select.find('li:first')
               if (menuBottom) {
                  elem.removeClass('up').addClass('down')
               }
               if (menuTop) {
                  $select.find('li:first').removeClass('down').addClass('up')
               }
            } else {
               if ($menu.is(':visible')) {
                  select.trigger('close')
               }
            }
            if (isMobile()) {
               if (__options.responsive) {
                  $menu.addClass('responsive')
               }
            }
         }
      })
   }
}(jQuery));
