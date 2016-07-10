/*
 * ui.tux
 */angular.module("ui.tux", ["ui.tux.tpls", "ui.tux.collapse","ui.tux.accordion","ui.tux.position","ui.tux.debounce","ui.tux.affix","ui.tux.alert","ui.tux.breadcrumb","ui.tux.carousel","ui.tux.dateparser","ui.tux.isClass","ui.tux.datepicker","ui.tux.datepickerPopup","ui.tux.dropdown","ui.tux.fileUpload","ui.tux.footer","ui.tux.formComponents","ui.tux.formValidations","ui.tux.grid","ui.tux.header","ui.tux.stackedMap","ui.tux.modal","ui.tux.imageGallery","ui.tux.login","ui.tux.multiselect","ui.tux.tooltip","ui.tux.popover","ui.tux.progressbar","ui.tux.scrollspy","ui.tux.slider","ui.tux.submitFeedback","ui.tux.tabs","ui.tux.textEditor","ui.tux.timepicker","ui.tux.typeahead","ui.tux.verticalImageGallery","ui.tux.widgets","ui.tux.wizard"]);
angular.module("ui.tux.tpls", ["tux/template/accordion/accordion-group.html","tux/template/accordion/accordion.html","tux/template/alert/alert.html","tux/template/carousel/carousel.html","tux/template/carousel/slide.html","tux/template/datepicker/datepicker.html","tux/template/datepicker/day.html","tux/template/datepicker/month.html","tux/template/datepicker/year.html","tux/template/datepickerPopup/popup.html","tux/template/fileUpload/fileupload.html","tux/template/formComponents/input.html","tux/template/header/header-li.html","tux/template/header/header-ul.html","tux/template/modal/backdrop.html","tux/template/modal/window.html","tux/template/imageGallery/imageGallery.html","tux/template/login/login.html","tux/template/multiselect/multiselect.html","tux/template/tooltip/tooltip-html-popup.html","tux/template/tooltip/tooltip-popup.html","tux/template/tooltip/tooltip-template-popup.html","tux/template/popover/popover-html.html","tux/template/popover/popover-template.html","tux/template/popover/popover.html","tux/template/progressbar/bar.html","tux/template/progressbar/progress.html","tux/template/progressbar/progressbar.html","tux/template/slider/slider.html","tux/template/tabs/tab.html","tux/template/tabs/tabset.html","tux/template/timepicker/timepicker.html","tux/template/typeahead/typeahead-match.html","tux/template/typeahead/typeahead-popup.html","tux/template/verticalImageGallery/verticalImageGallery.html","tux/template/widgets/widgets-sort.html","tux/template/widgets/widgets.html","tux/template/wizard/step.html","tux/template/wizard/wizard.html"]);
angular.module('ui.tux.collapse', [])

  .directive('tuxCollapse', ['$animate', '$q', '$parse', '$injector', function($animate, $q, $parse, $injector) {
    var $animateCss = $injector.has('$animateCss') ? $injector.get('$animateCss') : null;
    return {
      link: function(scope, element, attrs) {
        var expandingExpr = $parse(attrs.expanding),
            expandedExpr = $parse(attrs.expanded),
            collapsingExpr = $parse(attrs.collapsing),
            collapsedExpr = $parse(attrs.collapsed);

        if (!scope.$eval(attrs.tuxCollapse)) {
          element.addClass('in')
            .addClass('collapse')
            .attr('aria-expanded', true)
            .attr('aria-hidden', false)
            .css({height: 'auto'});
        }

        function expand() {
          if (element.hasClass('collapse') && element.hasClass('in')) {
            return;
          }

          $q.resolve(expandingExpr(scope))
            .then(function() {
              element.removeClass('collapse')
                .addClass('collapsing')
                .attr('aria-expanded', true)
                .attr('aria-hidden', false);

              if ($animateCss) {
                $animateCss(element, {
                  addClass: 'in',
                  easing: 'ease',
                  to: { height: element[0].scrollHeight + 'px' }
                }).start()['finally'](expandDone);
              } else {
                $animate.addClass(element, 'in', {
                  to: { height: element[0].scrollHeight + 'px' }
                }).then(expandDone);
              }
            });
        }

        function expandDone() {
          element.removeClass('collapsing')
            .addClass('collapse')
            .css({height: 'auto'});
          expandedExpr(scope);
        }

        function collapse() {
          if (!element.hasClass('collapse') && !element.hasClass('in')) {
            return collapseDone();
          }

          $q.resolve(collapsingExpr(scope))
            .then(function() {
              element
                // IMPORTANT: The height must be set before adding "collapsing" class.
                // Otherwise, the browser attempts to animate from height 0 (in
                // collapsing class) to the given height here.
                .css({height: element[0].scrollHeight + 'px'})
                // initially all panel collapse have the collapse class, this removal
                // prevents the animation from jumping to collapsed state
                .removeClass('collapse')
                .addClass('collapsing')
                .attr('aria-expanded', false)
                .attr('aria-hidden', true);

              if ($animateCss) {
                $animateCss(element, {
                  removeClass: 'in',
                  to: {height: '0'}
                }).start()['finally'](collapseDone);
              } else {
                $animate.removeClass(element, 'in', {
                  to: {height: '0'}
                }).then(collapseDone);
              }
            });
        }

        function collapseDone() {
          element.css({height: '0'}); // Required so that collapse works when animation is disabled
          element.removeClass('collapsing')
            .addClass('collapse');
          collapsedExpr(scope);
        }

        scope.$watch(attrs.tuxCollapse, function(shouldCollapse) {
          if (shouldCollapse) {
            collapse();
          } else {
            expand();
          }
        });
      }
    };
  }]);

angular.module('ui.tux.accordion', ['ui.tux.collapse'])

.constant('tuxAccordionConfig', {
  closeOthers: true
})

.controller('TrwdAccordionController', ['$scope', '$attrs', 'tuxAccordionConfig', function($scope, $attrs, accordionConfig) {
  // This array keeps track of the accordion groups
  this.groups = [];

  // Ensure that all the groups in this accordion are closed, unless close-others explicitly says not to
  this.closeOthers = function(openGroup) {
    var closeOthers = angular.isDefined($attrs.closeOthers) ?
      $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
    if (closeOthers) {
      angular.forEach(this.groups, function(group) {
        if (group !== openGroup) {
          group.isOpen = false;
        }
      });
    }
  };

  // This is called from the accordion-group directive to add itself to the accordion
  this.addGroup = function(groupScope) {
    var that = this;
    this.groups.push(groupScope);

    groupScope.$on('$destroy', function(event) {
      that.removeGroup(groupScope);
    });
  };

  // This is called from the accordion-group directive when to remove itself
  this.removeGroup = function(group) {
    var index = this.groups.indexOf(group);
    if (index !== -1) {
      this.groups.splice(index, 1);
    }
  };
}])

// The accordion directive simply sets up the directive controller
// and adds an accordion CSS class to itself element.
.directive('tuxAccordion', function() {
  return {
    controller: 'TrwdAccordionController',
    controllerAs: 'accordion',
    transclude: true,
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'tux/template/accordion/accordion.html';
    }
  };
})

// The accordion-group directive indicates a block of html that will expand and collapse in an accordion
.directive('tuxAccordionGroup', function() {
  return {
    require: '^tuxAccordion',         // We need this directive to be inside an accordion
    transclude: true,              // It transcludes the contents of the directive into the template
    replace: true,                // The element containing the directive will be replaced with the template
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'tux/template/accordion/accordion-group.html';
    },
    scope: {
      heading: '@',               // Interpolate the heading attribute onto this scope
      isOpen: '=?',
      isDisabled: '=?',
      alertType:'@',
      message:'=?'
    },
    controller: function() {
      this.setHeading = function(element) {
        this.heading = element;
      };
    },
    link: function(scope, element, attrs, accordionCtrl) {
      accordionCtrl.addGroup(scope);

      scope.openClass = attrs.openClass || 'panel-open';
      scope.panelClass = attrs.panelClass || 'panel-default';
      scope.accType = attrs.accType;
      scope.$watch('isOpen', function(value) {
        element.toggleClass(scope.openClass, !!value);
        if (value) {
          accordionCtrl.closeOthers(scope);
        }
      });
       scope.$watch('message', function(value) {
        if(value){
          var str = ['<ol>'];
          value.forEach(function(data){
            str.push("<li>" + data + "</li>");
          });
          str.push("</ol>");
          angular.element(element[0].querySelector('.panel-body')).html(str.join(''));
        }
      });

      if(typeof scope.alertType !== 'undefined') {
        element.addClass('alert-accordion');
        angular.element(element[0].querySelector('.panel-heading')).addClass('alert '+ scope.alertType);
      }
      scope.toggleOpen = function($event) {
        if (!scope.isDisabled) {
          if (!$event || $event.which === 32) {
            scope.isOpen = !scope.isOpen;
          }
        }
      };

      var id = 'accordiongroup-' + scope.$id + '-' + Math.floor(Math.random() * 10000);
      scope.headingId = id + '-tab';
      scope.panelId = id + '-panel';
    }
  };
})

// Use accordion-heading below an accordion-group to provide a heading containing HTML
.directive('tuxAccordionHeading', function() {
  return {
    transclude: true,   // Grab the contents to be used as the heading
    template: '',       // In effect remove this element!
    replace: true,
    require: '^tuxAccordionGroup',
    link: function(scope, element, attrs, accordionGroupCtrl, transclude) {
      // Pass the heading to the accordion-group controller
      // so that it can be transcluded into the right place in the template
      // [The second parameter to transclude causes the elements to be cloned so that they work in ng-repeat]
      accordionGroupCtrl.setHeading(transclude(scope, angular.noop));
    }
  };
})

// Use in the accordion-group template to indicate where you want the heading to be transcluded
// You must provide the property on the accordion-group controller that will hold the transcluded element
.directive('tuxAccordionTransclude', function() {
  return {
    require: '^tuxAccordionGroup',
    link: function(scope, element, attrs, controller) {
      scope.$watch(function() { return controller[attrs.tuxAccordionTransclude]; }, function(heading) {
        if (heading) {
          var elem = angular.element(element[0].querySelector('[tux-accordion-header]'));
          elem.html('');
          elem.append(heading);
        }
      });
    }
  };
});

angular.module('ui.tux.position', [])

.factory('$tuxPosition', ['$document', '$window', function($document, $window) {
    var SCROLLBAR_WIDTH;
    var OVERFLOW_REGEX = {
        normal: /(auto|scroll)/,
        hidden: /(auto|scroll|hidden)/
    };
    var PLACEMENT_REGEX = {
        auto: /\s?auto?\s?/i,
        primary: /^(top|bottom|left|right)$/,
        secondary: /^(top|bottom|left|right|center)$/,
        vertical: /^(top|bottom)$/
    };

    return {
        css : function(element, prop, extra) {
            var value;
            if (element.currentStyle) { // IE
                value = element.currentStyle[prop];
            } else if (window.getComputedStyle) {
                value = window.getComputedStyle(element)[prop];
            } else {
                value = element.style[prop];
            }
            return extra === true ? parseFloat(value) || 0 : value;
        },
        parseStyle: function(value) {
            value = parseFloat(value);
            return isFinite(value) ? value : 0;
        },
        getRawNode: function(elem) {
            return elem.nodeName ? elem : elem[0] || elem;
        },
        
        offsetParent: function(elem) {
            elem = this.getRawNode(elem);

            var offsetParent = elem.offsetParent || $document[0].documentElement;

            function isStaticPositioned(el) {
                return ($window.getComputedStyle(el).position || 'static') === 'static';
            }

            while (offsetParent && offsetParent !== $document[0].documentElement && isStaticPositioned(offsetParent)) {
                offsetParent = offsetParent.offsetParent;
            }

            return offsetParent || $document[0].documentElement;
        },
        scrollbarWidth: function() {
            if (angular.isUndefined(SCROLLBAR_WIDTH)) {
                var scrollElem = angular.element('<div style="position: absolute; top: -9999px; width: 50px; height: 50px; overflow: scroll;"></div>');
                $document.find('body').append(scrollElem);
                SCROLLBAR_WIDTH = scrollElem[0].offsetWidth - scrollElem[0].clientWidth;
                SCROLLBAR_WIDTH = isFinite(SCROLLBAR_WIDTH) ? SCROLLBAR_WIDTH : 0;
                scrollElem.remove();
            }

            return SCROLLBAR_WIDTH;
        },
        scrollParent: function(elem, includeHidden) {
            elem = this.getRawNode(elem);

            var overflowRegex = includeHidden ? OVERFLOW_REGEX.hidden : OVERFLOW_REGEX.normal;
            var documentEl = $document[0].documentElement;
            var elemStyle = $window.getComputedStyle(elem);
            var excludeStatic = elemStyle.position === 'absolute';
            var scrollParent = elem.parentElement || documentEl;

            if (scrollParent === documentEl || elemStyle.position === 'fixed') {
                return documentEl;
            }

            while (scrollParent.parentElement && scrollParent !== documentEl) {
                var spStyle = $window.getComputedStyle(scrollParent);
                if (excludeStatic && spStyle.position !== 'static') {
                    excludeStatic = false;
                }

                if (!excludeStatic && overflowRegex.test(spStyle.overflow + spStyle.overflowY + spStyle.overflowX)) {
                    break;
                }
                scrollParent = scrollParent.parentElement;
            }

            return scrollParent;
        },
        position: function(elem, includeMagins) {
            elem = this.getRawNode(elem);

            var elemOffset = this.offset(elem);
            if (includeMagins) {
                var elemStyle = $window.getComputedStyle(elem);
                elemOffset.top -= this.parseStyle(elemStyle.marginTop);
                elemOffset.left -= this.parseStyle(elemStyle.marginLeft);
            }
            var parent = this.offsetParent(elem);
            var parentOffset = {
                top: 0,
                left: 0
            };

            if (parent !== $document[0].documentElement) {
                parentOffset = this.offset(parent);
                parentOffset.top += parent.clientTop - parent.scrollTop;
                parentOffset.left += parent.clientLeft - parent.scrollLeft;
            }

            return {
                width: Math.round(angular.isNumber(elemOffset.width) ? elemOffset.width : elem.offsetWidth),
                height: Math.round(angular.isNumber(elemOffset.height) ? elemOffset.height : elem.offsetHeight),
                top: Math.round(elemOffset.top - parentOffset.top),
                left: Math.round(elemOffset.left - parentOffset.left)
            };
        },
        offset: function(elem) {
            elem = this.getRawNode(elem);

            var elemBCR = elem.getBoundingClientRect();
            return {
                width: Math.round(angular.isNumber(elemBCR.width) ? elemBCR.width : elem.offsetWidth),
                height: Math.round(angular.isNumber(elemBCR.height) ? elemBCR.height : elem.offsetHeight),
                top: Math.round(elemBCR.top + ($window.pageYOffset || $document[0].documentElement.scrollTop)),
                left: Math.round(elemBCR.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft))
            };
        },
        viewportOffset: function(elem, useDocument, includePadding) {
            elem = this.getRawNode(elem);
            includePadding = includePadding !== false ? true : false;

            var elemBCR = elem.getBoundingClientRect();
            var offsetBCR = {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
            };

            var offsetParent = useDocument ? $document[0].documentElement : this.scrollParent(elem);
            var offsetParentBCR = offsetParent.getBoundingClientRect();

            offsetBCR.top = offsetParentBCR.top + offsetParent.clientTop;
            offsetBCR.left = offsetParentBCR.left + offsetParent.clientLeft;
            if (offsetParent === $document[0].documentElement) {
                offsetBCR.top += $window.pageYOffset;
                offsetBCR.left += $window.pageXOffset;
            }
            offsetBCR.bottom = offsetBCR.top + offsetParent.clientHeight;
            offsetBCR.right = offsetBCR.left + offsetParent.clientWidth;

            if (includePadding) {
                var offsetParentStyle = $window.getComputedStyle(offsetParent);
                offsetBCR.top += this.parseStyle(offsetParentStyle.paddingTop);
                offsetBCR.bottom -= this.parseStyle(offsetParentStyle.paddingBottom);
                offsetBCR.left += this.parseStyle(offsetParentStyle.paddingLeft);
                offsetBCR.right -= this.parseStyle(offsetParentStyle.paddingRight);
            }

            return {
                top: Math.round(elemBCR.top - offsetBCR.top),
                bottom: Math.round(offsetBCR.bottom - elemBCR.bottom),
                left: Math.round(elemBCR.left - offsetBCR.left),
                right: Math.round(offsetBCR.right - elemBCR.right)
            };
        },
        parsePlacement: function(placement) {
            var autoPlace = PLACEMENT_REGEX.auto.test(placement);
            if (autoPlace) {
                placement = placement.replace(PLACEMENT_REGEX.auto, '');
            }

            placement = placement.split('-');

            placement[0] = placement[0] || 'top';
            if (!PLACEMENT_REGEX.primary.test(placement[0])) {
                placement[0] = 'top';
            }

            placement[1] = placement[1] || 'center';
            if (!PLACEMENT_REGEX.secondary.test(placement[1])) {
                placement[1] = 'center';
            }

            if (autoPlace) {
                placement[2] = true;
            } else {
                placement[2] = false;
            }

            return placement;
        },
        positionElements: function(hostElem, targetElem, placement, appendToBody) {
            hostElem = this.getRawNode(hostElem);
            targetElem = this.getRawNode(targetElem);

            // need to read from prop to support tests.
            var targetWidth = angular.isDefined(targetElem.offsetWidth) ? targetElem.offsetWidth : targetElem.prop('offsetWidth');
            var targetHeight = angular.isDefined(targetElem.offsetHeight) ? targetElem.offsetHeight : targetElem.prop('offsetHeight');

            placement = this.parsePlacement(placement);

            var hostElemPos = appendToBody ? this.offset(hostElem) : this.position(hostElem);
            var targetElemPos = {
                top: 0,
                left: 0,
                placement: ''
            };

            if (placement[2]) {
                var viewportOffset = this.viewportOffset(hostElem);

                var targetElemStyle = $window.getComputedStyle(targetElem);
                var adjustedSize = {
                    width: targetWidth + Math.round(Math.abs(this.parseStyle(targetElemStyle.marginLeft) + this.parseStyle(targetElemStyle.marginRight))),
                    height: targetHeight + Math.round(Math.abs(this.parseStyle(targetElemStyle.marginTop) + this.parseStyle(targetElemStyle.marginBottom)))
                };

                placement[0] = placement[0] === 'top' && adjustedSize.height > viewportOffset.top && adjustedSize.height <= viewportOffset.bottom ? 'bottom' :
                    placement[0] === 'bottom' && adjustedSize.height > viewportOffset.bottom && adjustedSize.height <= viewportOffset.top ? 'top' :
                    placement[0] === 'left' && adjustedSize.width > viewportOffset.left && adjustedSize.width <= viewportOffset.right ? 'right' :
                    placement[0] === 'right' && adjustedSize.width > viewportOffset.right && adjustedSize.width <= viewportOffset.left ? 'left' :
                    placement[0];

                placement[1] = placement[1] === 'top' && adjustedSize.height - hostElemPos.height > viewportOffset.bottom && adjustedSize.height - hostElemPos.height <= viewportOffset.top ? 'bottom' :
                    placement[1] === 'bottom' && adjustedSize.height - hostElemPos.height > viewportOffset.top && adjustedSize.height - hostElemPos.height <= viewportOffset.bottom ? 'top' :
                    placement[1] === 'left' && adjustedSize.width - hostElemPos.width > viewportOffset.right && adjustedSize.width - hostElemPos.width <= viewportOffset.left ? 'right' :
                    placement[1] === 'right' && adjustedSize.width - hostElemPos.width > viewportOffset.left && adjustedSize.width - hostElemPos.width <= viewportOffset.right ? 'left' :
                    placement[1];

                if (placement[1] === 'center') {
                    if (PLACEMENT_REGEX.vertical.test(placement[0])) {
                        var xOverflow = hostElemPos.width / 2 - targetWidth / 2;
                        if (viewportOffset.left + xOverflow < 0 && adjustedSize.width - hostElemPos.width <= viewportOffset.right) {
                            placement[1] = 'left';
                        } else if (viewportOffset.right + xOverflow < 0 && adjustedSize.width - hostElemPos.width <= viewportOffset.left) {
                            placement[1] = 'right';
                        }
                    } else {
                        var yOverflow = hostElemPos.height / 2 - adjustedSize.height / 2;
                        if (viewportOffset.top + yOverflow < 0 && adjustedSize.height - hostElemPos.height <= viewportOffset.bottom) {
                            placement[1] = 'top';
                        } else if (viewportOffset.bottom + yOverflow < 0 && adjustedSize.height - hostElemPos.height <= viewportOffset.top) {
                            placement[1] = 'bottom';
                        }
                    }
                }
            }

            switch (placement[0]) {
                case 'top':
                    targetElemPos.top = hostElemPos.top - targetHeight;
                    break;
                case 'bottom':
                    targetElemPos.top = hostElemPos.top + hostElemPos.height;
                    break;
                case 'left':
                    targetElemPos.left = hostElemPos.left - targetWidth;
                    break;
                case 'right':
                    targetElemPos.left = hostElemPos.left + hostElemPos.width;
                    break;
            }

            switch (placement[1]) {
                case 'top':
                    targetElemPos.top = hostElemPos.top;
                    break;
                case 'bottom':
                    targetElemPos.top = hostElemPos.top + hostElemPos.height - targetHeight;
                    break;
                case 'left':
                    targetElemPos.left = hostElemPos.left;
                    break;
                case 'right':
                    targetElemPos.left = hostElemPos.left + hostElemPos.width - targetWidth;
                    break;
                case 'center':
                    if (PLACEMENT_REGEX.vertical.test(placement[0])) {
                        targetElemPos.left = hostElemPos.left + hostElemPos.width / 2 - targetWidth / 2;
                    } else {
                        targetElemPos.top = hostElemPos.top + hostElemPos.height / 2 - targetHeight / 2;
                    }
                    break;
            }

            targetElemPos.top = Math.round(targetElemPos.top);
            targetElemPos.left = Math.round(targetElemPos.left);
            targetElemPos.placement = placement[1] === 'center' ? placement[0] : placement[0] + '-' + placement[1];

            return targetElemPos;
        },
        positionArrow: function(elem, placement) {
            elem = this.getRawNode(elem);

            var innerElem = elem.querySelector('.tooltip-inner, .popover-inner');
            if (!innerElem) {
                return;
            }

            var isTooltip = angular.element(innerElem).hasClass('tooltip-inner');

            var arrowElem = isTooltip ? elem.querySelector('.tooltip-arrow') : elem.querySelector('.arrow');
            if (!arrowElem) {
                return;
            }

            placement = this.parsePlacement(placement);
            if (placement[1] === 'center') {
                // no adjustment necessary - just reset styles
                angular.element(arrowElem).css({
                    top: '',
                    bottom: '',
                    right: '',
                    left: '',
                    margin: ''
                });
                return;
            }

            var borderProp = 'border-' + placement[0] + '-width';
            var borderWidth = $window.getComputedStyle(arrowElem)[borderProp];

            var borderRadiusProp = 'border-';
            if (PLACEMENT_REGEX.vertical.test(placement[0])) {
                borderRadiusProp += placement[0] + '-' + placement[1];
            } else {
                borderRadiusProp += placement[1] + '-' + placement[0];
            }
            borderRadiusProp += '-radius';
            var borderRadius = $window.getComputedStyle(isTooltip ? innerElem : elem)[borderRadiusProp];

            var arrowCss = {
                top: 'auto',
                bottom: 'auto',
                left: 'auto',
                right: 'auto',
                margin: 0
            };

            switch (placement[0]) {
                case 'top':
                    arrowCss.bottom = isTooltip ? '0' : '-' + borderWidth;
                    break;
                case 'bottom':
                    arrowCss.top = isTooltip ? '0' : '-' + borderWidth;
                    break;
                case 'left':
                    arrowCss.right = isTooltip ? '0' : '-' + borderWidth;
                    break;
                case 'right':
                    arrowCss.left = isTooltip ? '0' : '-' + borderWidth;
                    break;
            }

            arrowCss[placement[1]] = borderRadius === "0px" ? "10px" : borderRadius;

            angular.element(arrowElem).css(arrowCss);
        },
        height : function(element, outer) {
            var value = element.offsetHeight;
            if (outer) {
                value += this.css(element, 'marginTop', true) + this.css(element, 'marginBottom', true);
            } else {
                value -= this.css(element, 'paddingTop', true) + this.css(element, 'paddingBottom', true) + this.css(element, 'borderTopWidth', true) + this.css(element, 'borderBottomWidth', true);
            }
            return value;
        }
    };
}]);

angular.module('ui.tux.debounce', [])

.factory('$tuxDebounce', function($timeout) {
    return function(func, wait, immediate) {
        var timeout = null;
        return function() {
            var context = this;
            var args = arguments;
            var callNow = immediate && !timeout;
            if (timeout) {
                $timeout.cancel(timeout);
            }
            timeout = $timeout(function later() {
                timeout = null;
                if (!immediate) {
                    func.apply(context, args);
                }
            }, wait, false);
            if (callNow) {
                func.apply(context, args);
            }
            return timeout;
        };
    };
})
.factory('$tuxThrottle', function($timeout) {
    return function(func, wait, options) {
        var timeout = null;
        if (!options) options = {};
        return function() {
            var context = this;
            var args = arguments;
            if (!timeout) {
                if (options.leading !== false) {
                    func.apply(context, args);
                }
                timeout = $timeout(function later() {
                    timeout = null;
                    if (options.trailing !== false) {
                        func.apply(context, args);
                    }
                }, wait, false);
            }
        };
    };
});
angular.module('ui.tux.affix', ['ui.tux.position','ui.tux.debounce'])

.provider('$affix', function() {

	var defaults = this.defaults = {
		offsetTop: 'auto',
		inlineStyles: true
	};

	this.$get = function($window, $tuxDebounce, $tuxPosition) {

		var bodyEl = angular.element($window.document.body);
		var windowEl = angular.element($window);

		function AffixFactory(element, config) {

			var $affix = {};

			// Common vars
			var options = angular.extend({}, defaults, config);
			var targetEl = options.target;

			// Initial private vars
			var reset = 'affix affix-top affix-bottom';
			var setWidth = false;
			var initialAffixTop = 0;
			var initialOffsetTop = 0;
			var offsetTop = 0;
			var offsetBottom = 0;
			var affixed = null;
			var unpin = null;

			var parent = element.parent();
			// Options: custom parent
			if (options.offsetParent) {
				if (options.offsetParent.match(/^\d+$/)) {
					for (var i = 0; i < (options.offsetParent * 1) - 1; i++) {
						parent = parent.parent();
					}
				} else {
					parent = angular.element(options.offsetParent);
				}
			}

			$affix.init = function() {

				this.$parseOffsets();
				initialOffsetTop = $tuxPosition.offset(element[0]).top + initialAffixTop;
				setWidth = !element[0].style.width;

				// Bind events
				targetEl.on('scroll', this.checkPosition);
				targetEl.on('click', this.checkPositionWithEventLoop);
				windowEl.on('resize', this.$debouncedOnResize);

				// Both of these checkPosition() calls are necessary for the case where
				// the user hits refresh after scrolling to the bottom of the page.
				this.checkPosition();
				this.checkPositionWithEventLoop();

			};

			$affix.destroy = function() {

				// Unbind events
				targetEl.off('scroll', this.checkPosition);
				targetEl.off('click', this.checkPositionWithEventLoop);
				windowEl.off('resize', this.$debouncedOnResize);

			};

			$affix.checkPositionWithEventLoop = function() {

				// IE 9 throws an error if we use 'this' instead of '$affix'
				// in this setTimeout call
				setTimeout($affix.checkPosition, 1);

			};

			$affix.checkPosition = function() {
				// if (!this.$element.is(':visible')) return

				var scrollTop = getScrollTop();
				var position = $tuxPosition.offset(element[0]);
				var elementHeight = $tuxPosition.height(element[0]);

				// Get required affix class according to position
				var affix = getRequiredAffixClass(unpin, position, elementHeight);

				// Did affix status changed this last check?
				if (affixed === affix) return;
				affixed = affix;

				if (affix === 'top') {
					unpin = null;
					if (setWidth) {
						element.css('width', '');
					}
					if (options.inlineStyles) {
						element.css('position', (options.offsetParent) ? '' : 'relative');
						element.css('top', '');
					}
				} else if (affix === 'bottom') {
					if (options.offsetUnpin) {
						unpin = -(options.offsetUnpin * 1);
					} else {
						// Calculate unpin threshold when affixed to bottom.
						// Hopefully the browser scrolls pixel by pixel.
						unpin = position.top - scrollTop;
					}
					if (setWidth) {
						element.css('width', '');
					}
					if (options.inlineStyles) {
						element.css('position', (options.offsetParent) ? '' : 'relative');
						element.css('top', (options.offsetParent) ? '' : ((bodyEl[0].offsetHeight - offsetBottom - elementHeight - initialOffsetTop) + 'px'));
					}
				} else { // affix === 'middle'
					unpin = null;
					if (setWidth) {
						element.css('width', element[0].offsetWidth + 'px');
					}
					if (options.inlineStyles) {
						element.css('position', 'fixed');
						element.css('top', initialAffixTop + 'px');
					}
				}

				// Add proper affix class
				element.removeClass(reset).addClass('affix' + ((affix !== 'middle') ? '-' + affix : ''));

			};

			$affix.$onResize = function() {
				$affix.$parseOffsets();
				$affix.checkPosition();
			};
			$affix.$debouncedOnResize = $tuxDebounce($affix.$onResize, 50);

			$affix.$parseOffsets = function() {
				var initialPosition = element.css('position');
				// Reset position to calculate correct offsetTop
				if (options.inlineStyles) {
					element.css('position', (options.offsetParent) ? '' : 'relative');
				}

				if (options.offsetTop) {
					if (options.offsetTop === 'auto') {
						options.offsetTop = '+0';
					}
					if (options.offsetTop.match(/^[-+]\d+$/)) {
						initialAffixTop = -options.offsetTop * 1;
						if (options.offsetParent) {
							offsetTop = $tuxPosition.offset(parent[0]).top + (options.offsetTop * 1);
						} else {
							offsetTop = $tuxPosition.offset(element[0]).top - $tuxPosition.css(element[0], 'marginTop', true) + (options.offsetTop * 1);
						}
					} else {
						offsetTop = options.offsetTop * 1;
					}
				}

				if (options.offsetBottom) {
					if (options.offsetParent && options.offsetBottom.match(/^[-+]\d+$/)) {
						// add 1 pixel due to rounding problems...
						offsetBottom = getScrollHeight() - ($tuxPosition.offset(parent[0]).top + $tuxPosition.height(parent[0])) + (options.offsetBottom * 1) + 1;
					} else {
						offsetBottom = options.offsetBottom * 1;
					}
				}

				// Bring back the element's position after calculations
				if (options.inlineStyles) {
					element.css('position', initialPosition);
				}
			};

			// Private methods

			function getRequiredAffixClass(_unpin, position, elementHeight) {
				var scrollTop = getScrollTop();
				var scrollHeight = getScrollHeight();

				if (scrollTop <= offsetTop) {
					return 'top';
				} else if (_unpin !== null && (scrollTop + _unpin <= position.top)) {
					return 'middle';
				} else if (offsetBottom !== null && (position.top + elementHeight + initialAffixTop >= scrollHeight - offsetBottom)) {
					return 'bottom';
				}
				return 'middle';
			}

			function getScrollTop() {
				return targetEl[0] === $window ? $window.pageYOffset : targetEl[0].scrollTop;
			}

			function getScrollHeight() {
				return targetEl[0] === $window ? $window.document.body.scrollHeight : targetEl[0].scrollHeight;
			}

			$affix.init();
			return $affix;

		}

		return AffixFactory;

	};

})

.directive('tuxAffix', function($affix, $window) {  
	return {
		restrict: 'EAC',
		require: '^?bsAffixTarget',
		link: function postLink(scope, element, attr, affixTarget) {        
			var options = {
				scope: scope,
				target: affixTarget ? affixTarget.$element : angular.element($window)
			};
			angular.forEach(['offsetTop', 'offsetBottom', 'offsetParent', 'offsetUnpin', 'inlineStyles'], function(key) {
				if (angular.isDefined(attr[key])) {
					var option = attr[key];
					if (/true/i.test(option)) option = true;
					if (/false/i.test(option)) option = false;
					options[key] = option;
				}
			});

			var affix = $affix(element, options);
			scope.$on('$destroy', function() {
				if (affix) affix.destroy();
				options = null;
				affix = null;
			});

		}
	};

})

.directive('bsAffixTarget', function() {
	return {
		controller: function($element) {
			this.$element = $element;
		}
	};
});
angular.module('ui.tux.alert', [])

.controller('TrwdAlertController', ['$scope', '$attrs', '$interpolate', '$timeout', function($scope, $attrs, $interpolate, $timeout) {
  $scope.closeable = !!$attrs.close;

  var dismissOnTimeout = angular.isDefined($attrs.dismissOnTimeout) ?
    $interpolate($attrs.dismissOnTimeout)($scope.$parent) : null;

  if (dismissOnTimeout) {
    $timeout(function() {
      $scope.close();
    }, parseInt(dismissOnTimeout, 10));
  }
}])

.directive('tuxAlert', function() {
  return {
    controller: 'TrwdAlertController',
    controllerAs: 'alert',
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'tux/template/alert/alert.html';
    },
    transclude: true,
    replace: true,
    scope: {
      type: '@',
      close: '&'
    }
  };
});

angular.module('ui.tux.breadcrumb', [])

.controller('TrwdBreadcrumbController', ['$scope', '$attrs', function($scope, $attrs) {

}]);
angular.module('ui.tux.carousel', [])

.controller('TrwdCarouselController', ['$scope', function($scope) {



    $scope.$on("jump", function(event, index) {
        $scope.jump(index);
    });
    this.next = function() {
        $scope.nextSlide();
    }
    this.prev = function() {
        $scope.prevSlide();
    }
}])

.directive('tuxCarousel', function($timeout, $window) {
    return {
        transclude: true,
        replace: true,
        controller: 'TrwdCarouselController',
        controllerAs: 'carousel',
        templateUrl: function(element, attrs) {
            return attrs.templateUrl || 'tux/template/carousel/carousel.html';
        },
        scope: {
            direction: '@',
            carouselButtons: '@',
            onUpdate: '&',
            counterOffset: '='
        },
        link: function(scope, element, attrs, TrwdCarouselCtrl) {
            var width,
                left = 0,
                carousel,
                carousel_slides,
                carousel_container,
                w = angular.element($window),
                counterOffset,
                carousel_container_width,
                height,
                carousel_container_height,
                break_point = 0,
                left_break_point = 0,
                carousel_next = null,
                carousel_prev = null,
                flag = 0;
            var self = this;
            this.element = element;
            if (typeof attrs.slidesToScroll === 'undefined') {
                scope.slidesToScroll = 1;
            }
            if (typeof attrs.slidesToShow === 'undefined') {
                scope.slidesToShow = 1;
            }
            if (typeof attrs.counterOffset === 'undefined') {
                scope.counterOffset = 1;
            }
            if (typeof attrs.direction === 'undefined') {
                scope.direction = 'horizontal'
            }
            if (typeof attrs.carouselButtons === 'undefined') {
                scope.carouselButtons = true;
            }
            scope.slidesToShow = parseInt(attrs.slidesToShow, 10);
            scope.slidesToScroll = parseInt(attrs.slidesToScroll, 10);
            var temp_counterOffset = scope.counterOffset;
            var tempCss = {},
                key;
            if (scope.direction == 'horizontal') {
                key = 'left';
            } else {
                key = 'top';
            }

            scope.$watch('counterOffset', function(newValue, oldValue) {
                if (newValue != oldValue) {
                    init();
                }
            })


            $timeout(function() {
                var slides = angular.element(element[0].getElementsByClassName('carousel-slides')),
                    till = slides.length,
                    i = 0;
                for (i; i < till; i++) {
                    angular.element(slides[i]).attr('carousel_slide_id', i);
                }
            }, 90);

            function init(a) {
                carousel_cont = angular.element(element[0].getElementsByClassName('carousel-cont'));
                carousel = angular.element(element[0].getElementsByClassName('carousel'));
                carousel_slides = angular.element(element[0].getElementsByClassName('carousel-slides'));
                carousel_container = angular.element(element[0].getElementsByClassName('carousel-container'));
                carousel_next = angular.element(element[0].getElementsByClassName('next'));
                carousel_prev = angular.element(element[0].getElementsByClassName('prev'));
                if (scope.direction == 'horizontal') {
                    width = (carousel[0].clientWidth - (scope.slidesToShow * 10 - 10)) / scope.slidesToShow;
                    carousel_container_width = width * carousel_slides.length + (carousel_slides.length * 10 - 10);
                    width += 'px';
                    carousel_container_width += 'px';
                    height = carousel_container_height = '100%';
                    carousel_slides.css({
                        'margin-top': '0px'
                    })
                } else {

                    carousel.addClass('vertical');
                    carousel_cont.addClass('vertical-carousel');
                    carousel_slides.css({
                        'margin-left': '0px'
                    })

                    width = carousel_container_width = '100%';
                    height = (carousel[0].clientHeight - (scope.slidesToShow * 10 - 10)) / scope.slidesToShow;
                    carousel_container_height = height * carousel_slides.length + (carousel_slides.length * 10 - 10);
                    height += 'px';
                }

                carousel_container.css({
                    'width': carousel_container_width,
                    'height': carousel_container_height
                });
                carousel_slides.css({
                    'width': width,
                    'height': height,
                });

                /* for active class */
                counterOffset = carousel_slides.length - scope.slidesToShow + temp_counterOffset;

                if (scope.counterOffset < 1) {
                    scope.counterOffset = 1;
                }
                if (carousel_slides.length > 0 && scope.counterOffset > carousel_slides.length) {
                    scope.counterOffset = carousel_slides.length;
                }
                if (scope.slidesToShow % 2 == 0) {
                    temp_counterOffset = parseInt(scope.slidesToShow / 2, 10);
                } else {
                    temp_counterOffset = parseInt(scope.slidesToShow / 2, 10) + 1;
                }
                carousel_slides.removeClass('hidd');
                carousel_slides.removeClass('active');
                angular.element(carousel_slides[scope.counterOffset - 1]).addClass('active');

                width = parseInt(width, 10);
                height = parseInt(height, 10);

                if (scope.direction == 'horizontal') {
                    break_point = width;
                } else {
                    break_point = height;
                }

                if (scope.slidesToShow == 1) {
                    next_left = (scope.counterOffset - 1) * break_point + (scope.counterOffset - 1) * 10;
                } else {
                    next_left = (scope.counterOffset - temp_counterOffset) * break_point + (scope.counterOffset - temp_counterOffset) * 10;
                }
                left_break_point = (carousel_slides.length - scope.slidesToShow) * break_point + (carousel_slides.length - scope.slidesToShow) * 10 + 3;
                if (next_left < 0) {
                    next_left = 0;
                }
                if (left_break_point != 0 && next_left > left_break_point) {
                    next_left = left_break_point;
                }
                tempCss[key] = -next_left + 'px';
                if (typeof a !== 'undefined' || flag == 0) {
                    flag = 1;
                    carousel_container.css({
                        'transition-duration': '0s',
                    });
                }
                carousel_container.css(tempCss);
                $timeout(function() {
                    if (scope.slidesToShow == 1) {
                        carousel_slides.addClass('hidd');
                        angular.element(carousel_slides[scope.counterOffset - 1]).removeClass('hidd');
                    }
                    carousel_container.css({
                        'transition-duration': '1s'
                    });                   
                    if (scope.counterOffset == 0) {
                        carousel_prev.attr('disabled', 'disabled');
                        carousel_prev.addClass('disabled');
                    } else {
                        carousel_prev.removeClass('disabled');
                        carousel_prev.removeAttr('disabled');

                    }
                    if (scope.counterOffset == carousel_slides.length) {
                        carousel_next.attr('disabled', 'disabled');
                        carousel_next.addClass('disabled');
                    } else {
                        carousel_next.removeAttr('disabled');
                        carousel_next.removeClass('disabled');
                    }
                }, 1000)
            }

            $timeout(init, 200);
            scope.nextSlide = function() {
                scope.counterOffset += scope.slidesToScroll;
                scope.$apply();
            };

            scope.prevSlide = function() {
                scope.counterOffset -= scope.slidesToScroll;
                scope.$apply();
            };

            scope.MakeActive = function() {
                var current = angular.element(event.currentTarget);
                scope.jump(current.attr('carousel_slide_id'));
            }

            scope.jump = function(index) {
                scope.counterOffset = parseInt(index, 10) + 1;
                init();
            }


            w.bind('resize', function() {
                init(1);
            });
        }
    };
})

.directive("tuxSlide", function() {
    return {
        replace: true,
        transclude: true,
        require: "^tuxCarousel",
        templateUrl: function(element, attrs) {
            return attrs.templateUrl || 'tux/template/carousel/slide.html';
        }
    }
})

.directive('tuxCarouselNext', function() {
    return {
        require: "^tuxCarousel",
        link: function(scope, element, attr, Cltr) {
            element.on('click', Cltr.next);
        }
    }
})

.directive('tuxCarouselPrev', function() {
    return {
        require: "^tuxCarousel",
        link: function(scope, element, attr, Cltr) {
            element.on('click', Cltr.prev);
        }
    }
});

angular.module('ui.tux.dateparser', [])

.service('tuxDateParser', ['$log', '$locale', 'dateFilter', 'orderByFilter', function($log, $locale, dateFilter, orderByFilter) {
  // Pulled from https://github.com/mbostock/d3/blob/master/src/format/requote.js
  var SPECIAL_CHARACTERS_REGEXP = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;

  var localeId;
  var formatCodeToRegex;

  this.init = function() {
    localeId = $locale.id;

    this.parsers = {};
    this.formatters = {};

    formatCodeToRegex = [
      {
        key: 'yyyy',
        regex: '\\d{4}',
        apply: function(value) { this.year = +value; },
        formatter: function(date) {
          var _date = new Date();
          _date.setFullYear(Math.abs(date.getFullYear()));
          return dateFilter(_date, 'yyyy');
        }
      },
      {
        key: 'yy',
        regex: '\\d{2}',
        apply: function(value) { value = +value; this.year = value < 69 ? value + 2000 : value + 1900; },
        formatter: function(date) {
          var _date = new Date();
          _date.setFullYear(Math.abs(date.getFullYear()));
          return dateFilter(_date, 'yy');
        }
      },
      {
        key: 'y',
        regex: '\\d{1,4}',
        apply: function(value) { this.year = +value; },
        formatter: function(date) {
          var _date = new Date();
          _date.setFullYear(Math.abs(date.getFullYear()));
          return dateFilter(_date, 'y');
        }
      },
      {
        key: 'M!',
        regex: '0?[1-9]|1[0-2]',
        apply: function(value) { this.month = value - 1; },
        formatter: function(date) {
          var value = date.getMonth();
          if (/^[0-9]$/.test(value)) {
            return dateFilter(date, 'MM');
          }

          return dateFilter(date, 'M');
        }
      },
      {
        key: 'MMMM',
        regex: $locale.DATETIME_FORMATS.MONTH.join('|'),
        apply: function(value) { this.month = $locale.DATETIME_FORMATS.MONTH.indexOf(value); },
        formatter: function(date) { return dateFilter(date, 'MMMM'); }
      },
      {
        key: 'MMM',
        regex: $locale.DATETIME_FORMATS.SHORTMONTH.join('|'),
        apply: function(value) { this.month = $locale.DATETIME_FORMATS.SHORTMONTH.indexOf(value); },
        formatter: function(date) { return dateFilter(date, 'MMM'); }
      },
      {
        key: 'MM',
        regex: '0[1-9]|1[0-2]',
        apply: function(value) { this.month = value - 1; },
        formatter: function(date) { return dateFilter(date, 'MM'); }
      },
      {
        key: 'M',
        regex: '[1-9]|1[0-2]',
        apply: function(value) { this.month = value - 1; },
        formatter: function(date) { return dateFilter(date, 'M'); }
      },
      {
        key: 'd!',
        regex: '[0-2]?[0-9]{1}|3[0-1]{1}',
        apply: function(value) { this.date = +value; },
        formatter: function(date) {
          var value = date.getDate();
          if (/^[1-9]$/.test(value)) {
            return dateFilter(date, 'dd');
          }

          return dateFilter(date, 'd');
        }
      },
      {
        key: 'dd',
        regex: '[0-2][0-9]{1}|3[0-1]{1}',
        apply: function(value) { this.date = +value; },
        formatter: function(date) { return dateFilter(date, 'dd'); }
      },
      {
        key: 'd',
        regex: '[1-2]?[0-9]{1}|3[0-1]{1}',
        apply: function(value) { this.date = +value; },
        formatter: function(date) { return dateFilter(date, 'd'); }
      },
      {
        key: 'EEEE',
        regex: $locale.DATETIME_FORMATS.DAY.join('|'),
        formatter: function(date) { return dateFilter(date, 'EEEE'); }
      },
      {
        key: 'EEE',
        regex: $locale.DATETIME_FORMATS.SHORTDAY.join('|'),
        formatter: function(date) { return dateFilter(date, 'EEE'); }
      },
      {
        key: 'HH',
        regex: '(?:0|1)[0-9]|2[0-3]',
        apply: function(value) { this.hours = +value; },
        formatter: function(date) { return dateFilter(date, 'HH'); }
      },
      {
        key: 'hh',
        regex: '0[0-9]|1[0-2]',
        apply: function(value) { this.hours = +value; },
        formatter: function(date) { return dateFilter(date, 'hh'); }
      },
      {
        key: 'H',
        regex: '1?[0-9]|2[0-3]',
        apply: function(value) { this.hours = +value; },
        formatter: function(date) { return dateFilter(date, 'H'); }
      },
      {
        key: 'h',
        regex: '[0-9]|1[0-2]',
        apply: function(value) { this.hours = +value; },
        formatter: function(date) { return dateFilter(date, 'h'); }
      },
      {
        key: 'mm',
        regex: '[0-5][0-9]',
        apply: function(value) { this.minutes = +value; },
        formatter: function(date) { return dateFilter(date, 'mm'); }
      },
      {
        key: 'm',
        regex: '[0-9]|[1-5][0-9]',
        apply: function(value) { this.minutes = +value; },
        formatter: function(date) { return dateFilter(date, 'm'); }
      },
      {
        key: 'sss',
        regex: '[0-9][0-9][0-9]',
        apply: function(value) { this.milliseconds = +value; },
        formatter: function(date) { return dateFilter(date, 'sss'); }
      },
      {
        key: 'ss',
        regex: '[0-5][0-9]',
        apply: function(value) { this.seconds = +value; },
        formatter: function(date) { return dateFilter(date, 'ss'); }
      },
      {
        key: 's',
        regex: '[0-9]|[1-5][0-9]',
        apply: function(value) { this.seconds = +value; },
        formatter: function(date) { return dateFilter(date, 's'); }
      },
      {
        key: 'a',
        regex: $locale.DATETIME_FORMATS.AMPMS.join('|'),
        apply: function(value) {
          if (this.hours === 12) {
            this.hours = 0;
          }

          if (value === 'PM') {
            this.hours += 12;
          }
        },
        formatter: function(date) { return dateFilter(date, 'a'); }
      },
      {
        key: 'Z',
        regex: '[+-]\\d{4}',
        apply: function(value) {
          var matches = value.match(/([+-])(\d{2})(\d{2})/),
            sign = matches[1],
            hours = matches[2],
            minutes = matches[3];
          this.hours += toInt(sign + hours);
          this.minutes += toInt(sign + minutes);
        },
        formatter: function(date) {
          return dateFilter(date, 'Z');
        }
      },
      {
        key: 'ww',
        regex: '[0-4][0-9]|5[0-3]',
        formatter: function(date) { return dateFilter(date, 'ww'); }
      },
      {
        key: 'w',
        regex: '[0-9]|[1-4][0-9]|5[0-3]',
        formatter: function(date) { return dateFilter(date, 'w'); }
      },
      {
        key: 'GGGG',
        regex: $locale.DATETIME_FORMATS.ERANAMES.join('|').replace(/\s/g, '\\s'),
        formatter: function(date) { return dateFilter(date, 'GGGG'); }
      },
      {
        key: 'GGG',
        regex: $locale.DATETIME_FORMATS.ERAS.join('|'),
        formatter: function(date) { return dateFilter(date, 'GGG'); }
      },
      {
        key: 'GG',
        regex: $locale.DATETIME_FORMATS.ERAS.join('|'),
        formatter: function(date) { return dateFilter(date, 'GG'); }
      },
      {
        key: 'G',
        regex: $locale.DATETIME_FORMATS.ERAS.join('|'),
        formatter: function(date) { return dateFilter(date, 'G'); }
      }
    ];
  };

  this.init();

  function createParser(format, func) {
    var map = [], regex = format.split('');

    // check for literal values
    var quoteIndex = format.indexOf('\'');
    if (quoteIndex > -1) {
      var inLiteral = false;
      format = format.split('');
      for (var i = quoteIndex; i < format.length; i++) {
        if (inLiteral) {
          if (format[i] === '\'') {
            if (i + 1 < format.length && format[i+1] === '\'') { // escaped single quote
              format[i+1] = '$';
              regex[i+1] = '';
            } else { // end of literal
              regex[i] = '';
              inLiteral = false;
            }
          }
          format[i] = '$';
        } else {
          if (format[i] === '\'') { // start of literal
            format[i] = '$';
            regex[i] = '';
            inLiteral = true;
          }
        }
      }

      format = format.join('');
    }

    angular.forEach(formatCodeToRegex, function(data) {
      var index = format.indexOf(data.key);

      if (index > -1) {
        format = format.split('');

        regex[index] = '(' + data.regex + ')';
        format[index] = '$'; // Custom symbol to define consumed part of format
        for (var i = index + 1, n = index + data.key.length; i < n; i++) {
          regex[i] = '';
          format[i] = '$';
        }
        format = format.join('');

        map.push({
          index: index,
          key: data.key,
          apply: data[func],
          matcher: data.regex
        });
      }
    });

    return {
      regex: new RegExp('^' + regex.join('') + '$'),
      map: orderByFilter(map, 'index')
    };
  }

  this.filter = function(date, format) {
    if (!angular.isDate(date) || isNaN(date) || !format) {
      return '';
    }

    format = $locale.DATETIME_FORMATS[format] || format;

    if ($locale.id !== localeId) {
      this.init();
    }

    if (!this.formatters[format]) {
      this.formatters[format] = createParser(format, 'formatter');
    }

    var parser = this.formatters[format],
      map = parser.map;

    var _format = format;

    return map.reduce(function(str, mapper, i) {
      var match = _format.match(new RegExp('(.*)' + mapper.key));
      if (match && angular.isString(match[1])) {
        str += match[1];
        _format = _format.replace(match[1] + mapper.key, '');
      }

      var endStr = i === map.length - 1 ? _format : '';

      if (mapper.apply) {
        return str + mapper.apply.call(null, date) + endStr;
      }

      return str + endStr;
    }, '');
  };

  this.parse = function(input, format, baseDate) {
    if (!angular.isString(input) || !format) {
      return input;
    }

    format = $locale.DATETIME_FORMATS[format] || format;
    format = format.replace(SPECIAL_CHARACTERS_REGEXP, '\\$&');

    if ($locale.id !== localeId) {
      this.init();
    }

    if (!this.parsers[format]) {
      this.parsers[format] = createParser(format, 'apply');
    }

    var parser = this.parsers[format],
        regex = parser.regex,
        map = parser.map,
        results = input.match(regex),
        tzOffset = false;
    if (results && results.length) {
      var fields, dt;
      if (angular.isDate(baseDate) && !isNaN(baseDate.getTime())) {
        fields = {
          year: baseDate.getFullYear(),
          month: baseDate.getMonth(),
          date: baseDate.getDate(),
          hours: baseDate.getHours(),
          minutes: baseDate.getMinutes(),
          seconds: baseDate.getSeconds(),
          milliseconds: baseDate.getMilliseconds()
        };
      } else {
        if (baseDate) {
          $log.warn('dateparser:', 'baseDate is not a valid date');
        }
        fields = { year: 1900, month: 0, date: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
      }

      for (var i = 1, n = results.length; i < n; i++) {
        var mapper = map[i - 1];
        if (mapper.matcher === 'Z') {
          tzOffset = true;
        }

        if (mapper.apply) {
          mapper.apply.call(fields, results[i]);
        }
      }

      var datesetter = tzOffset ? Date.prototype.setUTCFullYear :
        Date.prototype.setFullYear;
      var timesetter = tzOffset ? Date.prototype.setUTCHours :
        Date.prototype.setHours;

      if (isValid(fields.year, fields.month, fields.date)) {
        if (angular.isDate(baseDate) && !isNaN(baseDate.getTime()) && !tzOffset) {
          dt = new Date(baseDate);
          datesetter.call(dt, fields.year, fields.month, fields.date);
          timesetter.call(dt, fields.hours, fields.minutes,
            fields.seconds, fields.milliseconds);
        } else {
          dt = new Date(0);
          datesetter.call(dt, fields.year, fields.month, fields.date);
          timesetter.call(dt, fields.hours || 0, fields.minutes || 0,
            fields.seconds || 0, fields.milliseconds || 0);
        }
      }

      return dt;
    }
  };

  // Check if date is valid for specific month (and year for February).
  // Month: 0 = Jan, 1 = Feb, etc
  function isValid(year, month, date) {
    if (date < 1) {
      return false;
    }

    if (month === 1 && date > 28) {
      return date === 29 && (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0);
    }

    if (month === 3 || month === 5 || month === 8 || month === 10) {
      return date < 31;
    }

    return true;
  }

  function toInt(str) {
    return parseInt(str, 10);
  }

  this.toTimezone = toTimezone;
  this.fromTimezone = fromTimezone;
  this.timezoneToOffset = timezoneToOffset;
  this.addDateMinutes = addDateMinutes;
  this.convertTimezoneToLocal = convertTimezoneToLocal;

  function toTimezone(date, timezone) {
    return date && timezone ? convertTimezoneToLocal(date, timezone) : date;
  }

  function fromTimezone(date, timezone) {
    return date && timezone ? convertTimezoneToLocal(date, timezone, true) : date;
  }

  //https://github.com/angular/angular.js/blob/4daafd3dbe6a80d578f5a31df1bb99c77559543e/src/Angular.js#L1207
  function timezoneToOffset(timezone, fallback) {
    var requestedTimezoneOffset = Date.parse('Jan 01, 1970 00:00:00 ' + timezone) / 60000;
    return isNaN(requestedTimezoneOffset) ? fallback : requestedTimezoneOffset;
  }

  function addDateMinutes(date, minutes) {
    date = new Date(date.getTime());
    date.setMinutes(date.getMinutes() + minutes);
    return date;
  }

  function convertTimezoneToLocal(date, timezone, reverse) {
    reverse = reverse ? -1 : 1;
    var timezoneOffset = timezoneToOffset(timezone, date.getTimezoneOffset());
    return addDateMinutes(date, reverse * (timezoneOffset - date.getTimezoneOffset()));
  }
}]);

// Avoiding use of ng-class as it creates a lot of watchers when a class is to be applied to
// at most one element.
angular.module('ui.tux.isClass', [])
.directive('tuxIsClass', [
         '$animate',
function ($animate) {
  //                    11111111          22222222
  var ON_REGEXP = /^\s*([\s\S]+?)\s+on\s+([\s\S]+?)\s*$/;
  //                    11111111           22222222
  var IS_REGEXP = /^\s*([\s\S]+?)\s+for\s+([\s\S]+?)\s*$/;

  var dataPerTracked = {};

  return {
    restrict: 'A',
    compile: function(tElement, tAttrs) {
      var linkedScopes = [];
      var instances = [];
      var expToData = {};
      var lastActivated = null;
      var onExpMatches = tAttrs.tuxIsClass.match(ON_REGEXP);
      var onExp = onExpMatches[2];
      var expsStr = onExpMatches[1];
      var exps = expsStr.split(',');

      return linkFn;

      function linkFn(scope, element, attrs) {
        linkedScopes.push(scope);
        instances.push({
          scope: scope,
          element: element
        });

        exps.forEach(function(exp, k) {
          addForExp(exp, scope);
        });

        scope.$on('$destroy', removeScope);
      }

      function addForExp(exp, scope) {
        var matches = exp.match(IS_REGEXP);
        var clazz = scope.$eval(matches[1]);
        var compareWithExp = matches[2];
        var data = expToData[exp];
        if (!data) {
          var watchFn = function(compareWithVal) {
            var newActivated = null;
            instances.some(function(instance) {
              var thisVal = instance.scope.$eval(onExp);
              if (thisVal === compareWithVal) {
                newActivated = instance;
                return true;
              }
            });
            if (data.lastActivated !== newActivated) {
              if (data.lastActivated) {
                $animate.removeClass(data.lastActivated.element, clazz);
              }
              if (newActivated) {
                $animate.addClass(newActivated.element, clazz);
              }
              data.lastActivated = newActivated;
            }
          };
          expToData[exp] = data = {
            lastActivated: null,
            scope: scope,
            watchFn: watchFn,
            compareWithExp: compareWithExp,
            watcher: scope.$watch(compareWithExp, watchFn)
          };
        }
        data.watchFn(scope.$eval(compareWithExp));
      }

      function removeScope(e) {
        var removedScope = e.targetScope;
        var index = linkedScopes.indexOf(removedScope);
        linkedScopes.splice(index, 1);
        instances.splice(index, 1);
        if (linkedScopes.length) {
          var newWatchScope = linkedScopes[0];
          angular.forEach(expToData, function(data) {
            if (data.scope === removedScope) {
              data.watcher = newWatchScope.$watch(data.compareWithExp, data.watchFn);
              data.scope = newWatchScope;
            }
          });
        } else {
          expToData = {};
        }
      }
    }
  };
}]);
angular.module('ui.tux.datepicker', ['ui.tux.dateparser', 'ui.tux.isClass'])

.value('$datepickerSuppressError', false)

.constant('tuxDatepickerConfig', {
  datepickerMode: 'day',
  formatDay: 'dd',
  formatMonth: 'MMMM',
  formatYear: 'yyyy',
  formatDayHeader: 'EEE',
  formatDayTitle: 'MMMM yyyy',
  formatMonthTitle: 'yyyy',
  maxDate: null,
  maxMode: 'year',
  minDate: null,
  minMode: 'day',
  ngModelOptions: {},
  shortcutPropagation: false,
  showWeeks: true,
  yearColumns: 5,
  yearRows: 4
})

.controller('TuxDatepickerController', ['$scope', '$attrs', '$parse', '$interpolate', '$locale', '$log', 'dateFilter', 'tuxDatepickerConfig', '$datepickerSuppressError', 'tuxDateParser',
  function($scope, $attrs, $parse, $interpolate, $locale, $log, dateFilter, datepickerConfig, $datepickerSuppressError, dateParser) {
  var self = this,
      ngModelCtrl = { $setViewValue: angular.noop }, // nullModelCtrl;
      ngModelOptions = {},
      watchListeners = [],
      optionsUsed = !!$attrs.datepickerOptions;

  if (!$scope.datepickerOptions) {
    $scope.datepickerOptions = {};
  }

  // Modes chain
  this.modes = ['day', 'month', 'year'];

  [
    'customClass',
    'dateDisabled',
    'datepickerMode',
    'formatDay',
    'formatDayHeader',
    'formatDayTitle',
    'formatMonth',
    'formatMonthTitle',
    'formatYear',
    'maxDate',
    'maxMode',
    'minDate',
    'minMode',
    'showWeeks',
    'shortcutPropagation',
    'startingDay',
    'yearColumns',
    'yearRows'
  ].forEach(function(key) {
    switch (key) {
      case 'customClass':
      case 'dateDisabled':
        $scope[key] = $scope.datepickerOptions[key] || angular.noop;
        break;
      case 'datepickerMode':
        $scope.datepickerMode = angular.isDefined($scope.datepickerOptions.datepickerMode) ?
          $scope.datepickerOptions.datepickerMode : datepickerConfig.datepickerMode;
        break;
      case 'formatDay':
      case 'formatDayHeader':
      case 'formatDayTitle':
      case 'formatMonth':
      case 'formatMonthTitle':
      case 'formatYear':
        self[key] = angular.isDefined($scope.datepickerOptions[key]) ?
          $interpolate($scope.datepickerOptions[key])($scope.$parent) :
          datepickerConfig[key];
        break;
      case 'showWeeks':
      case 'shortcutPropagation':
      case 'yearColumns':
      case 'yearRows':
        self[key] = angular.isDefined($scope.datepickerOptions[key]) ?
          $scope.datepickerOptions[key] : datepickerConfig[key];
        break;
      case 'startingDay':
        if (angular.isDefined($scope.datepickerOptions.startingDay)) {
          self.startingDay = $scope.datepickerOptions.startingDay;
        } else if (angular.isNumber(datepickerConfig.startingDay)) {
          self.startingDay = datepickerConfig.startingDay;
        } else {
          self.startingDay = ($locale.DATETIME_FORMATS.FIRSTDAYOFWEEK + 8) % 7;
        }

        break;
      case 'maxDate':
      case 'minDate':
        $scope.$watch('datepickerOptions.' + key, function(value) {
          if (value) {
            if (angular.isDate(value)) {
              self[key] = dateParser.fromTimezone(new Date(value), ngModelOptions.timezone);
            } else {
              if ($datepickerLiteralWarning) {
                $log.warn('Literal date support has been deprecated, please switch to date object usage');
              }

              self[key] = new Date(dateFilter(value, 'medium'));
            }
          } else {
            self[key] = datepickerConfig[key] ?
              dateParser.fromTimezone(new Date(datepickerConfig[key]), ngModelOptions.timezone) :
              null;
          }

          self.refreshView();
        });

        break;
      case 'maxMode':
      case 'minMode':
        if ($scope.datepickerOptions[key]) {
          $scope.$watch(function() { return $scope.datepickerOptions[key]; }, function(value) {
            self[key] = $scope[key] = angular.isDefined(value) ? value : datepickerOptions[key];
            if (key === 'minMode' && self.modes.indexOf($scope.datepickerOptions.datepickerMode) < self.modes.indexOf(self[key]) ||
              key === 'maxMode' && self.modes.indexOf($scope.datepickerOptions.datepickerMode) > self.modes.indexOf(self[key])) {
              $scope.datepickerMode = self[key];
              $scope.datepickerOptions.datepickerMode = self[key];
            }
          });
        } else {
          self[key] = $scope[key] = datepickerConfig[key] || null;
        }

        break;
    }
  });

  $scope.uniqueId = 'datepicker-' + $scope.$id + '-' + Math.floor(Math.random() * 10000);

  $scope.disabled = angular.isDefined($attrs.disabled) || false;
  if (angular.isDefined($attrs.ngDisabled)) {
    watchListeners.push($scope.$parent.$watch($attrs.ngDisabled, function(disabled) {
      $scope.disabled = disabled;
      self.refreshView();
    }));
  }

  $scope.isActive = function(dateObject) {
    if (self.compare(dateObject.date, self.activeDate) === 0) {
      $scope.activeDateId = dateObject.uid;
      return true;
    }
    return false;
  };

  this.init = function(ngModelCtrl_) {
    ngModelCtrl = ngModelCtrl_;
    ngModelOptions = ngModelCtrl_.$options || datepickerConfig.ngModelOptions;
    if ($scope.datepickerOptions.initDate) {
      self.activeDate = dateParser.fromTimezone($scope.datepickerOptions.initDate, ngModelOptions.timezone) || new Date();
      $scope.$watch('datepickerOptions.initDate', function(initDate) {
        if (initDate && (ngModelCtrl.$isEmpty(ngModelCtrl.$modelValue) || ngModelCtrl.$invalid)) {
          self.activeDate = dateParser.fromTimezone(initDate, ngModelOptions.timezone);
          self.refreshView();
        }
      });
    } else {
      self.activeDate = new Date();
    }

    this.activeDate = ngModelCtrl.$modelValue ?
      dateParser.fromTimezone(new Date(ngModelCtrl.$modelValue), ngModelOptions.timezone) :
      dateParser.fromTimezone(new Date(), ngModelOptions.timezone);

    ngModelCtrl.$render = function() {
      self.render();
    };
  };

  this.render = function() {
    if (ngModelCtrl.$viewValue) {
      var date = new Date(ngModelCtrl.$viewValue),
          isValid = !isNaN(date);

      if (isValid) {
        this.activeDate = dateParser.fromTimezone(date, ngModelOptions.timezone);
      } else if (!$datepickerSuppressError) {
        $log.error('Datepicker directive: "ng-model" value must be a Date object');
      }
    }
    this.refreshView();
  };

  this.refreshView = function() {
    if (this.element) {
      $scope.selectedDt = null;
      this._refreshView();
      if ($scope.activeDt) {
        $scope.activeDateId = $scope.activeDt.uid;
      }

      var date = ngModelCtrl.$viewValue ? new Date(ngModelCtrl.$viewValue) : null;
      date = dateParser.fromTimezone(date, ngModelOptions.timezone);
      ngModelCtrl.$setValidity('dateDisabled', !date ||
        this.element && !this.isDisabled(date));
    }
  };

  this.createDateObject = function(date, format) {
    var model = ngModelCtrl.$viewValue ? new Date(ngModelCtrl.$viewValue) : null;
    model = dateParser.fromTimezone(model, ngModelOptions.timezone);
    var today = new Date();
    today = dateParser.fromTimezone(today, ngModelOptions.timezone);
    var time = this.compare(date, today);
    var dt = {
      date: date,
      label: dateParser.filter(date, format),
      selected: model && this.compare(date, model) === 0,
      disabled: this.isDisabled(date),
      past: time < 0,
      current: time === 0,
      future: time > 0,
      customClass: this.customClass(date) || null
    };

    if (model && this.compare(date, model) === 0) {
      $scope.selectedDt = dt;
    }

    if (self.activeDate && this.compare(dt.date, self.activeDate) === 0) {
      $scope.activeDt = dt;
    }

    return dt;
  };

  this.isDisabled = function(date) {
    return $scope.disabled ||
      this.minDate && this.compare(date, this.minDate) < 0 ||
      this.maxDate && this.compare(date, this.maxDate) > 0 ||
      $scope.dateDisabled && $scope.dateDisabled({date: date, mode: $scope.datepickerMode});
  };

  this.customClass = function(date) {
    return $scope.customClass({date: date, mode: $scope.datepickerMode});
  };

  // Split array into smaller arrays
  this.split = function(arr, size) {
    var arrays = [];
    while (arr.length > 0) {
      arrays.push(arr.splice(0, size));
    }
    return arrays;
  };

  $scope.select = function(date) {
    if ($scope.datepickerMode === self.minMode) {
      var dt = ngModelCtrl.$viewValue ? dateParser.fromTimezone(new Date(ngModelCtrl.$viewValue), ngModelOptions.timezone) : new Date(0, 0, 0, 0, 0, 0, 0);
      dt.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      dt = dateParser.toTimezone(dt, ngModelOptions.timezone);
      ngModelCtrl.$setViewValue(dt);
      ngModelCtrl.$render();
    } else {
      self.activeDate = date;
      setMode(self.modes[self.modes.indexOf($scope.datepickerMode) - 1]);

      $scope.$emit('tux:datepicker.mode');
    }

    $scope.$broadcast('tux:datepicker.focus');
  };

  $scope.move = function(direction) {
    var year = self.activeDate.getFullYear() + direction * (self.step.years || 0),
        month = self.activeDate.getMonth() + direction * (self.step.months || 0);
    self.activeDate.setFullYear(year, month, 1);
    self.refreshView();
  };

  $scope.toggleMode = function(direction) {
    direction = direction || 1;

    if ($scope.datepickerMode === self.maxMode && direction === 1 ||
      $scope.datepickerMode === self.minMode && direction === -1) {
      return;
    }

    setMode(self.modes[self.modes.indexOf($scope.datepickerMode) + direction]);

    $scope.$emit('tux:datepicker.mode');
  };

  // Key event mapper
  $scope.keys = { 13: 'enter', 32: 'space', 33: 'pageup', 34: 'pagedown', 35: 'end', 36: 'home', 37: 'left', 38: 'up', 39: 'right', 40: 'down' };

  var focusElement = function() {
    self.element[0].focus();
  };

  // Listen for focus requests from popup directive
  $scope.$on('tux:datepicker.focus', focusElement);

  $scope.keydown = function(evt) {
    var key = $scope.keys[evt.which];

    if (!key || evt.shiftKey || evt.altKey || $scope.disabled) {
      return;
    }

    evt.preventDefault();
    if (!self.shortcutPropagation) {
      evt.stopPropagation();
    }

    if (key === 'enter' || key === 'space') {
      if (self.isDisabled(self.activeDate)) {
        return; // do nothing
      }
      $scope.select(self.activeDate);
    } else if (evt.ctrlKey && (key === 'up' || key === 'down')) {
      $scope.toggleMode(key === 'up' ? 1 : -1);
    } else {
      self.handleKeyDown(key, evt);
      self.refreshView();
    }
  };

  $scope.$on('$destroy', function() {
    //Clear all watch listeners on destroy
    while (watchListeners.length) {
      watchListeners.shift()();
    }
  });

  function setMode(mode) {
    $scope.datepickerMode = mode;
    $scope.datepickerOptions.datepickerMode = mode;
  }
}])

.controller('TuxDaypickerController', ['$scope', '$element', 'dateFilter', function(scope, $element, dateFilter) {
  var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  this.step = { months: 1 };
  this.element = $element;
  function getDaysInMonth(year, month) {
    return month === 1 && year % 4 === 0 &&
      (year % 100 !== 0 || year % 400 === 0) ? 29 : DAYS_IN_MONTH[month];
  }

  this.init = function(ctrl) {
    angular.extend(ctrl, this);
    scope.showWeeks = ctrl.showWeeks;
    ctrl.refreshView();
  };

  this.getDates = function(startDate, n) {
    var dates = new Array(n), current = new Date(startDate), i = 0, date;
    while (i < n) {
      date = new Date(current);
      dates[i++] = date;
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  this._refreshView = function() {
    var year = this.activeDate.getFullYear(),
      month = this.activeDate.getMonth(),
      firstDayOfMonth = new Date(this.activeDate);

    firstDayOfMonth.setFullYear(year, month, 1);

    var difference = this.startingDay - firstDayOfMonth.getDay(),
      numDisplayedFromPreviousMonth = difference > 0 ?
        7 - difference : - difference,
      firstDate = new Date(firstDayOfMonth);

    if (numDisplayedFromPreviousMonth > 0) {
      firstDate.setDate(-numDisplayedFromPreviousMonth + 1);
    }

    // 42 is the number of days on a six-week calendar
    var days = this.getDates(firstDate, 42);
    for (var i = 0; i < 42; i ++) {
      days[i] = angular.extend(this.createDateObject(days[i], this.formatDay), {
        secondary: days[i].getMonth() !== month,
        uid: scope.uniqueId + '-' + i
      });
    }

    scope.labels = new Array(7);
    for (var j = 0; j < 7; j++) {
      scope.labels[j] = {
        abbr: dateFilter(days[j].date, this.formatDayHeader),
        full: dateFilter(days[j].date, 'EEEE')
      };
    }

    scope.title = dateFilter(this.activeDate, this.formatDayTitle);
    scope.rows = this.split(days, 7);

    if (scope.showWeeks) {
      scope.weekNumbers = [];
      var thursdayIndex = (4 + 7 - this.startingDay) % 7,
          numWeeks = scope.rows.length;
      for (var curWeek = 0; curWeek < numWeeks; curWeek++) {
        scope.weekNumbers.push(
          getISO8601WeekNumber(scope.rows[curWeek][thursdayIndex].date));
      }
    }
  };

  this.compare = function(date1, date2) {
    var _date1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    var _date2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    _date1.setFullYear(date1.getFullYear());
    _date2.setFullYear(date2.getFullYear());
    return _date1 - _date2;
  };

  function getISO8601WeekNumber(date) {
    var checkDate = new Date(date);
    checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7)); // Thursday
    var time = checkDate.getTime();
    checkDate.setMonth(0); // Compare with Jan 1
    checkDate.setDate(1);
    return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
  }

  this.handleKeyDown = function(key, evt) {
    var date = this.activeDate.getDate();

    if (key === 'left') {
      date = date - 1;
    } else if (key === 'up') {
      date = date - 7;
    } else if (key === 'right') {
      date = date + 1;
    } else if (key === 'down') {
      date = date + 7;
    } else if (key === 'pageup' || key === 'pagedown') {
      var month = this.activeDate.getMonth() + (key === 'pageup' ? - 1 : 1);
      this.activeDate.setMonth(month, 1);
      date = Math.min(getDaysInMonth(this.activeDate.getFullYear(), this.activeDate.getMonth()), date);
    } else if (key === 'home') {
      date = 1;
    } else if (key === 'end') {
      date = getDaysInMonth(this.activeDate.getFullYear(), this.activeDate.getMonth());
    }
    this.activeDate.setDate(date);
  };
}])

.controller('TuxMonthpickerController', ['$scope', '$element', 'dateFilter', function(scope, $element, dateFilter) {
  this.step = { years: 1 };
  this.element = $element;

  this.init = function(ctrl) {
    angular.extend(ctrl, this);
    ctrl.refreshView();
  };

  this._refreshView = function() {
    var months = new Array(12),
        year = this.activeDate.getFullYear(),
        date;

    for (var i = 0; i < 12; i++) {
      date = new Date(this.activeDate);
      date.setFullYear(year, i, 1);
      months[i] = angular.extend(this.createDateObject(date, this.formatMonth), {
        uid: scope.uniqueId + '-' + i
      });
    }

    scope.title = dateFilter(this.activeDate, this.formatMonthTitle);
    scope.rows = this.split(months, 3);
  };

  this.compare = function(date1, date2) {
    var _date1 = new Date(date1.getFullYear(), date1.getMonth());
    var _date2 = new Date(date2.getFullYear(), date2.getMonth());
    _date1.setFullYear(date1.getFullYear());
    _date2.setFullYear(date2.getFullYear());
    return _date1 - _date2;
  };

  this.handleKeyDown = function(key, evt) {
    var date = this.activeDate.getMonth();

    if (key === 'left') {
      date = date - 1;
    } else if (key === 'up') {
      date = date - 3;
    } else if (key === 'right') {
      date = date + 1;
    } else if (key === 'down') {
      date = date + 3;
    } else if (key === 'pageup' || key === 'pagedown') {
      var year = this.activeDate.getFullYear() + (key === 'pageup' ? - 1 : 1);
      this.activeDate.setFullYear(year);
    } else if (key === 'home') {
      date = 0;
    } else if (key === 'end') {
      date = 11;
    }
    this.activeDate.setMonth(date);
  };
}])

.controller('TuxYearpickerController', ['$scope', '$element', 'dateFilter', function(scope, $element, dateFilter) {
  var columns, range;
  this.element = $element;

  function getStartingYear(year) {
    return parseInt((year - 1) / range, 10) * range + 1;
  }

  this.yearpickerInit = function() {
    columns = this.yearColumns;
    range = this.yearRows * columns;
    this.step = { years: range };
  };

  this._refreshView = function() {
    var years = new Array(range), date;

    for (var i = 0, start = getStartingYear(this.activeDate.getFullYear()); i < range; i++) {
      date = new Date(this.activeDate);
      date.setFullYear(start + i, 0, 1);
      years[i] = angular.extend(this.createDateObject(date, this.formatYear), {
        uid: scope.uniqueId + '-' + i
      });
    }

    scope.title = [years[0].label, years[range - 1].label].join(' - ');
    scope.rows = this.split(years, columns);
    scope.columns = columns;
  };

  this.compare = function(date1, date2) {
    return date1.getFullYear() - date2.getFullYear();
  };

  this.handleKeyDown = function(key, evt) {
    var date = this.activeDate.getFullYear();

    if (key === 'left') {
      date = date - 1;
    } else if (key === 'up') {
      date = date - columns;
    } else if (key === 'right') {
      date = date + 1;
    } else if (key === 'down') {
      date = date + columns;
    } else if (key === 'pageup' || key === 'pagedown') {
      date += (key === 'pageup' ? - 1 : 1) * range;
    } else if (key === 'home') {
      date = getStartingYear(this.activeDate.getFullYear());
    } else if (key === 'end') {
      date = getStartingYear(this.activeDate.getFullYear()) + range - 1;
    }
    this.activeDate.setFullYear(date);
  };
}])

.directive('tuxDatepicker', function() {
  return {
    replace: true,
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'tux/template/datepicker/datepicker.html';
    },
    scope: {
      datepickerOptions: '=?'
    },
    require: ['tuxDatepicker', '^ngModel'],
    controller: 'TuxDatepickerController',
    controllerAs: 'datepicker',
    link: function(scope, element, attrs, ctrls) {
      var datepickerCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      datepickerCtrl.init(ngModelCtrl);
    }
  };
})

.directive('tuxDaypicker', function() {
  return {
    replace: true,
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'tux/template/datepicker/day.html';
    },
    require: ['^tuxDatepicker', 'tuxDaypicker'],
    controller: 'TuxDaypickerController',
    link: function(scope, element, attrs, ctrls) {
      var datepickerCtrl = ctrls[0],
        daypickerCtrl = ctrls[1];

      daypickerCtrl.init(datepickerCtrl);
    }
  };
})

.directive('tuxMonthpicker', function() {
  return {
    replace: true,
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'tux/template/datepicker/month.html';
    },
    require: ['^tuxDatepicker', 'tuxMonthpicker'],
    controller: 'TuxMonthpickerController',
    link: function(scope, element, attrs, ctrls) {
      var datepickerCtrl = ctrls[0],
        monthpickerCtrl = ctrls[1];

      monthpickerCtrl.init(datepickerCtrl);
    }
  };
})

.directive('tuxYearpicker', function() {
  return {
    replace: true,
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'tux/template/datepicker/year.html';
    },
    require: ['^tuxDatepicker', 'tuxYearpicker'],
    controller: 'TuxYearpickerController',
    link: function(scope, element, attrs, ctrls) {
      var ctrl = ctrls[0];
      angular.extend(ctrl, ctrls[1]);
      ctrl.yearpickerInit();

      ctrl.refreshView();
    }
  };
});

angular.module('ui.tux.datepickerPopup', ['ui.tux.datepicker', 'ui.tux.position'])

.value('$datepickerPopupLiteralWarning', true)

.constant('tuxDatepickerPopupConfig', {
  altInputFormats: [],
  appendToBody: false,
  clearText: 'Clear',
  closeOnDateSelection: true,
  closeText: 'Done',
  currentText: 'Today',
  datepickerPopup: 'yyyy-MM-dd',
  datepickerPopupTemplateUrl: 'tux/template/datepickerPopup/popup.html',
  datepickerTemplateUrl: 'tux/template/datepicker/datepicker.html',
  html5Types: {
    date: 'yyyy-MM-dd',
    'datetime-local': 'yyyy-MM-ddTHH:mm:ss.sss',
    'month': 'yyyy-MM'
  },
  onOpenFocus: true,
  showButtonBar: false,
  placement: 'auto bottom-left'
})

.controller('TuxDatepickerPopupController', ['$scope', '$element', '$attrs', '$compile', '$log', '$parse', '$window', '$document', '$rootScope', '$tuxPosition', 'dateFilter', 'tuxDateParser', 'tuxDatepickerPopupConfig', '$timeout', 'tuxDatepickerConfig', '$datepickerPopupLiteralWarning',
function($scope, $element, $attrs, $compile, $log, $parse, $window, $document, $rootScope, $position, dateFilter, dateParser, datepickerPopupConfig, $timeout, datepickerConfig, $datepickerPopupLiteralWarning) {
  var cache = {},
    isHtml5DateInput = false;
  var dateFormat, closeOnDateSelection, appendToBody, onOpenFocus,
    datepickerPopupTemplateUrl, datepickerTemplateUrl, popupEl, datepickerEl, scrollParentEl,
    ngModel, ngModelOptions, $popup, altInputFormats, watchListeners = [],
    timezone;

  this.init = function(_ngModel_) {
    ngModel = _ngModel_;
    ngModelOptions = _ngModel_.$options;
    closeOnDateSelection = angular.isDefined($attrs.closeOnDateSelection) ?
      $scope.$parent.$eval($attrs.closeOnDateSelection) :
      datepickerPopupConfig.closeOnDateSelection;
    appendToBody = angular.isDefined($attrs.datepickerAppendToBody) ?
      $scope.$parent.$eval($attrs.datepickerAppendToBody) :
      datepickerPopupConfig.appendToBody;
    onOpenFocus = angular.isDefined($attrs.onOpenFocus) ?
      $scope.$parent.$eval($attrs.onOpenFocus) : datepickerPopupConfig.onOpenFocus;
    datepickerPopupTemplateUrl = angular.isDefined($attrs.datepickerPopupTemplateUrl) ?
      $attrs.datepickerPopupTemplateUrl :
      datepickerPopupConfig.datepickerPopupTemplateUrl;
    datepickerTemplateUrl = angular.isDefined($attrs.datepickerTemplateUrl) ?
      $attrs.datepickerTemplateUrl : datepickerPopupConfig.datepickerTemplateUrl;
    altInputFormats = angular.isDefined($attrs.altInputFormats) ?
      $scope.$parent.$eval($attrs.altInputFormats) :
      datepickerPopupConfig.altInputFormats;

    $scope.showButtonBar = angular.isDefined($attrs.showButtonBar) ?
      $scope.$parent.$eval($attrs.showButtonBar) :
      datepickerPopupConfig.showButtonBar;

    if (datepickerPopupConfig.html5Types[$attrs.type]) {
      dateFormat = datepickerPopupConfig.html5Types[$attrs.type];
      isHtml5DateInput = true;
    } else {
      dateFormat = $attrs.tuxDatepickerPopup || datepickerPopupConfig.datepickerPopup;
      $attrs.$observe('tuxDatepickerPopup', function(value, oldValue) {
        var newDateFormat = value || datepickerPopupConfig.datepickerPopup;
        // Invalidate the $modelValue to ensure that formatters re-run
        // FIXME: Refactor when PR is merged: https://github.com/angular/angular.js/pull/10764
        if (newDateFormat !== dateFormat) {
          dateFormat = newDateFormat;
          ngModel.$modelValue = null;

          if (!dateFormat) {
            throw new Error('tuxDatepickerPopup must have a date format specified.');
          }
        }
      });
    }

    if (!dateFormat) {
      throw new Error('tuxDatepickerPopup must have a date format specified.');
    }

    if (isHtml5DateInput && $attrs.tuxDatepickerPopup) {
      throw new Error('HTML5 date input types do not support custom formats.');
    }

    // popup element used to display calendar
    popupEl = angular.element('<div tux-datepicker-popup-wrap><div tux-datepicker></div></div>');
    if (ngModelOptions) {
      timezone = ngModelOptions.timezone;
      $scope.ngModelOptions = angular.copy(ngModelOptions);
      $scope.ngModelOptions.timezone = null;
      if ($scope.ngModelOptions.updateOnDefault === true) {
        $scope.ngModelOptions.updateOn = $scope.ngModelOptions.updateOn ?
          $scope.ngModelOptions.updateOn + ' default' : 'default';
      }

      popupEl.attr('ng-model-options', 'ngModelOptions');
    } else {
      timezone = null;
    }

    popupEl.attr({
      'ng-model': 'date',
      'ng-change': 'dateSelection(date)',
      'template-url': datepickerPopupTemplateUrl
    });

    // datepicker element
    datepickerEl = angular.element(popupEl.children()[0]);
    datepickerEl.attr('template-url', datepickerTemplateUrl);

    if (!$scope.datepickerOptions) {
      $scope.datepickerOptions = {};
    }

    if (isHtml5DateInput) {
      if ($attrs.type === 'month') {
        $scope.datepickerOptions.datepickerMode = 'month';
        $scope.datepickerOptions.minMode = 'month';
      }
    }

    datepickerEl.attr('datepicker-options', 'datepickerOptions');

    if (!isHtml5DateInput) {
      // Internal API to maintain the correct ng-invalid-[key] class
      ngModel.$$parserName = 'date';
      ngModel.$validators.date = validator;
      ngModel.$parsers.unshift(parseDate);
      ngModel.$formatters.push(function(value) {
        if (ngModel.$isEmpty(value)) {
          $scope.date = value;
          return value;
        }

        $scope.date = dateParser.fromTimezone(value, timezone);

        if (angular.isNumber($scope.date)) {
          $scope.date = new Date($scope.date);
        }

        return dateParser.filter($scope.date, dateFormat);
      });
    } else {
      ngModel.$formatters.push(function(value) {
        $scope.date = dateParser.fromTimezone(value, timezone);
        return value;
      });
    }

    // Detect changes in the view from the text box
    ngModel.$viewChangeListeners.push(function() {
      $scope.date = parseDateString(ngModel.$viewValue);
    });

    $element.on('keydown', inputKeydownBind);

    $popup = $compile(popupEl)($scope);
    // Prevent jQuery cache memory leak (template is now redundant after linking)
    popupEl.remove();

    if (appendToBody) {
      $document.find('body').append($popup);
    } else {
      $element.after($popup);
    }

    $scope.$on('$destroy', function() {
      if ($scope.isOpen === true) {
        if (!$rootScope.$$phase) {
          $scope.$apply(function() {
            $scope.isOpen = false;
          });
        }
      }

      $popup.remove();
      $element.off('keydown', inputKeydownBind);
      $document.off('click', documentClickBind);
      if (scrollParentEl) {
        scrollParentEl.off('scroll', positionPopup);
      }
      angular.element($window).off('resize', positionPopup);

      //Clear all watch listeners on destroy
      while (watchListeners.length) {
        watchListeners.shift()();
      }
    });
  };

  $scope.getText = function(key) {
    return $scope[key + 'Text'] || datepickerPopupConfig[key + 'Text'];
  };

  $scope.isDisabled = function(date) {
    if (date === 'today') {
      date = dateParser.fromTimezone(new Date(), timezone);
    }

    var dates = {};
    angular.forEach(['minDate', 'maxDate'], function(key) {
      if (!$scope.datepickerOptions[key]) {
        dates[key] = null;
      } else if (angular.isDate($scope.datepickerOptions[key])) {
        dates[key] = dateParser.fromTimezone(new Date($scope.datepickerOptions[key]), timezone);
      } else {
        if ($datepickerPopupLiteralWarning) {
          $log.warn('Literal date support has been deprecated, please switch to date object usage');
        }

        dates[key] = new Date(dateFilter($scope.datepickerOptions[key], 'medium'));
      }
    });

    return $scope.datepickerOptions &&
      dates.minDate && $scope.compare(date, dates.minDate) < 0 ||
      dates.maxDate && $scope.compare(date, dates.maxDate) > 0;
  };

  $scope.compare = function(date1, date2) {
    return new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  };

  // Inner change
  $scope.dateSelection = function(dt) {
    if (angular.isDefined(dt)) {
      $scope.date = dt;
    }
    var date = $scope.date ? dateParser.filter($scope.date, dateFormat) : null; // Setting to NULL is necessary for form validators to function
    $element.val(date);
    ngModel.$setViewValue(date);

    if (closeOnDateSelection) {
      $scope.isOpen = false;
      $element[0].focus();
    }
  };

  $scope.keydown = function(evt) {
    if (evt.which === 27) {
      evt.stopPropagation();
      $scope.isOpen = false;
      $element[0].focus();
    }
  };

  $scope.select = function(date, evt) {
    evt.stopPropagation();

    if (date === 'today') {
      var today = new Date();
      if (angular.isDate($scope.date)) {
        date = new Date($scope.date);
        date.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
      } else {
        date = new Date(today.setHours(0, 0, 0, 0));
      }
    }
    $scope.dateSelection(date);
  };

  $scope.close = function(evt) {
    evt.stopPropagation();

    $scope.isOpen = false;
    $element[0].focus();
  };

  $scope.disabled = angular.isDefined($attrs.disabled) || false;
  if ($attrs.ngDisabled) {
    watchListeners.push($scope.$parent.$watch($parse($attrs.ngDisabled), function(disabled) {
      $scope.disabled = disabled;
    }));
  }

  $scope.$watch('isOpen', function(value) {
    if (value) {
      if (!$scope.disabled) {
        $timeout(function() {
          positionPopup();

          if (onOpenFocus) {
            $scope.$broadcast('tux:datepicker.focus');
          }

          $document.on('click', documentClickBind);

          var placement = $attrs.popupPlacement ? $attrs.popupPlacement : datepickerPopupConfig.placement;
          if (appendToBody || $position.parsePlacement(placement)[2]) {
            scrollParentEl = scrollParentEl || angular.element($position.scrollParent($element));
            if (scrollParentEl) {
              scrollParentEl.on('scroll', positionPopup);
            }
          } else {
            scrollParentEl = null;
          }

          angular.element($window).on('resize', positionPopup);
        }, 0, false);
      } else {
        $scope.isOpen = false;
      }
    } else {
      $document.off('click', documentClickBind);
      if (scrollParentEl) {
        scrollParentEl.off('scroll', positionPopup);
      }
      angular.element($window).off('resize', positionPopup);
    }
  });

  function cameltoDash(string) {
    return string.replace(/([A-Z])/g, function($1) { return '-' + $1.toLowerCase(); });
  }

  function parseDateString(viewValue) {
    var date = dateParser.parse(viewValue, dateFormat, $scope.date);
    if (isNaN(date)) {
      for (var i = 0; i < altInputFormats.length; i++) {
        date = dateParser.parse(viewValue, altInputFormats[i], $scope.date);
        if (!isNaN(date)) {
          return date;
        }
      }
    }
    return date;
  }

  function parseDate(viewValue) {
    if (angular.isNumber(viewValue)) {
      // presumably timestamp to date object
      viewValue = new Date(viewValue);
    }

    if (!viewValue) {
      return null;
    }

    if (angular.isDate(viewValue) && !isNaN(viewValue)) {
      return viewValue;
    }

    if (angular.isString(viewValue)) {
      var date = parseDateString(viewValue);
      if (!isNaN(date)) {
        return dateParser.toTimezone(date, timezone);
      }
    }

    return ngModel.$options && ngModel.$options.allowInvalid ? viewValue : undefined;
  }

  function validator(modelValue, viewValue) {
    var value = modelValue || viewValue;

    if (!$attrs.ngRequired && !value) {
      return true;
    }

    if (angular.isNumber(value)) {
      value = new Date(value);
    }

    if (!value) {
      return true;
    }

    if (angular.isDate(value) && !isNaN(value)) {
      return true;
    }

    if (angular.isString(value)) {
      return !isNaN(parseDateString(viewValue));
    }

    return false;
  }

  function documentClickBind(event) {
    if (!$scope.isOpen && $scope.disabled) {
      return;
    }

    var popup = $popup[0];
    var dpContainsTarget = $element[0].contains(event.target);
    // The popup node may not be an element node
    // In some browsers (IE) only element nodes have the 'contains' function
    var popupContainsTarget = popup.contains !== undefined && popup.contains(event.target);
    if ($scope.isOpen && !(dpContainsTarget || popupContainsTarget)) {
      $scope.$apply(function() {
        $scope.isOpen = false;
      });
    }
  }

  function inputKeydownBind(evt) {
    if (evt.which === 27 && $scope.isOpen) {
      evt.preventDefault();
      evt.stopPropagation();
      $scope.$apply(function() {
        $scope.isOpen = false;
      });
      $element[0].focus();
    } else if (evt.which === 40 && !$scope.isOpen) {
      evt.preventDefault();
      evt.stopPropagation();
      $scope.$apply(function() {
        $scope.isOpen = true;
      });
    }
  }

  function positionPopup() {
    if ($scope.isOpen) {
      var dpElement = angular.element($popup[0].querySelector('.tux-datepicker-popup'));
      var placement = $attrs.popupPlacement ? $attrs.popupPlacement : datepickerPopupConfig.placement;
      var position = $position.positionElements($element, dpElement, placement, appendToBody);
      dpElement.css({top: position.top + 'px', left: position.left + 'px'});
      if (dpElement.hasClass('tux-position-measure')) {
        dpElement.removeClass('tux-position-measure');
      }
    }
  }

  $scope.$on('tux:datepicker.mode', function() {
    $timeout(positionPopup, 0, false);
  });
}])

.directive('tuxDatepickerPopup', function() {
  return {
    require: ['ngModel', 'tuxDatepickerPopup'],
    controller: 'TuxDatepickerPopupController',
    scope: {
      datepickerOptions: '=?',
      isOpen: '=?',
      currentText: '@',
      clearText: '@',
      closeText: '@'
    },
    link: function(scope, element, attrs, ctrls) {
      var ngModel = ctrls[0],
        ctrl = ctrls[1];

      ctrl.init(ngModel);
    }
  };
})

.directive('tuxDatepickerPopupWrap', function() {
  return {
    replace: true,
    transclude: true,
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || 'tux/template/datepickerPopup/popup.html';
    }
  };
});

angular.module('ui.tux.dropdown', ['ui.tux.position'])

.constant('tuxDropdownConfig', {
  appendToOpenClass: 'tux-dropdown-open',
  openClass: 'open'
})

.service('tuxDropdownService', ['$document', '$rootScope', function($document, $rootScope) {
  var openScope = null;

  this.open = function(dropdownScope) {
    if (!openScope) {
      $document.on('click', closeDropdown);
      $document.on('keydown', keybindFilter);
    }

    if (openScope && openScope !== dropdownScope) {
      openScope.isOpen = false;
    }

    openScope = dropdownScope;
  };

  this.close = function(dropdownScope) {
    if (openScope === dropdownScope) {
      openScope = null;
      $document.off('click', closeDropdown);
      $document.off('keydown', keybindFilter);
    }
  };

  var closeDropdown = function(evt) {
    // This method may still be called during the same mouse event that
    // unbound this event handler. So check openScope before proceeding.
    if (!openScope) { return; }

    if (evt && openScope.getAutoClose() === 'disabled') { return; }

    if (evt && evt.which === 3) { return; }

    var toggleElement = openScope.getToggleElement();
    if (evt && toggleElement && toggleElement[0].contains(evt.target)) {
      return;
    }

    var dropdownElement = openScope.getDropdownElement();
    if (evt && openScope.getAutoClose() === 'outsideClick' &&
      dropdownElement && dropdownElement[0].contains(evt.target)) {
      return;
    }

    openScope.isOpen = false;

    if (!$rootScope.$$phase) {
      openScope.$apply();
    }
  };

  var keybindFilter = function(evt) {
    if (evt.which === 27) {
      openScope.focusToggleElement();
      closeDropdown();
    } else if (openScope.isKeynavEnabled() && [38, 40].indexOf(evt.which) !== -1 && openScope.isOpen) {
      evt.preventDefault();
      evt.stopPropagation();
      openScope.focusDropdownEntry(evt.which);
    }
  };
}])

.controller('TrwdDropdownController', ['$scope', '$element', '$attrs', '$parse', 'tuxDropdownConfig', 'tuxDropdownService', '$animate', '$tuxPosition', '$document', '$compile', '$templateRequest', function($scope, $element, $attrs, $parse, dropdownConfig, tuxDropdownService, $animate, $position, $document, $compile, $templateRequest) {
  var self = this,
    scope = $scope.$new(), // create a child scope so we are not polluting original one
    templateScope,
    appendToOpenClass = dropdownConfig.appendToOpenClass,
    openClass = dropdownConfig.openClass,
    getIsOpen,
    setIsOpen = angular.noop,
    toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop,
    appendToBody = false,
    appendTo = null,
    keynavEnabled = false,
    selectedOption = null,
    body = $document.find('body');

  $element.addClass('dropdown');

  this.init = function() {
    if ($attrs.isOpen) {
      getIsOpen = $parse($attrs.isOpen);
      setIsOpen = getIsOpen.assign;

      $scope.$watch(getIsOpen, function(value) {
        scope.isOpen = !!value;
      });
    }

    if (angular.isDefined($attrs.dropdownAppendTo)) {
      var appendToEl = $parse($attrs.dropdownAppendTo)(scope);
      if (appendToEl) {
        appendTo = angular.element(appendToEl);
      }
    }

    appendToBody = angular.isDefined($attrs.dropdownAppendToBody);
    keynavEnabled = angular.isDefined($attrs.keyboardNav);

    if (appendToBody && !appendTo) {
      appendTo = body;
    }

    if (appendTo && self.dropdownMenu) {
      appendTo.append(self.dropdownMenu);
      $element.on('$destroy', function handleDestroyEvent() {
        self.dropdownMenu.remove();
      });
    }
  };

  this.toggle = function(open) {
    return scope.isOpen = arguments.length ? !!open : !scope.isOpen;
  };

  // Allow other directives to watch status
  this.isOpen = function() {
    return scope.isOpen;
  };

  scope.getToggleElement = function() {
    return self.toggleElement;
  };

  scope.getAutoClose = function() {
    return $attrs.autoClose || 'always'; //or 'outsideClick' or 'disabled'
  };

  scope.getElement = function() {
    return $element;
  };

  scope.isKeynavEnabled = function() {
    return keynavEnabled;
  };

  scope.focusDropdownEntry = function(keyCode) {
    var elems = self.dropdownMenu ? //If append to body is used.
      angular.element(self.dropdownMenu).find('a') :
      $element.find('ul').eq(0).find('a');

    switch (keyCode) {
      case 40: {
        if (!angular.isNumber(self.selectedOption)) {
          self.selectedOption = 0;
        } else {
          self.selectedOption = self.selectedOption === elems.length - 1 ?
            self.selectedOption :
            self.selectedOption + 1;
        }
        break;
      }
      case 38: {
        if (!angular.isNumber(self.selectedOption)) {
          self.selectedOption = elems.length - 1;
        } else {
          self.selectedOption = self.selectedOption === 0 ?
            0 : self.selectedOption - 1;
        }
        break;
      }
    }
    elems[self.selectedOption].focus();
  };

  scope.getDropdownElement = function() {
    return self.dropdownMenu;
  };

  scope.focusToggleElement = function() {
    if (self.toggleElement) {
      self.toggleElement[0].focus();
    }
  };

  scope.$watch('isOpen', function(isOpen, wasOpen) {
    if (appendTo && self.dropdownMenu) {
      var pos = $position.positionElements($element, self.dropdownMenu, 'bottom-left', true),
        css,
        rightalign;

      css = {
        top: pos.top + 'px',
        display: isOpen ? 'block' : 'none'
      };

      rightalign = self.dropdownMenu.hasClass('dropdown-menu-right');
      if (!rightalign) {
        css.left = pos.left + 'px';
        css.right = 'auto';
      } else {
        css.left = 'auto';
        css.right = window.innerWidth -
          (pos.left + $element.prop('offsetWidth')) + 'px';
      }

      // Need to adjust our positioning to be relative to the appendTo container
      // if it's not the body element
      if (!appendToBody) {
        var appendOffset = $position.offset(appendTo);

        css.top = pos.top - appendOffset.top + 'px';

        if (!rightalign) {
          css.left = pos.left - appendOffset.left + 'px';
        } else {
          css.right = window.innerWidth -
            (pos.left - appendOffset.left + $element.prop('offsetWidth')) + 'px';
        }
      }

      self.dropdownMenu.css(css);
    }

    var openContainer = appendTo ? appendTo : $element;
    var hasOpenClass = openContainer.hasClass(appendTo ? appendToOpenClass : openClass);

    if (hasOpenClass === !isOpen) {
      $animate[isOpen ? 'addClass' : 'removeClass'](openContainer, appendTo ? appendToOpenClass : openClass).then(function() {
        if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
          toggleInvoker($scope, { open: !!isOpen });
        }
      });
    }

    if (isOpen) {
      if (self.dropdownMenuTemplateUrl) {
        $templateRequest(self.dropdownMenuTemplateUrl).then(function(tplContent) {
          templateScope = scope.$new();
          $compile(tplContent.trim())(templateScope, function(dropdownElement) {
            var newEl = dropdownElement;
            self.dropdownMenu.replaceWith(newEl);
            self.dropdownMenu = newEl;
          });
        });
      }

      scope.focusToggleElement();
      tuxDropdownService.open(scope);
    } else {
      if (self.dropdownMenuTemplateUrl) {
        if (templateScope) {
          templateScope.$destroy();
        }
        var newEl = angular.element('<ul class="dropdown-menu"></ul>');
        self.dropdownMenu.replaceWith(newEl);
        self.dropdownMenu = newEl;
      }

      tuxDropdownService.close(scope);
      self.selectedOption = null;
    }

    if (angular.isFunction(setIsOpen)) {
      setIsOpen($scope, isOpen);
    }
  });

  $scope.$on('$locationChangeSuccess', function() {
    if (scope.getAutoClose() !== 'disabled') {
      scope.isOpen = false;
    }
  });
}])

.directive('tuxDropdown', function() {
  return {
    controller: 'TrwdDropdownController',
    link: function(scope, element, attrs, dropdownCtrl) {
      dropdownCtrl.init();
    }
  };
})

.directive('tuxDropdownMenu', function() {
  return {
    restrict: 'A',
    require: '?^tuxDropdown',
    link: function(scope, element, attrs, dropdownCtrl) {
      if (!dropdownCtrl || angular.isDefined(attrs.dropdownNested)) {
        return;
      }

      element.addClass('dropdown-menu');

      var tplUrl = attrs.templateUrl;
      if (tplUrl) {
        dropdownCtrl.dropdownMenuTemplateUrl = tplUrl;
      }

      if (!dropdownCtrl.dropdownMenu) {
        dropdownCtrl.dropdownMenu = element;
      }
    }
  };
})

.directive('tuxDropdownToggle', function() {
  return {
    require: '?^tuxDropdown',
    link: function(scope, element, attrs, dropdownCtrl) {
      if (!dropdownCtrl) {
        return;
      }

      element.addClass('dropdown-toggle');

      dropdownCtrl.toggleElement = element;

      var toggleDropdown = function(event) {
        event.preventDefault();

        if (!element.hasClass('disabled') && !attrs.disabled) {
          scope.$apply(function() {
            dropdownCtrl.toggle();
          });
        }
      };

      element.bind('click', toggleDropdown);

      // WAI-ARIA
      element.attr({ 'aria-haspopup': true, 'aria-expanded': false });
      scope.$watch(dropdownCtrl.isOpen, function(isOpen) {
        element.attr('aria-expanded', !!isOpen);
      });

      scope.$on('$destroy', function() {
        element.unbind('click', toggleDropdown);
      });
    }
  };
});

"use strict";
angular.module('ui.tux.fileUpload',[])
    .directive('tuxFileUpload', function(){
        return {
            restrict: 'E',
            templateUrl: 'tux/template/fileUpload/fileupload.html',
            replace: true,
            transclude: true,
            scope: {
                __userFiles: '=ngModel'
            },
            link: function(scope, el, attr){
                var fileName,
                    __userFiles,
                    uri;

                var _validFileExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"];
                _validFileExtensions = attr.extension || _validFileExtensions;

                fileName = attr.name || 'userFile';
                scope.buttonText = attr.label || 'Upload Files';

                el.find('label').append('<input type="file" '+(attr.multiple=='true'?'multiple':'')+' accept="'+(attr.accept?attr.accept:'')+'" '+(attr.required=='true'?'required':'')+' name="'+fileName+'"/>');
                uri = attr.uri||'/upload/upload';

                function uploadFile(file, uri, index) {
                    var xhr = new XMLHttpRequest(),
                        fd = new FormData(),
                        progress = 0;

                    xhr.open('POST', uri, true);
                    xhr.onreadystatechange = function(){
                        scope.__userFiles[index].status = {
                            code: xhr.status,
                            statusText: xhr.statusText,
                            response: xhr.response
                        };
                        scope.$apply();
                    };
                    xhr.upload.addEventListener("progress", function(e) {
                        progress = parseInt(e.loaded / e.total * 100);
                        scope.__userFiles[index].percent = progress;
                        scope.$apply();
                    }, false);
                    fd.append(fileName, file);
                    xhr.send(fd);
                    return {
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        status: {},
                        percent: 0
                    }
                }

                scope.removeFile = function(indexValue) {
                    scope.__userFiles.splice(indexValue, 1);
                }

                angular.element(el.find('button')).bind('click',function(e){
                  //  scope.$eval(el.find('input')[0].click());
                });

                angular.element(el.find('input')[0]).bind('change', function(e){
                    var files = e.srcElement.files || e.dataTransfer.files;
                    var list = [];


                    for (var i = 0, f; f = files[i]; i++) {
                        var sFileName = files[i].name;
                        var blnValid = false;
                        for (var j = 0; j < _validFileExtensions.length; j++) {
                            var sCurExtension = _validFileExtensions[j];
                            if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
                                blnValid = true;
                                list.push(uploadFile(f,uri,i));
                                angular.element(el.find('p')).addClass("hide");
                                break;
                            }
                        }
                        if (!blnValid) {
                            angular.element(el.find('p')).html("Sorry, " + sFileName + " is invalid.");
                            angular.element(el.find('p')).removeClass("hide");
                            //return false;
                        }
                    }
                    
                    //e.srcElement.files = {};
                    e.srcElement.value = '';

                    scope.__userFiles = list;
                    scope.$apply();
                })
            }
        }
    });
angular.module('ui.tux.footer', [])

.controller('TrwdFooterController', ['$scope', '$attrs', function($scope, $attrs) {

}]);
angular.module('ui.tux.formComponents', [])

.directive("tuxCheckbox", function() {
        return {
            require: "ngModel",
            transclude: true,
            scope: {
                label: "@"
            },
            templateUrl: 'tux/template/formComponents/input.html',
            link: function(scope, element, attrs, ctrl) {
                var input = element.find("input");

                input.css({ display: 'none' });

                function getTrueValue() {
                    return getCheckboxValue(attrs.btnCheckboxTrue, true);
                }

                function getFalseValue() {
                    return getCheckboxValue(attrs.btnCheckboxFalse, false);
                }

                function getCheckboxValue(attribute, defaultValue) {
                    return angular.isDefined(attribute) ? scope.$eval(attribute) : defaultValue;
                }

                //model -> UI
                ctrl.$render = function() {
                    element.toggleClass("active", angular.equals(ctrl.$modelValue, getTrueValue()));
                };

                //ui->model
                element.find("label").on("click", function(event) {
                    if (attrs.disabled) {
                        return;
                    }

                    scope.$apply(function() {
                        ctrl.$setViewValue(element.hasClass("active") ? getFalseValue() : getTrueValue());
                        ctrl.$render();
                    });
                });
            }
        };
    })
    .directive("tuxRadio", function() {
        return {
            require: "ngModel",
            transclude: true,
            scope: {
                label: "@",
            },
            templateUrl: 'tux/template/formComponents/input.html',
            link: function(scope, element, attrs, ctrl) {
               var input = element.find("input");

                input.css({ display: 'none' });

                //model -> UI
                ctrl.$render = function() {
                    element.toggleClass("active", angular.equals(ctrl.$modelValue, scope.$eval(attrs.tuxRadio)));
                };

                //ui->model
                element.find("label").on("click", function() {
                    if (attrs.disabled) {
                        return;
                    }

                    var isActive = element.hasClass("active");

                    if (!isActive) {
                        scope.$apply(function() {
                            ctrl.$setViewValue(isActive ? null : scope.$eval(attrs.tuxRadio));
                            ctrl.$render();
                        });
                    }
                });

            }
        };
    });

angular.module('ui.tux.formValidations', [])



if(agGrid) {
agGrid.initialiseAgGridWithAngular1(angular);
angular.module("ui.tux.grid", ["agGrid"]);
}

angular.module('ui.tux.header', [])

.controller('TrwdHeaderController', ['$scope', '$attrs', function($scope, $attrs) {
  scope.isCollapsed = false;

}])

.directive('tuxHeader', function() {
  return {
    controller: 'TrwdHeaderController',
    controllerAs: 'header',
    
  };
});
angular.module('ui.tux.stackedMap', [])
/**
 * A helper, internal data structure that acts as a map but also allows getting / removing
 * elements in the LIFO order
 */
  .factory('$$stackedMap', function() {
    return {
      createNew: function() {
        var stack = [];

        return {
          add: function(key, value) {
            stack.push({
              key: key,
              value: value
            });
          },
          get: function(key) {
            for (var i = 0; i < stack.length; i++) {
              if (key === stack[i].key) {
                return stack[i];
              }
            }
          },
          keys: function() {
            var keys = [];
            for (var i = 0; i < stack.length; i++) {
              keys.push(stack[i].key);
            }
            return keys;
          },
          top: function() {
            return stack[stack.length - 1];
          },
          remove: function(key) {
            var idx = -1;
            for (var i = 0; i < stack.length; i++) {
              if (key === stack[i].key) {
                idx = i;
                break;
              }
            }
            return stack.splice(idx, 1)[0];
          },
          removeTop: function() {
            return stack.splice(stack.length - 1, 1)[0];
          },
          length: function() {
            return stack.length;
          }
        };
      }
    };
  });
angular.module('ui.tux.modal', ['ui.tux.stackedMap'])
/**
 * A helper, internal data structure that stores all references attached to key
 */
  .factory('$$multiMap', function() {
    return {
      createNew: function() {
        var map = {};

        return {
          entries: function() {
            return Object.keys(map).map(function(key) {
              return {
                key: key,
                value: map[key]
              };
            });
          },
          get: function(key) {
            return map[key];
          },
          hasKey: function(key) {
            return !!map[key];
          },
          keys: function() {
            return Object.keys(map);
          },
          put: function(key, value) {
            if (!map[key]) {
              map[key] = [];
            }

            map[key].push(value);
          },
          remove: function(key, value) {
            var values = map[key];

            if (!values) {
              return;
            }

            var idx = values.indexOf(value);

            if (idx !== -1) {
              values.splice(idx, 1);
            }

            if (!values.length) {
              delete map[key];
            }
          }
        };
      }
    };
  })

/**
 * Pluggable resolve mechanism for the modal resolve resolution
 * Supports UI Router's $resolve service
 */
  .provider('$tuxResolve', function() {
    var resolve = this;
    this.resolver = null;

    this.setResolver = function(resolver) {
      this.resolver = resolver;
    };

    this.$get = ['$injector', '$q', function($injector, $q) {
      var resolver = resolve.resolver ? $injector.get(resolve.resolver) : null;
      return {
        resolve: function(invocables, locals, parent, self) {
          if (resolver) {
            return resolver.resolve(invocables, locals, parent, self);
          }

          var promises = [];

          angular.forEach(invocables, function(value) {
            if (angular.isFunction(value) || angular.isArray(value)) {
              promises.push($q.resolve($injector.invoke(value)));
            } else if (angular.isString(value)) {
              promises.push($q.resolve($injector.get(value)));
            } else {
              promises.push($q.resolve(value));
            }
          });

          return $q.all(promises).then(function(resolves) {
            var resolveObj = {};
            var resolveIter = 0;
            angular.forEach(invocables, function(value, key) {
              resolveObj[key] = resolves[resolveIter++];
            });

            return resolveObj;
          });
        }
      };
    }];
  })

/**
 * A helper directive for the $modal service. It creates a backdrop element.
 */
  .directive('tuxModalBackdrop', ['$animateCss', '$injector', '$tuxModalStack',
  function($animateCss, $injector, $modalStack) {
    return {
      replace: true,
      templateUrl: 'tux/template/modal/backdrop.html',
      compile: function(tElement, tAttrs) {
        tElement.addClass(tAttrs.backdropClass);
        return linkFn;
      }
    };

    function linkFn(scope, element, attrs) {
      if (attrs.modalInClass) {
        $animateCss(element, {
          addClass: attrs.modalInClass
        }).start();

        scope.$on($modalStack.NOW_CLOSING_EVENT, function(e, setIsAsync) {
          var done = setIsAsync();
          if (scope.modalOptions.animation) {
            $animateCss(element, {
              removeClass: attrs.modalInClass
            }).start().then(done);
          } else {
            done();
          }
        });
      }
    }
  }])

  .directive('tuxModalWindow', ['$tuxModalStack', '$q', '$animate', '$animateCss', '$document',
  function($modalStack, $q, $animate, $animateCss, $document) {
    return {
      scope: {
        index: '@'
      },
      replace: true,
      transclude: true,
      templateUrl: function(tElement, tAttrs) {
        return tAttrs.templateUrl || 'tux/template/modal/window.html';
      },
      link: function(scope, element, attrs) {
        element.addClass(attrs.windowClass || '');
        element.addClass(attrs.windowTopClass || '');
        scope.size = attrs.size;

        scope.close = function(evt) {
          var modal = $modalStack.getTop();
          if (modal && modal.value.backdrop &&
            modal.value.backdrop !== 'static' &&
            evt.target === evt.currentTarget) {
            evt.preventDefault();
            evt.stopPropagation();
            $modalStack.dismiss(modal.key, 'backdrop click');
          }
        };

        // moved from template to fix issue #2280
        element.on('click', scope.close);

        // This property is only added to the scope for the purpose of detecting when this directive is rendered.
        // We can detect that by using this property in the template associated with this directive and then use
        // {@link Attribute#$observe} on it. For more details please see {@link TableColumnResize}.
        scope.$isRendered = true;

        // Deferred object that will be resolved when this modal is render.
        var modalRenderDeferObj = $q.defer();
        // Observe function will be called on next digest cycle after compilation, ensuring that the DOM is ready.
        // In order to use this way of finding whether DOM is ready, we need to observe a scope property used in modal's template.
        attrs.$observe('modalRender', function(value) {
          if (value === 'true') {
            modalRenderDeferObj.resolve();
          }
        });

        modalRenderDeferObj.promise.then(function() {
          var animationPromise = null;

          if (attrs.modalInClass) {
            animationPromise = $animateCss(element, {
              addClass: attrs.modalInClass
            }).start();

            scope.$on($modalStack.NOW_CLOSING_EVENT, function(e, setIsAsync) {
              var done = setIsAsync();
              if ($animateCss) {
                $animateCss(element, {
                  removeClass: attrs.modalInClass
                }).start().then(done);
              } else {
                $animate.removeClass(element, attrs.modalInClass).then(done);
              }
            });
          }


          $q.when(animationPromise).then(function() {
            // Notify {@link $modalStack} that modal is rendered.
            var modal = $modalStack.getTop();
            if (modal) {
              $modalStack.modalRendered(modal.key);
            }

            /**
             * If something within the freshly-opened modal already has focus (perhaps via a
             * directive that causes focus). then no need to try and focus anything.
             */
            if (!($document[0].activeElement && element[0].contains($document[0].activeElement))) {
              var inputWithAutofocus = element[0].querySelector('[autofocus]');
              /**
               * Auto-focusing of a freshly-opened modal element causes any child elements
               * with the autofocus attribute to lose focus. This is an issue on touch
               * based devices which will show and then hide the onscreen keyboard.
               * Attempts to refocus the autofocus element via JavaScript will not reopen
               * the onscreen keyboard. Fixed by updated the focusing logic to only autofocus
               * the modal element if the modal does not contain an autofocus element.
               */
              if (inputWithAutofocus) {
                inputWithAutofocus.focus();
              } else {
                element[0].focus();
              }
            }
          });
        });
      }
    };
  }])

  .directive('tuxModalAnimationClass', function() {
    return {
      compile: function(tElement, tAttrs) {
        if (tAttrs.modalAnimation) {
          tElement.addClass(tAttrs.tuxModalAnimationClass);
        }
      }
    };
  })

  .directive('tuxModalTransclude', function() {
    return {
      link: function(scope, element, attrs, controller, transclude) {
        transclude(scope.$parent, function(clone) {
          element.empty();
          element.append(clone);
        });
      }
    };
  })

  .factory('$tuxModalStack', ['$animate', '$animateCss', '$document',
    '$compile', '$rootScope', '$q', '$$multiMap', '$$stackedMap',
    function($animate, $animateCss, $document, $compile, $rootScope, $q, $$multiMap, $$stackedMap) {
      var OPENED_MODAL_CLASS = 'modal-open';

      var backdropDomEl, backdropScope;
      var openedWindows = $$stackedMap.createNew();
      var openedClasses = $$multiMap.createNew();
      var $modalStack = {
        NOW_CLOSING_EVENT: 'modal.stack.now-closing'
      };

      //Modal focus behavior
      var focusableElementList;
      var focusIndex = 0;
      var tababbleSelector = 'a[href], area[href], input:not([disabled]), ' +
        'button:not([disabled]),select:not([disabled]), textarea:not([disabled]), ' +
        'iframe, object, embed, *[tabindex], *[contenteditable=true]';

      function backdropIndex() {
        var topBackdropIndex = -1;
        var opened = openedWindows.keys();
        for (var i = 0; i < opened.length; i++) {
          if (openedWindows.get(opened[i]).value.backdrop) {
            topBackdropIndex = i;
          }
        }
        return topBackdropIndex;
      }

      $rootScope.$watch(backdropIndex, function(newBackdropIndex) {
        if (backdropScope) {
          backdropScope.index = newBackdropIndex;
        }
      });

      function removeModalWindow(modalInstance, elementToReceiveFocus) {
        var modalWindow = openedWindows.get(modalInstance).value;
        var appendToElement = modalWindow.appendTo;

        //clean up the stack
        openedWindows.remove(modalInstance);

        removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, function() {
          var modalBodyClass = modalWindow.openedClass || OPENED_MODAL_CLASS;
          openedClasses.remove(modalBodyClass, modalInstance);
          appendToElement.toggleClass(modalBodyClass, openedClasses.hasKey(modalBodyClass));
          toggleTopWindowClass(true);
        }, modalWindow.closedDeferred);
        checkRemoveBackdrop();

        //move focus to specified element if available, or else to body
        if (elementToReceiveFocus && elementToReceiveFocus.focus) {
          elementToReceiveFocus.focus();
        } else if (appendToElement.focus) {
          appendToElement.focus();
        }
      }

      // Add or remove "windowTopClass" from the top window in the stack
      function toggleTopWindowClass(toggleSwitch) {
        var modalWindow;

        if (openedWindows.length() > 0) {
          modalWindow = openedWindows.top().value;
          modalWindow.modalDomEl.toggleClass(modalWindow.windowTopClass || '', toggleSwitch);
        }
      }

      function checkRemoveBackdrop() {
        //remove backdrop if no longer needed
        if (backdropDomEl && backdropIndex() === -1) {
          var backdropScopeRef = backdropScope;
          removeAfterAnimate(backdropDomEl, backdropScope, function() {
            backdropScopeRef = null;
          });
          backdropDomEl = undefined;
          backdropScope = undefined;
        }
      }

      function removeAfterAnimate(domEl, scope, done, closedDeferred) {
        var asyncDeferred;
        var asyncPromise = null;
        var setIsAsync = function() {
          if (!asyncDeferred) {
            asyncDeferred = $q.defer();
            asyncPromise = asyncDeferred.promise;
          }

          return function asyncDone() {
            asyncDeferred.resolve();
          };
        };
        scope.$broadcast($modalStack.NOW_CLOSING_EVENT, setIsAsync);

        // Note that it's intentional that asyncPromise might be null.
        // That's when setIsAsync has not been called during the
        // NOW_CLOSING_EVENT broadcast.
        return $q.when(asyncPromise).then(afterAnimating);

        function afterAnimating() {
          if (afterAnimating.done) {
            return;
          }
          afterAnimating.done = true;

          $animateCss(domEl, {
            event: 'leave'
          }).start().then(function() {
            domEl.remove();
            if (closedDeferred) {
              closedDeferred.resolve();
            }
          });

          scope.$destroy();
          if (done) {
            done();
          }
        }
      }

      $document.on('keydown', keydownListener);

      $rootScope.$on('$destroy', function() {
        $document.off('keydown', keydownListener);
      });

      function keydownListener(evt) {
        if (evt.isDefaultPrevented()) {
          return evt;
        }

        var modal = openedWindows.top();
        if (modal) {
          switch (evt.which) {
            case 27: {
              if (modal.value.keyboard) {
                evt.preventDefault();
                $rootScope.$apply(function() {
                  $modalStack.dismiss(modal.key, 'escape key press');
                });
              }
              break;
            }
            case 9: {
              $modalStack.loadFocusElementList(modal);
              var focusChanged = false;
              if (evt.shiftKey) {
                if ($modalStack.isFocusInFirstItem(evt) || $modalStack.isModalFocused(evt, modal)) {
                  focusChanged = $modalStack.focusLastFocusableElement();
                }
              } else {
                if ($modalStack.isFocusInLastItem(evt)) {
                  focusChanged = $modalStack.focusFirstFocusableElement();
                }
              }

              if (focusChanged) {
                evt.preventDefault();
                evt.stopPropagation();
              }
              break;
            }
          }
        }
      }

      $modalStack.open = function(modalInstance, modal) {
        var modalOpener = $document[0].activeElement,
          modalBodyClass = modal.openedClass || OPENED_MODAL_CLASS;

        toggleTopWindowClass(false);

        openedWindows.add(modalInstance, {
          deferred: modal.deferred,
          renderDeferred: modal.renderDeferred,
          closedDeferred: modal.closedDeferred,
          modalScope: modal.scope,
          backdrop: modal.backdrop,
          keyboard: modal.keyboard,
          openedClass: modal.openedClass,
          windowTopClass: modal.windowTopClass,
          animation: modal.animation,
          appendTo: modal.appendTo
        });

        openedClasses.put(modalBodyClass, modalInstance);

        var appendToElement = modal.appendTo,
            currBackdropIndex = backdropIndex();

        if (!appendToElement.length) {
          throw new Error('appendTo element not found. Make sure that the element passed is in DOM.');
        }

        if (currBackdropIndex >= 0 && !backdropDomEl) {
          backdropScope = $rootScope.$new(true);
          backdropScope.modalOptions = modal;
          backdropScope.index = currBackdropIndex;
          backdropDomEl = angular.element('<div tux-modal-backdrop="modal-backdrop"></div>');
          backdropDomEl.attr('backdrop-class', modal.backdropClass);
          if (modal.animation) {
            backdropDomEl.attr('modal-animation', 'true');
          }
          $compile(backdropDomEl)(backdropScope);
          $animate.enter(backdropDomEl, appendToElement);
        }

        var angularDomEl = angular.element('<div tux-modal-window="modal-window"></div>');
        angularDomEl.attr({
          'template-url': modal.windowTemplateUrl,
          'window-class': modal.windowClass,
          'window-top-class': modal.windowTopClass,
          'size': modal.size,
          'index': openedWindows.length() - 1,
          'animate': 'animate'
        }).html(modal.content);
        if (modal.animation) {
          angularDomEl.attr('modal-animation', 'true');
        }

        $animate.enter($compile(angularDomEl)(modal.scope), appendToElement)
          .then(function() {
            if (!modal.scope.$$tuxDestructionScheduled) {
              $animate.addClass(appendToElement, modalBodyClass);
            }
          });

        openedWindows.top().value.modalDomEl = angularDomEl;
        openedWindows.top().value.modalOpener = modalOpener;

        $modalStack.clearFocusListCache();
      };

      function broadcastClosing(modalWindow, resultOrReason, closing) {
        return !modalWindow.value.modalScope.$broadcast('modal.closing', resultOrReason, closing).defaultPrevented;
      }

      $modalStack.close = function(modalInstance, result) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow && broadcastClosing(modalWindow, result, true)) {
          modalWindow.value.modalScope.$$tuxDestructionScheduled = true;
          modalWindow.value.deferred.resolve(result);
          removeModalWindow(modalInstance, modalWindow.value.modalOpener);
          return true;
        }
        return !modalWindow;
      };

      $modalStack.dismiss = function(modalInstance, reason) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow && broadcastClosing(modalWindow, reason, false)) {
          modalWindow.value.modalScope.$$tuxDestructionScheduled = true;
          modalWindow.value.deferred.reject(reason);
          removeModalWindow(modalInstance, modalWindow.value.modalOpener);
          return true;
        }
        return !modalWindow;
      };

      $modalStack.dismissAll = function(reason) {
        var topModal = this.getTop();
        while (topModal && this.dismiss(topModal.key, reason)) {
          topModal = this.getTop();
        }
      };

      $modalStack.getTop = function() {
        return openedWindows.top();
      };

      $modalStack.modalRendered = function(modalInstance) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow) {
          modalWindow.value.renderDeferred.resolve();
        }
      };

      $modalStack.focusFirstFocusableElement = function() {
        if (focusableElementList.length > 0) {
          focusableElementList[0].focus();
          return true;
        }
        return false;
      };
      $modalStack.focusLastFocusableElement = function() {
        if (focusableElementList.length > 0) {
          focusableElementList[focusableElementList.length - 1].focus();
          return true;
        }
        return false;
      };

      $modalStack.isModalFocused = function(evt, modalWindow) {
        if (evt && modalWindow) {
          var modalDomEl = modalWindow.value.modalDomEl;
          if (modalDomEl && modalDomEl.length) {
            return (evt.target || evt.srcElement) === modalDomEl[0];
          }
        }
        return false;
      };

      $modalStack.isFocusInFirstItem = function(evt) {
        if (focusableElementList.length > 0) {
          return (evt.target || evt.srcElement) === focusableElementList[0];
        }
        return false;
      };

      $modalStack.isFocusInLastItem = function(evt) {
        if (focusableElementList.length > 0) {
          return (evt.target || evt.srcElement) === focusableElementList[focusableElementList.length - 1];
        }
        return false;
      };

      $modalStack.clearFocusListCache = function() {
        focusableElementList = [];
        focusIndex = 0;
      };

      $modalStack.loadFocusElementList = function(modalWindow) {
        if (focusableElementList === undefined || !focusableElementList.length) {
          if (modalWindow) {
            var modalDomE1 = modalWindow.value.modalDomEl;
            if (modalDomE1 && modalDomE1.length) {
              focusableElementList = modalDomE1[0].querySelectorAll(tababbleSelector);
            }
          }
        }
      };

      return $modalStack;
    }])

  .provider('$tuxModal', function() {
    var $modalProvider = {
      options: {
        animation: true,
        backdrop: true, //can also be false or 'static'
        keyboard: true
      },
      $get: ['$rootScope', '$q', '$document', '$templateRequest', '$controller', '$tuxResolve', '$tuxModalStack',
        function ($rootScope, $q, $document, $templateRequest, $controller, $tuxResolve, $modalStack) {
          var $modal = {};

          function getTemplatePromise(options) {
            return options.template ? $q.when(options.template) :
              $templateRequest(angular.isFunction(options.templateUrl) ?
                options.templateUrl() : options.templateUrl);
          }

          var promiseChain = null;
          $modal.getPromiseChain = function() {
            return promiseChain;
          };

          $modal.open = function(modalOptions) {
            var modalResultDeferred = $q.defer();
            var modalOpenedDeferred = $q.defer();
            var modalClosedDeferred = $q.defer();
            var modalRenderDeferred = $q.defer();

            //prepare an instance of a modal to be injected into controllers and returned to a caller
            var modalInstance = {
              result: modalResultDeferred.promise,
              opened: modalOpenedDeferred.promise,
              closed: modalClosedDeferred.promise,
              rendered: modalRenderDeferred.promise,
              close: function (result) {
                return $modalStack.close(modalInstance, result);
              },
              dismiss: function (reason) {
                return $modalStack.dismiss(modalInstance, reason);
              }
            };

            //merge and clean up options
            modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
            modalOptions.resolve = modalOptions.resolve || {};
            modalOptions.appendTo = modalOptions.appendTo || $document.find('body').eq(0);

            //verify options
            if (!modalOptions.template && !modalOptions.templateUrl) {
              throw new Error('One of template or templateUrl options is required.');
            }

            var templateAndResolvePromise =
              $q.all([getTemplatePromise(modalOptions), $tuxResolve.resolve(modalOptions.resolve, {}, null, null)]);

            function resolveWithTemplate() {
              return templateAndResolvePromise;
            }

            // Wait for the resolution of the existing promise chain.
            // Then switch to our own combined promise dependency (regardless of how the previous modal fared).
            // Then add to $modalStack and resolve opened.
            // Finally clean up the chain variable if no subsequent modal has overwritten it.
            var samePromise;
            samePromise = promiseChain = $q.all([promiseChain])
              .then(resolveWithTemplate, resolveWithTemplate)
              .then(function resolveSuccess(tplAndVars) {
                var providedScope = modalOptions.scope || $rootScope;

                var modalScope = providedScope.$new();
                modalScope.$close = modalInstance.close;
                modalScope.$dismiss = modalInstance.dismiss;

                modalScope.$on('$destroy', function() {
                  if (!modalScope.$$tuxDestructionScheduled) {
                    modalScope.$dismiss('$tuxUnscheduledDestruction');
                  }
                });

                var ctrlInstance, ctrlLocals = {};

                //controllers
                if (modalOptions.controller) {
                  ctrlLocals.$scope = modalScope;
                  ctrlLocals.$tuxModalInstance = modalInstance;
                  angular.forEach(tplAndVars[1], function(value, key) {
                    ctrlLocals[key] = value;
                  });

                  ctrlInstance = $controller(modalOptions.controller, ctrlLocals);
                  if (modalOptions.controllerAs) {
                    if (modalOptions.bindToController) {
                      ctrlInstance.$close = modalScope.$close;
                      ctrlInstance.$dismiss = modalScope.$dismiss;
                      angular.extend(ctrlInstance, providedScope);
                    }

                    modalScope[modalOptions.controllerAs] = ctrlInstance;
                  }
                }

                $modalStack.open(modalInstance, {
                  scope: modalScope,
                  deferred: modalResultDeferred,
                  renderDeferred: modalRenderDeferred,
                  closedDeferred: modalClosedDeferred,
                  content: tplAndVars[0],
                  animation: modalOptions.animation,
                  backdrop: modalOptions.backdrop,
                  keyboard: modalOptions.keyboard,
                  backdropClass: modalOptions.backdropClass,
                  windowTopClass: modalOptions.windowTopClass,
                  windowClass: modalOptions.windowClass,
                  windowTemplateUrl: modalOptions.windowTemplateUrl,
                  size: modalOptions.size,
                  openedClass: modalOptions.openedClass,
                  appendTo: modalOptions.appendTo
                });
                modalOpenedDeferred.resolve(true);

            }, function resolveError(reason) {
              modalOpenedDeferred.reject(reason);
              modalResultDeferred.reject(reason);
            })['finally'](function() {
              if (promiseChain === samePromise) {
                promiseChain = null;
              }
            });

            return modalInstance;
          };

          return $modal;
        }
      ]
    };

    return $modalProvider;
  });

angular.module('ui.tux.imageGallery', ['ui.tux.carousel', 'ui.tux.modal'])

.controller('carousel_ModalCltr', function($scope, $tuxModalInstance, param, $timeout) {
    $scope.data = param.data;
    $scope.counterOffset = param.counterOffset + 1;
    $scope.current = $scope.data[$scope.counterOffset - 1];
    $scope.current.index = $scope.counterOffset - 1;
    $scope.$watch('counterOffset', function(newValue) {
        $scope.current = $scope.data[newValue - 1];
        $scope.current.index = $scope.counterOffset - 1;
    });
    $scope.close = function() {
        $tuxModalInstance.close();
    };
})
    .directive('tuxImageGallery', function($tuxModal) {
        return {
            scope: {
                galleryHoverMenu: '=',
                source: '='
            },
            replace: true,
            templateUrl: function(element, attrs) {
                return attrs.templateUrl || 'tux/template/imageGallery/imageGallery.html';
            },
            controller: function($scope, $http) {
                if (angular.isObject($scope.source)) {
                    $scope.data = $scope.source;
                } else if (angular.isString($scope.source)) {
                    $http.get($scope.source).then(function(response) {
                        $scope.data = response.data.gallery;
                    });
                }
            },
            link: function(scope, element, attrs) {
                var modalContainer = angular.element(element[0].getElementsByClassName('modalContainer'));
                var modalInstance;
                scope.open = function(counterOffset) {
                    modalInstance = $tuxModal.open({
                        templateUrl: 'galleryModal.html',
                        controller: 'carousel_ModalCltr',
                        scope: scope,
                        resolve: {
                            param: function() {
                                return {
                                    'data': scope.data,
                                    'counterOffset': counterOffset
                                };
                            }
                        }
                    });
                };
                scope.hoverLinkClick = function(event, index, obj) {
                    event.stopPropagation();
                    scope.$emit('hoverLinkClick', event, index, obj);
                    if (index == scope.data.length) {
                        modalInstance.close();
                    }
                    event.preventDefault();
                }
                scope.openInNewTab = function(imgPath) {
                    var myWindow = window.open("", "_blank");
                    myWindow.document.write("<img src='"+imgPath+"'>");                    
                }
            }
        }
    })
angular.module('ui.tux.loin', [])

angular.module('ui.tux.login', [])

angular.module('ui.tux.multiselect', ['ng'])


.directive('tuxMultiselect', ['$sce', '$timeout', '$templateCache', function($sce, $timeout, $templateCache) {
    return {
        restrict: 'AE',

        scope: {
            // models
            inputModel: '=',
            outputModel: '=',

            // settings based on attribute
            isDisabled: '=',

            // callbacks
            onClear: '&',
            onClose: '&',
            onSearchChange: '&',
            onItemClick: '&',
            onOpen: '&',
            onReset: '&',
            onSelectAll: '&',
            onSelectNone: '&',

            // i18n
            translation: '='
        },

        /* 
         * The rest are attributes. They don't need to be parsed / binded, so we can safely access them by value.
         * - buttonLabel, directiveId, helperElements, itemLabel, maxLabels, orientation, selectionMode, minSearchLength,
         *   tickProperty, disableProperty, groupProperty, searchProperty, maxHeight, outputProperties
         */

        templateUrl: function(element, attrs) {
            return attrs.templateUrl || 'tux/template/multiselect/multiselect.html';
        },

        link: function($scope, element, attrs) {

            $scope.backUp = [];
            $scope.varButtonLabel = '';
            $scope.spacingProperty = '';
            $scope.indexProperty = '';
            $scope.orientationH = false;
            $scope.orientationV = true;
            $scope.selectionShow = false;
            $scope.filteredModel = [];
            $scope.inputLabel = { labelFilter: '' };
            $scope.tabIndex = 0;
            $scope.lang = {};
            $scope.helperStatus = {
                all: true,
                none: true,
                reset: true,
                filter: true
            };

            var
                prevTabIndex = 0,
                helperItems = [],
                helperItemsLength = 0,
                checkBoxLayer = '',
                scrolled = false,
                selectedItems = [],
                formElements = [],
                vMinSearchLength = 0,
                clickedItem = null;


            if(typeof attrs.selectionShow !== 'undefined' && attrs.selectionShow.toUpperCase() === 'TRUE') {
                $scope.selectionShow = true; 
            }

            if(typeof attrs.tickProperty === 'undefined' && attrs.tickProperty === undefined) {
                attrs.tickProperty = 'ticked';
            }

            if(typeof attrs.selectionMode === 'undefined' && attrs.selectionMode === undefined) {
                attrs.selectionMode = 'single';
            }

            if(typeof attrs.buttonLabel === 'undefined' && attrs.buttonLabel === undefined) {
                attrs.buttonLabel = 'name';
            }

            if(typeof attrs.itemLabel === 'undefined' && attrs.itemLabel === undefined) {
                attrs.itemLabel = 'name';
            }

            // v3.0.0
            // clear button clicked
            $scope.clearClicked = function(e) {
                $scope.inputLabel.labelFilter = '';
                $scope.updateFilter();
                $scope.select('clear', e);
            };

            // A little hack so that AngularJS ng-repeat can loop using start and end index like a normal loop
            // http://stackoverflow.com/questions/16824853/way-to-ng-repeat-defined-number-of-times-instead-of-repeating-over-array
            $scope.numberToArray = function(num) {
                return new Array(num);
            };

            // Call this function when user type on the filter field
            $scope.searchChanged = function() {
                if ($scope.inputLabel.labelFilter.length < vMinSearchLength && $scope.inputLabel.labelFilter.length > 0) {
                    return false;
                }
                $scope.updateFilter();
            };

            $scope.updateFilter = function() {
                // we check by looping from end of input-model
                $scope.filteredModel = [];
                var i = 0;

                if (typeof $scope.inputModel === 'undefined') {
                    return false;
                }

                for (i = $scope.inputModel.length - 1; i >= 0; i--) {

                    // if it's group end, we push it to filteredModel[];
                    if (typeof $scope.inputModel[i][attrs.groupProperty] !== 'undefined' && $scope.inputModel[i][attrs.groupProperty] === false) {
                        $scope.filteredModel.push($scope.inputModel[i]);
                    }

                    // if it's data 
                    var gotData = false;
                    var key = null;
                    if (typeof $scope.inputModel[i][attrs.groupProperty] === 'undefined') {

                        // If we set the search-key attribute, we use this loop. 
                        if (typeof attrs.searchProperty !== 'undefined' && attrs.searchProperty !== '') {
                           
                            for (key in $scope.inputModel[i]) {
                                if (
                                    typeof $scope.inputModel[i][key] !== 'boolean' && String($scope.inputModel[i][key]).toUpperCase().indexOf($scope.inputLabel.labelFilter.toUpperCase()) >= 0 && attrs.searchProperty.indexOf(key) > -1
                                ) {
                                    gotData = true;
                                    break;
                                }
                            }
                        }
                        // if there's no search-key attribute, we use this one. Much better on performance.
                        else {
                            for (key in $scope.inputModel[i]) {
                                if (
                                    typeof $scope.inputModel[i][key] !== 'boolean' && String($scope.inputModel[i][key]).toUpperCase().indexOf($scope.inputLabel.labelFilter.toUpperCase()) >= 0
                                ) {
                                    gotData = true;
                                    break;
                                }
                            }
                        }

                        if (gotData === true) {
                            // push
                            $scope.filteredModel.push($scope.inputModel[i]);
                        }
                    }

                    // if it's group start
                    if (typeof $scope.inputModel[i][attrs.groupProperty] !== 'undefined' && $scope.inputModel[i][attrs.groupProperty] === true) {

                        if (typeof $scope.filteredModel[$scope.filteredModel.length - 1][attrs.groupProperty] !== 'undefined' && $scope.filteredModel[$scope.filteredModel.length - 1][attrs.groupProperty] === false) {
                            $scope.filteredModel.pop();
                        } else {
                            $scope.filteredModel.push($scope.inputModel[i]);
                        }
                    }
                }

                $scope.filteredModel.reverse();

                $timeout(function() {

                    $scope.getFormElements();

                    // Callback: on filter change                      
                    if ($scope.inputLabel.labelFilter.length > vMinSearchLength) {

                        var filterObj = [];

                        angular.forEach($scope.filteredModel, function(value, key) {
                            if (typeof value !== 'undefined') {
                                if (typeof value[attrs.groupProperty] === 'undefined') {
                                    var tempObj = angular.copy(value);
                                    var index = filterObj.push(tempObj);
                                    delete filterObj[index - 1][$scope.indexProperty];
                                    delete filterObj[index - 1][$scope.spacingProperty];
                                }
                            }
                        });

                        $scope.onSearchChange({
                            data: {
                                keyword: $scope.inputLabel.labelFilter,
                                result: filterObj
                            }
                        });
                    }
                }, 0);
            };

            // List all the input elements. We need this for our keyboard navigation.
            // This function will be called everytime the filter is updated. 
            // Depending on the size of filtered mode, might not good for performance, but oh well..
            $scope.getFormElements = function() {
                formElements = [];

                var
                    selectButtons = [],
                    inputField = [],
                    checkboxes = [],
                    clearButton = [],
                    i=0;

                // If available, then get select all, select none, and reset buttons
                if ($scope.helperStatus.all || $scope.helperStatus.none || $scope.helperStatus.reset) {
                    selectButtons = element.children().children().next().children().children()[0].getElementsByTagName('button');
                    // If available, then get the search box and the clear button
                    if ($scope.helperStatus.filter) {
                        // Get helper - search and clear button. 
                        inputField = element.children().children().next().children().children().next()[0].getElementsByTagName('input');
                        clearButton = element.children().children().next().children().children().next()[0].getElementsByTagName('button');
                    }
                } else {
                    if ($scope.helperStatus.filter) {
                        // Get helper - search and clear button. 
                        inputField = element.children().children().next().children().children()[0].getElementsByTagName('input');
                        clearButton = element.children().children().next().children().children()[0].getElementsByTagName('button');
                    }
                }

                // Get checkboxes
                if (!$scope.helperStatus.all && !$scope.helperStatus.none && !$scope.helperStatus.reset && !$scope.helperStatus.filter) {
                    checkboxes = element.children().children().next()[0].getElementsByTagName('input');
                } else {
                    checkboxes = element.children().children().next().children().next()[0].getElementsByTagName('input');
                }

                // Push them into global array formElements[] 
                for (i = 0; i < selectButtons.length; i++) { formElements.push(selectButtons[i]); }
                for (i = 0; i < inputField.length; i++) { formElements.push(inputField[i]); }
                for (i = 0; i < clearButton.length; i++) { formElements.push(clearButton[i]); }
                for (i = 0; i < checkboxes.length; i++) { formElements.push(checkboxes[i]); }
            };

            // check if an item has attrs.groupProperty (be it true or false)
            $scope.isGroupMarker = function(item, type) {
                if (typeof item[attrs.groupProperty] !== 'undefined' && item[attrs.groupProperty] === type){ return true;}
                return false;
            };

            $scope.removeGroupEndMarker = function(item) {
                if (typeof item[attrs.groupProperty] !== 'undefined' && item[attrs.groupProperty] === false){ return false;}
                return true;
            };

            $scope.tickedItems = function(item) {
                if (item.ticked){
                    return true;
                }
                
            };

            // call this function when an item is clicked
            $scope.syncItems = function(item, e, ng_repeat_index) {
                 var inputModelIndex;
                 var i, j, k;
                e.preventDefault();
                e.stopPropagation();

                // if the directive is globaly disabled, do nothing
                if (typeof attrs.disableProperty !== 'undefined' && item[attrs.disableProperty] === true) {
                    return false;
                }

                // if item is disabled, do nothing
                if (typeof attrs.isDisabled !== 'undefined' && $scope.isDisabled === true) {
                    return false;
                }

                // if end group marker is clicked, do nothing
                if (typeof item[attrs.groupProperty] !== 'undefined' && item[attrs.groupProperty] === false) {
                    return false;
                }

                var index = $scope.filteredModel.indexOf(item);

                // if the start of group marker is clicked ( only for multiple selection! )
                // how it works:
                // - if, in a group, there are items which are not selected, then they all will be selected
                // - if, in a group, all items are selected, then they all will be de-selected                
                if (typeof item[attrs.groupProperty] !== 'undefined' && item[attrs.groupProperty] === true) {

                    // this is only for multiple selection, so if selection mode is single, do nothing
                    if (typeof attrs.selectionMode !== 'undefined' && attrs.selectionMode.toUpperCase() === 'SINGLE') {
                        return false;
                    }

                    
                    var startIndex = 0;
                    var endIndex = $scope.filteredModel.length - 1;
                    var tempArr = [];
                   


                    // nest level is to mark the depth of the group.
                    // when you get into a group (start group marker), nestLevel++
                    // when you exit a group (end group marker), nextLevel--
                    var nestLevel = 0;

                    // we loop throughout the filtered model (not whole model)
                    for (i = index; i < $scope.filteredModel.length; i++) {

                        // this break will be executed when we're done processing each group
                        if (nestLevel === 0 && i > index) {
                            break;
                        }

                        if (typeof $scope.filteredModel[i][attrs.groupProperty] !== 'undefined' && $scope.filteredModel[i][attrs.groupProperty] === true) {

                            // To cater multi level grouping
                            if (tempArr.length === 0) {
                                startIndex = i + 1;
                            }
                            nestLevel = nestLevel + 1;
                        }

                        // if group end
                        else if (typeof $scope.filteredModel[i][attrs.groupProperty] !== 'undefined' && $scope.filteredModel[i][attrs.groupProperty] === false) {

                            nestLevel = nestLevel - 1;

                            // cek if all are ticked or not                            
                            if (tempArr.length > 0 && nestLevel === 0) {

                                var allTicked = true;

                                endIndex = i;

                                for (j = 0; j < tempArr.length; j++) {
                                    if (typeof tempArr[j][$scope.tickProperty] !== 'undefined' && tempArr[j][$scope.tickProperty] === false) {
                                        allTicked = false;
                                        break;
                                    }
                                }

                                if (allTicked === true) {
                                    for (j = startIndex; j <= endIndex; j++) {
                                        if (typeof $scope.filteredModel[j][attrs.groupProperty] === 'undefined') {
                                            if (typeof attrs.disableProperty === 'undefined') {
                                                $scope.filteredModel[j][$scope.tickProperty] = false;
                                                // we refresh input model as well
                                                inputModelIndex = $scope.filteredModel[j][$scope.indexProperty];
                                                $scope.inputModel[inputModelIndex][$scope.tickProperty] = false;
                                            } else if ($scope.filteredModel[j][attrs.disableProperty] !== true) {
                                                $scope.filteredModel[j][$scope.tickProperty] = false;
                                                // we refresh input model as well
                                                inputModelIndex = $scope.filteredModel[j][$scope.indexProperty];
                                                $scope.inputModel[inputModelIndex][$scope.tickProperty] = false;
                                            }
                                        }
                                    }
                                } else {
                                    for (j = startIndex; j <= endIndex; j++) {
                                        if (typeof $scope.filteredModel[j][attrs.groupProperty] === 'undefined') {
                                            if (typeof attrs.disableProperty === 'undefined') {
                                                $scope.filteredModel[j][$scope.tickProperty] = true;
                                                // we refresh input model as well
                                                inputModelIndex = $scope.filteredModel[j][$scope.indexProperty];
                                                $scope.inputModel[inputModelIndex][$scope.tickProperty] = true;

                                            } else if ($scope.filteredModel[j][attrs.disableProperty] !== true) {
                                                $scope.filteredModel[j][$scope.tickProperty] = true;
                                                // we refresh input model as well
                                                inputModelIndex = $scope.filteredModel[j][$scope.indexProperty];
                                                $scope.inputModel[inputModelIndex][$scope.tickProperty] = true;
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // if data
                        else {
                            tempArr.push($scope.filteredModel[i]);
                        }
                    }
                }

                // if an item (not group marker) is clicked
                else {

                    // If it's single selection mode
                    if (typeof attrs.selectionMode !== 'undefined' && attrs.selectionMode.toUpperCase() === 'SINGLE') {

                        // first, set everything to false
                        for (i = 0; i < $scope.filteredModel.length; i++) {
                            $scope.filteredModel[i][$scope.tickProperty] = false;
                        }
                        for (i = 0; i < $scope.inputModel.length; i++) {
                            $scope.inputModel[i][$scope.tickProperty] = false;
                        }

                        // then set the clicked item to true
                        $scope.filteredModel[index][$scope.tickProperty] = true;
                    }

                    // Multiple
                    else {
                        $scope.filteredModel[index][$scope.tickProperty] = !$scope.filteredModel[index][$scope.tickProperty];
                    }

                    // we refresh input model as well
                    inputModelIndex = $scope.filteredModel[index][$scope.indexProperty];
                    $scope.inputModel[inputModelIndex][$scope.tickProperty] = $scope.filteredModel[index][$scope.tickProperty];
                }

                // we execute the callback function here
                clickedItem = angular.copy(item);
                if (clickedItem !== null) {
                    $timeout(function() {
                        delete clickedItem[$scope.indexProperty];
                        delete clickedItem[$scope.spacingProperty];
                        $scope.onItemClick({ data: clickedItem });
                        clickedItem = null;
                    }, 0);
                }

                $scope.refreshOutputModel();
                $scope.refreshButton();

                // We update the index here
                prevTabIndex = $scope.tabIndex;
                $scope.tabIndex = ng_repeat_index + helperItemsLength;

                // Set focus on the hidden checkbox 
                e.target.focus();

                // set & remove CSS style
                $scope.removeFocusStyle(prevTabIndex);
                $scope.setFocusStyle($scope.tabIndex);

                if (typeof attrs.selectionMode !== 'undefined' && attrs.selectionMode.toUpperCase() === 'SINGLE') {
                    // on single selection mode, we then hide the checkbox layer
                    $scope.toggleCheckboxes(e);
                }
            };

            // update $scope.outputModel
            $scope.refreshOutputModel = function() {

                $scope.outputModel = [];
                var
                    outputProps = [],
                    tempObj = {};

                // v4.0.0
                if (typeof attrs.outputProperties !== 'undefined') {
                    outputProps = attrs.outputProperties.split(' ');
                    angular.forEach($scope.inputModel, function(value, key) {
                        if (
                            typeof value !== 'undefined' && typeof value[attrs.groupProperty] === 'undefined' && value[$scope.tickProperty] === true
                        ) {
                            tempObj = {};
                            angular.forEach(value, function(value1, key1) {
                                if (outputProps.indexOf(key1) > -1) {
                                    tempObj[key1] = value1;
                                }
                            });
                            var index = $scope.outputModel.push(tempObj);
                            delete $scope.outputModel[index - 1][$scope.indexProperty];
                            delete $scope.outputModel[index - 1][$scope.spacingProperty];
                        }
                    });
                } else {
                    angular.forEach($scope.inputModel, function(value, key) {
                        if (
                            typeof value !== 'undefined' && typeof value[attrs.groupProperty] === 'undefined' && value[$scope.tickProperty] === true
                        ) {
                            var temp = angular.copy(value);
                            var index = $scope.outputModel.push(temp);
                            delete $scope.outputModel[index - 1][$scope.indexProperty];
                            delete $scope.outputModel[index - 1][$scope.spacingProperty];
                        }
                    });
                }
            };

            // refresh button label
            $scope.refreshButton = function() {

                $scope.varButtonLabel = '';
                //$scope.varSelectionLabel = '';
                var ctr = 0;

                // refresh button label...
                if ($scope.outputModel.length === 0) {
                    // https://github.com/isteven/angular-multi-select/pull/19                    
                    $scope.varButtonLabel = $scope.lang.nothingSelected;
                } else {
                    var tempMaxLabels = $scope.outputModel.length;
                    if (typeof attrs.maxLabels !== 'undefined' && attrs.maxLabels !== '') {
                        tempMaxLabels = attrs.maxLabels;
                    }

                    // if max amount of labels displayed..
                    if ($scope.outputModel.length > tempMaxLabels) {
                        $scope.more = true;
                    } else {
                        $scope.more = false;
                    }

                    angular.forEach($scope.inputModel, function(value, key) {
                        if (typeof value !== 'undefined' && value[attrs.tickProperty] === true) {
                            if (ctr < tempMaxLabels) {
                                if (typeof attrs.selectionMode !== 'undefined' && attrs.selectionMode.toUpperCase() === 'SINGLE'){
                                  $scope.varButtonLabel += ($scope.varButtonLabel.length > 0 ? '</div>, <div class="buttonLabel">' : '<div class="buttonLabel">') + $scope.writeLabel(value, 'buttonLabel');  
                              } else {
                                  $scope.varButtonLabel = ($scope.varButtonLabel.length > 0 ? '<div class="buttonLabel">' : '<div class="buttonLabel">') + tempMaxLabels + " Selected";
                              }

                              // if(typeof attrs.selectionShow !== 'undefined' && attrs.selectionShow.toUpperCase() === 'TRUE')
                              // {
                              //   $scope.varSelectionLabel += ($scope.varSelectionLabel.length > 0 ? '<div class="selectionLabel">' : '<div class="selectionLabel">') + $scope.writeLabel(value, 'buttonLabel') + '<a class="close fa fa-close" rel="1" ng-click="syncItems( item, $event, $index );"></a></div>';
                              // }
                            }
                            ctr++;
                        }
                    });

                    if ($scope.more === true) {
                        // https://github.com/isteven/angular-multi-select/pull/16
                        if (tempMaxLabels > 0) {
                            $scope.varButtonLabel += ', ... ';
                        }
                        $scope.varButtonLabel += '(' + $scope.outputModel.length + ')';
                    }
                }
                $scope.varButtonLabel = $sce.trustAsHtml($scope.varButtonLabel + '<span class="caret"></span>');
            };

            // Check if a checkbox is disabled or enabled. It will check the granular control (disableProperty) and global control (isDisabled)
            // Take note that the granular control has higher priority.
            $scope.itemIsDisabled = function(item) {

                if (typeof attrs.disableProperty !== 'undefined' && item[attrs.disableProperty] === true) {
                    return true;
                }
                if ($scope.isDisabled === true) {
                    return true;
                }
                return false;
                

            };

            // A simple function to parse the item label settings. Used on the buttons and checkbox labels.
            $scope.writeLabel = function(item, type) {

                // type is either 'itemLabel' or 'buttonLabel'
                var temp = attrs[type].split(' ');
                var label = '';

                angular.forEach(temp, function(value, key) {
                    if(item[value]) {
                        label += '&nbsp;' + value.split('.').reduce(function(prev, current) {
                        return prev[current];
                    }, item);
                    }
                });

                if (type.toUpperCase() === 'BUTTONLABEL') {
                    return label;
                }
                return $sce.trustAsHtml(label);
            };

            // UI operations to show/hide checkboxes based on click event..
            $scope.toggleCheckboxes = function(e) {

                // We grab the button
                var clickedEl = element.children()[0];

                // Just to make sure.. had a bug where key events were recorded twice
                angular.element(document).off('click', $scope.externalClickListener);
                angular.element(document).off('keydown', $scope.keyboardListener);

                // The idea below was taken from another multi-select directive - https://github.com/amitava82/angular-multiselect 
                // His version is awesome if you need a more simple multi-select approach.                                

                // close
                if (angular.element(checkBoxLayer).hasClass('show')) {

                    angular.element(checkBoxLayer).removeClass('show');
                    angular.element(checkBoxLayer).parent().parent().removeClass('open');
                    angular.element(clickedEl).removeClass('buttonClicked');
                    angular.element(document).off('click', $scope.externalClickListener);
                    angular.element(document).off('keydown', $scope.keyboardListener);

                    // clear the focused element;
                    $scope.removeFocusStyle($scope.tabIndex);
                    if (typeof formElements[$scope.tabIndex] !== 'undefined') {
                        formElements[$scope.tabIndex].blur();
                    }

                    // close callback
                    $timeout(function() {
                        $scope.onClose();
                    }, 0);

                    // set focus on button again
                    element.children().children()[0].focus();
                }
                // open
                else {
                    // clear filter
                    $scope.inputLabel.labelFilter = '';
                    $scope.updateFilter();

                    helperItems = [];
                    helperItemsLength = 0;

                    angular.element(checkBoxLayer).addClass('show');
                    angular.element(checkBoxLayer).parent().parent().addClass('open');
                    angular.element(clickedEl).addClass('buttonClicked');

                    // Attach change event listener on the input filter. 
                    // We need this because ng-change is apparently not an event listener.                    
                    angular.element(document).on('click', $scope.externalClickListener);
                    angular.element(document).on('keydown', $scope.keyboardListener);

                    // to get the initial tab index, depending on how many helper elements we have. 
                    // priority is to always focus it on the input filter                                                                
                    $scope.getFormElements();
                    $scope.tabIndex = 0;

                    var helperContainer = angular.element(element[0].querySelector('.helperContainer'))[0];

                    if (typeof helperContainer !== 'undefined') {
                        for (var i = 0; i < helperContainer.getElementsByTagName('BUTTON').length; i++) {
                            helperItems[i] = helperContainer.getElementsByTagName('BUTTON')[i];
                        }
                        helperItemsLength = helperItems.length + helperContainer.getElementsByTagName('INPUT').length;
                    }

                    // focus on the filter element on open. 
                    if (element[0].querySelector('.inputFilter')) {
                        element[0].querySelector('.inputFilter').focus();
                        $scope.tabIndex = $scope.tabIndex + helperItemsLength - 2;
                        // blur button in vain
                        angular.element(element).children()[0].blur();
                    }
                    // if there's no filter then just focus on the first checkbox item
                    else {
                        if (!$scope.isDisabled) {
                            $scope.tabIndex = $scope.tabIndex + helperItemsLength;
                            if ($scope.inputModel.length > 0) {
                                formElements[$scope.tabIndex].focus();
                                $scope.setFocusStyle($scope.tabIndex);
                                // blur button in vain
                                angular.element(element).children()[0].blur();
                            }
                        }
                    }

                    // open callback
                    $scope.onOpen();
                }
            };

            // handle clicks outside the button / multi select layer
            $scope.externalClickListener = function(e) {

                var targetsArr = element.find(e.target.tagName);
                for (var i = 0; i < targetsArr.length; i++) {
                    if (e.target === targetsArr[i]) {
                        return;
                    }
                }

                angular.element(checkBoxLayer.previousSibling).removeClass('buttonClicked');
                angular.element(checkBoxLayer).removeClass('show');
                angular.element(checkBoxLayer).parent().parent().removeClass('open');
                angular.element(document).off('click', $scope.externalClickListener);
                angular.element(document).off('keydown', $scope.keyboardListener);

                // close callback                
                $timeout(function() {
                    $scope.onClose();
                }, 0);

                // set focus on button again
                element.children().children()[0].focus();
            };

            // select All / select None / reset buttons
            $scope.select = function(type, e) {

                var helperIndex = helperItems.indexOf(e.target);
                $scope.tabIndex = helperIndex;

                switch (type.toUpperCase()) {
                    case 'ALL':
                        angular.forEach($scope.filteredModel, function(value, key) {
                            if (typeof value !== 'undefined' && value[attrs.disableProperty] !== true) {
                                if (typeof value[attrs.groupProperty] === 'undefined') {
                                    value[$scope.tickProperty] = true;
                                }
                            }
                        });
                        $scope.refreshOutputModel();
                        $scope.refreshButton();
                        $scope.onSelectAll();
                        break;
                    case 'NONE':
                        angular.forEach($scope.filteredModel, function(value, key) {
                            if (typeof value !== 'undefined' && value[attrs.disableProperty] !== true) {
                                if (typeof value[attrs.groupProperty] === 'undefined') {
                                    value[$scope.tickProperty] = false;
                                }
                            }
                        });
                        $scope.refreshOutputModel();
                        $scope.refreshButton();
                        $scope.onSelectNone();
                        break;
                    case 'RESET':
                        angular.forEach($scope.filteredModel, function(value, key) {
                            if (typeof value[attrs.groupProperty] === 'undefined' && typeof value !== 'undefined' && value[attrs.disableProperty] !== true) {
                                var temp = value[$scope.indexProperty];
                                value[$scope.tickProperty] = $scope.backUp[temp][$scope.tickProperty];
                            }
                        });
                        $scope.refreshOutputModel();
                        $scope.refreshButton();
                        $scope.onReset();
                        break;
                    case 'CLEAR':
                        $scope.tabIndex = $scope.tabIndex + 1;
                        $scope.onClear();
                        break;
                    case 'FILTER':
                        $scope.tabIndex = helperItems.length - 1;
                        break;
                    default:
                }
            };

            // just to create a random variable name                
            function genRandomString(length) {
                var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                var temp = '';
                for (var i = 0; i < length; i++) {
                    temp += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return temp;
            }

            // count leading spaces
            $scope.prepareGrouping = function() {
                var spacing = 0;
                angular.forEach($scope.filteredModel, function(value, key) {
                    value[$scope.spacingProperty] = spacing;
                    if (value[attrs.groupProperty] === true) {
                        spacing += 2;
                    } else if (value[attrs.groupProperty] === false) {
                        spacing -= 2;
                    }
                });
            };

            // prepare original index
            $scope.prepareIndex = function() {
                var ctr = 0;
                angular.forEach($scope.filteredModel, function(value, key) {
                    value[$scope.indexProperty] = ctr;
                    ctr++;
                });
            };

            // navigate using up and down arrow
            $scope.keyboardListener = function(e) {

                var key = e.keyCode ? e.keyCode : e.which;
                var isNavigationKey = false;

                // ESC key (close)
                if (key === 27) {
                    e.preventDefault();
                    e.stopPropagation();
                    $scope.toggleCheckboxes(e);
                }


                // next element ( tab, down & right key )                    
                else if (key === 40 || key === 39 || !e.shiftKey && key === 9) {

                    isNavigationKey = true;
                    prevTabIndex = $scope.tabIndex;
                    $scope.tabIndex++;
                    if ($scope.tabIndex > formElements.length - 1) {
                        $scope.tabIndex = 0;
                        prevTabIndex = formElements.length - 1;
                    }
                    while (formElements[$scope.tabIndex].disabled === true) {
                        $scope.tabIndex++;
                        if ($scope.tabIndex > formElements.length - 1) {
                            $scope.tabIndex = 0;
                        }
                        if ($scope.tabIndex === prevTabIndex) {
                            break;
                        }
                    }
                }

                // prev element ( shift+tab, up & left key )
                else if (key === 38 || key === 37 || e.shiftKey && key === 9) {
                    isNavigationKey = true;
                    prevTabIndex = $scope.tabIndex;
                    $scope.tabIndex--;
                    if ($scope.tabIndex < 0) {
                        $scope.tabIndex = formElements.length - 1;
                        prevTabIndex = 0;
                    }
                    while (formElements[$scope.tabIndex].disabled === true) {
                        $scope.tabIndex--;
                        if ($scope.tabIndex === prevTabIndex) {
                            break;
                        }
                        if ($scope.tabIndex < 0) {
                            $scope.tabIndex = formElements.length - 1;
                        }
                    }
                }

                if (isNavigationKey === true) {

                    e.preventDefault();

                    // set focus on the checkbox                    
                    formElements[$scope.tabIndex].focus();
                    var actEl = document.activeElement;

                    if (actEl.type.toUpperCase() === 'CHECKBOX') {
                        $scope.setFocusStyle($scope.tabIndex);
                        $scope.removeFocusStyle(prevTabIndex);
                    } else {
                        $scope.removeFocusStyle(prevTabIndex);
                        $scope.removeFocusStyle(helperItemsLength);
                        $scope.removeFocusStyle(formElements.length - 1);
                    }
                }

                isNavigationKey = false;
            };

            // set (add) CSS style on selected row
            $scope.setFocusStyle = function(tabIndex) {
                angular.element(formElements[tabIndex]).parent().parent().parent().addClass('multiSelectFocus');
            };

            // remove CSS style on selected row
            $scope.removeFocusStyle = function(tabIndex) {
                angular.element(formElements[tabIndex]).parent().parent().parent().removeClass('multiSelectFocus');
            };

            /*********************
             *********************             
             *
             * 1) Initializations
             *
             *********************
             *********************/

            // attrs to $scope - attrs-$scope - attrs - $scope
            // Copy some properties that will be used on the template. They need to be in the $scope.
            $scope.groupProperty = attrs.groupProperty;
            $scope.tickProperty = attrs.tickProperty;
            $scope.directiveId = attrs.directiveId;

            // Unfortunately I need to add these grouping properties into the input model
            var tempStr = genRandomString(5);
            $scope.indexProperty = 'idx_' + tempStr;
            $scope.spacingProperty = 'spc_' + tempStr;

            // set orientation css            
            if (typeof attrs.orientation !== 'undefined') {

                if (attrs.orientation.toUpperCase() === 'HORIZONTAL') {
                    $scope.orientationH = true;
                    $scope.orientationV = false;
                } else {
                    $scope.orientationH = false;
                    $scope.orientationV = true;
                }
            }

            // get elements required for DOM operation
            checkBoxLayer = element.children().children().next()[0];

            // set max-height property if provided
            if (typeof attrs.maxHeight !== 'undefined') {
                var layer = element.children().children().children()[0];
                angular.element(layer).attr("style", "height:" + attrs.maxHeight + "; overflow-y:scroll;");
            }

            // some flags for easier checking            
            for (var property in $scope.helperStatus) {
                if ($scope.helperStatus.hasOwnProperty(property)) {
                    if (
                        typeof attrs.helperElements !== 'undefined' && attrs.helperElements.toUpperCase().indexOf(property.toUpperCase()) === -1
                    ) {
                        $scope.helperStatus[property] = false;
                    }
                }
            }
            if (typeof attrs.selectionMode !== 'undefined' && attrs.selectionMode.toUpperCase() === 'SINGLE') {
                $scope.helperStatus.all = false;
                $scope.helperStatus.none = false;
            }

            // helper button icons.. I guess you can use html tag here if you want to. 
            $scope.icon = {};
            $scope.icon.selectAll = '&#10003;'; // a tick icon
            $scope.icon.selectNone = '&times;'; // x icon
            $scope.icon.reset = '&#8630;'; // undo icon            
            // this one is for the selected items
            $scope.icon.tickMark = '&#10003;'; // a tick icon 

            // configurable button labels                       
            if (typeof attrs.translation !== 'undefined') {
                $scope.lang.selectAll = $sce.trustAsHtml($scope.icon.selectAll + '&nbsp;&nbsp;' + $scope.translation.selectAll);
                $scope.lang.selectNone = $sce.trustAsHtml($scope.icon.selectNone + '&nbsp;&nbsp;' + $scope.translation.selectNone);
                $scope.lang.reset = $sce.trustAsHtml($scope.icon.reset + '&nbsp;&nbsp;' + $scope.translation.reset);
                $scope.lang.search = $scope.translation.search;
                $scope.lang.nothingSelected = $sce.trustAsHtml($scope.translation.nothingSelected);
            } else {
                $scope.lang.selectAll = $sce.trustAsHtml('Select All');
                $scope.lang.selectNone = $sce.trustAsHtml('Clear All');
                $scope.lang.reset = $sce.trustAsHtml('Reset');
                $scope.lang.search = 'Search...';
                $scope.lang.nothingSelected = 'None Selected';
            }
            $scope.icon.tickMark = $sce.trustAsHtml($scope.icon.tickMark);

            // min length of keyword to trigger the filter function
            if (typeof attrs.MinSearchLength !== 'undefined' && parseInt(attrs.MinSearchLength,10) > 0) {
                vMinSearchLength = Math.floor(parseInt(attrs.MinSearchLength,10));
            }

            /*******************************************************
             *******************************************************
             *
             * 2) Logic starts here, initiated by watch 1 & watch 2
             *
             *******************************************************
             *******************************************************/

            // watch1, for changes in input model property
            // updates multi-select when user select/deselect a single checkbox programatically
            // https://github.com/isteven/angular-multi-select/issues/8            
            $scope.$watch('inputModel', function(newVal) {
                if (newVal) {
                    $scope.refreshOutputModel();
                    $scope.refreshButton();
                }
            }, true);

            // watch2 for changes in input model as a whole
            // this on updates the multi-select when a user load a whole new input-model. We also update the $scope.backUp variable
            $scope.$watch('inputModel', function(newVal) {
                if (newVal) {
                    $scope.backUp = angular.copy($scope.inputModel);
                    $scope.updateFilter();
                    $scope.prepareGrouping();
                    $scope.prepareIndex();
                    $scope.refreshOutputModel();
                    $scope.refreshButton();
                }
            });

            // watch for changes in directive state (disabled or enabled)
            $scope.$watch('isDisabled', function(newVal) {
                $scope.isDisabled = newVal;
            });

            // this is for touch enabled devices. We don't want to hide checkboxes on scroll. 
            var onTouchStart = function(e) {
                $scope.$apply(function() {
                    $scope.scrolled = false;
                });
            };
            angular.element(document).bind('touchstart', onTouchStart);
            var onTouchMove = function(e) {
                $scope.$apply(function() {
                    $scope.scrolled = true;
                });
            };
            angular.element(document).bind('touchmove', onTouchMove);

            // unbind document events to prevent memory leaks
            $scope.$on('$destroy', function() {
                angular.element(document).unbind('touchstart', onTouchStart);
                angular.element(document).unbind('touchmove', onTouchMove);
            });
        }
    };
}]);

/**
 * The following features are still outstanding: animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, html tooltips, and selector delegation.
 */
angular.module('ui.tux.tooltip', ['ui.tux.position', 'ui.tux.stackedMap'])

/**
 * The $tooltip service creates tooltip- and popover-like directives as well as
 * houses global options for them.
 */
.provider('$tuxTooltip', function() {
    // The default options tooltip and popover.
    var defaultOptions = {
        placement: 'top',
        placementClassPrefix: '',
        animation: true,
        popupDelay: 0,
        popupCloseDelay: 0,
        useContentExp: false
    };

    // Default hide triggers for each show trigger
    var triggerMap = {
        'mouseenter': 'mouseleave',
        'click': 'click',
        'outsideClick': 'outsideClick',
        'focus': 'blur',
        'none': ''
    };

    // The options specified to the provider globally.
    var globalOptions = {};

    /**
     * `options({})` allows global configuration of all tooltips in the
     * application.
     *
     *   var app = angular.module( 'App', ['ui.bootstrap.tooltip'], function( $tooltipProvider ) {
     *     // place tooltips left instead of top by default
     *     $tooltipProvider.options( { placement: 'left' } );
     *   });
     */
    this.options = function(value) {
        angular.extend(globalOptions, value);
    };

    /**
     * This allows you to extend the set of trigger mappings available. E.g.:
     *
     *   $tooltipProvider.setTriggers( 'openTrigger': 'closeTrigger' );
     */
    this.setTriggers = function setTriggers(triggers) {
        angular.extend(triggerMap, triggers);
    };

    /**
     * This is a helper function for translating camel-case to snake_case.
     */
    function snake_case(name) {
        var regexp = /[A-Z]/g;
        var separator = '-';
        return name.replace(regexp, function(letter, pos) {
            return (pos ? separator : '') + letter.toLowerCase();
        });
    }

    /**
     * Returns the actual instance of the $tooltip service.
     * TODO support multiple triggers
     */
    this.$get = ['$window', '$compile', '$timeout', '$document', '$tuxPosition', '$interpolate', '$rootScope', '$parse', '$$stackedMap', function($window, $compile, $timeout, $document, $position, $interpolate, $rootScope, $parse, $$stackedMap) {
        var openedTooltips = $$stackedMap.createNew();
        $document.on('keypress', keypressListener);

        $rootScope.$on('$destroy', function() {
            $document.off('keypress', keypressListener);
        });

        function keypressListener(e) {
            if (e.which === 27) {
                var last = openedTooltips.top();
                if (last) {
                    last.value.close();
                    openedTooltips.removeTop();
                    last = null;
                }
            }
        }

        return function $tooltip(ttType, prefix, defaultTriggerShow, options) {
            options = angular.extend({}, defaultOptions, globalOptions, options);

            /**
             * Returns an object of show and hide triggers.
             *
             * If a trigger is supplied,
             * it is used to show the tooltip; otherwise, it will use the `trigger`
             * option passed to the `$tooltipProvider.options` method; else it will
             * default to the trigger supplied to this directive factory.
             *
             * The hide trigger is based on the show trigger. If the `trigger` option
             * was passed to the `$tooltipProvider.options` method, it will use the
             * mapped trigger from `triggerMap` or the passed trigger if the map is
             * undefined; otherwise, it uses the `triggerMap` value of the show
             * trigger; else it will just use the show trigger.
             */
            function getTriggers(trigger) {
                var show = (trigger || options.trigger || defaultTriggerShow).split(' ');
                var hide = show.map(function(trigger) {
                    return triggerMap[trigger] || trigger;
                });
                return {
                    show: show,
                    hide: hide
                };
            }

            var directiveName = snake_case(ttType);

            var startSym = $interpolate.startSymbol();
            var endSym = $interpolate.endSymbol();
            var template =
        '<div '+ directiveName + '-popup '+
          'title="' + startSym + 'title' + endSym + '" '+
                (options.useContentExp ?
                    'content-exp="contentExp()" ' :
                    'content="' + startSym + 'content' + endSym + '" ') +
          'placement="' + startSym + 'placement' + endSym + '" '+
          'popup-class="' + startSym + 'popupClass' + endSym + '" '+
                'animation="animation" ' +
                'is-open="isOpen"' +
                'origin-scope="origScope" ' +
                'style="visibility: hidden; display: block; top: -9999px; left: -9999px;"' +
                '>' +
                '</div>';

            return {
                compile: function(tElem, tAttrs) {
                    var tooltipLinker = $compile(template);

                    return function link(scope, element, attrs, tooltipCtrl) {
                        var tooltip;
                        var tooltipLinkedScope;
                        var transitionTimeout;
                        var showTimeout;
                        var hideTimeout;
                        var positionTimeout;
                        var appendToBody = angular.isDefined(options.appendToBody) ? options.appendToBody : false;
                        var triggers = getTriggers(undefined);
                        var hasEnableExp = angular.isDefined(attrs[prefix + 'Enable']);
                        var ttScope = scope.$new(true);
                        var repositionScheduled = false;
                        var isOpenParse = angular.isDefined(attrs[prefix + 'IsOpen']) ? $parse(attrs[prefix + 'IsOpen']) : false;
                        var contentParse = options.useContentExp ? $parse(attrs[ttType]) : false;
                        var observers = [];

                        var positionTooltip = function() {
                            // check if tooltip exists and is not empty
              if (!tooltip || !tooltip.html()) { return; }

                            if (!positionTimeout) {
                                positionTimeout = $timeout(function() {
                                    // Reset the positioning.
                                    tooltip.css({ top: 0, left: 0 });

                                    // Now set the calculated positioning.
                                    var ttPosition = $position.positionElements(element, tooltip, ttScope.placement, appendToBody),
                                        tooltipBorderRadius = $window.getComputedStyle(tooltip[0])["border-radius"],
                                        placement = ttScope.placement.split('-');
                                    
                                    switch (placement[1]) {
                                        case 'top':
                                            ttPosition.top += 10;
                                            break;
                                        case 'bottom':
                                            ttPosition.top -= 10;
                                            break;
                                        case 'left':
                                            ttPosition.left -= 10;
                                            break;
                                        case 'right':
                                            ttPosition.left += 10;
                                            break;
                                    }
                                    tooltip.css({ top: ttPosition.top + 'px', left: ttPosition.left + 'px', visibility: 'visible' });

                                    // If the placement class is prefixed, still need
                                    // to remove the TWBS standard class.
                                    if (options.placementClassPrefix) {
                                        tooltip.removeClass('top bottom left right');
                                    }

                                    tooltip.removeClass(
                                        options.placementClassPrefix + 'top ' +
                                        options.placementClassPrefix + 'top-left ' +
                                        options.placementClassPrefix + 'top-right ' +
                                        options.placementClassPrefix + 'bottom ' +
                                        options.placementClassPrefix + 'bottom-left ' +
                                        options.placementClassPrefix + 'bottom-right ' +
                                        options.placementClassPrefix + 'left ' +
                                        options.placementClassPrefix + 'left-top ' +
                                        options.placementClassPrefix + 'left-bottom ' +
                                        options.placementClassPrefix + 'right ' +
                                        options.placementClassPrefix + 'right-top ' +
                                        options.placementClassPrefix + 'right-bottom');

                                    var placement = ttPosition.placement.split('-');
                                    tooltip.addClass(placement[0] + ' ' + options.placementClassPrefix + ttPosition.placement);
                                    $position.positionArrow(tooltip, ttPosition.placement);

                                    positionTimeout = null;
                                }, 0, false);
                            }
                        };

                        // Set up the correct scope to allow transclusion later
                        ttScope.origScope = scope;

                        // By default, the tooltip is not open.
                        // TODO add ability to start tooltip opened
                        ttScope.isOpen = false;
                        openedTooltips.add(ttScope, {
                            close: hide
                        });

                        function toggleTooltipBind() {
                            if (!ttScope.isOpen) {
                                showTooltipBind();
                            } else {
                                hideTooltipBind();
                            }
                        }

                        // Show the tooltip with delay if specified, otherwise show it immediately
                        function showTooltipBind() {
                            if (hasEnableExp && !scope.$eval(attrs[prefix + 'Enable'])) {
                                return;
                            }

                            cancelHide();
                            prepareTooltip();
                            element.addClass("tooltip-open");
                            if (ttScope.popupDelay) {
                                // Do nothing if the tooltip was already scheduled to pop-up.
                                // This happens if show is triggered multiple times before any hide is triggered.
                                if (!showTimeout) {
                                    showTimeout = $timeout(show, ttScope.popupDelay, false);
                                }
                            } else {
                                show();
                            }
                        }

                        function hideTooltipBind() {
                            cancelShow();
                            element.removeClass("tooltip-open");
                            if (ttScope.popupCloseDelay) {
                                if (!hideTimeout) {
                                    hideTimeout = $timeout(hide, ttScope.popupCloseDelay, false);
                                }
                            } else {
                                hide();
                            }
                        }

                        // Show the tooltip popup element.
                        function show() {
                            cancelShow();
                            cancelHide();

                            // Don't show empty tooltips.
                            if (!ttScope.content) {
                                return angular.noop;
                            }

                            createTooltip();

                            // And show the tooltip.
                            ttScope.$evalAsync(function() {
                                ttScope.isOpen = true;
                                assignIsOpen(true);
                                positionTooltip();
                            });
                        }

                        function cancelShow() {
                            if (showTimeout) {
                                $timeout.cancel(showTimeout);
                                showTimeout = null;
                            }

                            if (positionTimeout) {
                                $timeout.cancel(positionTimeout);
                                positionTimeout = null;
                            }
                        }

                        // Hide the tooltip popup element.
                        function hide() {
                            if (!ttScope) {
                                return;
                            }

                            // First things first: we don't show it anymore.
                            ttScope.$evalAsync(function() {
                                if (ttScope) {
                                    ttScope.isOpen = false;
                                    assignIsOpen(false);
                                    // And now we remove it from the DOM. However, if we have animation, we
                                    // need to wait for it to expire beforehand.
                                    // FIXME: this is a placeholder for a port of the transitions library.
                                    // The fade transition in TWBS is 150ms.
                                    if (ttScope.animation) {
                                        if (!transitionTimeout) {
                                            transitionTimeout = $timeout(removeTooltip, 150, false);
                                        }
                                    } else {
                                        removeTooltip();
                                    }
                                }
                            });
                        }

                        function cancelHide() {
                            if (hideTimeout) {
                                $timeout.cancel(hideTimeout);
                                hideTimeout = null;
                            }

                            if (transitionTimeout) {
                                $timeout.cancel(transitionTimeout);
                                transitionTimeout = null;
                            }
                        }

                        function createTooltip() {
                            // There can only be one tooltip element per directive shown at once.
                            if (tooltip) {
                                return;
                            }

                            tooltipLinkedScope = ttScope.$new();
                            tooltip = tooltipLinker(tooltipLinkedScope, function(tooltip) {
                                if (appendToBody) {
                                    $document.find('body').append(tooltip);
                                } else {
                                    element.after(tooltip);
                                }
                            });

                            prepObservers();
                        }

                        function removeTooltip() {
                            cancelShow();
                            cancelHide();
                            unregisterObservers();

                            if (tooltip) {
                                tooltip.remove();
                                tooltip = null;
                            }
                            if (tooltipLinkedScope) {
                                tooltipLinkedScope.$destroy();
                                tooltipLinkedScope = null;
                            }
                        }

                        /**
                         * Set the initial scope values. Once
                         * the tooltip is created, the observers
                         * will be added to keep things in sync.
                         */
                        function prepareTooltip() {
                            ttScope.title = attrs[prefix + 'Title'];
                            if (contentParse) {
                                ttScope.content = contentParse(scope);
                            } else {
                                ttScope.content = attrs[ttType];
                            }

                            ttScope.popupClass = attrs[prefix + 'Class'];
                            ttScope.placement = angular.isDefined(attrs[prefix + 'Placement']) ? attrs[prefix + 'Placement'] : options.placement;

                            var delay = parseInt(attrs[prefix + 'PopupDelay'], 10);
                            var closeDelay = parseInt(attrs[prefix + 'PopupCloseDelay'], 10);
                            ttScope.popupDelay = !isNaN(delay) ? delay : options.popupDelay;
                            ttScope.popupCloseDelay = !isNaN(closeDelay) ? closeDelay : options.popupCloseDelay;
                        }

                        function assignIsOpen(isOpen) {
                            if (isOpenParse && angular.isFunction(isOpenParse.assign)) {
                                isOpenParse.assign(scope, isOpen);
                            }
                        }

                        ttScope.contentExp = function() {
                            return ttScope.content;
                        };

                        /**
                         * Observe the relevant attributes.
                         */
                        attrs.$observe('disabled', function(val) {
                            if (val) {
                                cancelShow();
                            }

                            if (val && ttScope.isOpen) {
                                hide();
                            }
                        });

                        if (isOpenParse) {
                            scope.$watch(isOpenParse, function(val) {
                                if (ttScope && !val === ttScope.isOpen) {
                                    toggleTooltipBind();
                                }
                            });
                        }

                        function prepObservers() {
                            observers.length = 0;

                            if (contentParse) {
                                observers.push(
                                    scope.$watch(contentParse, function(val) {
                                        ttScope.content = val;
                                        if (!val && ttScope.isOpen) {
                                            hide();
                                        }
                                    })
                                );

                                observers.push(
                                    tooltipLinkedScope.$watch(function() {
                                        if (!repositionScheduled) {
                                            repositionScheduled = true;
                                            tooltipLinkedScope.$$postDigest(function() {
                                                repositionScheduled = false;
                                                if (ttScope && ttScope.isOpen) {
                                                    positionTooltip();
                                                }
                                            });
                                        }
                                    })
                                );
                            } else {
                                observers.push(
                                    attrs.$observe(ttType, function(val) {
                                        ttScope.content = val;
                                        if (!val && ttScope.isOpen) {
                                            hide();
                                        } else {
                                            positionTooltip();
                                        }
                                    })
                                );
                            }

                            observers.push(
                                attrs.$observe(prefix + 'Title', function(val) {
                                    ttScope.title = val;
                                    if (ttScope.isOpen) {
                                        positionTooltip();
                                    }
                                })
                            );

                            observers.push(
                                attrs.$observe(prefix + 'Placement', function(val) {
                                    ttScope.placement = val ? val : options.placement;
                                    if (ttScope.isOpen) {
                                        positionTooltip();
                                    }
                                })
                            );
                        }

                        function unregisterObservers() {
                            if (observers.length) {
                                angular.forEach(observers, function(observer) {
                                    observer();
                                });
                                observers.length = 0;
                            }
                        }

                        // hide tooltips/popovers for outsideClick trigger
                        function bodyHideTooltipBind(e) {
                            if (!ttScope || !ttScope.isOpen || !tooltip) {
                                return;
                            }
                            // make sure the tooltip/popover link or tool tooltip/popover itself were not clicked
                            if (!element[0].contains(e.target) && !tooltip[0].contains(e.target)) {
                                hideTooltipBind();
                            }
                        }

                        var unregisterTriggers = function() {
                            triggers.show.forEach(function(trigger) {
                                if (trigger === 'outsideClick') {
                                    element.off('click', toggleTooltipBind);
                                } else {
                                    element.off(trigger, showTooltipBind);
                                    element.off(trigger, toggleTooltipBind);
                                }
                            });
                            triggers.hide.forEach(function(trigger) {
                                if (trigger === 'outsideClick') {
                                    $document.off('click', bodyHideTooltipBind);
                                } else {
                                    element.off(trigger, hideTooltipBind);
                                }
                            });
                        };

                        function prepTriggers() {
                            var val = attrs[prefix + 'Trigger'];
                            unregisterTriggers();

                            triggers = getTriggers(val);

                            if (triggers.show !== 'none') {
                                triggers.show.forEach(function(trigger, idx) {
                                    if (trigger === 'outsideClick') {
                                        element.on('click', toggleTooltipBind);
                                        $document.on('click', bodyHideTooltipBind);
                                    } else if (trigger === triggers.hide[idx]) {
                                        element.on(trigger, toggleTooltipBind);
                                    } else if (trigger) {
                                        element.on(trigger, showTooltipBind);
                                        element.on(triggers.hide[idx], hideTooltipBind);
                                    }

                                    element.on('keypress', function(e) {
                                        if (e.which === 27) {
                                            hideTooltipBind();
                                        }
                                    });
                                });
                            }
                        }

                        prepTriggers();

                        var animation = scope.$eval(attrs[prefix + 'Animation']);
                        ttScope.animation = angular.isDefined(animation) ? !!animation : options.animation;

                        var appendToBodyVal;
                        var appendKey = prefix + 'AppendToBody';
                        if (appendKey in attrs && attrs[appendKey] === undefined) {
                            appendToBodyVal = true;
                        } else {
                            appendToBodyVal = scope.$eval(attrs[appendKey]);
                        }

                        appendToBody = angular.isDefined(appendToBodyVal) ? appendToBodyVal : appendToBody;

                        // Make sure tooltip is destroyed and removed.
                        scope.$on('$destroy', function onDestroyTooltip() {
                            unregisterTriggers();
                            removeTooltip();
                            openedTooltips.remove(ttScope);
                            ttScope = null;
                        });
                    };
                }
            };
        };
    }];
})

// This is mostly ngInclude code but with a custom scope
.directive('tuxTooltipTemplateTransclude', [
    '$animate', '$sce', '$compile', '$templateRequest',
function ($animate, $sce, $compile, $templateRequest) {
        return {
            link: function(scope, elem, attrs) {
                var origScope = scope.$eval(attrs.tooltipTemplateTranscludeScope);

                var changeCounter = 0,
                    currentScope,
                    previousElement,
                    currentElement;

                var cleanupLastIncludeContent = function() {
                    if (previousElement) {
                        previousElement.remove();
                        previousElement = null;
                    }

                    if (currentScope) {
                        currentScope.$destroy();
                        currentScope = null;
                    }

                    if (currentElement) {
                        $animate.leave(currentElement).then(function() {
                            previousElement = null;
                        });
                        previousElement = currentElement;
                        currentElement = null;
                    }
                };

                scope.$watch($sce.parseAsResourceUrl(attrs.tuxTooltipTemplateTransclude), function(src) {
                    var thisChangeId = ++changeCounter;

                    if (src) {
                        //set the 2nd param to true to ignore the template request error so that the inner
                        //contents and scope can be cleaned up.
                        $templateRequest(src, true).then(function(response) {
            if (thisChangeId !== changeCounter) { return; }
                            var newScope = origScope.$new();
                            var template = response;

                            var clone = $compile(template)(newScope, function(clone) {
                                cleanupLastIncludeContent();
                                $animate.enter(clone, elem);
                            });

                            currentScope = newScope;
                            currentElement = clone;

                            currentScope.$emit('$includeContentLoaded', src);
                        }, function() {
                            if (thisChangeId === changeCounter) {
                                cleanupLastIncludeContent();
                                scope.$emit('$includeContentError', src);
                            }
                        });
                        scope.$emit('$includeContentRequested', src);
                    } else {
                        cleanupLastIncludeContent();
                    }
                });

                scope.$on('$destroy', cleanupLastIncludeContent);
            }
        };
}])

/**
 * Note that it's intentional that these classes are *not* applied through $animate.
 * They must not be animated as they're expected to be present on the tooltip on
 * initialization.
 */
.directive('tuxTooltipClasses', ['$tuxPosition', function($tuxPosition) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            // need to set the primary position so the
            // arrow has space during position measure.
            // tooltip.positionTooltip()
            if (scope.placement) {
                // // There are no top-left etc... classes
                // // in TWBS, so we need the primary position.
                var position = $tuxPosition.parsePlacement(scope.placement);
                element.addClass(position[0]);
            } else {
                element.addClass('top');
            }

            if (scope.popupClass) {
                element.addClass(scope.popupClass);
            }

            if (scope.animation()) {
                element.addClass(attrs.tooltipAnimationClass);
            }
        }
    };
}])

.directive('tuxTooltipPopup', function() {
    return {
        replace: true,
        scope: { content: '@', placement: '@', popupClass: '@', animation: '&', isOpen: '&' },
        templateUrl: 'tux/template/tooltip/tooltip-popup.html'
    };
})

.directive('tuxTooltip', [ '$tuxTooltip', function($tuxTooltip) {
    return $tuxTooltip('tuxTooltip', 'tooltip', 'mouseenter');
}])

.directive('tuxTooltipTemplatePopup', function() {
    return {
        replace: true,
    scope: { contentExp: '&', placement: '@', popupClass: '@', animation: '&', isOpen: '&',
      originScope: '&' },
        templateUrl: 'tux/template/tooltip/tooltip-template-popup.html'
    };
})

.directive('tuxTooltipTemplate', ['$tuxTooltip', function($tuxTooltip) {
    return $tuxTooltip('tuxTooltipTemplate', 'tooltip', 'mouseenter', {
        useContentExp: true
    });
}])

.directive('tuxTooltipHtmlPopup', function() {
    return {
        replace: true,
        scope: { contentExp: '&', placement: '@', popupClass: '@', animation: '&', isOpen: '&' },
        templateUrl: 'tux/template/tooltip/tooltip-html-popup.html'
    };
})

.directive('tuxTooltipHtml', ['$tuxTooltip', function($tuxTooltip) {
    return $tuxTooltip('tuxTooltipHtml', 'tooltip', 'mouseenter', {
        useContentExp: true
    });
}]);

/**
 * The following features are still outstanding: popup delay, animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, and selector delegatation.
 */
angular.module('ui.tux.popover', ['ui.tux.tooltip'])

.directive('tuxPopoverTemplatePopup', function() {
  return {
    replace: true,
    scope: { title: '@', contentExp: '&', placement: '@', popupClass: '@', animation: '&', isOpen: '&',
      originScope: '&' },
    templateUrl: 'tux/template/popover/popover-template.html'
  };
})

.directive('tuxPopoverTemplate', ['$tuxTooltip', function($tuxTooltip) {
  return $tuxTooltip('tuxPopoverTemplate', 'popover', 'click', {
    useContentExp: true
  });
}])

.directive('tuxPopoverHtmlPopup', function() {
  return {
    replace: true,
    scope: { contentExp: '&', title: '@', placement: '@', popupClass: '@', animation: '&', isOpen: '&' },
    templateUrl: 'tux/template/popover/popover-html.html'
  };
})

.directive('tuxPopoverHtml', ['$tuxTooltip', function($tuxTooltip) {
  return $tuxTooltip('tuxPopoverHtml', 'popover', 'click', {
    useContentExp: true
  });
}])

.directive('tuxPopoverPopup', function() {
  return {
    replace: true,
    scope: { title: '@', content: '@', placement: '@', popupClass: '@', animation: '&', isOpen: '&' },
    templateUrl: 'tux/template/popover/popover.html'
  };
})

.directive('tuxPopover', ['$tuxTooltip', function($tuxTooltip) {
  return $tuxTooltip('tuxPopover', 'popover', 'click');
}]);

angular.module('ui.tux.progressbar', [])

.constant('tuxProgressConfig', {
    animate: true,
    max: 100
})

.controller('TrwdProgressController', ['$scope', '$attrs', 'tuxProgressConfig', function($scope, $attrs, progressConfig) {
    var self = this,
        animate = angular.isDefined($attrs.animate) ? $scope.$parent.$eval($attrs.animate) : progressConfig.animate;

    this.bars = [];
    $scope.max = getMaxOrDefault();

    this.addBar = function(bar, element, attrs) {
        if (!animate) {
            element.css({ 'transition': 'none' });
        }

        this.bars.push(bar);

        bar.max = getMaxOrDefault();
        bar.title = attrs && angular.isDefined(attrs.title) ? attrs.title : 'progressbar';

        bar.$watch('value', function(value) {
            bar.recalculatePercentage();
        });

        bar.recalculatePercentage = function() {
            var totalPercentage = self.bars.reduce(function(total, bar) {
                bar.percent = +(100 * bar.value / bar.max).toFixed(2);
                return total + bar.percent;
            }, 0);

            if (totalPercentage > 100) {
                bar.percent -= totalPercentage - 100;
            }
        };

        bar.$on('$destroy', function() {
            element = null;
            self.removeBar(bar);
        });
    };

    this.removeBar = function(bar) {
        this.bars.splice(this.bars.indexOf(bar), 1);
        this.bars.forEach(function(bar) {
            bar.recalculatePercentage();
        });
    };

    //$attrs.$observe('maxParam', function(maxParam) {
    $scope.$watch('maxParam', function(maxParam) {
        self.bars.forEach(function(bar) {
            bar.max = getMaxOrDefault();
            bar.recalculatePercentage();
        });
    });

    function getMaxOrDefault() {
        return angular.isDefined($scope.maxParam) ? $scope.maxParam : progressConfig.max;
    }
}])

.directive('tuxProgress', function() {
    return {
        replace: true,
        transclude: true,
        controller: 'TrwdProgressController',
        require: 'tuxProgress',
        scope: {
            maxParam: '=?max'
        },
        templateUrl: 'tux/template/progressbar/progress.html'
    };
})

.directive('tuxBar', function() {
    return {
        replace: true,
        transclude: true,
        require: '^tuxProgress',
        scope: {
            value: '=',
            type: '@'
        },
        templateUrl: 'tux/template/progressbar/bar.html',
        link: function(scope, element, attrs, progressCtrl) {
            progressCtrl.addBar(scope, element, attrs);
        }
    };
})

.directive('tuxProgressbar', function() {
    return {
        replace: true,
        transclude: true,
        controller: 'TrwdProgressController',
        scope: {
            value: '=',
            maxParam: '=?max',
            type: '@'
        },
        templateUrl: 'tux/template/progressbar/progressbar.html',
        link: function(scope, element, attrs, progressCtrl) {
            progressCtrl.addBar(scope, angular.element(element.children()[0]), { title: attrs.title });
       }
    };
})

.directive('tuxCircularprogressbar', [
    function () {
        var create = function (elementName) {
          return document.createElementNS('http://www.w3.org/2000/svg', elementName);
        };
        var cthickness = 10;
        var csize = 400;
        var cvalue = 0;
        var cmin = 0;
        var cmax = 100;
        var coffset = 90;
        var ctotal = 0;
        var svg = null;
        var path = null;
        function updatePath () {
          var cpercent =  (cvalue - cmin) / (cmax - cmin);
          path.setAttribute('stroke-dashoffset', ctotal - (cpercent * ctotal));
        };
        function updateSize () {
            var half = Math.floor(csize / 2);
            csize = half * 2;
            svg.style.width = csize + 'px';
            svg.style.height = csize + 'px';
            var quarter = Math.floor(half / 2);
            var halfThickness = Math.ceil(cthickness / 2);
            path.setAttribute('d',
                              'M' + halfThickness + ',' + half
                            + 'A' + quarter + ',' + quarter + ' 0 0,1 ' + (csize - halfThickness) + ',' + half
                            + 'A' + quarter + ',' + quarter + ' 0 0,1 ' + halfThickness + ',' + half);
            ctotal = path.getTotalLength();
            path.setAttribute('stroke-dasharray', ctotal + ' ' + ctotal);
            path.setAttribute('transform', 'rotate(' + coffset + ' ' + half + ' ' + half + ')');

            circle.setAttribute('cx', half);
            circle.setAttribute('cy', half);
            circle.setAttribute('r', half - cthickness/2);
            circle.setAttribute('stroke-width', cthickness);
        }
        return function ($scope, element, attrs) {
            svg = create('svg');
            svg.setAttribute('class', 'progress-circle');
            path = create('path');
            circle = create('circle')
            updateSize();
            updatePath();
            svg.appendChild(circle);
            svg.appendChild(path);
            element.replaceWith(svg);
            $scope.$watch(attrs.ngModel, function (newValue) {
                cvalue = newValue || 0;
                updatePath();
            });
            $scope.$watch(attrs.csize, function (sizeValue) {
                csize = sizeValue || 100;
                svg.style.width = csize + 'px';
                svg.style.height = csize + 'px';
                updateSize();
                updatePath();
            });
            $scope.$watch(attrs.cmin, function (minValue) {
                cmin = minValue || 0;
                updatePath();
            });
            $scope.$watch(attrs.cmax, function (maxValue) {
                cmax = maxValue || 1;
                updatePath();
            });
            $scope.$watch(attrs.cthickness, function (thicknessValue) {
                cthickness = thicknessValue || 10;
                path.setAttribute('stroke-width', cthickness);
                updateSize();
                updatePath();
            });
            $scope.$watch(attrs.coffset, function (offsetValue) {
                coffset = offsetValue || 90;
                updateSize();
            });
        };
    }
]);

angular.module('ui.tux.scrollspy', ['ui.tux.debounce'])
    .directive('tuxScrollspy', ['$window', '$timeout','$tuxDebounce',
        function($window, $timeout, $tuxDebounce) {

            function getWindowScrollTop() {
                if (angular.isDefined($window.pageYOffset)) {
                    return $window.pageYOffset;
                } else {
                    var iebody = (document.compatMode && document.compatMode !== 'BackCompat') ? document.documentElement : document.body;
                    return iebody.scrollTop;
                }
            }

            function getWindowScrollHeight() {
                return ($window.document.body.scrollHeight - $window.innerHeight);
            }

            function getWindowHeight(contentHeight) {
                return (contentHeight ? $window.document.body.clientHeight : $window.innerHeight);
            }
            return {
                require: ['tuxScrollspy', '^?tuxScrollspyTarget'],
                controller: function() {
                    var self = this;
                    this.$element = undefined;
                    this.$target = undefined;
                    this.hasTarget = false;
                    this.hasSubScrollSpy = false;
                    this.hit = undefined;
                    this.edges = {
                        top: {
                            top: true
                        }
                    };
                    this.hitEdge = undefined;

                    this.default_edge = {
                        absolute: false,
                        percent: false,
                        shift: 0
                    };
                    this.posCache = {};

                    this.ready = false;
                    this.enabled = true;

                    this.scrollpointClass = 'active';
                    this.actions = undefined;

                    function parseScrollpoint(scrollpoint) {
                        var def = {
                            shift: 0,
                            absolute: false,
                            percent: false
                        };
                        if (scrollpoint && angular.isString(scrollpoint)) {
                            def.percent = (scrollpoint.charAt(scrollpoint.length - 1) == '%');
                            if (def.percent) {
                                scrollpoint = scrollpoint.substr(0, scrollpoint.length - 1);
                            }
                            if (scrollpoint.charAt(0) === '-') {
                                def.absolute = def.percent;
                                def.shift = -parseFloat(scrollpoint.substr(1));
                            } else if (scrollpoint.charAt(0) === '+') {
                                def.absolute = def.percent;
                                def.shift = parseFloat(scrollpoint.substr(1));
                            } else {
                                var parsed = parseFloat(scrollpoint);
                                if (!isNaN(parsed) && isFinite(parsed)) {
                                    def.absolute = true;
                                    def.shift = parsed;
                                }
                            }
                        } else if (angular.isNumber(scrollpoint)) {
                            return parseScrollpoint(scrollpoint.toString());
                        }
                        return def;
                    }

                    this.addEdge = function(view_edge, element_edge) {
                        if (angular.isString(view_edge)) {
                            if (angular.isUndefined(element_edge)) {
                                element_edge = true;
                            }
                            if (view_edge == 'view') {
                                // view is a shorthand for matching top of element with bottom of view, and vice versa
                                this.addEdge('top', 'bottom');
                                this.addEdge('bottom', 'top');
                            } else {
                                var edge, parsedEdge;
                                if (angular.isObject(element_edge)) {
                                    // the view_edge interacts with more than one element_edge
                                    for (edge in element_edge) {
                                        // parse each element_edge definition (allows each element_edge to have its own scrollpoint with view_edge)
                                        if (element_edge[edge] === true) {
                                            element_edge[edge] = true; // use the ui-scrollpoint default
                                        } else {
                                            element_edge[edge] = parseScrollpoint(element_edge[edge]);
                                        }
                                    }
                                } else if (element_edge == 'top' || element_edge == 'bottom') {
                                    // simple top or bottom of element with 0 shift
                                    edge = element_edge;
                                    parsedEdge = parseScrollpoint();
                                    element_edge = {};
                                    element_edge[edge] = parsedEdge;
                                } else if (element_edge === true) {
                                    element_edge = {};
                                    element_edge[view_edge] = true; // use the ui-scrollpoint default
                                } else {
                                    // element_edge matches view_edge (ie. top of element interacts with top of view)
                                    parsedEdge = parseScrollpoint(element_edge);
                                    element_edge = {};
                                    element_edge[view_edge] = parsedEdge;
                                }
                                // element_edge has been parsed
                                this.edges[view_edge] = element_edge;
                            }
                        }
                    };

                    this.addAction = function(action) {
                        if (action && angular.isFunction(action)) {
                            if (angular.isUndefined(this.actions)) {
                                this.actions = [action];
                            } else if (this.actions.indexOf(action) == -1) {
                                this.actions.push(action);
                            }
                        }
                    };

                    this.setScrollpoint = function(scrollpoint) {
                        this.default_edge = parseScrollpoint(scrollpoint);
                    };

                    this.setClass = function(_class) {
                        if (!_class) {
                            _class = 'active';
                        }
                        this.scrollpointClass = _class;
                    };

                    this.setEdges = function(edges) {
                        // normalize tuxScrollspyEdge into edges structure
                        //  edges = { ['screen_edge'] : ['element_edge' | true] }
                        if (angular.isString(edges)) {
                            this.edges = {};
                            this.addEdge(edges);
                        } else if (angular.isArray(edges)) {
                            this.edges = {};
                            for (var i = 0; i < edges.length; i++) {
                                this.addEdge(edges[i]);
                            }
                        } else if (angular.isObject(edges)) {
                            this.edges = {};
                            for (var edge in edges) {
                                this.addEdge(edge, edges[edge]);
                            }
                        } else {
                            // default
                            this.edges = {};
                            this.addEdge('top');
                        }
                    };

                    this.setElement = function(element) {
                        this.$element = element;
                    };
                    this.setElementToActive = function(element) {
                        this.$elementToActive = element;
                    }
                    this.setTarget = function(target) {
                        if (target) {
                            this.$target = target;
                            this.hasTarget = true;
                        } else {
                            this.$target = angular.element($window);
                            this.hasTarget = false;
                        }
                    };

                    this.getEdge = function(scroll_edge, element_edge) {
                        if (scroll_edge && element_edge) {
                            if (this.edges[scroll_edge] && this.edges[scroll_edge][element_edge] && this.edges[scroll_edge][element_edge] !== true) {
                                return this.edges[scroll_edge][element_edge];
                            }
                        } else if (scroll_edge && !element_edge) {
                            if (this.edges[scroll_edge]) {
                                return this.edges[scroll_edge];
                            }
                            return;
                        }
                        return this.default_edge;
                    };

                    this.checkOffset = function(scroll_edge, elem_edge, edge) {
                        var offset;
                        if (!edge) {
                            edge = this.default_edge;
                        }

                        var scroll_bottom = (scroll_edge == 'bottom');
                        var elem_top = (elem_edge == 'top');
                        var elem_bottom = (elem_edge == 'bottom');

                        var scrollOffset = this.getScrollOffset();
                        if (scroll_bottom) {
                            scrollOffset += this.getTargetHeight();
                        }

                        var checkOffset;
                        if (edge.absolute) {
                            if (edge.percent) {
                                checkOffset = edge.shift / 100.0 * this.getTargetScrollHeight();
                            } else {
                                checkOffset = edge.shift;
                            }
                            if (scroll_bottom) {
                                checkOffset = this.getTargetContentHeight() - checkOffset;
                                if (this.hasTarget) {
                                    checkOffset += this.getTargetHeight();
                                }
                            }
                        } else {
                            if (elem_top) {
                                checkOffset = this.getElementTop();
                            } else if (elem_bottom) {
                                checkOffset = this.getElementBottom();
                            }
                            checkOffset += edge.shift;
                        }

                        offset = (scrollOffset - checkOffset);
                        if (scroll_bottom) {
                            offset *= -1.0;
                        }
                        return offset;
                    };

                    this.scrollEdgeHit = function() {
                        var offset, edgeHit, absEdges, absEdgeHits;
                        var edge, scroll_edge, element_edge;
                        absEdges = 0;
                        absEdgeHits = {};
                        for (scroll_edge in this.edges) {
                            for (element_edge in this.edges[scroll_edge]) {
                                edge = this.getEdge(scroll_edge, element_edge);
                                var edge_offset = this.checkOffset(scroll_edge, element_edge, edge);

                                if (edge.absolute) {
                                    if (angular.isUndefined(absEdgeHits)) {
                                        absEdgeHits = {};
                                    }
                                    if (angular.isUndefined(absEdgeHits[scroll_edge])) {
                                        absEdgeHits[scroll_edge] = {};
                                    }
                                    absEdgeHits[scroll_edge][element_edge] = edge_offset;
                                    absEdges++;
                                } else if (angular.isUndefined(offset) || edge_offset > offset) {
                                    offset = edge_offset;
                                    edgeHit = {
                                        scroll: scroll_edge,
                                        element: element_edge
                                    };
                                }
                            }
                        }
                        // special handling for absolute edges when no relative edges hit
                        if (absEdges && !edgeHit) {
                            // in case there is more than one absolute edge, they all should pass to count a hit (allows for creating ranges where the scrollpoint is active)
                            var allPass = true;
                            offset = undefined;
                            for (scroll_edge in absEdgeHits) {
                                for (element_edge in absEdgeHits[scroll_edge]) {
                                    if (absEdges > 1 && absEdgeHits[scroll_edge][element_edge] < 0) {
                                        allPass = false;
                                    } else if (angular.isUndefined(offset) || absEdgeHits[scroll_edge][element_edge] > offset) {
                                        offset = absEdgeHits[scroll_edge][element_edge];
                                        edgeHit = {
                                            scroll: scroll_edge,
                                            element: element_edge
                                        };
                                    }
                                }
                            }
                            if (!allPass) {
                                edgeHit = undefined;
                                offset = undefined;
                            }
                        }
                        this.hitEdge = ((offset >= 0) ? edgeHit : undefined);
                        return offset;
                    };

                    this.getScrollOffset = function() {
                        return this.hasTarget ? this.$target[0].scrollTop : getWindowScrollTop();
                    };
                    this.getTargetHeight = function() {
                        return this.hasTarget ? this.$target[0].offsetHeight : getWindowHeight();
                    };
                    this.getTargetContentHeight = function() {
                        return (this.hasTarget ? (this.$target[0].scrollHeight - this.$target[0].clientHeight) : getWindowHeight(true));
                    };
                    this.getTargetScrollHeight = function() {
                        return (this.hasTarget ? (this.$target[0].scrollHeight - this.$target[0].clientHeight) : getWindowScrollHeight());
                    };
                    this.sethasSubScrollSpy = function(bool) {
                        this.hasSubScrollSpy = bool;
                    }
                    this.setsideMenu = function(element) {
                        this.sideMenu = element;
                    }
                    this.getElementTop = function(current) {
                        if (!current && angular.isDefined(this.posCache.top)) {
                            return this.posCache.top;
                        }
                        var bounds = this.$element[0].getBoundingClientRect();
                        var top = bounds.top + this.getScrollOffset();

                        if (this.hasTarget) {
                            var targetBounds = this.$target[0].getBoundingClientRect();
                            top -= targetBounds.top;
                        }

                        return top;
                    };
                    this.getElementBottom = function(current) {
                        return this.getElementTop(current) + this.$element[0].offsetHeight;
                    };

                    this.cachePosition = function() {
                        this.posCache.top = this.getElementTop(true);
                    };

                    this.onScroll = function() {
                        if (!self.ready || !self.enabled) {
                            return;
                        }

                        var edgeHit = self.scrollEdgeHit();
                        if (edgeHit >= -2 && edgeHit <= self.$element[0].offsetHeight - 2) {
                            // SCROLLPOINT is OUT by edgeHit pixels
                            if (!self.hit) {
                                // add the scrollpoint class
                                if (!self.$elementToActive.hasClass(self.scrollpointClass)) {
                                    self.$elementToActive.addClass(self.scrollpointClass);
                                    if (self.hasSubScrollSpy) {
                                        self.sideMenu.addClass('show');
                                    }
                                }
                                fireActions = true;
                                self.hit = true;
                            }
                        } else {
                            // SCROLLPOINT is IN by edgeHit pixels
                            if (self.hit || angular.isUndefined(self.hit)) {
                                // remove the scrollpoint class
                                if (self.$elementToActive.hasClass(self.scrollpointClass)) {
                                    self.$elementToActive.removeClass(self.scrollpointClass);
                                    if (self.hasSubScrollSpy) {
                                        self.sideMenu.removeClass('show');
                                    }
                                }
                                fireActions = true;
                                self.hit = false;
                            }
                            self.cachePosition();
                        }

                        if (fireActions) {
                            // fire the actions
                            if (self.actions) {
                                for (var i = 0; i < self.actions.length; i++) {
                                    self.actions[i](edgeHit, self.$element, (self.hitEdge ? self.hitEdge.scroll : undefined), (self.hitEdge ? self.hitEdge.element : undefined));
                                }
                            }
                        }
                    };

                    this.reset = function() {
                        $timeout(function() {
                            self.$elementToActive.removeClass(self.scrollpointClass);
                            self.hit = undefined;
                            self.hitEdge = undefined;
                            self.cachePosition();
                            self.onScroll();
                        });
                    };

                    angular.element($window).bind('resize', self.reset)
                },
                link: function(scope, elm, attrs, Ctrl) {
                    var tuxScrollspy = Ctrl[0];
                    var tuxScrollspyTarget = Ctrl[1];
                    var absoluteParent = false;
                    if (attrs.hasSubScrollspy == "true") {
                        tuxScrollspy.sethasSubScrollSpy(true);
                        var SideMenu = angular.element(elm[0].getElementsByClassName('side-affix-ul'));
                        tuxScrollspy.setsideMenu(SideMenu);
                    }
                    tuxScrollspy.setElement(elm);
                    var activeTarget = angular.element(document.querySelector(attrs.targetActive));
                    tuxScrollspy.setElementToActive(activeTarget);
                    tuxScrollspy.setTarget(tuxScrollspyTarget ? tuxScrollspyTarget.$element : null);



                    attrs.$observe('tuxScrollspy', function(scrollpoint) {
                        tuxScrollspy.setScrollpoint(scrollpoint);
                        tuxScrollspy.reset();
                    });


                    attrs.$observe('tuxScrollspyEnabled', function(scrollpointEnabled) {
                        scrollpointEnabled = scope.$eval(scrollpointEnabled);
                        if (scrollpointEnabled != tuxScrollspy.enabled) {
                            tuxScrollspy.reset();
                        }
                        tuxScrollspy.enabled = scrollpointEnabled;
                    });


                    attrs.$observe('tuxScrollspyAbsolute', function(scrollpointAbsolute) {
                        scrollpointAbsolute = scope.$eval(scrollpointAbsolute);
                        if (scrollpointAbsolute != absoluteParent) {
                            if (tuxScrollspy.$target) {
                                tuxScrollspy.$target.off('scroll', tuxScrollspy.onScroll);
                            }
                            tuxScrollspy.setTarget((!scrollpointAbsolute && tuxScrollspyTarget) ? tuxScrollspyTarget.$element : null);
                            resetTarget();
                            tuxScrollspy.reset();
                        }
                        absoluteParent = scrollpointAbsolute;
                    });

                    // ui-scrollpoint-action function name to use as scrollpoint callback
                    attrs.$observe('tuxScrollspyAction', function(tuxScrollspyAction) {
                        var action = scope.$eval(tuxScrollspyAction);
                        if (action && angular.isFunction(action)) {
                            tuxScrollspy.addAction(action);
                        }
                    });

                    // ui-scrollpoint-class class to add instead of ui-scrollpoint
                    attrs.$observe('tuxScrollspyClass', function(scrollpointClass) {
                        elm.removeClass(tuxScrollspy.scrollpointClass);
                        tuxScrollspy.setClass(scrollpointClass);
                        tuxScrollspy.reset();
                    });

                    // ui-scrollpoint-edge allows configuring which element and scroll edges match
                    attrs.$observe('tuxScrollspyEdge', function(scrollpointEdge) {
                        if (scrollpointEdge) {
                            // allowed un-$eval'ed values
                            var allowedKeywords = ['top', 'bottom', 'view'];
                            if (allowedKeywords.indexOf(scrollpointEdge) == -1) {
                                // $eval any other values
                                scrollpointEdge = scope.$eval(scrollpointEdge);
                            }

                            // assign it in controller
                            tuxScrollspy.setEdges(scrollpointEdge);
                            tuxScrollspy.reset();
                        }
                    });
                    var onScrollevt = $tuxDebounce(tuxScrollspy.onScroll,10);
                    function resetTarget() {
                        tuxScrollspy.$target.on('scroll', onScrollevt);
                        scope.$on('$destroy', function() {
                            tuxScrollspy.$target.off('scroll', onScrollevt);
                        });
                    }
                    resetTarget();
                    elm.ready(function() {
                        tuxScrollspy.ready = true;
                        onScrollevt();
                    });
                    scope.$on('scrollpointShouldReset', tuxScrollspy.reset);
                }
            };
        }
    ])
    .directive('tuxScrollspyTarget', [
        function() {
            return {
                controller: ['$element',
                    function($element) {
                        this.$element = $element;
                    }
                ]
            };
        }
    ]);
angular.module('ui.tux.slider', [])
    .directive('tuxSlider', function($timeout) {
        'use strict';
        var angularize, bindHtml, gap, halfWidth, hide, inputEvents, module, offset, offsetLeft, pixelize, qualifiedDirectiveDefinition, roundStep, show, sliderDirective, width;

        angularize = function(element) {
            return angular.element(element);
        };

        pixelize = function(position) {
            return "" + position + "px";
        };

        hide = function(element) {
            return element.css({
                opacity: 0
            });
        };

        show = function(element) {
            return element.css({
                opacity: 1
            });
        };

        offset = function(element, position) {
            return element.css({
                left: position
            });
        };

        halfWidth = function(element) {
            return element[0].offsetWidth / 2;
        };

        offsetLeft = function(element) {
            return element[0].offsetLeft;
        };

        width = function(element) {
            return element[0].offsetWidth;
        };

        gap = function(element1, element2) {
            return offsetLeft(element2) - offsetLeft(element1) - width(element1);
        };

        bindHtml = function(element, html) {
            return element.attr('ng-bind-html', html);
        };

        roundStep = function(value, precision, step, floor) {
            var decimals, remainder, roundedValue, steppedValue;

            if (floor == null) {
                floor = 0;
            }
            if (step == null) {
                step = 1 / Math.pow(10, precision);
            }
            remainder = (value - floor) % step;
            steppedValue = remainder > (step / 2) ? value + step - remainder : value - remainder;
            decimals = Math.pow(10, precision);
            roundedValue = steppedValue * decimals / decimals;
            return roundedValue.toFixed(precision);
        };

        inputEvents = {
            mouse: {
                start: 'mousedown',
                move: 'mousemove',
                end: 'mouseup'
            },
            touch: {
                start: 'touchstart',
                move: 'touchmove',
                end: 'touchend'
            }
        };
        return {
            restrict: 'EA',
            scope: {
                floor: '@',
                ceiling: '@',
                step: '@',
                precision: '@',
                ngModel: '=?',
                tuxSliderLow: '=?',
                tuxSliderHigh: '=?',
                translate: '&',
                'simpleSliderRange': '@'
            },
            templateUrl: function(element, attrs) {
                return attrs.templateUrl || 'tux/template/slider/slider.html';
            },
            compile: function(element, attributes) {
                var ceilBub, cmbBub, e, flrBub, fullBar, highBub, lowBub, maxPtr, minPtr, range, refHigh, refLow, selBar, selBub, watchables, _i, _len, _ref, _ref1, simpleSliderRange;

                if (attributes.translate) {
                    attributes.$set('translate', "" + attributes.translate + "(value)");
                }
                range = (attributes.ngModel == null) && ((attributes.tuxSliderLow != null) && (attributes.tuxSliderHigh != null));
                simpleSliderRange = !range && attributes.simpleSliderRange != null;
                _ref = (function() {
                    var _i, _len, _ref, _results;

                    _ref = element.children();
                    _results = [];
                    _len = _ref.length
                    for (_i = 0; _i < _len; _i++) {
                        e = _ref[_i];
                        _results.push(angularize(e));
                    }
                    return _results;
                })(),
                fullBar = _ref[0], selBar = _ref[1], minPtr = _ref[2], maxPtr = _ref[3], selBub = _ref[4], flrBub = _ref[5], ceilBub = _ref[6], lowBub = _ref[7], highBub = _ref[8], cmbBub = _ref[9];
                refLow = range ? 'tuxSliderLow' : 'ngModel';
                if (simpleSliderRange) {
                    range = true;
                    refLow = 'tuxSliderLow';
                }
                refHigh = 'tuxSliderHigh';
                bindHtml(selBub, "'Range: ' + translate({value: diff})");
                bindHtml(lowBub, "translate({value: " + refLow + "})");
                bindHtml(highBub, "translate({value: " + refHigh + "})");
                bindHtml(cmbBub, "translate({value: " + refLow + "}) + ' - ' + translate({value: " + refHigh + "})");
                if (!range && !simpleSliderRange) {
                    _ref1 = [selBar, maxPtr, selBub, highBub, cmbBub];
                    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                        element = _ref1[_i];
                        element.remove();
                    }
                }
                watchables = [refLow, 'floor', 'ceiling'];
                if (range) {
                    watchables.push(refHigh);
                }
                return {
                    post: function(scope, element, attributes) {
                        if (range || simpleSliderRange) {
                            _ref = (function() {
                                var _i, _len, _ref, _results;

                                _ref = element.children();
                                _results = [];
                                _len = _ref.length
                                for (_i = 0; _i < _len; _i++) {
                                    e = _ref[_i];
                                    _results.push(angularize(e));
                                }
                                return _results;
                            })(),
                            fullBar = _ref[0], selBar = _ref[1], minPtr = _ref[2], maxPtr = _ref[3], selBub = _ref[4], flrBub = _ref[5], ceilBub = _ref[6], lowBub = _ref[7], highBub = _ref[8], cmbBub = _ref[9];
                            if (simpleSliderRange) {
                                minPtr.remove();
                            }
                        }
                        else{
                            var tmp = element.children();
                            fullBar = angular.element(tmp[0]);
                            minPtr = angular.element(tmp[1]);                            
                            flrBub = angular.element(tmp[2]);
                            ceilBub = angular.element(tmp[3]);                                                        
                            lowBub = angular.element(tmp[4]);
                        }
                        var barWidth, boundToInputs, dimensions, maxOffset, maxValue, minOffset, minValue, ngDocument, offsetRange, pointerHalfWidth, updateDOM, valueRange, w, _j, _len1;
                        if (angular.isDefined(scope.simpleSliderRange)) {
                            scope.tuxSliderLow = scope.floor;
                            if (!angular.isDefined(scope.ngModel)) {
                                scope.tuxSliderHigh = (scope.ceiling - scope.floor) / 2;
                            } else {
                                scope.tuxSliderHigh = scope.ngModel;
                            }
                        }
                        boundToInputs = false;
                        ngDocument = angularize(document);
                        if (!attributes.translate) {
                            scope.translate = function(value) {
                                return value.value;
                            };
                        }
                        pointerHalfWidth = barWidth = minOffset = maxOffset = minValue = maxValue = valueRange = offsetRange = void 0;
                        dimensions = function() {
                            var value, _j, _len1, _ref2, _ref3;

                            if ((_ref2 = scope.precision) == null) {
                                scope.precision = 0;
                            }
                            if ((_ref3 = scope.step) == null) {
                                scope.step = 1;
                            }
                            for (_j = 0, _len1 = watchables.length; _j < _len1; _j++) {
                                value = watchables[_j];
                                scope[value] = roundStep(parseFloat(scope[value]), parseInt(scope.precision), parseFloat(scope.step), parseFloat(scope.floor));
                            }
                            scope.diff = roundStep(scope[refHigh] - scope[refLow], parseInt(scope.precision), parseFloat(scope.step), parseFloat(scope.floor));
                            pointerHalfWidth = halfWidth(minPtr);
                            barWidth = width(fullBar);
                            minOffset = 0;
                            maxOffset = barWidth - width(minPtr);
                            minValue = parseFloat(attributes.floor);
                            maxValue = parseFloat(attributes.ceiling);
                            valueRange = maxValue - minValue;
                            return offsetRange = maxOffset - minOffset;
                        };
                        updateDOM = function() {
                            var adjustBubbles, bindToInputEvents, fitToBar, percentOffset, percentToOffset, percentValue, setBindings, setPointers;

                            dimensions();
                            percentOffset = function(offset) {
                                return ((offset - minOffset) / offsetRange) * 100;
                            };
                            percentValue = function(value) {
                                return ((value - minValue) / valueRange) * 100;
                            };
                            percentToOffset = function(percent) {
                                return pixelize(percent * offsetRange / 100);
                            };
                            fitToBar = function(element) {
                                return offset(element, pixelize(Math.min(Math.max(0, offsetLeft(element)), barWidth - width(element))));
                            };
                            setPointers = function() {
                                var newHighValue, newLowValue;

                                offset(ceilBub, pixelize(barWidth - width(ceilBub)));
                                newLowValue = percentValue(scope[refLow]);
                                offset(minPtr, percentToOffset(newLowValue));
                                offset(lowBub, pixelize(offsetLeft(minPtr) - (halfWidth(lowBub)) + pointerHalfWidth));
                                if (range) {
                                    newHighValue = percentValue(scope[refHigh]);
                                    offset(maxPtr, percentToOffset(newHighValue));
                                    offset(highBub, pixelize(offsetLeft(maxPtr) - (halfWidth(highBub)) + pointerHalfWidth));
                                    offset(selBar, pixelize(offsetLeft(minPtr) + pointerHalfWidth));
                                    selBar.css({
                                        width: percentToOffset(newHighValue - newLowValue)
                                    });
                                    offset(selBub, pixelize(offsetLeft(selBar) + halfWidth(selBar) - halfWidth(selBub)));
                                    return offset(cmbBub, pixelize(offsetLeft(selBar) + halfWidth(selBar) - halfWidth(cmbBub)));
                                }
                            };
                            adjustBubbles = function() {
                                var bubToAdjust;

                                fitToBar(lowBub);
                                bubToAdjust = highBub;
                                if (range) {
                                    fitToBar(highBub);
                                    fitToBar(selBub);
                                    if (gap(lowBub, highBub) < 10) {
                                        hide(lowBub);
                                        hide(highBub);
                                        fitToBar(cmbBub);
                                        show(cmbBub);
                                        bubToAdjust = cmbBub;
                                    } else {
                                        show(lowBub);
                                        show(highBub);
                                        hide(cmbBub);
                                        bubToAdjust = highBub;
                                    }
                                }
                                if (gap(flrBub, lowBub) < 5) {
                                    hide(flrBub);
                                } else {
                                    if (range) {
                                        if (gap(flrBub, bubToAdjust) < 5) {
                                            hide(flrBub);
                                        } else {
                                            show(flrBub);
                                        }
                                    } else {
                                        show(flrBub);
                                    }
                                }
                                if (gap(lowBub, ceilBub) < 5) {
                                    return hide(ceilBub);
                                } else {
                                    if (range) {
                                        if (gap(bubToAdjust, ceilBub) < 5) {
                                            return hide(ceilBub);
                                        } else {
                                            return show(ceilBub);
                                        }
                                    } else {
                                        return show(ceilBub);
                                    }
                                }
                            };
                            bindToInputEvents = function(pointer, ref, events) {
                                var onEnd, onMove, onStart;

                                onEnd = function() {
                                    pointer.removeClass('active');
                                    ngDocument.unbind(events.move);
                                    return ngDocument.unbind(events.end);
                                };
                                onMove = function(event) {
                                    var eventX, newOffset, newPercent, newValue;

                                    eventX = event.clientX || event.touches[0].clientX;
                                    newOffset = eventX - element[0].getBoundingClientRect().left - pointerHalfWidth;
                                    newOffset = Math.max(Math.min(newOffset, maxOffset), minOffset);
                                    newPercent = percentOffset(newOffset);
                                    newValue = minValue + (valueRange * newPercent / 100.0);
                                    if (range) {
                                        if (ref === refLow) {
                                            if (newValue > scope[refHigh]) {
                                                ref = refHigh;
                                                minPtr.removeClass('active');
                                                maxPtr.addClass('active');
                                            }
                                        } else {
                                            if (newValue < scope[refLow]) {
                                                ref = refLow;
                                                maxPtr.removeClass('active');
                                                minPtr.addClass('active');
                                            }
                                        }
                                    }
                                    newValue = roundStep(newValue, parseInt(scope.precision), parseFloat(scope.step), parseFloat(scope.floor));
                                    scope[ref] = newValue;
                                    return scope.$apply();
                                };
                                onStart = function(event) {
                                    pointer.addClass('active');
                                    dimensions();
                                    event.stopPropagation();
                                    event.preventDefault();
                                    ngDocument.bind(events.move, onMove);
                                    return ngDocument.bind(events.end, onEnd);
                                };                                
                                return pointer.bind(events.start, onStart);
                            };
                            setBindings = function() {
                                var bind, inputMethod, _j, _len1, _ref2, _results;

                                boundToInputs = true;
                                bind = function(method) {                                   
                                    bindToInputEvents(minPtr, refLow, inputEvents[method]);
                                    return bindToInputEvents(maxPtr, refHigh, inputEvents[method]);
                                };
                                _ref2 = ['touch', 'mouse'];
                                _results = [];
                                for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                                    inputMethod = _ref2[_j];
                                    _results.push(bind(inputMethod));
                                }
                                return _results;
                            };
                            setPointers();
                            adjustBubbles();
                            if (!boundToInputs) {
                                return setBindings();
                            }
                        };
                        $timeout(updateDOM, 1000);
                        for (_j = 0, _len1 = watchables.length; _j < _len1; _j++) {
                            w = watchables[_j];
                            scope.$watch(w, updateDOM);
                        }
                        return window.addEventListener("resize", updateDOM);
                    }
                };
            }
        };
    });
angular.module('ui.tux.submitFeedback', ['ui.tux.multiselect','ui.tux.modal','ui.tux.stackedMap']);


angular.module('ui.tux.tabs', [])

.controller('TrwdTabsetController', ['$scope', function($scope) {
    var ctrl = this,
        tabs = ctrl.tabs = $scope.tabs = [];

    ctrl.select = function(selectedTab) {
        angular.forEach(tabs, function(tab) {
            if (tab.active && tab !== selectedTab) {
                tab.active = false;
                tab.onDeselect();
                selectedTab.selectCalled = false;
            }
        });
        selectedTab.active = true;
        // only call select if it has not already been called
        if (!selectedTab.selectCalled) {
            selectedTab.onSelect();
            selectedTab.selectCalled = true;
        }
    };

    ctrl.addTab = function addTab(tab) {
        tabs.push(tab);
        // we can't run the select function on the first tab
        // since that would select it twice
        if (tabs.length === 1 && tab.active !== false) {
            tab.active = true;
        } else if (tab.active) {
            ctrl.select(tab);
        } else {
            tab.active = false;
        }
    };

    ctrl.removeTab = function removeTab(tab) {
        var index = tabs.indexOf(tab);
        //Select a new tab if the tab to be removed is selected and not destroyed
        if (tab.active && tabs.length > 1 && !destroyed) {
            //If this is the last tab, select the previous tab. else, the next tab.
            var newActiveIndex = index === tabs.length - 1 ? index - 1 : index + 1;
            ctrl.select(tabs[newActiveIndex]);
        }
        tabs.splice(index, 1);
    };

    var destroyed;
    $scope.$on('$destroy', function() {
        destroyed = true;
    });
}])

.directive('tuxTabset', function() {
    return {
        transclude: true,
        replace: true,
        scope: {
            type: '@'
        },
        controller: 'TrwdTabsetController',
        templateUrl: 'tux/template/tabs/tabset.html',
        link: function(scope, element, attrs, TabsetController) {
            scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
            scope.justified = angular.isDefined(attrs.justified) ? scope.$parent.$eval(attrs.justified) : false;
            scope.selectedGroup = TabsetController.selectedGroup;
            scope.$on('createEvt', function(event, data) {
                scope.selectedGroup = data;
            });
            
            scope.toggletabs = function() {
              angular.element(element[0].querySelector('.nav-tabs')).toggleClass('open');
            };
        }
    };
})

.directive('tuxTab', ['$parse', function($parse) {
    return {
        require: '^tuxTabset',
        replace: true,
        templateUrl: 'tux/template/tabs/tab.html',
        transclude: true,
        scope: {
            active: '=?',
            heading: '@',
            onSelect: '&select', //This callback is called in contentHeadingTransclude
            //once it inserts the tab's content into the dom
            onDeselect: '&deselect'
        },
        controller: function() {
            //Empty controller so other directives can require being 'under' a tab
        },
        controllerAs: 'tab',
        link: function(scope, elm, attrs, tabsetCtrl, transclude) {
            scope.$watch('active', function(active) {
                if (active) {
                    tabsetCtrl.select(scope);
                    scope.$emit('createEvt', attrs.heading);
                }
            });

            scope.disabled = false;
            if (attrs.disable) {
                scope.$parent.$watch($parse(attrs.disable), function(value) {
                    scope.disabled = !!value;
                });
            }

            scope.select = function() {
                if (!scope.disabled) {
                    scope.active = true;
                    elm.parent('.nav-tabs').removeClass('open');
                }
            };

            tabsetCtrl.addTab(scope);
            scope.$on('$destroy', function() {
                tabsetCtrl.removeTab(scope);
            });

            //We need to transclude later, once the content container is ready.
            //when this link happens, we're inside a tab heading.
            scope.$transcludeFn = transclude;
        }
    };
}])

.directive('tuxTabHeadingTransclude', function() {
    return {
        restrict: 'A',
        require: '^tuxTab',
        link: function(scope, elm) {
            scope.$watch('headingElement', function updateHeadingElement(heading) {
                if (heading) {
                    elm.html('');
                    elm.append(heading);
                }
            });
        }
    };
})

.directive('tuxTabContentTransclude', function() {
    return {
        restrict: 'A',
        require: '^tuxTabset',
        link: function(scope, elm, attrs) {
            var tab = scope.$eval(attrs.tuxTabContentTransclude);

            //Now our tab is ready to be transcluded: both the tab heading area
            //and the tab content area are loaded.  Transclude 'em both.
            tab.$transcludeFn(tab.$parent, function(contents) {
                angular.forEach(contents, function(node) {
                    if (isTabHeading(node)) {
                        //Let tabHeadingTransclude know.
                        tab.headingElement = node;
                    } else {
                        elm.append(node);
                    }
                });
            });
        }
    };

    function isTabHeading(node) {
        return node.tagName && (
            node.hasAttribute('tux-tab-heading') ||
            node.hasAttribute('data-tux-tab-heading') ||
            node.hasAttribute('x-tux-tab-heading') ||
            node.tagName.toLowerCase() === 'tux-tab-heading' ||
            node.tagName.toLowerCase() === 'data-tux-tab-heading' ||
            node.tagName.toLowerCase() === 'x-tux-tab-heading'
        );
    }
});

angular.module('ui.tux.textEditor', [])
    .run(['$q', '$timeout', function($q, $timeout) {
        var $defer = $q.defer();

        if (typeof CKEDITOR == 'undefined') {
            return;
        }
        CKEDITOR.disableAutoInline = true;

        function checkLoaded() {
            if (CKEDITOR.status === 'loaded') {
                $defer.resolve();
            } else {
                checkLoaded();
            }
        }

        CKEDITOR.on('loaded', checkLoaded);
        $timeout(checkLoaded, 100);
    }])
    .directive('tuxTextEditor', ['$timeout', '$q', function($timeout, $q) {

        return {
            require: ['ngModel', '^?form'],
            priority: 10,
            link: function(scope, element, attrs, ctrls) {
                var ngModel = ctrls[0],
                    form = ctrls[1] || null,
                    EMPTY_HTML = '<p></p>',
                    isTextarea = element[0].tagName.toLowerCase() === 'textarea',
                    data = [],
                    isReady = false;
                $defer = $q.defer();


                if (!isTextarea) {
                    element.attr('contenteditable', true);
                }

                ngModel.$render = function() {
                        data.push(ngModel.$viewValue);
                        if (isReady) {
                            onUpdateModelData();
                        }
                    };

                var onLoad = function() {
                    var options = {
                        "removeStatusBar": true,
                        "width": '100%',
                        "height": '200px',
                        "toolbar": [
                            ['Format'],
                            ['FontSize', 'TextColor'],
                            ['Bold', 'Italic', 'Underline'],
                            ['NumberedList', 'BulletedList'],
                            ['Subscript', 'Superscript'],
                            ['JustifyLeft', 'JustifyRight', 'JustifyBlock'],
                            ['Outdent', 'Indent'],
                            ['Strike'],
                            ['Link', 'Unlink'],
                            ['RemoveFormat'],
                            ['Source']
                        ],
                        "removePlugins": 'elementspath',
                        "resize_enabled": false
                    };
                    options = angular.extend(options, scope[attrs.editorOptions]);

                    var instance = CKEDITOR.replace(element[0], options),
                        configLoaderDef = $q.defer();

                    element.bind('$destroy', function() {
                        if (instance && CKEDITOR.instances[instance.name]) {
                            CKEDITOR.instances[instance.name].destroy();
                        }
                    });
                    var setModelData = function(setPristine) {
                            var data = instance.getData();
                            if (data === '') {
                                data = null;
                            }
                            $timeout(function() { // for key up event
                                if (setPristine !== true || data !== ngModel.$viewValue) {
                                    ngModel.$setViewValue(data);
                                }

                                if (setPristine === true && form) {
                                    form.$setPristine();
                                }
                            }, 0);
                        },
                        onUpdateModelData = function(setPristine) {
                            if (!data.length) {
                                return;
                            }

                            var item = data.pop() || EMPTY_HTML;
                            isReady = false;
                            instance.setData(item, function() {
                                setModelData(setPristine);
                                isReady = true;
                            });
                        };

                    instance.on('pasteState', setModelData);
                    instance.on('change', setModelData);
                    instance.on('blur', setModelData);
                    //instance.on('key',          setModelData); // for source view

                    instance.on('instanceReady', function() {
                        scope.$broadcast('ckeditor.ready');
                        scope.$apply(function() {
                            onUpdateModelData(true);
                        });

                        instance.document.on('keyup', setModelData);
                    });
                    instance.on('customConfigLoaded', function() {
                        configLoaderDef.resolve();
                    });

                    // $timeout(function() {
                    //     scope.$apply(function() {
                            ngModel.$render = function() {
                                data.push(ngModel.$viewValue);
                                if (isReady) {
                                    onUpdateModelData();
                                }
                            };
                    //     });
                    // }, 100)

                };


                function checkLoaded() {
                    if (CKEDITOR.status === 'loaded') {
                        loaded = true;
                        $defer.resolve();
                    } else {
                        checkLoaded();
                    }
                }

                CKEDITOR.on('loaded', checkLoaded);
                $timeout(checkLoaded, 100);
                $defer.promise.then(onLoad);
            }
        };
    }]);
angular.module('ui.tux.timepicker', [])

.constant('tuxTimepickerConfig', {
  hourStep: 1,
  minuteStep: 1,
  secondStep: 1,
  showMeridian: true,
  showSeconds: false,
  meridians: null,
  readonlyInput: false,
  mousewheel: true,
  arrowkeys: true,
  showSpinners: true,
  templateUrl: 'tux/template/timepicker/timepicker.html'
})

.controller('tuxTimepickerController', ['$scope', '$element', '$attrs', '$parse', '$log', '$locale', 'tuxTimepickerConfig', function($scope, $element, $attrs, $parse, $log, $locale, timepickerConfig) {
  var selected = new Date(),
    watchers = [],
    ngModelCtrl = { $setViewValue: angular.noop }, // nullModelCtrl
    meridians = angular.isDefined($attrs.meridians) ? $scope.$parent.$eval($attrs.meridians) : timepickerConfig.meridians || $locale.DATETIME_FORMATS.AMPMS,
    padHours = angular.isDefined($attrs.padHours) ? $scope.$parent.$eval($attrs.padHours) : true;

  $scope.tabindex = angular.isDefined($attrs.tabindex) ? $attrs.tabindex : 0;
  $element.removeAttr('tabindex');

  this.init = function(ngModelCtrl_, inputs) {
    ngModelCtrl = ngModelCtrl_;
    ngModelCtrl.$render = this.render;

    ngModelCtrl.$formatters.unshift(function(modelValue) {
      return modelValue ? new Date(modelValue) : null;
    });

    var hoursInputEl = inputs.eq(0),
        minutesInputEl = inputs.eq(1),
        secondsInputEl = inputs.eq(2);

    var mousewheel = angular.isDefined($attrs.mousewheel) ? $scope.$parent.$eval($attrs.mousewheel) : timepickerConfig.mousewheel;

    if (mousewheel) {
      this.setupMousewheelEvents(hoursInputEl, minutesInputEl, secondsInputEl);
    }

    var arrowkeys = angular.isDefined($attrs.arrowkeys) ? $scope.$parent.$eval($attrs.arrowkeys) : timepickerConfig.arrowkeys;
    if (arrowkeys) {
      this.setupArrowkeyEvents(hoursInputEl, minutesInputEl, secondsInputEl);
    }

    $scope.readonlyInput = angular.isDefined($attrs.readonlyInput) ? $scope.$parent.$eval($attrs.readonlyInput) : timepickerConfig.readonlyInput;
    this.setupInputEvents(hoursInputEl, minutesInputEl, secondsInputEl);
  };

  var hourStep = timepickerConfig.hourStep;
  if ($attrs.hourStep) {
    watchers.push($scope.$parent.$watch($parse($attrs.hourStep), function(value) {
      hourStep = +value;
    }));
  }

  var minuteStep = timepickerConfig.minuteStep;
  if ($attrs.minuteStep) {
    watchers.push($scope.$parent.$watch($parse($attrs.minuteStep), function(value) {
      minuteStep = +value;
    }));
  }

  var min;
  watchers.push($scope.$parent.$watch($parse($attrs.min), function(value) {
    var dt = new Date(value);
    min = isNaN(dt) ? undefined : dt;
  }));

  var max;
  watchers.push($scope.$parent.$watch($parse($attrs.max), function(value) {
    var dt = new Date(value);
    max = isNaN(dt) ? undefined : dt;
  }));

  var disabled = false;
  if ($attrs.ngDisabled) {
    watchers.push($scope.$parent.$watch($parse($attrs.ngDisabled), function(value) {
      disabled = value;
    }));
  }

  $scope.noIncrementHours = function() {
    var incrementedSelected = addMinutes(selected, hourStep * 60);
    return disabled || incrementedSelected > max ||
      incrementedSelected < selected && incrementedSelected < min;
  };

  $scope.noDecrementHours = function() {
    var decrementedSelected = addMinutes(selected, -hourStep * 60);
    return disabled || decrementedSelected < min ||
      decrementedSelected > selected && decrementedSelected > max;
  };

  $scope.noIncrementMinutes = function() {
    var incrementedSelected = addMinutes(selected, minuteStep);
    return disabled || incrementedSelected > max ||
      incrementedSelected < selected && incrementedSelected < min;
  };

  $scope.noDecrementMinutes = function() {
    var decrementedSelected = addMinutes(selected, -minuteStep);
    return disabled || decrementedSelected < min ||
      decrementedSelected > selected && decrementedSelected > max;
  };

  $scope.noIncrementSeconds = function() {
    var incrementedSelected = addSeconds(selected, secondStep);
    return disabled || incrementedSelected > max ||
      incrementedSelected < selected && incrementedSelected < min;
  };

  $scope.noDecrementSeconds = function() {
    var decrementedSelected = addSeconds(selected, -secondStep);
    return disabled || decrementedSelected < min ||
      decrementedSelected > selected && decrementedSelected > max;
  };

  $scope.noToggleMeridian = function() {
    if (selected.getHours() < 12) {
      return disabled || addMinutes(selected, 12 * 60) > max;
    }

    return disabled || addMinutes(selected, -12 * 60) < min;
  };

  var secondStep = timepickerConfig.secondStep;
  if ($attrs.secondStep) {
    watchers.push($scope.$parent.$watch($parse($attrs.secondStep), function(value) {
      secondStep = +value;
    }));
  }

  $scope.showSeconds = timepickerConfig.showSeconds;
  if ($attrs.showSeconds) {
    watchers.push($scope.$parent.$watch($parse($attrs.showSeconds), function(value) {
      $scope.showSeconds = !!value;
    }));
  }

  // 12H / 24H mode
  $scope.showMeridian = timepickerConfig.showMeridian;
  if ($attrs.showMeridian) {
    watchers.push($scope.$parent.$watch($parse($attrs.showMeridian), function(value) {
      $scope.showMeridian = !!value;

      if (ngModelCtrl.$error.time) {
        // Evaluate from template
        var hours = getHoursFromTemplate(), minutes = getMinutesFromTemplate();
        if (angular.isDefined(hours) && angular.isDefined(minutes)) {
          selected.setHours(hours);
          refresh();
        }
      } else {
        updateTemplate();
      }
    }));
  }

  // Get $scope.hours in 24H mode if valid
  function getHoursFromTemplate() {
    var hours = +$scope.hours;
    var valid = $scope.showMeridian ? hours > 0 && hours < 13 :
      hours >= 0 && hours < 24;
    if (!valid || $scope.hours === '') {
      return undefined;
    }

    if ($scope.showMeridian) {
      if (hours === 12) {
        hours = 0;
      }
      if ($scope.meridian === meridians[1]) {
        hours = hours + 12;
      }
    }
    return hours;
  }

  function getMinutesFromTemplate() {
    var minutes = +$scope.minutes;
    var valid = minutes >= 0 && minutes < 60;
    if (!valid || $scope.minutes === '') {
      return undefined;
    }
    return minutes;
  }

  function getSecondsFromTemplate() {
    var seconds = +$scope.seconds;
    return seconds >= 0 && seconds < 60 ? seconds : undefined;
  }

  function pad(value, noPad) {
    if (value === null) {
      return '';
    }

    return angular.isDefined(value) && value.toString().length < 2 && !noPad ?
      '0' + value : value.toString();
  }

  // Respond on mousewheel spin
  this.setupMousewheelEvents = function(hoursInputEl, minutesInputEl, secondsInputEl) {
    var isScrollingUp = function(e) {
      if (e.originalEvent) {
        e = e.originalEvent;
      }
      //pick correct delta variable depending on event
      var delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
      return e.detail || delta > 0;
    };

    hoursInputEl.bind('mousewheel wheel', function(e) {
      if (!disabled) {
        $scope.$apply(isScrollingUp(e) ? $scope.incrementHours() : $scope.decrementHours());
      }
      e.preventDefault();
    });

    minutesInputEl.bind('mousewheel wheel', function(e) {
      if (!disabled) {
        $scope.$apply(isScrollingUp(e) ? $scope.incrementMinutes() : $scope.decrementMinutes());
      }
      e.preventDefault();
    });

     secondsInputEl.bind('mousewheel wheel', function(e) {
      if (!disabled) {
        $scope.$apply(isScrollingUp(e) ? $scope.incrementSeconds() : $scope.decrementSeconds());
      }
      e.preventDefault();
    });
  };

  // Respond on up/down arrowkeys
  this.setupArrowkeyEvents = function(hoursInputEl, minutesInputEl, secondsInputEl) {
    hoursInputEl.bind('keydown', function(e) {
      if (!disabled) {
        if (e.which === 38) { // up
          e.preventDefault();
          $scope.incrementHours();
          $scope.$apply();
        } else if (e.which === 40) { // down
          e.preventDefault();
          $scope.decrementHours();
          $scope.$apply();
        }
      }
    });

    minutesInputEl.bind('keydown', function(e) {
      if (!disabled) {
        if (e.which === 38) { // up
          e.preventDefault();
          $scope.incrementMinutes();
          $scope.$apply();
        } else if (e.which === 40) { // down
          e.preventDefault();
          $scope.decrementMinutes();
          $scope.$apply();
        }
      }
    });

    secondsInputEl.bind('keydown', function(e) {
      if (!disabled) {
        if (e.which === 38) { // up
          e.preventDefault();
          $scope.incrementSeconds();
          $scope.$apply();
        } else if (e.which === 40) { // down
          e.preventDefault();
          $scope.decrementSeconds();
          $scope.$apply();
        }
      }
    });
  };

  this.setupInputEvents = function(hoursInputEl, minutesInputEl, secondsInputEl) {
    if ($scope.readonlyInput) {
      $scope.updateHours = angular.noop;
      $scope.updateMinutes = angular.noop;
      $scope.updateSeconds = angular.noop;
      return;
    }

    var invalidate = function(invalidHours, invalidMinutes, invalidSeconds) {
      ngModelCtrl.$setViewValue(null);
      ngModelCtrl.$setValidity('time', false);
      if (angular.isDefined(invalidHours)) {
        $scope.invalidHours = invalidHours;
      }

      if (angular.isDefined(invalidMinutes)) {
        $scope.invalidMinutes = invalidMinutes;
      }

      if (angular.isDefined(invalidSeconds)) {
        $scope.invalidSeconds = invalidSeconds;
      }
    };

    $scope.updateHours = function() {
      var hours = getHoursFromTemplate(),
        minutes = getMinutesFromTemplate();

      ngModelCtrl.$setDirty();

      if (angular.isDefined(hours) && angular.isDefined(minutes)) {
        selected.setHours(hours);
        selected.setMinutes(minutes);
        if (selected < min || selected > max) {
          invalidate(true);
        } else {
          refresh('h');
        }
      } else {
        invalidate(true);
      }
    };

    hoursInputEl.bind('blur', function(e) {
      ngModelCtrl.$setTouched();
      if (modelIsEmpty()) {
        makeValid();
      } else if ($scope.hours === null || $scope.hours === '') {
        invalidate(true);
      } else if (!$scope.invalidHours && $scope.hours < 10) {
        $scope.$apply(function() {
          $scope.hours = pad($scope.hours, !padHours);
        });
      }
    });

    $scope.updateMinutes = function() {
      var minutes = getMinutesFromTemplate(),
        hours = getHoursFromTemplate();

      ngModelCtrl.$setDirty();

      if (angular.isDefined(minutes) && angular.isDefined(hours)) {
        selected.setHours(hours);
        selected.setMinutes(minutes);
        if (selected < min || selected > max) {
          invalidate(undefined, true);
        } else {
          refresh('m');
        }
      } else {
        invalidate(undefined, true);
      }
    };

    minutesInputEl.bind('blur', function(e) {
      ngModelCtrl.$setTouched();
      if (modelIsEmpty()) {
        makeValid();
      } else if ($scope.minutes === null) {
        invalidate(undefined, true);
      } else if (!$scope.invalidMinutes && $scope.minutes < 10) {
        $scope.$apply(function() {
          $scope.minutes = pad($scope.minutes);
        });
      }
    });

    $scope.updateSeconds = function() {
      var seconds = getSecondsFromTemplate();

      ngModelCtrl.$setDirty();

      if (angular.isDefined(seconds)) {
        selected.setSeconds(seconds);
        refresh('s');
      } else {
        invalidate(undefined, undefined, true);
      }
    };

    secondsInputEl.bind('blur', function(e) {
      if (modelIsEmpty()) {
        makeValid();
      } else if (!$scope.invalidSeconds && $scope.seconds < 10) {
        $scope.$apply( function() {
          $scope.seconds = pad($scope.seconds);
        });
      }
    });

  };

  this.render = function() {
    var date = ngModelCtrl.$viewValue;

    if (isNaN(date)) {
      ngModelCtrl.$setValidity('time', false);
      $log.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
    } else {
      if (date) {
        selected = date;
      } 

      if (selected < min || selected > max) {
        ngModelCtrl.$setValidity('time', false);
        $scope.invalidHours = true;
        $scope.invalidMinutes = true;
      } else {
        makeValid();
      }
      updateTemplate();
    }
  };

  // Call internally when we know that model is valid.
  function refresh(keyboardChange) {
    makeValid();
    ngModelCtrl.$setViewValue(new Date(selected));
    updateTemplate(keyboardChange);
  }

  function makeValid() {
    ngModelCtrl.$setValidity('time', true);
    $scope.invalidHours = false;
    $scope.invalidMinutes = false;
    $scope.invalidSeconds = false;
  }

  function updateTemplate(keyboardChange) {
    if (!ngModelCtrl.$modelValue) {
      $scope.hours = null;
      $scope.minutes = null;
      $scope.seconds = null;
      $scope.meridian = meridians[0];
    } else {
      var hours = selected.getHours(),
        minutes = selected.getMinutes(),
        seconds = selected.getSeconds();

      if ($scope.showMeridian) {
        hours = hours === 0 || hours === 12 ? 12 : hours % 12; // Convert 24 to 12 hour system
      }

      $scope.hours = keyboardChange === 'h' ? hours : pad(hours, !padHours);
      if (keyboardChange !== 'm') {
        $scope.minutes = pad(minutes);
      }
      $scope.meridian = selected.getHours() < 12 ? meridians[0] : meridians[1];

      if (keyboardChange !== 's') {
        $scope.seconds = pad(seconds);
      }
      $scope.meridian = selected.getHours() < 12 ? meridians[0] : meridians[1];
    }
  }

  function addSecondsToSelected(seconds) {
    selected = addSeconds(selected, seconds);
    refresh();
  }

  function addMinutes(selected, minutes) {
    return addSeconds(selected, minutes*60);
  }

  function addSeconds(date, seconds) {
    var dt = new Date(date.getTime() + seconds * 1000);
    var newDate = new Date(date);
    newDate.setHours(dt.getHours(), dt.getMinutes(), dt.getSeconds());
    return newDate;
  }

  function modelIsEmpty() {
    return ($scope.hours === null || $scope.hours === '') &&
      ($scope.minutes === null || $scope.minutes === '') &&
      (!$scope.showSeconds || $scope.showSeconds && ($scope.seconds === null || $scope.seconds === ''));
  }

  $scope.showSpinners = angular.isDefined($attrs.showSpinners) ?
    $scope.$parent.$eval($attrs.showSpinners) : timepickerConfig.showSpinners;

  $scope.incrementHours = function() {
    if (!$scope.noIncrementHours()) {
      addSecondsToSelected(hourStep * 60 * 60);
    }
  };

  $scope.decrementHours = function() {
    if (!$scope.noDecrementHours()) {
      addSecondsToSelected(-hourStep * 60 * 60);
    }
  };

  $scope.incrementMinutes = function() {
    if (!$scope.noIncrementMinutes()) {
      addSecondsToSelected(minuteStep * 60);
    }
  };

  $scope.decrementMinutes = function() {
    if (!$scope.noDecrementMinutes()) {
      addSecondsToSelected(-minuteStep * 60);
    }
  };

  $scope.incrementSeconds = function() {
    if (!$scope.noIncrementSeconds()) {
      addSecondsToSelected(secondStep);
    }
  };

  $scope.decrementSeconds = function() {
    if (!$scope.noDecrementSeconds()) {
      addSecondsToSelected(-secondStep);
    }
  };

  $scope.toggleMeridian = function() {
    var minutes = getMinutesFromTemplate(),
        hours = getHoursFromTemplate();

    if (!$scope.noToggleMeridian()) {
      if (angular.isDefined(minutes) && angular.isDefined(hours)) {
        addSecondsToSelected(12 * 60 * (selected.getHours() < 12 ? 60 : -60));
      } else {
        $scope.meridian = $scope.meridian === meridians[0] ? meridians[1] : meridians[0];
      }
    }
  };

  $scope.blur = function() {
    ngModelCtrl.$setTouched();
  };

  $scope.$on('$destroy', function() {
    while (watchers.length) {
      watchers.shift()();
    }
  });
}])

.directive('tuxTimepicker', ['tuxTimepickerConfig', function(tuxTimepickerConfig) {
  return {
    require: ['tuxTimepicker', '?^ngModel'],
    controller: 'tuxTimepickerController',
    controllerAs: 'timepicker',
    replace: true,
    scope: {},
    templateUrl: function(element, attrs) {
      return attrs.templateUrl || tuxTimepickerConfig.templateUrl;
    },
    link: function(scope, element, attrs, ctrls) {
      var timepickerCtrl = ctrls[0], ngModelCtrl = ctrls[1];

      if (ngModelCtrl) {
        timepickerCtrl.init(ngModelCtrl, element.find('input'));
      }
    }
  };
}]);
angular.module('ui.tux.typeahead', ['ui.tux.debounce', 'ui.tux.position'])

/**
 * A helper service that can parse typeahead's syntax (string provided by users)
 * Extracted to a separate service for ease of unit testing
 */
  .factory('tuxTypeaheadParser', ['$parse', function($parse) {
    //                      00000111000000000000022200000000000000003333333333333330000000000044000
    var TYPEAHEAD_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+([\s\S]+?)$/;
    return {
      parse: function(input) {
        var match = input.match(TYPEAHEAD_REGEXP);
        if (!match) {
          throw new Error(
            'Expected typeahead specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_"' +
              ' but got "' + input + '".');
        }

        return {
          itemName: match[3],
          source: $parse(match[4]),
          viewMapper: $parse(match[2] || match[1]),
          modelMapper: $parse(match[1])
        };
      }
    };
  }])

  .controller('TrwdTypeaheadController', ['$scope', '$element', '$attrs', '$compile', '$parse', '$q', '$timeout', '$document', '$window', '$rootScope', '$tuxDebounce', '$tuxPosition', 'tuxTypeaheadParser',
    function(originalScope, element, attrs, $compile, $parse, $q, $timeout, $document, $window, $rootScope, $$debounce, $position, typeaheadParser) {
    var HOT_KEYS = [9, 13, 27, 38, 40];
    var eventDebounceTime = 200;
    var modelCtrl, ngModelOptions;
    //SUPPORTED ATTRIBUTES (OPTIONS)

    //minimal no of characters that needs to be entered before typeahead kicks-in
    var minLength = originalScope.$eval(attrs.typeaheadMinLength);
    if (!minLength && minLength !== 0) {
      minLength = 1;
    }

    //minimal wait time after last character typed before typeahead kicks-in
    var waitTime = originalScope.$eval(attrs.typeaheadWaitMs) || 0;

    //should it restrict model values to the ones selected from the popup only?
    var isEditable = originalScope.$eval(attrs.typeaheadEditable) !== false;
    originalScope.$watch(attrs.typeaheadEditable, function (newVal) {
      isEditable = newVal !== false;
    });

    //binding to a variable that indicates if matches are being retrieved asynchronously
    var isLoadingSetter = $parse(attrs.typeaheadLoading).assign || angular.noop;

    //a callback executed when a match is selected
    var onSelectCallback = $parse(attrs.typeaheadOnSelect);

    //should it select highlighted popup value when losing focus?
    var isSelectOnBlur = angular.isDefined(attrs.typeaheadSelectOnBlur) ? originalScope.$eval(attrs.typeaheadSelectOnBlur) : false;

    //binding to a variable that indicates if there were no results after the query is completed
    var isNoResultsSetter = $parse(attrs.typeaheadNoResults).assign || angular.noop;

    var inputFormatter = attrs.typeaheadInputFormatter ? $parse(attrs.typeaheadInputFormatter) : undefined;

    var appendToBody = attrs.typeaheadAppendToBody ? originalScope.$eval(attrs.typeaheadAppendToBody) : false;

    var appendTo = attrs.typeaheadAppendTo ?
      originalScope.$eval(attrs.typeaheadAppendTo) : null;

    var focusFirst = originalScope.$eval(attrs.typeaheadFocusFirst) !== false;

    //If input matches an item of the list exactly, select it automatically
    var selectOnExact = attrs.typeaheadSelectOnExact ? originalScope.$eval(attrs.typeaheadSelectOnExact) : false;

    //binding to a variable that indicates if dropdown is open
    var isOpenSetter = $parse(attrs.typeaheadIsOpen).assign || angular.noop;

    var showHint = originalScope.$eval(attrs.typeaheadShowHint) || false;

    //INTERNAL VARIABLES

    //model setter executed upon match selection
    var parsedModel = $parse(attrs.ngModel);
    var invokeModelSetter = $parse(attrs.ngModel + '($$$p)');
    var $setModelValue = function(scope, newValue) {
      if (angular.isFunction(parsedModel(originalScope)) &&
        ngModelOptions && ngModelOptions.$options && ngModelOptions.$options.getterSetter) {
        return invokeModelSetter(scope, {$$$p: newValue});
      }

      return parsedModel.assign(scope, newValue);
    };

    //expressions used by typeahead
    var parserResult = typeaheadParser.parse(attrs.tuxTypeahead);

    var hasFocus;

    //Used to avoid bug in iOS webview where iOS keyboard does not fire
    //mousedown & mouseup events
    //Issue #3699
    var selected;

    //create a child scope for the typeahead directive so we are not polluting original scope
    //with typeahead-specific data (matches, query etc.)
    var scope = originalScope.$new();
    var offDestroy = originalScope.$on('$destroy', function() {
      scope.$destroy();
    });
    scope.$on('$destroy', offDestroy);

    // WAI-ARIA
    var popupId = 'typeahead-' + scope.$id + '-' + Math.floor(Math.random() * 10000);
    element.attr({
      'aria-autocomplete': 'list',
      'aria-expanded': false,
      'aria-owns': popupId
    });

    var inputsContainer, hintInputElem;
    //add read-only input to show hint
    if (showHint) {
      inputsContainer = angular.element('<div></div>');
      inputsContainer.css('position', 'relative');
      element.after(inputsContainer);
      hintInputElem = element.clone();
      hintInputElem.attr('placeholder', '');
      hintInputElem.val('');
      hintInputElem.css({
        'position': 'absolute',
        'top': '0px',
        'left': '0px',
        'border-color': 'transparent',
        'box-shadow': 'none',
        'opacity': 1,
        'background': 'none 0% 0% / auto repeat scroll padding-box border-box rgb(255, 255, 255)',
        'color': '#999'
      });
      element.css({
        'position': 'relative',
        'vertical-align': 'top',
        'background-color': 'transparent'
      });
      inputsContainer.append(hintInputElem);
      hintInputElem.after(element);
    }

    //pop-up element used to display matches
    var popUpEl = angular.element('<div tux-typeahead-popup></div>');
    popUpEl.attr({
      id: popupId,
      matches: 'matches',
      active: 'activeIdx',
      select: 'select(activeIdx, evt)',
      'move-in-progress': 'moveInProgress',
      query: 'query',
      position: 'position',
      'assign-is-open': 'assignIsOpen(isOpen)',
      debounce: 'debounceUpdate'
    });
    //custom item template
    if (angular.isDefined(attrs.typeaheadTemplateUrl)) {
      popUpEl.attr('template-url', attrs.typeaheadTemplateUrl);
    }

    if (angular.isDefined(attrs.typeaheadPopupTemplateUrl)) {
      popUpEl.attr('popup-template-url', attrs.typeaheadPopupTemplateUrl);
    }

    var resetHint = function() {
      if (showHint) {
        hintInputElem.val('');
      }
    };

    var resetMatches = function() {
      scope.matches = [];
      scope.activeIdx = -1;
      element.attr('aria-expanded', false);
      resetHint();
    };

    var getMatchId = function(index) {
      return popupId + '-option-' + index;
    };

    // Indicate that the specified match is the active (pre-selected) item in the list owned by this typeahead.
    // This attribute is added or removed automatically when the `activeIdx` changes.
    scope.$watch('activeIdx', function(index) {
      if (index < 0) {
        element.removeAttr('aria-activedescendant');
      } else {
        element.attr('aria-activedescendant', getMatchId(index));
      }
    });

    var inputIsExactMatch = function(inputValue, index) {
      if (scope.matches.length > index && inputValue) {
        return inputValue.toUpperCase() === scope.matches[index].label.toUpperCase();
      }

      return false;
    };

    var getMatchesAsync = function(inputValue, evt) {
      var locals = {$viewValue: inputValue};
      isLoadingSetter(originalScope, true);
      isNoResultsSetter(originalScope, false);
      $q.when(parserResult.source(originalScope, locals)).then(function(matches) {
        //it might happen that several async queries were in progress if a user were typing fast
        //but we are interested only in responses that correspond to the current view value
        var onCurrentRequest = inputValue === modelCtrl.$viewValue;
        if (onCurrentRequest && hasFocus) {
          if (matches && matches.length > 0) {
            scope.activeIdx = focusFirst ? 0 : -1;
            isNoResultsSetter(originalScope, false);
            scope.matches.length = 0;

            //transform labels
            for (var i = 0; i < matches.length; i++) {
              locals[parserResult.itemName] = matches[i];
              scope.matches.push({
                id: getMatchId(i),
                label: parserResult.viewMapper(scope, locals),
                model: matches[i]
              });
            }

            scope.query = inputValue;
            //position pop-up with matches - we need to re-calculate its position each time we are opening a window
            //with matches as a pop-up might be absolute-positioned and position of an input might have changed on a page
            //due to other elements being rendered
            recalculatePosition();

            element.attr('aria-expanded', true);

            //Select the single remaining option if user input matches
            if (selectOnExact && scope.matches.length === 1 && inputIsExactMatch(inputValue, 0)) {
              if (angular.isNumber(scope.debounceUpdate) || angular.isObject(scope.debounceUpdate)) {
                $$debounce(function() {
                  scope.select(0, evt);
                }, angular.isNumber(scope.debounceUpdate) ? scope.debounceUpdate : scope.debounceUpdate['default']);
              } else {
                scope.select(0, evt);
              }
            }

            if (showHint) {
              var firstLabel = scope.matches[0].label;
              if (angular.isString(inputValue) &&
                inputValue.length > 0 &&
                firstLabel.slice(0, inputValue.length).toUpperCase() === inputValue.toUpperCase()) {
                hintInputElem.val(inputValue + firstLabel.slice(inputValue.length));
              } else {
                hintInputElem.val('');
              }
            }
          } else {
            resetMatches();
            isNoResultsSetter(originalScope, true);
          }
        }
        if (onCurrentRequest) {
          isLoadingSetter(originalScope, false);
        }
      }, function() {
        resetMatches();
        isLoadingSetter(originalScope, false);
        isNoResultsSetter(originalScope, true);
      });
    };

    // bind events only if appendToBody params exist - performance feature
    if (appendToBody) {
      angular.element($window).on('resize', fireRecalculating);
      $document.find('body').on('scroll', fireRecalculating);
    }

    // Declare the debounced function outside recalculating for
    // proper debouncing
    var debouncedRecalculate = $$debounce(function() {
      // if popup is visible
      if (scope.matches.length) {
        recalculatePosition();
      }

      scope.moveInProgress = false;
    }, eventDebounceTime);

    // Default progress type
    scope.moveInProgress = false;

    function fireRecalculating() {
      if (!scope.moveInProgress) {
        scope.moveInProgress = true;
        scope.$digest();
      }

      debouncedRecalculate();
    }

    // recalculate actual position and set new values to scope
    // after digest loop is popup in right position
    function recalculatePosition() {
      scope.position = appendToBody ? $position.offset(element) : $position.position(element);
      scope.position.top += element.prop('offsetHeight');
    }

    //we need to propagate user's query so we can higlight matches
    scope.query = undefined;

    //Declare the timeout promise var outside the function scope so that stacked calls can be cancelled later
    var timeoutPromise;

    var scheduleSearchWithTimeout = function(inputValue) {
      timeoutPromise = $timeout(function() {
        getMatchesAsync(inputValue);
      }, waitTime);
    };

    var cancelPreviousTimeout = function() {
      if (timeoutPromise) {
        $timeout.cancel(timeoutPromise);
      }
    };

    resetMatches();

    scope.assignIsOpen = function (isOpen) {
      isOpenSetter(originalScope, isOpen);
    };

    scope.select = function(activeIdx, evt) {
      //called from within the $digest() cycle
      var locals = {};
      var model, item;

      selected = true;
      locals[parserResult.itemName] = item = scope.matches[activeIdx].model;
      model = parserResult.modelMapper(originalScope, locals);
      $setModelValue(originalScope, model);
      modelCtrl.$setValidity('editable', true);
      modelCtrl.$setValidity('parse', true);

      onSelectCallback(originalScope, {
        $item: item,
        $model: model,
        $label: parserResult.viewMapper(originalScope, locals),
        $event: evt
      });

      resetMatches();

      //return focus to the input element if a match was selected via a mouse click event
      // use timeout to avoid $rootScope:inprog error
      if (scope.$eval(attrs.typeaheadFocusOnSelect) !== false) {
        $timeout(function() { element[0].focus(); }, 0, false);
      }
    };

    //bind keyboard events: arrows up(38) / down(40), enter(13) and tab(9), esc(27)
    element.on('keydown', function(evt) {
      //typeahead is open and an "interesting" key was pressed
      if (scope.matches.length === 0 || HOT_KEYS.indexOf(evt.which) === -1) {
        return;
      }

      // if there's nothing selected (i.e. focusFirst) and enter or tab is hit, clear the results
      if (scope.activeIdx === -1 && (evt.which === 9 || evt.which === 13)) {
        resetMatches();
        scope.$digest();
        return;
      }

      evt.preventDefault();
      var target;
      switch (evt.which) {
        case 9:
        case 13:
          scope.$apply(function () {
            if (angular.isNumber(scope.debounceUpdate) || angular.isObject(scope.debounceUpdate)) {
              $$debounce(function() {
                scope.select(scope.activeIdx, evt);
              }, angular.isNumber(scope.debounceUpdate) ? scope.debounceUpdate : scope.debounceUpdate['default']);
            } else {
              scope.select(scope.activeIdx, evt);
            }
          });
          break;
        case 27:
          evt.stopPropagation();

          resetMatches();
          scope.$digest();
          break;
        case 38:
          scope.activeIdx = (scope.activeIdx > 0 ? scope.activeIdx : scope.matches.length) - 1;
          scope.$digest();
          target = popUpEl.find('li')[scope.activeIdx];
          target.parentNode.scrollTop = target.offsetTop;
          break;
        case 40:
          scope.activeIdx = (scope.activeIdx + 1) % scope.matches.length;
          scope.$digest();
          target = popUpEl.find('li')[scope.activeIdx];
          target.parentNode.scrollTop = target.offsetTop;
          break;
      }
    });

    element.bind('focus', function (evt) {
      hasFocus = true;
      if (minLength === 0 && !modelCtrl.$viewValue) {
        $timeout(function() {
          getMatchesAsync(modelCtrl.$viewValue, evt);
        }, 0);
      }
    });

    element.bind('blur', function(evt) {
      if (isSelectOnBlur && scope.matches.length && scope.activeIdx !== -1 && !selected) {
        selected = true;
        scope.$apply(function() {
          if (angular.isObject(scope.debounceUpdate) && angular.isNumber(scope.debounceUpdate.blur)) {
            $$debounce(function() {
              scope.select(scope.activeIdx, evt);
            }, scope.debounceUpdate.blur);
          } else {
            scope.select(scope.activeIdx, evt);
          }
        });
      }
      if (!isEditable && modelCtrl.$error.editable) {
        modelCtrl.$viewValue = '';
        element.val('');
      }
      hasFocus = false;
      selected = false;
    });

    // Keep reference to click handler to unbind it.
    var dismissClickHandler = function(evt) {
      // Issue #3973
      // Firefox treats right click as a click on document
      if (element[0] !== evt.target && evt.which !== 3 && scope.matches.length !== 0) {
        resetMatches();
        if (!$rootScope.$$phase) {
          scope.$digest();
        }
      }
    };

    $document.on('click', dismissClickHandler);

    originalScope.$on('$destroy', function() {
      $document.off('click', dismissClickHandler);
      if (appendToBody || appendTo) {
        $popup.remove();
      }

      if (appendToBody) {
        angular.element($window).off('resize', fireRecalculating);
        $document.find('body').off('scroll', fireRecalculating);
      }
      // Prevent jQuery cache memory leak
      popUpEl.remove();

      if (showHint) {
          inputsContainer.remove();
      }
    });

    var $popup = $compile(popUpEl)(scope);

    if (appendToBody) {
      $document.find('body').append($popup);
    } else if (appendTo) {
      angular.element(appendTo).eq(0).append($popup);
    } else {
      element.after($popup);
    }

    this.init = function(_modelCtrl, _ngModelOptions) {
      modelCtrl = _modelCtrl;
      ngModelOptions = _ngModelOptions;

      scope.debounceUpdate = modelCtrl.$options && $parse(modelCtrl.$options.debounce)(originalScope);

      //plug into $parsers pipeline to open a typeahead on view changes initiated from DOM
      //$parsers kick-in on all the changes coming from the view as well as manually triggered by $setViewValue
      modelCtrl.$parsers.unshift(function(inputValue) {
        hasFocus = true;

        if (minLength === 0 || inputValue && inputValue.length >= minLength) {
          if (waitTime > 0) {
            cancelPreviousTimeout();
            scheduleSearchWithTimeout(inputValue);
          } else {
            getMatchesAsync(inputValue);
          }
        } else {
          isLoadingSetter(originalScope, false);
          cancelPreviousTimeout();
          resetMatches();
        }

        if (isEditable) {
          return inputValue;
        }

        if (!inputValue) {
          // Reset in case user had typed something previously.
          modelCtrl.$setValidity('editable', true);
          return null;
        }

        modelCtrl.$setValidity('editable', false);
        return undefined;
      });

      modelCtrl.$formatters.push(function(modelValue) {
        var candidateViewValue, emptyViewValue;
        var locals = {};

        // The validity may be set to false via $parsers (see above) if
        // the model is restricted to selected values. If the model
        // is set manually it is considered to be valid.
        if (!isEditable) {
          modelCtrl.$setValidity('editable', true);
        }

        if (inputFormatter) {
          locals.$model = modelValue;
          return inputFormatter(originalScope, locals);
        }

        //it might happen that we don't have enough info to properly render input value
        //we need to check for this situation and simply return model value if we can't apply custom formatting
        locals[parserResult.itemName] = modelValue;
        candidateViewValue = parserResult.viewMapper(originalScope, locals);
        locals[parserResult.itemName] = undefined;
        emptyViewValue = parserResult.viewMapper(originalScope, locals);

        return candidateViewValue !== emptyViewValue ? candidateViewValue : modelValue;
      });
    };
  }])

  .directive('tuxTypeahead', function() {
    return {
      controller: 'TrwdTypeaheadController',
      require: ['ngModel', '^?ngModelOptions', 'tuxTypeahead'],
      link: function(originalScope, element, attrs, ctrls) {
        ctrls[2].init(ctrls[0], ctrls[1]);
      }
    };
  })

  .directive('tuxTypeaheadPopup', ['$tuxDebounce', function($$debounce) {
    return {
      scope: {
        matches: '=',
        query: '=',
        active: '=',
        position: '&',
        moveInProgress: '=',
        select: '&',
        assignIsOpen: '&',
        debounce: '&'
      },
      replace: true,
      templateUrl: function(element, attrs) {
        return attrs.popupTemplateUrl || 'tux/template/typeahead/typeahead-popup.html';
      },
      link: function(scope, element, attrs) {
        scope.templateUrl = attrs.templateUrl;

        scope.isOpen = function() {
          var isDropdownOpen = scope.matches.length > 0;
          scope.assignIsOpen({ isOpen: isDropdownOpen });
          return isDropdownOpen;
        };

        scope.isActive = function(matchIdx) {
          return scope.active === matchIdx;
        };

        scope.selectActive = function(matchIdx) {
          scope.active = matchIdx;
        };

        scope.selectMatch = function(activeIdx, evt) {
          var debounce = scope.debounce();
          if (angular.isNumber(debounce) || angular.isObject(debounce)) {
            $$debounce(function() {
              scope.select({activeIdx: activeIdx, evt: evt});
            }, angular.isNumber(debounce) ? debounce : debounce['default']);
          } else {
            scope.select({activeIdx: activeIdx, evt: evt});
          }
        };
      }
    };
  }])

  .directive('tuxTypeaheadMatch', ['$templateRequest', '$compile', '$parse', function($templateRequest, $compile, $parse) {
    return {
      scope: {
        index: '=',
        match: '=',
        query: '='
      },
      link: function(scope, element, attrs) {
        var tplUrl = $parse(attrs.templateUrl)(scope.$parent) || 'tux/template/typeahead/typeahead-match.html';
        $templateRequest(tplUrl).then(function(tplContent) {
          var tplEl = angular.element(tplContent.trim());
          element.replaceWith(tplEl);
          $compile(tplEl)(scope);
        });
      }
    };
  }])

  .filter('tuxTypeaheadHighlight', ['$sce', '$injector', '$log', function($sce, $injector, $log) {
    var isSanitizePresent;
    isSanitizePresent = $injector.has('$sanitize');

    function escapeRegexp(queryToEscape) {
      // Regex: capture the whole query string and replace it with the string that will be used to match
      // the results, for example if the capture is "a" the result will be \a
      return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
    }

    function containsHtml(matchItem) {
      return /<.*>/g.test(matchItem);
    }

    return function(matchItem, query) {
      if (!isSanitizePresent && containsHtml(matchItem)) {
        $log.warn('Unsafe use of typeahead please use ngSanitize'); // Warn the user about the danger
      }
      matchItem = query ? ('' + matchItem).replace(new RegExp(escapeRegexp(query), 'gi'), '<strong>$&</strong>') : matchItem; // Replaces the capture string with a the same string inside of a "strong" tag
      if (!isSanitizePresent) {
        matchItem = $sce.trustAsHtml(matchItem); // If $sanitize is not present we pack the string in a $sce object for the ng-bind-html directive
      }
      return matchItem;
    };
  }]);
angular.module('ui.tux.verticalImageGallery', ['ui.tux.carousel'])

.controller('TrwdverticalImageGallery', ['$scope', function($scope) {

}])

.directive('tuxVerticalImageGallery', function($timeout) {
    return {
        replace: true,
        controller: 'TrwdverticalImageGallery',
        controllerAs: 'verticalImageGallery',
        scope: {
            data: '=',
            counterOffset: '='
        },
        templateUrl: function(element, attrs) {
            return attrs.templateUrl || 'tux/template/verticalImageGallery/verticalImageGallery.html';
        },
        controller: function($scope, $http) {           
        },
        link: function(scope, element, attrs) {            
            $timeout(function() {
                if (typeof scope.data !== 'undefined' && scope.data.length >= scope.counterOffset) {
                    scope.current = scope.data[scope.counterOffset - 1];
                }
                scope.$apply();                
            }, 200);
            scope.$watch('counterOffset', function(newValue) {
                if (typeof scope.data !== 'undefined' && scope.data.length >= newValue) {
                    scope.current = scope.data[newValue - 1]
                }

            })
        }
    }
})

angular.module('as.sortable', [])
    .constant('sortableConfig', {
        itemClass: 'as-sortable-item',
        handleClass: 'as-sortable-item-handle',
        placeHolderClass: 'as-sortable-placeholder',
        dragClass: 'as-sortable-drag',
        hiddenClass: 'as-sortable-hidden',
        dragging: 'as-sortable-dragging'
    })
    .controller('as.sortable.sortableController', ['$scope', function($scope) {
        this.scope = $scope;
        $scope.modelValue = null; // sortable list.
        $scope.callbacks = null;
        $scope.type = 'sortable';
        $scope.options = {
            longTouch: false
        };
        $scope.isDisabled = false;

        $scope.insertItem = function(index, itemData) {
            if ($scope.options.allowDuplicates) {
                $scope.modelValue.splice(index, 0, angular.copy(itemData));
            } else {
                $scope.modelValue.splice(index, 0, itemData);
            }
        };

        $scope.removeItem = function(index) {
            var removedItem = null;
            if (index > -1) {
                removedItem = $scope.modelValue.splice(index, 1)[0];
            }
            return removedItem;
        };

        $scope.isEmpty = function() {
            return ($scope.modelValue && $scope.modelValue.length === 0);
        };

        $scope.accept = function(sourceItemHandleScope, destScope, destItemScope) {
            return $scope.callbacks.accept(sourceItemHandleScope, destScope, destItemScope);
        };

    }])
    .directive('asSortable',
        function() {
            return {
                require: 'ngModel', // get a hold of NgModelController
                restrict: 'A',
                scope: true,
                controller: 'as.sortable.sortableController',
                link: function(scope, element, attrs, ngModelController) {

                    var ngModel, callbacks;

                    ngModel = ngModelController;

                    if (!ngModel) {
                        return; // do nothing if no ng-model
                    }

                    // Set the model value in to scope.
                    ngModel.$render = function() {
                        scope.modelValue = ngModel.$modelValue;
                    };
                    //set the element in scope to be accessed by its sub scope.
                    scope.element = element;
                    element.data('_scope', scope); // #144, work with angular debugInfoEnabled(false)

                    callbacks = { accept: null, orderChanged: null, itemMoved: null, dragStart: null, dragMove: null, dragCancel: null, dragEnd: null };

                    callbacks.accept = function(sourceItemHandleScope, destSortableScope, destItemScope) {
                        return true;
                    };

                    callbacks.orderChanged = function(event) {};

                    callbacks.itemMoved = function(event) {};

                    callbacks.dragStart = function(event) {};

                    callbacks.dragMove = angular.noop;

                    callbacks.dragCancel = function(event) {};

                    callbacks.dragEnd = function(event) {};

                    //Set the sortOptions callbacks else set it to default.
                    scope.$watch(attrs.asSortable, function(newVal, oldVal) {
                        angular.forEach(newVal, function(value, key) {
                            if (callbacks[key]) {
                                if (typeof value === 'function') {
                                    callbacks[key] = value;
                                }
                            } else {
                                scope.options[key] = value;
                            }
                        });
                        scope.callbacks = callbacks;
                    }, true);

                    // Set isDisabled if attr is set, if undefined isDisabled = false
                    if (angular.isDefined(attrs.isDisabled)) {
                        scope.$watch(attrs.isDisabled, function(newVal, oldVal) {
                            if (!angular.isUndefined(newVal)) {
                                scope.isDisabled = newVal;
                            }
                        }, true);
                    }
                }
            };
        })
    .controller('as.sortable.sortableItemController', ['$scope', function($scope) {

        this.scope = $scope;

        $scope.sortableScope = null;
        $scope.modelValue = null; // sortable item.
        $scope.type = 'item';

        $scope.index = function() {
            return $scope.$index;
        };

        $scope.itemData = function() {
            return $scope.sortableScope.modelValue[$scope.$index];
        };

    }])

.directive('asSortableItem', ['sortableConfig',
        function(sortableConfig) {
            return {
                require: ['^asSortable', '?ngModel'],
                restrict: 'A',
                controller: 'as.sortable.sortableItemController',
                link: function(scope, element, attrs, ctrl) {
                    var sortableController = ctrl[0];
                    var ngModelController = ctrl[1];
                    if (sortableConfig.itemClass) {
                        element.addClass(sortableConfig.itemClass);
                    }
                    scope.sortableScope = sortableController.scope;
                    if (ngModelController) {
                        ngModelController.$render = function() {
                            scope.modelValue = ngModelController.$modelValue;
                        };
                    } else {
                        scope.modelValue = sortableController.scope.modelValue[scope.$index];
                    }
                    scope.element = element;
                    element.data('_scope', scope); // #144, work with angular debugInfoEnabled(false)
                }
            };
        }
    ])
    .controller('as.sortable.sortableItemHandleController', ['$scope', function($scope) {

        this.scope = $scope;

        $scope.itemScope = null;
        $scope.type = 'handle';
    }])

.directive('asSortableItemHandle', ['sortableConfig', '$helper', '$window', '$document', '$timeout',
    function(sortableConfig, $helper, $window, $document, $timeout) {
        return {
            require: '^asSortableItem',
            scope: true,
            restrict: 'A',
            controller: 'as.sortable.sortableItemHandleController',
            link: function(scope, element, attrs, itemController) {

                var dragElement, //drag item element.
                    placeHolder, //place holder class element.
                    placeElement, //hidden place element.
                    itemPosition, //drag item element position.
                    dragItemInfo, //drag item data.
                    containment, //the drag container.
                    containerPositioning, // absolute or relative positioning.
                    dragListen, // drag listen event.
                    scrollableContainer, //the scrollable container
                    dragStart, // drag start event.
                    dragMove, //drag move event.
                    dragEnd, //drag end event.
                    dragCancel, //drag cancel event.
                    isDraggable, //is element draggable.
                    placeHolderIndex, //placeholder index in items elements.
                    bindDrag, //bind drag events.
                    unbindDrag, //unbind drag events.
                    bindEvents, //bind the drag events.
                    unBindEvents, //unbind the drag events.
                    hasTouch, // has touch support.
                    isIOS, // is iOS device.
                    longTouchStart, // long touch start event
                    longTouchCancel, // cancel long touch
                    longTouchTimer, // timer promise for the long touch on iOS devices
                    dragHandled, //drag handled.
                    createPlaceholder, //create place holder.
                    isPlaceHolderPresent, //is placeholder present.
                    isDisabled = false, // drag enabled
                    escapeListen, // escape listen event
                    isLongTouch = false; //long touch disabled.

                function isParent(possibleParent, elem) {
                    if (!elem || elem.nodeName === 'HTML') {
                        return false;
                    }

                    if (elem.parentNode === possibleParent) {
                        return true;
                    }

                    return isParent(possibleParent, elem.parentNode);
                }

                hasTouch = 'ontouchstart' in $window;
                isIOS = /iPad|iPhone|iPod/.test($window.navigator.userAgent) && !$window.MSStream;

                if (sortableConfig.handleClass) {
                    element.addClass(sortableConfig.handleClass);
                }

                scope.itemScope = itemController.scope;
                element.data('_scope', scope); // #144, work with angular debugInfoEnabled(false)

                scope.$watch('[sortableScope.isDisabled, sortableScope.options.longTouch]',
                    function(newValues) {
                        if (isDisabled !== newValues[0]) {
                            isDisabled = newValues[0];
                            if (isDisabled) {
                                unbindDrag();
                            }
                        } else if (isLongTouch !== newValues[1]) {
                            isLongTouch = newValues[1];
                            unbindDrag();
                            bindDrag();
                        } else {
                            bindDrag();
                        }
                    });

                scope.$on('$destroy', function() {
                    angular.element($document[0].body).unbind('keydown', escapeListen);
                });

                createPlaceholder = function(itemScope) {
                    if (typeof scope.sortableScope.options.placeholder === 'function') {
                        return angular.element(scope.sortableScope.options.placeholder(itemScope));
                    } else if (typeof scope.sortableScope.options.placeholder === 'string') {
                        return angular.element(scope.sortableScope.options.placeholder);
                    } else {
                        return angular.element($document[0].createElement(itemScope.element.prop('tagName')));
                    }
                };

                dragListen = function(event) {
                    event.preventDefault();
                    var unbindMoveListen = function() {
                        angular.element($document).unbind('mousemove', moveListen);
                        angular.element($document).unbind('touchmove', moveListen);
                        element.unbind('mouseup', unbindMoveListen);
                        element.unbind('touchend', unbindMoveListen);
                        element.unbind('touchcancel', unbindMoveListen);
                    };

                    var startPosition;
                    var moveListen = function(e) {
                        e.preventDefault();
                        var eventObj = $helper.eventObj(e);
                        if (!startPosition) {
                            startPosition = { clientX: eventObj.clientX, clientY: eventObj.clientY };
                        }
                        if (Math.abs(eventObj.clientX - startPosition.clientX) + Math.abs(eventObj.clientY - startPosition.clientY) > 10) {
                            unbindMoveListen();
                            dragStart(event);
                        }
                    };

                    angular.element($document).bind('mousemove', moveListen);
                    angular.element($document).bind('touchmove', moveListen);
                    element.bind('mouseup', unbindMoveListen);
                    element.bind('touchend', unbindMoveListen);
                    element.bind('touchcancel', unbindMoveListen);
                    event.stopPropagation();
                };

                dragStart = function(event) {

                    var eventObj, tagName;

                    if (!hasTouch && (event.button === 2 || event.which === 3)) {
                        // disable right click
                        return;
                    }
                    if (hasTouch && $helper.isTouchInvalid(event)) {
                        return;
                    }
                    if (dragHandled || !isDraggable(event)) {
                        // event has already fired in other scope.
                        return;
                    }
                    // Set the flag to prevent other items from inheriting the drag event
                    dragHandled = true;
                    event.preventDefault();
                    eventObj = $helper.eventObj(event);
                    scope.sortableScope = scope.sortableScope || scope.itemScope.sortableScope; //isolate directive scope issue.
                    scope.callbacks = scope.callbacks || scope.itemScope.callbacks; //isolate directive scope issue.

                    if (scope.itemScope.sortableScope.options.clone || (scope.itemScope.sortableScope.options.ctrlClone && event.ctrlKey)) {
                        // Clone option is true
                        // or Ctrl clone option is true & the ctrl key was pressed when the user innitiated drag
                        scope.itemScope.sortableScope.cloning = true;
                    } else {
                        scope.itemScope.sortableScope.cloning = false;
                    }

                    // (optional) Scrollable container as reference for top & left offset calculations, defaults to Document
                    scrollableContainer = angular.element($document[0].querySelector(scope.sortableScope.options.scrollableContainer)).length > 0 ?
                        $document[0].querySelector(scope.sortableScope.options.scrollableContainer) : $document[0].documentElement;

                    containment = (scope.sortableScope.options.containment) ? $helper.findAncestor(element, scope.sortableScope.options.containment) : angular.element($document[0].body);
                    //capture mouse move on containment.
                    containment.css('cursor', 'move');
                    containment.css('cursor', '-webkit-grabbing');
                    containment.css('cursor', '-moz-grabbing');
                    containment.addClass('as-sortable-un-selectable');

                    // container positioning
                    containerPositioning = scope.sortableScope.options.containerPositioning || 'absolute';

                    dragItemInfo = $helper.dragItem(scope);
                    tagName = scope.itemScope.element.prop('tagName');

                    dragElement = angular.element($document[0].createElement(scope.sortableScope.element.prop('tagName')))
                        .addClass(scope.sortableScope.element.attr('class')).addClass(sortableConfig.dragClass);
                    dragElement.css('width', $helper.width(scope.itemScope.element) + 'px');
                    dragElement.css('height', $helper.height(scope.itemScope.element) + 'px');

                    placeHolder = createPlaceholder(scope.itemScope)
                        .addClass(sortableConfig.placeHolderClass).addClass(scope.sortableScope.options.additionalPlaceholderClass);
                    placeHolder.css('width', $helper.width(scope.itemScope.element) + 'px');
                    placeHolder.css('height', $helper.height(scope.itemScope.element) + 'px');

                    placeElement = angular.element($document[0].createElement(tagName));
                    if (sortableConfig.hiddenClass) {
                        placeElement.addClass(sortableConfig.hiddenClass);
                    }

                    itemPosition = $helper.positionStarted(eventObj, scope.itemScope.element, scrollableContainer);

                    // fill the immediate vacuum.
                    if (!scope.itemScope.sortableScope.options.clone) {
                        scope.itemScope.element.after(placeHolder);
                    }

                    if (scope.itemScope.sortableScope.cloning) {
                        // clone option is enabled or triggered, so clone the element.
                        dragElement.append(scope.itemScope.element.clone());
                    } else {
                        // add hidden placeholder element in original position.
                        scope.itemScope.element.after(placeElement);
                        // not cloning, so use the original element.
                        dragElement.append(scope.itemScope.element);
                    }

                    containment.append(dragElement);
                    $helper.movePosition(eventObj, dragElement, itemPosition, containment, containerPositioning, scrollableContainer);

                    scope.sortableScope.$apply(function() {
                        scope.callbacks.dragStart(dragItemInfo.eventArgs());
                    });
                    bindEvents();
                };

                isDraggable = function(event) {

                    var elementClicked, sourceScope, isDraggable;

                    elementClicked = angular.element(event.target);

                    // look for the handle on the current scope or parent scopes
                    sourceScope = fetchScope(elementClicked);

                    isDraggable = (sourceScope && sourceScope.type === 'handle');

                    //If a 'no-drag' element inside item-handle if any.
                    while (isDraggable && elementClicked[0] !== element[0]) {
                        if ($helper.noDrag(elementClicked)) {
                            isDraggable = false;
                        }
                        elementClicked = elementClicked.parent();
                    }
                    return isDraggable;
                };

                function insertBefore(targetElement, targetScope) {
                    // Ensure the placeholder is visible in the target (unless it's a table row)
                    if (placeHolder.css('display') !== 'table-row') {
                        placeHolder.css('display', 'block');
                    }
                    if (!targetScope.sortableScope.options.clone) {
                        targetElement[0].parentNode.insertBefore(placeHolder[0], targetElement[0]);
                        dragItemInfo.moveTo(targetScope.sortableScope, targetScope.index());
                    }
                }

                function insertAfter(targetElement, targetScope) {
                    // Ensure the placeholder is visible in the target (unless it's a table row)
                    if (placeHolder.css('display') !== 'table-row') {
                        placeHolder.css('display', 'block');
                    }
                    if (!targetScope.sortableScope.options.clone) {
                        targetElement.after(placeHolder);
                        dragItemInfo.moveTo(targetScope.sortableScope, targetScope.index() + 1);
                    }
                }

                dragMove = function(event) {

                    var eventObj, targetX, targetY, targetScope, targetElement;

                    if (hasTouch && $helper.isTouchInvalid(event)) {
                        return;
                    }
                    // Ignore event if not handled
                    if (!dragHandled) {
                        return;
                    }
                    if (dragElement) {

                        event.preventDefault();

                        eventObj = $helper.eventObj(event);

                        // checking if dragMove callback exists, to prevent application
                        // rerenderings on each mouse move event
                        if (scope.callbacks.dragMove !== angular.noop) {
                            scope.sortableScope.$apply(function() {
                                scope.callbacks.dragMove(itemPosition, containment, eventObj);
                            });
                        }

                        targetX = eventObj.pageX - $document[0].documentElement.scrollLeft;
                        targetY = eventObj.pageY - ($window.pageYOffset || $document[0].documentElement.scrollTop);

                        //IE fixes: hide show element, call element from point twice to return pick correct element.
                        targetElement = angular.element($document[0].elementFromPoint(targetX, targetY));
                        dragElement.addClass(sortableConfig.hiddenClass);
                        dragElement.removeClass(sortableConfig.hiddenClass);

                        $helper.movePosition(eventObj, dragElement, itemPosition, containment, containerPositioning, scrollableContainer);

                        //Set Class as dragging starts
                        dragElement.addClass(sortableConfig.dragging);

                        targetScope = fetchScope(targetElement);

                        if (!targetScope || !targetScope.type) {
                            return;
                        }
                        if (targetScope.type === 'handle') {
                            targetScope = targetScope.itemScope;
                        }
                        if (targetScope.type !== 'item' && targetScope.type !== 'sortable') {
                            return;
                        }

                        if (targetScope.type === 'item' && targetScope.accept(scope, targetScope.sortableScope, targetScope)) {
                            // decide where to insert placeholder based on target element and current placeholder if is present
                            targetElement = targetScope.element;

                            // Fix #241 Drag and drop have trembling with blocks of different size
                            var targetElementOffset = $helper.offset(targetElement, scrollableContainer);
                            if (!dragItemInfo.canMove(itemPosition, targetElement, targetElementOffset)) {
                                return;
                            }

                            var placeholderIndex = placeHolderIndex(targetScope.sortableScope.element);
                            if (placeholderIndex < 0) {
                                insertBefore(targetElement, targetScope);
                            } else {
                                if (placeholderIndex <= targetScope.index()) {
                                    insertAfter(targetElement, targetScope);
                                } else {
                                    insertBefore(targetElement, targetScope);
                                }
                            }
                        }

                        if (targetScope.type === 'sortable') { //sortable scope.
                            if (targetScope.accept(scope, targetScope) &&
                                !isParent(targetScope.element[0], targetElement[0])) {
                                //moving over sortable bucket. not over item.
                                if (!isPlaceHolderPresent(targetElement) && !targetScope.options.clone) {
                                    targetElement[0].appendChild(placeHolder[0]);
                                    dragItemInfo.moveTo(targetScope, targetScope.modelValue.length);
                                }
                            }
                        }
                    }
                };

                function fetchScope(element) {
                    var scope;
                    while (!scope && element.length) {
                        scope = element.data('_scope');
                        if (!scope) {
                            element = element.parent();
                        }
                    }
                    return scope;
                }

                placeHolderIndex = function(targetElement) {
                    var itemElements, i;
                    // targetElement is placeHolder itself, return index 0
                    if (targetElement.hasClass(sortableConfig.placeHolderClass)) {
                        return 0;
                    }
                    // find index in target children
                    itemElements = targetElement.children();
                    for (i = 0; i < itemElements.length; i += 1) {
                        //TODO may not be accurate when elements contain other siblings than item elements
                        //solve by adding 1 to model index of previous item element
                        if (angular.element(itemElements[i]).hasClass(sortableConfig.placeHolderClass)) {
                            return i;
                        }
                    }
                    return -1;
                };

                isPlaceHolderPresent = function(targetElement) {
                    return placeHolderIndex(targetElement) >= 0;
                };

                function rollbackDragChanges() {
                    if (!scope.itemScope.sortableScope.cloning) {
                        placeElement.replaceWith(scope.itemScope.element);
                    }
                    placeHolder.remove();
                    dragElement.remove();
                    dragElement = null;
                    dragHandled = false;
                    containment.css('cursor', '');
                    containment.removeClass('as-sortable-un-selectable');
                }

                dragEnd = function(event) {
                    // Ignore event if not handled
                    if (!dragHandled) {
                        return;
                    }
                    event.preventDefault();
                    if (dragElement) {
                        //rollback all the changes.
                        rollbackDragChanges();
                        // update model data
                        dragItemInfo.apply();
                        scope.sortableScope.$apply(function() {
                            if (dragItemInfo.isSameParent()) {
                                if (dragItemInfo.isOrderChanged()) {
                                    scope.callbacks.orderChanged(dragItemInfo.eventArgs());
                                }
                            } else {
                                scope.callbacks.itemMoved(dragItemInfo.eventArgs());
                            }
                        });
                        scope.sortableScope.$apply(function() {
                            scope.callbacks.dragEnd(dragItemInfo.eventArgs());
                        });
                        dragItemInfo = null;
                    }
                    unBindEvents();
                };

                dragCancel = function(event) {
                    // Ignore event if not handled
                    if (!dragHandled) {
                        return;
                    }
                    event.preventDefault();

                    if (dragElement) {
                        //rollback all the changes.
                        rollbackDragChanges();
                        scope.sortableScope.$apply(function() {
                            scope.callbacks.dragCancel(dragItemInfo.eventArgs());
                        });
                        dragItemInfo = null;
                    }
                    unBindEvents();
                };

                bindDrag = function() {
                    if (hasTouch) {
                        if (isLongTouch) {
                            if (isIOS) {
                                element.bind('touchstart', longTouchStart);
                                element.bind('touchend', longTouchCancel);
                                element.bind('touchmove', longTouchCancel);
                            } else {
                                element.bind('contextmenu', dragListen);
                            }
                        } else {
                            element.bind('touchstart', dragListen);
                        }
                    } else {
                        element.bind('mousedown', dragListen);
                    }
                };

                unbindDrag = function() {
                    element.unbind('touchstart', longTouchStart);
                    element.unbind('touchend', longTouchCancel);
                    element.unbind('touchmove', longTouchCancel);
                    element.unbind('contextmenu', dragListen);
                    element.unbind('touchstart', dragListen);
                    element.unbind('mousedown', dragListen);
                };

                longTouchStart = function(event) {
                    longTouchTimer = $timeout(function() {
                        dragListen(event);
                    }, 500);
                };

                longTouchCancel = function() {
                    $timeout.cancel(longTouchTimer);
                };

                //bind drag start events.
                //put in a watcher since this method is now depending on the longtouch option from sortable.sortOptions
                //bindDrag();

                //Cancel drag on escape press.
                escapeListen = function(event) {
                    if (event.keyCode === 27) {
                        dragCancel(event);
                    }
                };
                angular.element($document[0].body).bind('keydown', escapeListen);

                bindEvents = function() {
                    angular.element($document).bind('touchmove', dragMove);
                    angular.element($document).bind('touchend', dragEnd);
                    angular.element($document).bind('touchcancel', dragCancel);
                    angular.element($document).bind('mousemove', dragMove);
                    angular.element($document).bind('mouseup', dragEnd);
                };

                unBindEvents = function() {
                    angular.element($document).unbind('touchend', dragEnd);
                    angular.element($document).unbind('touchcancel', dragCancel);
                    angular.element($document).unbind('touchmove', dragMove);
                    angular.element($document).unbind('mouseup', dragEnd);
                    angular.element($document).unbind('mousemove', dragMove);
                };
            }
        };
    }
])

.factory('$helper', ['$document', '$window',
    function($document, $window) {
        return {

            height: function(element) {
                return element[0].getBoundingClientRect().height;
            },

            width: function(element) {
                return element[0].getBoundingClientRect().width;
            },

            offset: function(element, scrollableContainer) {
                var boundingClientRect = element[0].getBoundingClientRect();
                if (!scrollableContainer) {
                    scrollableContainer = $document[0].documentElement;
                }

                return {
                    width: boundingClientRect.width || element.prop('offsetWidth'),
                    height: boundingClientRect.height || element.prop('offsetHeight'),
                    top: boundingClientRect.top + ($window.pageYOffset || scrollableContainer.scrollTop - scrollableContainer.offsetTop),
                    left: boundingClientRect.left + ($window.pageXOffset || scrollableContainer.scrollLeft - scrollableContainer.offsetLeft)
                };
            },

            eventObj: function(event) {
                var obj = event;
                if (event.targetTouches !== undefined) {
                    obj = event.targetTouches.item(0);
                } else if (event.originalEvent !== undefined && event.originalEvent.targetTouches !== undefined) {
                    obj = event.originalEvent.targetTouches.item(0);
                }
                return obj;
            },

            isTouchInvalid: function(event) {

                var touchInvalid = false;
                if (event.touches !== undefined && event.touches.length > 1) {
                    touchInvalid = true;
                } else if (event.originalEvent !== undefined &&
                    event.originalEvent.touches !== undefined && event.originalEvent.touches.length > 1) {
                    touchInvalid = true;
                }
                return touchInvalid;
            },

            positionStarted: function(event, target, scrollableContainer) {
                var pos = {};
                pos.offsetX = event.pageX - this.offset(target, scrollableContainer).left;
                pos.offsetY = event.pageY - this.offset(target, scrollableContainer).top;
                pos.startX = pos.lastX = event.pageX;
                pos.startY = pos.lastY = event.pageY;
                pos.nowX = pos.nowY = pos.distX = pos.distY = pos.dirAx = 0;
                pos.dirX = pos.dirY = pos.lastDirX = pos.lastDirY = pos.distAxX = pos.distAxY = 0;
                return pos;
            },

            calculatePosition: function(pos, event) {
                // mouse position last events
                pos.lastX = pos.nowX;
                pos.lastY = pos.nowY;

                // mouse position this events
                pos.nowX = event.pageX;
                pos.nowY = event.pageY;

                // distance mouse moved between events
                pos.distX = pos.nowX - pos.lastX;
                pos.distY = pos.nowY - pos.lastY;

                // direction mouse was moving
                pos.lastDirX = pos.dirX;
                pos.lastDirY = pos.dirY;

                // direction mouse is now moving (on both axis)
                pos.dirX = pos.distX === 0 ? 0 : pos.distX > 0 ? 1 : -1;
                pos.dirY = pos.distY === 0 ? 0 : pos.distY > 0 ? 1 : -1;

                // axis mouse is now moving on
                var newAx = Math.abs(pos.distX) > Math.abs(pos.distY) ? 1 : 0;

                // calc distance moved on this axis (and direction)
                if (pos.dirAx !== newAx) {
                    pos.distAxX = 0;
                    pos.distAxY = 0;
                } else {
                    pos.distAxX += Math.abs(pos.distX);
                    if (pos.dirX !== 0 && pos.dirX !== pos.lastDirX) {
                        pos.distAxX = 0;
                    }

                    pos.distAxY += Math.abs(pos.distY);
                    if (pos.dirY !== 0 && pos.dirY !== pos.lastDirY) {
                        pos.distAxY = 0;
                    }
                }
                pos.dirAx = newAx;
            },

            movePosition: function(event, element, pos, container, containerPositioning, scrollableContainer) {
                var bounds;
                var useRelative = (containerPositioning === 'relative');

                element.x = event.pageX - pos.offsetX;
                element.y = event.pageY - pos.offsetY;

                if (container) {
                    bounds = this.offset(container, scrollableContainer);

                    if (useRelative) {
                        // reduce positioning by bounds
                        element.x -= bounds.left;
                        element.y -= bounds.top;

                        // reset bounds
                        bounds.left = 0;
                        bounds.top = 0;
                    }

                    if (element.x < bounds.left) {
                        element.x = bounds.left;
                    } else if (element.x >= bounds.width + bounds.left - this.offset(element).width) {
                        element.x = bounds.width + bounds.left - this.offset(element).width;
                    }
                    if (element.y < bounds.top) {
                        element.y = bounds.top;
                    } else if (element.y >= bounds.height + bounds.top - this.offset(element).height) {
                        element.y = bounds.height + bounds.top - this.offset(element).height;
                    }
                }

                element.css({
                    'left': element.x + 'px',
                    'top': element.y + 'px'
                });

                this.calculatePosition(pos, event);
            },

            dragItem: function(item) {

                return {
                    index: item.index(),
                    parent: item.sortableScope,
                    source: item,
                    targetElement: null,
                    targetElementOffset: null,
                    sourceInfo: {
                        index: item.index(),
                        itemScope: item.itemScope,
                        sortableScope: item.sortableScope
                    },
                    canMove: function(itemPosition, targetElement, targetElementOffset) {
                        // return true if targetElement has been changed since last call
                        if (this.targetElement !== targetElement) {
                            this.targetElement = targetElement;
                            this.targetElementOffset = targetElementOffset;
                            return true;
                        }
                        // return true if mouse is moving in the last moving direction of targetElement
                        if (itemPosition.dirX * (targetElementOffset.left - this.targetElementOffset.left) > 0 ||
                            itemPosition.dirY * (targetElementOffset.top - this.targetElementOffset.top) > 0) {
                            this.targetElementOffset = targetElementOffset;
                            return true;
                        }
                        // return false otherwise
                        return false;
                    },
                    moveTo: function(parent, index) {
                        // move the item to a new position
                        this.parent = parent;
                        // if the source item is in the same parent, the target index is after the source index and we're not cloning
                        if (this.isSameParent() && this.source.index() < index && !this.sourceInfo.sortableScope.cloning) {
                            index = index - 1;
                        }
                        this.index = index;
                    },
                    isSameParent: function() {
                        return this.parent.element === this.sourceInfo.sortableScope.element;
                    },
                    isOrderChanged: function() {
                        return this.index !== this.sourceInfo.index;
                    },
                    eventArgs: function() {
                        return {
                            source: this.sourceInfo,
                            dest: {
                                index: this.index,
                                sortableScope: this.parent
                            }
                        };
                    },
                    apply: function() {
                        if (!this.sourceInfo.sortableScope.cloning) {
                            // if not cloning, remove the item from the source model.
                            this.sourceInfo.sortableScope.removeItem(this.sourceInfo.index);

                            // if the dragged item is not already there, insert the item. This avoids ng-repeat dupes error
                            if (this.parent.options.allowDuplicates || this.parent.modelValue.indexOf(this.source.modelValue) < 0) {
                                this.parent.insertItem(this.index, this.source.modelValue);
                            }
                        } else if (!this.parent.options.clone) { // prevent drop inside sortables that specify options.clone = true
                            // clone the model value as well
                            this.parent.insertItem(this.index, angular.copy(this.source.modelValue));
                        }
                    }
                };
            },

            noDrag: function(element) {
                return element.attr('no-drag') !== undefined || element.attr('data-no-drag') !== undefined;
            },

            findAncestor: function(el, selector) {
                el = el[0];
                var matches = Element.matches || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;
                while ((el = el.parentElement) && !matches.call(el, selector)) {}
                return el ? angular.element(el) : angular.element(document.body);
            }
        };
    }
]);

angular.module('ui.tux.widgets', ['ui.tux.modal', 'as.sortable'])

.directive("dashItem", function() {
        return {
            link: function(scope, elem, attr) {
                scope.$emit("itemRender", attr.index);
            }
        }
    })
    .directive('tuxWidgets', function($timeout, $compile) {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                widgetSource: "=",
                dashboardItems: "="
            },
            templateUrl: function(element, attributes) {
                return attributes.template || "tux/template/widgets/widgets.html";
            },
            link: function(scope, elem, attr) {
                scope.$on("itemRender", function(event, index) {
                    if (parseInt(index, 10) === scope.dashBoardData.length - 1) {
                        scope.updateBreakpoints();
                    }
                });
                scope.updateBreakpoints = function() {
                    var breakpoints = scope.widgetData.breakpoints || {},
                        desktop = breakpoints.desktop || 3,
                        lgdesktop = breakpoints.lgdesktop || 4,
                        mobile = breakpoints.mobile || 1,
                        tablet = breakpoints.tablet || 2,
                        deskElem = angular.element(elem[0].querySelectorAll(".moving-item:nth-child(" + desktop + "n)")),
                        lgdeskElem = angular.element(elem[0].querySelectorAll(".moving-item:nth-child(" + lgdesktop + "n)")),
                        mobileElem = angular.element(elem[0].querySelectorAll(".moving-item:nth-child(" + mobile + "n)")),
                        tabletElem = angular.element(elem[0].querySelectorAll(".moving-item:nth-child(" + tablet + "n)")),
                        dashBoardContent = elem[0].getElementsByClassName("dashboard-content");

                    angular.element(elem[0].getElementsByClassName("moving-item")).addClass("col-md-" + 12 / desktop + " col-lg-" + 12 / lgdesktop + " col-sm-" + 12 / tablet + " col-xs-" + 12 / mobile);
                    deskElem.after("<div class='clearfix visible-md-block align-item'></div>");
                    lgdeskElem.after("<div class='clearfix visible-lg-block align-item'></div>");
                    mobileElem.after("<div class='clearfix visible-xs-block align-item'></div>");
                    tabletElem.after("<div class='clearfix visible-sm-block align-item'></div>");

                    angular.forEach(scope.dashBoardData, function(widget, index) {
                        if (widget.url) {
                            var xhttp = new XMLHttpRequest(),
                                dashBoardContentWrap = angular.element(dashBoardContent[index]);
                            xhttp.onreadystatechange = function() {
                                if (xhttp.readyState == 4 && xhttp.status == 200) {
                                    dashBoardContentWrap.html(xhttp.response);
                                    var templateScript = angular.element(dashBoardContentWrap.find('script'));
                                    var scriptTag = document.createElement('script');
                                    scriptTag.setAttribute('type', 'text/javascript');
                                    if (angular.isDefined(templateScript.attr('src'))) {
                                        scriptTag.setAttribute('src', templateScript.attr('src'));
                                    } else {
                                        scriptTag.text = templateScript.text();
                                    }

                                    templateScript.replaceWith(scriptTag);
                                    $compile(dashBoardContentWrap)(scope);
                                }
                            };
                            xhttp.open("GET", widget.url, true);
                            xhttp.send();
                        }
                    })
                };



            },
            controller: ["$scope", "$tuxModal", "$http", function($scope, $tuxModal, $http) {
                $scope.dashboardItems = $scope.dashboardItems || [];
                $scope.dashBoardData = [];

                $scope.updateDashboard = function() {
                    $scope.dashBoardData.splice(0);
                    if ($scope.widgetData) {
                        $scope.availableWidgets = angular.copy($scope.widgetData.widget);
                        angular.forEach($scope.dashboardItems, function(item) {
                            angular.forEach($scope.availableWidgets, function(widgetItem, index) {
                                if (widgetItem.id === item) {
                                    $scope.dashBoardData.push(widgetItem);
                                    $scope.availableWidgets.splice(index, 1);
                                }
                            })
                        });
                    }
                }
                $scope.$on("refreshWidget", $scope.updateDashboard);
                $scope.$watchCollection("dashboardItems", function() {
                    $scope.updateDashboard();
                    $scope.$emit("dashboardChange", $scope.dashboardItems);
                });


                if (angular.isObject($scope.widgetSource)) {
                    $scope.widgetData = $scope.widgetSource;
                    $scope.updateDashboard();
                } else if (angular.isString($scope.widgetSource)) {
                    $http.get($scope.widgetSource).then(function(response) {
                        $scope.widgetData = response.data;
                        $scope.updateDashboard();
                    });
                }



                $scope.open = function() {

                    var modalInstance = $tuxModal.open({
                        templateUrl: "tux/template/widgets/widgets-sort.html",
                        controller: 'widgetsUpdate',
                        windowClass: "widget-modal",
                        size: "lg",
                        resolve: {
                            widgetData: function() {
                                return $scope.widgetData;
                            },
                            dashBoardData: function() {
                                return $scope.dashBoardData;
                            },
                            dashboardItems: function() {
                                return $scope.dashboardItems;
                            },
                            availableWidgets: function() {
                                return $scope.availableWidgets;
                            }
                        }
                    });

                };
            }]
        };
    })
    .controller("widgetsUpdate", function($scope, $tuxModalInstance, widgetData, dashBoardData, dashboardItems, availableWidgets) {
        var breakpoints = widgetData.breakpoints || {},
            desktop = breakpoints.desktop || 3,
            lgdesktop = breakpoints.lgdesktop || 4,
            mobile = breakpoints.mobile || 1,
            tablet = breakpoints.tablet || 2;
        $scope.widegetData = widgetData;
        $scope.dashBoardDataCopy = angular.copy(dashBoardData);
        $scope.availableWidgetsCopy = angular.copy(availableWidgets);
        $scope.breakClasses = "col-md-" + 12 / desktop + " col-lg-" + 12 / lgdesktop + " col-sm-" + 12 / tablet + " col-xs-" + 12 / mobile;
        $scope.done = function() {
            dashboardItems.splice(0);
            angular.forEach($scope.dashBoardDataCopy, function(elem) {
                dashboardItems.push(elem.id);
            });
            $tuxModalInstance.close();
        };
        $scope.cancel = function() {
            $tuxModalInstance.close();
        };
        $scope.addItem = function(index) {
            $scope.dashBoardDataCopy.push($scope.availableWidgetsCopy[index]);
            $scope.availableWidgetsCopy.splice(index, 1);
        };
        $scope.removeItemData = function(index) {
            $scope.availableWidgetsCopy.push($scope.dashBoardDataCopy[index]);
            $scope.dashBoardDataCopy.splice(index, 1);
        };

    })
    // .controller('tmpCltr',function($scope){
    //     $scope.val = 100;
    // })
    // .directive('tmp', function() {
    //     return {
    //         scope: false,                      
    //         link: function(scope, elm, attr) {
    //             scope._elmHeight = elm[0].offsetHeight;
    //             scope.$watch(function() {
    //                 scope._elmHeight = elm[0].offsetHeight;
    //                 console.log(scope._elmHeight)
    //             });
    //         }
    //     }
    // })
    // .directive('tmp1', function() {
    //     return {  
    //         scope: false,         
    //         link: function(scope, elm, attr) {
    //             console.log(scope)
    //             scope.$watch('_elmHeight', function(newHeight, oldHeight) {
    //                 elm.attr('style', 'min-height: ' + newHeight + 'px');
    //                 console.log(newHeight + 'newHeight');
    //             });
    //         }
    //     }
    // });

angular.module('ui.tux.wizard', [])

.directive('tuxWizard', function() {
        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {
                currentStep: '=',
                onFinish: '&',
                hideIndicators: '=',
                editMode: '=',
                name: '@'
            },
            templateUrl: function(element, attributes) {
                return attributes.template || "tux/template/wizard/wizard.html";
            },

            //controller for wizard directive, treat this just like an angular controller
            controller: ['$scope', '$element', '$log', 'WizardHandler', '$q', function($scope, $element, $log, WizardHandler, $q) {
                //this variable allows directive to load without having to pass any step validation
                var firstRun = true;
                //creating instance of wizard, passing this as second argument allows access to functions attached to this via Service
                WizardHandler.addWizard($scope.name || WizardHandler.defaultName, this);

                $scope.$on('$destroy', function() {
                    WizardHandler.removeWizard($scope.name || WizardHandler.defaultName);
                });

                //steps array where all the scopes of each step are added
                $scope.steps = [];

                var stepIdx = function(step) {
                    var idx = 0;
                    var res = -1;
                    angular.forEach($scope.getEnabledSteps(), function(currStep) {
                        if (currStep === step) {
                            res = idx;
                        }
                        idx++;
                    });
                    return res;
                };

                var stepByTitle = function(titleToFind) {
                    var foundStep = null;
                    angular.forEach($scope.getEnabledSteps(), function(step) {
                        if (step.wzTitle === titleToFind) {
                            foundStep = step;
                        }
                    });
                    return foundStep;
                };

                //access to context object for step validation
                $scope.context = {};

                //watching changes to currentStep
                $scope.$watch('currentStep', function(step) {
                    //checking to make sure currentStep is truthy value
                    if (!step) return;
                    //setting stepTitle equal to current step title or default title
                    var stepTitle = $scope.selectedStep.wzTitle;
                    if ($scope.selectedStep && stepTitle !== $scope.currentStep) {
                        //invoking goTo() with step title as argument
                        $scope.goTo(stepByTitle($scope.currentStep));
                    }

                });

                //watching steps array length and editMode value, if edit module is undefined or null the nothing is done
                //if edit mode is truthy, then all steps are marked as completed
                $scope.$watch('[editMode, steps.length]', function() {
                    var editMode = $scope.editMode;
                    if (angular.isUndefined(editMode) || (editMode === null)) return;

                    if (editMode) {
                        angular.forEach($scope.getEnabledSteps(), function(step) {
                            step.completed = true;
                        });
                    } else {
                        var completedStepsIndex = $scope.currentStepNumber() - 1;
                        angular.forEach($scope.getEnabledSteps(), function(step, stepIndex) {
                            if (stepIndex >= completedStepsIndex) {
                                step.completed = false;
                            }
                        });
                    }
                }, true);

                //called each time step directive is loaded
                this.addStep = function(step) {
                    //pushing the scope of directive onto step array
                    $scope.steps.push(step);
                    //if this is first step being pushed then goTo that first step
                    if ($scope.getEnabledSteps().length === 1) {
                        //goTo first step
                        $scope.goTo($scope.getEnabledSteps()[0]);
                    }
                };

                this.context = $scope.context;

                $scope.getStepNumber = function(step) {
                    return stepIdx(step) + 1;
                };

                $scope.goTo = function(step) {
                    //if this is the first time the wizard is loading it bi-passes step validation
                    if (firstRun) {
                        //deselect all steps so you can set fresh below
                        unselectAll();
                        $scope.selectedStep = step;
                        //making sure current step is not undefined
                        if (!angular.isUndefined($scope.currentStep)) {
                            $scope.currentStep = step.wzTitle;
                        }
                        //setting selected step to argument passed into goTo()
                        step.selected = true;
                        step.visited = true;
                        //emit event upwards with data on goTo() invoktion
                        $scope.$emit('wizard:stepChanged', { step: step, index: stepIdx(step) });
                        //setting variable to false so all other step changes must pass validation
                        firstRun = false;
                    } else {
                        //createing variables to capture current state that goTo() was invoked from and allow booleans
                        var thisStep;
                        //getting data for step you are transitioning out of
                        if ($scope.currentStepNumber() > 0) {
                            thisStep = $scope.currentStepNumber() - 1;
                        } else if ($scope.currentStepNumber() === 0) {
                            thisStep = 0;
                        }
                        //$log.log('steps[thisStep] Data: ', $scope.getEnabledSteps()[thisStep].canexit);
                        $q.all([canExitStep($scope.getEnabledSteps()[thisStep], step), canEnterStep(step)]).then(function(data) {
                            if (data[0] && data[1]) {
                                //deselect all steps so you can set fresh below
                                unselectAll();

                                //$log.log('value for canExit argument: ', $scope.currentStep.canexit);
                                $scope.selectedStep = step;
                                //making sure current step is not undefined
                                if (!angular.isUndefined($scope.currentStep)) {
                                    $scope.currentStep = step.wzTitle;
                                }
                                //setting selected step to argument passed into goTo()
                                step.selected = true;
                                step.visited = true;
                                //emit event upwards with data on goTo() invoktion
                                $scope.$emit('wizard:stepChanged', { step: step, index: stepIdx(step) });
                                $scope.$broadcast('jump', stepIdx(step));
                                //$log.log('current step number: ', $scope.currentStepNumber());
                            }
                        });
                    }
                };

                function canEnterStep(step) {
                    var defer,
                        canEnter;
                    //If no validation function is provided, allow the user to enter the step
                    if (step.canenter === undefined) {
                        return true;
                    }
                    //If canenter is a boolean value instead of a function, return the value
                    if (typeof step.canenter === 'boolean') {
                        return step.canenter;
                    }
                    //Check to see if the canenter function is a promise which needs to be returned
                    canEnter = step.canenter($scope.context);
                    if (angular.isFunction(canEnter.then)) {
                        defer = $q.defer();
                        canEnter.then(function(response) {
                            defer.resolve(response);
                        });
                        return defer.promise;
                    } else {
                        return canEnter === true;
                    }
                }

                function canExitStep(step, stepTo) {
                    var defer,
                        canExit;
                    //Exiting the step should be allowed if no validation function was provided or if the user is moving backwards
                    if (typeof(step.canexit) === 'undefined' || $scope.getStepNumber(stepTo) < $scope.currentStepNumber()) {
                        return true;
                    }
                    //If canexit is a boolean value instead of a function, return the value
                    if (typeof step.canexit === 'boolean') {
                        return step.canexit;
                    }
                    //Check to see if the canexit function is a promise which needs to be returned
                    canExit = step.canexit($scope.context);
                    if (angular.isFunction(canExit.then)) {
                        defer = $q.defer();
                        canExit.then(function(response) {
                            defer.resolve(response);
                        });
                        return defer.promise;
                    } else {
                        return canExit === true;
                    }
                }

                $scope.currentStepNumber = function() {
                    //retreive current step number
                    return stepIdx($scope.selectedStep) + 1;
                };

                $scope.getEnabledSteps = function() {
                    return $scope.steps.filter(function(step) {
                        return step.disabled !== 'true';
                    });
                };

                //unSelect All Steps
                function unselectAll() {
                    //traverse steps array and set each "selected" property to false
                    angular.forEach($scope.getEnabledSteps(), function(step) {
                        step.selected = false;
                    });
                    //set selectedStep variable to null
                    $scope.selectedStep = null;
                }

                $scope.jumpTo = function(step) {
                    if (step.visited) {
                        $scope.goTo(step);
                    };
                }

                //ALL METHODS ATTACHED TO this ARE ACCESSIBLE VIA WizardHandler.wizard().methodName()

                this.currentStepTitle = function() {
                    return $scope.selectedStep.wzTitle;
                };

                this.currentStepDescription = function() {
                    return $scope.selectedStep.description;
                };

                this.currentStep = function() {
                    return $scope.selectedStep;
                };

                this.totalStepCount = function() {
                    return $scope.getEnabledSteps().length;
                }

                //Access to enabled steps from outside
                this.getEnabledSteps = function() {
                    return $scope.getEnabledSteps();
                };

                //Access to current step number from outside
                this.currentStepNumber = function() {
                    return $scope.currentStepNumber();
                };
                //method used for next button within step
                this.next = function(callback) {
                    var enabledSteps = $scope.getEnabledSteps();
                    //setting variable equal to step  you were on when next() was invoked
                    var index = stepIdx($scope.selectedStep);
                    //checking to see if callback is a function
                    if (angular.isFunction(callback)) {
                        if (callback()) {
                            if (index === enabledSteps.length - 1) {
                                this.finish();
                            } else {
                                //invoking goTo() with step number next in line
                                $scope.goTo(enabledSteps[index + 1]);
                            }
                        } else {
                            return;
                        }
                    }
                    if (!callback) {
                        //completed property set on scope which is used to add class/remove class from progress bar
                        $scope.selectedStep.completed = true;
                    }
                    //checking to see if this is the last step.  If it is next behaves the same as finish()
                    if (index === enabledSteps.length - 1) {
                        this.finish();
                    } else {
                        //invoking goTo() with step number next in line
                        $scope.goTo(enabledSteps[index + 1]);
                    }

                };

                //used to traverse to any step, step number placed as argument
                this.goTo = function(step) {
                    var enabledSteps = $scope.getEnabledSteps();
                    var stepTo;
                    //checking that step is a Number
                    if (angular.isNumber(step)) {
                        stepTo = enabledSteps[step];
                    } else {
                        //finding the step associated with the title entered as goTo argument
                        stepTo = stepByTitle(step);
                    }
                    //going to step
                    $scope.goTo(stepTo);
                };

                //calls finish() which calls onFinish() which is declared on an attribute and linked to controller via wizard directive.
                this.finish = function() {
                    var steps = $scope.getEnabledSteps(),
                        lastStep = steps[steps.length - 1],
                        canExit = null;
                    if (typeof(lastStep.canexit) === 'undefined' || typeof(lastStep.canexit) === 'boolean' && lastStep.canexit) {
                        if ($scope.onFinish) {
                            $scope.onFinish();
                        }
                    }
                    if (angular.isFunction(lastStep.canExit)) {
                        canExit = lastStep.canexit($scope.context);
                        if (angular.isFunction(canExit.then)) {
                            canExit.then(function(response) {
                                if (response && $scope.onFinish) {
                                    $scope.onFinish();
                                }
                            });
                        } else {
                            if (canExit && $scope.onFinish) {
                                $scope.onFinish();
                            }
                        }
                    }

                };

                this.previous = function() {
                    //getting index of current step
                    var index = stepIdx($scope.selectedStep);
                    //ensuring you aren't trying to go back from the first step
                    if (index !== 0) {
                        //go back one step from current step
                        $scope.goTo($scope.getEnabledSteps()[index - 1]);
                    }
                };

                //cancel is alias for previous.
                this.cancel = function() {
                    //getting index of current step
                    var index = stepIdx($scope.selectedStep);
                    //ensuring you aren't trying to go back from the first step
                    if (index !== 0) {
                        //go back one step from current step
                        $scope.goTo($scope.getEnabledSteps()[0]);
                    }
                };

                //reset
                this.reset = function() {
                    //traverse steps array and set each "completed" property to false
                    angular.forEach($scope.getEnabledSteps(), function(step) {
                        step.completed = false;
                    });
                    //go to first step
                    this.goTo(0);
                };
            }]
        };
    })
    .directive('tuxWzStep', function() {
        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {
                wzTitle: '@',
                canenter: '=',
                canexit: '=',
                disabled: '@?wzDisabled',
                description: '@',
                wzData: '=',
                icon: '@'
            },
            require: '^tuxWizard',
            templateUrl: function(element, attributes) {
                return attributes.template || "tux/template/wizard/step.html";
            },
            link: function($scope, $element, $attrs, wizard) {
                $scope.title = $scope.wzTitle;
                wizard.addStep($scope);
            }
        };
    })
    .factory('WizardHandler', function() {
        var service = {};

        var wizards = {};

        service.defaultName = "defaultWizard";

        service.addWizard = function(name, wizard) {
            wizards[name] = wizard;
        };

        service.removeWizard = function(name) {
            delete wizards[name];
        };

        service.wizard = function(name) {
            var nameToUse = name;
            if (!name) {
                nameToUse = service.defaultName;
            }

            return wizards[nameToUse];
        };

        return service;
    })
    .directive("tuxWzNext", function() {
        return {
            restrict: 'A',
            replace: false,
            require: '^tuxWizard',
            link: function($scope, $element, $attrs, wizard) {

                $element.on("click", function(e) {
                    e.preventDefault();
                    $scope.$apply(function() {
                        $scope.$eval($attrs["tuxWzNext"]);
                        wizard.next();
                    });
                });
                $scope.$on("jump", function(event, index) {
                    if (index === wizard.totalStepCount() - 1) {
                        $element.prop("disabled", true);
                    } else {
                        $element.prop("disabled", false);
                    }
                })
            }
        };
    })
    .directive("tuxWzPrevious", function() {
        return {
            restrict: 'A',
            replace: false,
            require: '^tuxWizard',
            link: function($scope, $element, $attrs, wizard) {
                $element.prop("disabled", true);
                $element.on("click", function(e) {
                    e.preventDefault();
                    $scope.$apply(function() {
                        $scope.$eval($attrs["tuxWzNext"]);
                        wizard.previous();
                    });
                });
                $scope.$on("jump", function(event, index) {
                    if (index === 0) {
                        $element.prop("disabled", true);
                    } else {
                        $element.prop("disabled", false);
                    }
                })
            }
        };
    })
    .directive("tuxWzFinish", function() {
        return {
            restrict: 'A',
            replace: false,
            require: '^tuxWizard',
            link: function($scope, $element, $attrs, wizard) {
                $element.addClass("hide-button");
                $element.on("click", function(e) {
                    e.preventDefault();
                    $scope.$apply(function() {
                        $scope.$eval($attrs["tuxWzFinish"]);
                        wizard.finish();
                    });
                });
                $scope.$on("jump", function(event, index) {
                    if (index === wizard.totalStepCount() - 1) {
                        $element.removeClass("hide-button");
                    } else {
                        $element.addClass("hide-button");
                    }
                })
            }
        };
    });

function wizardButtonDirective(action) {
    angular.module('ui.tux.wizard')
        .directive(action, function() {
            return {
                restrict: 'A',
                replace: false,
                require: '^tuxWizard',
                link: function($scope, $element, $attrs, wizard) {

                    $element.on("click", function(e) {
                        e.preventDefault();
                        $scope.$apply(function() {
                            $scope.$eval($attrs[action]);
                            wizard[action.replace("tuxWz", "").toLowerCase()]();
                        });
                    });
                }
            };
        });
}

wizardButtonDirective('tuxWzCancel');
wizardButtonDirective('tuxWzReset');

angular.module("tux/template/accordion/accordion-group.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/accordion/accordion-group.html",
    "<div class=\"panel\" ng-class=\"panelClass || 'panel-default'\">\n" +
    "  <div role=\"tab\" id=\"{{::headingId}}\" aria-selected=\"{{isOpen}}\" class=\"panel-heading\" ng-keypress=\"toggleOpen($event)\">\n" +
    "    <h4 class=\"panel-title\">\n" +
    "      <a role=\"button\" data-toggle=\"collapse\" href aria-expanded=\"{{isOpen}}\" aria-controls=\"{{::panelId}}\" tabindex=\"0\" class=\"accordion-toggle\" ng-click=\"toggleOpen()\" tux-accordion-transclude=\"heading\"><span tux-accordion-header ng-class=\"{'text-muted': isDisabled}\">{{heading}}</span></a>\n" +
    "    </h4>\n" +
    "  </div>\n" +
    "  <div id=\"{{::panelId}}\" aria-labelledby=\"{{::headingId}}\" aria-hidden=\"{{!isOpen}}\" role=\"tabpanel\" class=\"panel-collapse collapse\" tux-collapse=\"!isOpen\">\n" +
    "    <div class=\"panel-body\" ng-transclude></div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("tux/template/accordion/accordion.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/accordion/accordion.html",
    "<div role=\"tablist\" class=\"panel-group\" ng-transclude></div>");
}]);

angular.module("tux/template/alert/alert.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/alert/alert.html",
    "<div class=\"alert\" ng-class=\"['alert-' + (type || 'warning'), closeable ? 'alert-dismissible' : null]\" role=\"alert\">\n" +
    "    <button ng-show=\"closeable\" type=\"button\" class=\"close\" ng-click=\"close({$event: $event})\">\n" +
    "        <span aria-hidden=\"true\">&times;</span>\n" +
    "        <span class=\"sr-only\">Close</span>\n" +
    "    </button>\n" +
    "    <div class=\"alert-message\" ng-transclude></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("tux/template/carousel/carousel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/carousel/carousel.html",
    "<div id=\"carousel\" class=\"clearfix\">\n" +
    "    <div class=\"carousel-cont clearfix\">\n" +
    "        <button type=\"button\" class=\"prev\" disabled=\"disabled\" tux-Carousel-prev ng-show={{carouselButtons}}></button>\n" +
    "        <button type=\"button\" class=\"next\" tux-Carousel-Next ng-show={{carouselButtons}}></button>\n" +
    "        <div class=\"carousel col-xs-12  img-responsive\">\n" +
    "            <div class=\"carousel-container clearfix ng-transclude\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("tux/template/carousel/slide.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/carousel/slide.html",
    "<div class=\"carousel-slides\" ng-transclude ng-click=\"$parent.$parent.MakeActive()\"></div>");
}]);

angular.module("tux/template/datepicker/datepicker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/datepicker/datepicker.html",
    "<div class=\"tux-datepicker\" ng-switch=\"datepickerMode\" role=\"application\" ng-keydown=\"keydown($event)\">\n" +
    "  <tux-daypicker ng-switch-when=\"day\" tabindex=\"0\"></tux-daypicker>\n" +
    "  <tux-monthpicker ng-switch-when=\"month\" tabindex=\"0\"></tux-monthpicker>\n" +
    "  <tux-yearpicker ng-switch-when=\"year\" tabindex=\"0\"></tux-yearpicker>\n" +
    "</div>\n" +
    "");
}]);

angular.module("tux/template/datepicker/day.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/datepicker/day.html",
    "<table class=\"tux-daypicker\" role=\"grid\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left tux-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
    "      <th colspan=\"{{::5 + showWeeks}}\"><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm tux-title\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right tux-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
    "    </tr>\n" +
    "    <tr>\n" +
    "      <th ng-if=\"showWeeks\" class=\"text-center\"></th>\n" +
    "      <th ng-repeat=\"label in ::labels track by $index\" class=\"text-center\"><small aria-label=\"{{::label.full}}\">{{::label.abbr}}</small></th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr class=\"tux-weeks\" ng-repeat=\"row in rows track by $index\">\n" +
    "      <td ng-if=\"showWeeks\" class=\"text-center h6\"><em>{{ weekNumbers[$index] }}</em></td>\n" +
    "      <td ng-repeat=\"dt in row\" class=\"tux-day text-center\" role=\"gridcell\"\n" +
    "        id=\"{{::dt.uid}}\"\n" +
    "        ng-class=\"::dt.customClass\">\n" +
    "        <button type=\"button\" class=\"btn btn-default btn-sm\"\n" +
    "          tux-is-class=\"\n" +
    "            'btn-info' for selectedDt,\n" +
    "            'active' for activeDt\n" +
    "            on dt\"\n" +
    "          ng-click=\"select(dt.date)\"\n" +
    "          ng-disabled=\"::dt.disabled\"\n" +
    "          tabindex=\"-1\"><span ng-class=\"::{'text-muted': dt.secondary, 'text-info': dt.current}\">{{::dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("tux/template/datepicker/month.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/datepicker/month.html",
    "<table class=\"tux-monthpicker\" role=\"grid\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left tux-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
    "      <th><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm tux-title\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right tux-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr class=\"tux-months\" ng-repeat=\"row in rows track by $index\">\n" +
    "      <td ng-repeat=\"dt in row\" class=\"tux-month text-center\" role=\"gridcell\"\n" +
    "        id=\"{{::dt.uid}}\"\n" +
    "        ng-class=\"::dt.customClass\">\n" +
    "        <button type=\"button\" class=\"btn btn-default\"\n" +
    "          tux-is-class=\"\n" +
    "            'btn-info' for selectedDt,\n" +
    "            'active' for activeDt\n" +
    "            on dt\"\n" +
    "          ng-click=\"select(dt.date)\"\n" +
    "          ng-disabled=\"::dt.disabled\"\n" +
    "          tabindex=\"-1\"><span ng-class=\"::{'text-info': dt.current}\">{{::dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("tux/template/datepicker/year.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/datepicker/year.html",
    "<table class=\"tux-yearpicker\" role=\"grid\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left tux-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
    "      <th colspan=\"{{::columns - 2}}\"><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm tux-title\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right tux-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr class=\"tux-years\" ng-repeat=\"row in rows track by $index\">\n" +
    "      <td ng-repeat=\"dt in row\" class=\"tux-year text-center\" role=\"gridcell\"\n" +
    "        id=\"{{::dt.uid}}\"\n" +
    "        ng-class=\"::dt.customClass\">\n" +
    "        <button type=\"button\" class=\"btn btn-default\"\n" +
    "          tux-is-class=\"\n" +
    "            'btn-info' for selectedDt,\n" +
    "            'active' for activeDt\n" +
    "            on dt\"\n" +
    "          ng-click=\"select(dt.date)\"\n" +
    "          ng-disabled=\"::dt.disabled\"\n" +
    "          tabindex=\"-1\"><span ng-class=\"::{'text-info': dt.current}\">{{::dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("tux/template/datepickerPopup/popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/datepickerPopup/popup.html",
    "<div>\n" +
    "  <ul class=\"tux-datepicker-popup dropdown-menu tux-position-measure\" dropdown-nested ng-if=\"isOpen\" ng-keydown=\"keydown($event)\" ng-click=\"$event.stopPropagation()\">\n" +
    "    <li ng-transclude></li>\n" +
    "    <li ng-if=\"showButtonBar\" class=\"tux-button-bar\">\n" +
    "      <span class=\"btn-group pull-left\">\n" +
    "        <button type=\"button\" class=\"btn btn-sm btn-info tux-datepicker-current\" ng-click=\"select('today', $event)\" ng-disabled=\"isDisabled('today')\">{{ getText('current') }}</button>\n" +
    "        <button type=\"button\" class=\"btn btn-sm btn-danger tux-clear\" ng-click=\"select(null, $event)\">{{ getText('clear') }}</button>\n" +
    "      </span>\n" +
    "      <button type=\"button\" class=\"btn btn-sm btn-success pull-right tux-close\" ng-click=\"close($event)\">{{ getText('close') }}</button>\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "</div>\n" +
    "");
}]);

angular.module("tux/template/fileUpload/fileupload.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/fileUpload/fileupload.html",
    "<div ng-model=\"__userFiles\" class=\"multi-file-upload\">\n" +
    "    <label class=\"btn btn-default file-upload\" type=\"button\">\n" +
    "        <i class=\"fa fa-upload\"></i>\n" +
    "        <span>{{buttonText}}</span>\n" +
    "    </label>\n" +
    "    <ul>\n" +
    "        <li ng-repeat=\"p in __userFiles\">\n" +
    "            <small>{{ p.name }}</small>\n" +
    "            <a class=\"MultiFile-remove\" ng-click=\"removeFile($index)\"><i class=\"fa fa-minus-circle\"></i></a>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "    <p class=\"error hide\"></p>\n" +
    "</div>\n" +
    "");
}]);

angular.module("tux/template/formComponents/input.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/formComponents/input.html",
    "<label class=\"input-label\">{{label}}</label>\n" +
    "");
}]);

angular.module("tux/template/header/header-li.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/header/header-li.html",
    "<li ng-class=\"{divider: leaf.name == 'divider'}\">\n" +
    "    <a ui-sref=\"{{leaf.link}}\" ng-if=\"leaf.name !== 'divider'\">{{leaf.name}}</a>\n" +
    "</li>");
}]);

angular.module("tux/template/header/header-ul.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/header/header-ul.html",
    "<ul class='dropdown-menu'>\n" +
    "    <leaf ng-repeat='leaf in tree' leaf='leaf'></leaf>\n" +
    "</ul>");
}]);

angular.module("tux/template/modal/backdrop.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/modal/backdrop.html",
    "<div class=\"modal-backdrop\"\n" +
    "     tux-modal-animation-class=\"fade\"\n" +
    "     modal-in-class=\"in\"\n" +
    "     ng-style=\"{'z-index': 1040 + (index && 1 || 0) + index*10}\"\n" +
    "></div>\n" +
    "");
}]);

angular.module("tux/template/modal/window.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/modal/window.html",
    "<div modal-render=\"{{$isRendered}}\" tabindex=\"-1\" role=\"dialog\" class=\"modal\"\n" +
    "    tux-modal-animation-class=\"fade\"\n" +
    "    modal-in-class=\"in\"\n" +
    "    ng-style=\"{'z-index': 1050 + index*10, display: 'block'}\">\n" +
    "    <div class=\"modal-dialog {{size ? 'modal-' + size : ''}}\"><div class=\"modal-content\" tux-modal-transclude></div></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("tux/template/imageGallery/imageGallery.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/imageGallery/imageGallery.html",
    "<div class=\"clearfix image-gallery\">\n" +
    "    <div class=\"col-xs-12\">\n" +
    "        <div class=\"col-md-4 col-sm-6 col-xs-12 tiles-wrapper\" ng-repeat='slide in data'>\n" +
    "            <div class=\"tiles\" ng-click=\"open($index)\">\n" +
    "                <img ng-src=\"{{slide.path}}\" class=\"image\">\n" +
    "                <div class=\"gallery-hover-menu\">\n" +
    "                    <a class=\"hover-link\" ng-repeat=\"links in slide.hoverMenu\" href=\"{{links.url}}\" ng-click=\"hoverLinkClick($event,$parent.$index,slide)\" title=\"{{links.title}}\">\n" +
    "                        <i class=\"fa {{links.icon}}\"></i>\n" +
    "                    </a>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"gallery-image-detail\" ng-click=\"open($index)\">\n" +
    "                <a class=\"image-title\"><h3>{{slide.title}}</h3></a>\n" +
    "                <span>{{slide.caption}}</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"modalContainer\"></div>\n" +
    "    <script type=\"text/ng-template\" id=\"galleryModal.html\">\n" +
    "        <div class=\"modal-content\">\n" +
    "            <div class=\"modal-header modal-header-bg\">\n" +
    "                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" ng-click=\"close()\" aria-label=\"Close\"><span aria-hidden=\"true\">×</span></button>\n" +
    "                <h5 class=\"modal-title\">{{current.title}}</h5>\n" +
    "            </div>\n" +
    "            <div class=\"modal-body text-center clearfix\">\n" +
    "                <tux-carousel slides-to-show=\"1\" slides-to-scroll=\"1\" counter-offset=\"counterOffset\" carousel-buttons=true>\n" +
    "                    <tux-slide ng-repeat=\"slide in data\">\n" +
    "                        <img class=\"img-responsive\" ng-src=\"{{slide.path}}\" />\n" +
    "                    </tux-slide>\n" +
    "                </tux-carousel>\n" +
    "                <div class=\"gallery-detail\">\n" +
    "                    <a href=\"javascript:void(0)\" class=\"open-new-win\" ng-click=\"openInNewTab(current.path)\">Click here to open image in new window</a>\n" +
    "                    <div class=\"gallery-desc\" ng-binh-html=\"current.descriptionHtml\">A premium quality heavy duty rubber foot mat that is known for its easy cleaning and high strength.\n" +
    "                    </div>\n" +
    "                    <span class=\"old-price\">{{current.oldPrice}}</span>\n" +
    "                    <span class=\"product-price\">{{current.price}}</span>\n" +
    "                    <span class=\"product-discount\">{{current.discount}}</span>\n" +
    "                </div>\n" +
    "                <div class=\"col-xs-10 col-xs-offset-1 carousel-indicator\">\n" +
    "                    <tux-carousel slides-to-show=\"3\" slides-to-scroll=\"1\" counter-offset=\"counterOffset\" carousel-buttons=true>\n" +
    "                        <tux-slide ng-repeat=\"slide in data\">\n" +
    "                            <img class=\"img-responsive\" ng-src=\"{{slide.path}}\" />\n" +
    "                        </tux-slide>\n" +
    "                    </tux-carousel>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"modal-footer clearfix\">\n" +
    "                <div class=\"footer-buttons pull-right\">\n" +
    "                    <a class=\"btn btn-default\" ng-repeat=\"slide in current.modalButtons\" ng-click=\"hoverLinkClick($event,current.index,current)\" href=\"{{slide.url}}\">\n" +
    "                        <i class=\"fa {{slide.icon}}\"></i>\n" +
    "                        <span>{{slide.text}}<span>                      \n" +
    "                    </a>\n" +
    "                </div>                    \n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </script>\n" +
    "</div>");
}]);

angular.module("tux/template/login/login.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/login/login.html",
    "<div class=\"alert\" ng-class=\"['alert-' + (type || 'warning'), closeable ? 'alert-dismissible' : null]\" role=\"alert\">\n" +
    "    <button ng-show=\"closeable\" type=\"button\" class=\"close\" ng-click=\"close({$event: $event})\">\n" +
    "        <span aria-hidden=\"true\">&times;</span>\n" +
    "        <span class=\"sr-only\">Close</span>\n" +
    "    </button>\n" +
    "    <div class=\"alert-message\" ng-transclude></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("tux/template/multiselect/multiselect.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/multiselect/multiselect.html",
    "<span class=\"multiSelect inlineBlock\">\n" +
    "	<div id=\"{{directiveId}}\" type=\"button\"ng-click=\"toggleCheckboxes( $event ); refreshSelectedItems(); refreshButton(); prepareGrouping; prepareIndex();\"ng-bind-html=\"varButtonLabel\"ng-disabled=\"disable-button\" class=\"dropdown-trigger\">\n" +
    "\n" +
    "	</div>\n" +
    "	<div class=\"checkboxLayer\">\n" +
    "		<div class=\"helperContainer\" ng-if=\"helperStatus.filter || helperStatus.all || helperStatus.none || helperStatus.reset \">\n" +
    "			<div class=\"line\" ng-if=\"helperStatus.all || helperStatus.none || helperStatus.reset \">\n" +
    "				<button type=\"button\" class=\"helperButton\"ng-disabled=\"isDisabled\"ng-if=\"helperStatus.all\"ng-click=\"select( 'all', $event );\"ng-bind-html=\"lang.selectAll\"></button>\n" +
    "				<button type=\"button\" class=\"helperButton clearAll\"ng-disabled=\"isDisabled\"ng-if=\"helperStatus.none\"ng-click=\"select( 'none', $event );\"ng-bind-html=\"lang.selectNone\">\n" +
    "				</button>\n" +
    "\n" +
    "				<button type=\"button\" class=\"helperButton reset\"ng-disabled=\"isDisabled\"ng-if=\"helperStatus.reset\"ng-click=\"select( 'reset', $event );\"ng-bind-html=\"lang.reset\"></button>\n" +
    "\n" +
    "			</div>\n" +
    "			<div class=\"line\" style=\"position:relative\" ng-if=\"helperStatus.filter\">\n" +
    "			<input placeholder=\"{{lang.search}}\" type=\"text\"ng-click=\"select( 'filter', $event )\" ng-model=\"inputLabel.labelFilter\" ng-change=\"searchChanged()\" class=\"inputFilter\"/>\n" +
    "			<button type=\"button\" class=\"clearButton\" ng-click=\"clearClicked( $event )\" >×</button> </div> </div> <div class=\"checkBoxContainer\">\n" +
    "			<div ng-repeat=\"item in filteredModel | filter:removeGroupEndMarker\" class=\"multiSelectItem\"ng-class=\"{selected: item[ tickProperty ], horizontal: orientationH, vertical: orientationV, multiSelectGroup:item[ groupProperty ], disabled:itemIsDisabled( item )}\"ng-click=\"syncItems( item, $event, $index );\" ng-mouseleave=\"removeFocusStyle( tabIndex );\"> <div class=\"acol\" ng-if=\"item[ spacingProperty ] > 0\" ng-repeat=\"i in numberToArray( item[ spacingProperty ] ) track by $index\"></div>  <div class=\"acol\"><label><input class=\"checkbox focusable\" type=\"checkbox\" ng-disabled=\"itemIsDisabled( item )\" ng-checked=\"item[ tickProperty ]\" ng-click=\"syncItems( item, $event, $index )\" /><span ng-class=\"{disabled:itemIsDisabled( item )}\" ng-bind-html=\"writeLabel( item, 'itemLabel' )\"></span></label>\n" +
    "		</div><span class=\"tickMark\" ng-if=\"item[ groupProperty ] !== true && item[ tickProperty ] === true\" ng-bind-html=\"icon.tickMark\"></span>\n" +
    "	</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div ng-if=\"selectionShow\">\n" +
    "	<div class=\"selectionLabel\" ng-repeat=\"item in filteredModel | filter:tickedItems\">\n" +
    "		<span ng-class=\"{disabled:itemIsDisabled( item )}\" ng-bind-html=\"writeLabel( item, 'itemLabel' )\"></span>\n" +
    "		<a class=\"close fa fa-close\" rel=\"1\" ng-disabled=\"itemIsDisabled( item )\" ng-checked=\"item[ ticked ]\" ng-click=\"syncItems( item, $event, $index )\"></a>\n" +
    "	</div>\n" +
    "</div>\n" +
    "</span>\n" +
    "");
}]);

angular.module("tux/template/tooltip/tooltip-html-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/tooltip/tooltip-html-popup.html",
    "<div class=\"tooltip\"\n" +
    "  tooltip-animation-class=\"fade\"\n" +
    "  tux-tooltip-classes\n" +
    "  ng-class=\"{ in: isOpen() }\">\n" +
    "  <div class=\"tooltip-arrow\"></div>\n" +
    "  <div class=\"tooltip-inner\" ng-bind-html=\"contentExp()\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("tux/template/tooltip/tooltip-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/tooltip/tooltip-popup.html",
    "<div class=\"tooltip\"\n" +
    "  tooltip-animation-class=\"fade\"\n" +
    "  tux-tooltip-classes\n" +
    "  ng-class=\"{ in: isOpen() }\">\n" +
    "  <div class=\"tooltip-arrow\"></div>\n" +
    "  <div class=\"tooltip-inner\" ng-bind=\"content\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("tux/template/tooltip/tooltip-template-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/tooltip/tooltip-template-popup.html",
    "<div class=\"tooltip\"\n" +
    "  tooltip-animation-class=\"fade\"\n" +
    "  tux-tooltip-classes\n" +
    "  ng-class=\"{ in: isOpen() }\">\n" +
    "  <div class=\"tooltip-arrow\"></div>\n" +
    "  <div class=\"tooltip-inner\"\n" +
    "    tux-tooltip-template-transclude=\"contentExp()\"\n" +
    "    tooltip-template-transclude-scope=\"originScope()\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("tux/template/popover/popover-html.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/popover/popover-html.html",
    "<div class=\"popover\"\n" +
    "  tooltip-animation-class=\"fade\"\n" +
    "  tux-tooltip-classes\n" +
    "  ng-class=\"{ in: isOpen() }\">\n" +
    "  <div class=\"arrow\"></div>\n" +
    "\n" +
    "  <div class=\"popover-inner\">\n" +
    "      <h3 class=\"popover-title\" ng-bind=\"title\" ng-if=\"title\"></h3>\n" +
    "      <div class=\"popover-content\" ng-bind-html=\"contentExp()\"></div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("tux/template/popover/popover-template.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/popover/popover-template.html",
    "<div class=\"popover\"\n" +
    "  tooltip-animation-class=\"fade\"\n" +
    "  tux-tooltip-classes\n" +
    "  ng-class=\"{ in: isOpen() }\">\n" +
    "  <div class=\"arrow\"></div>\n" +
    "\n" +
    "  <div class=\"popover-inner\">\n" +
    "      <h3 class=\"popover-title\" ng-bind=\"title\" ng-if=\"title\"></h3>\n" +
    "      <div class=\"popover-content\"\n" +
    "        tux-tooltip-template-transclude=\"contentExp()\"\n" +
    "        tooltip-template-transclude-scope=\"originScope()\"></div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("tux/template/popover/popover.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/popover/popover.html",
    "<div class=\"popover\"\n" +
    "  tooltip-animation-class=\"fade\"\n" +
    "  tux-tooltip-classes\n" +
    "  ng-class=\"{ in: isOpen() }\">\n" +
    "  <div class=\"arrow\"></div>\n" +
    "\n" +
    "  <div class=\"popover-inner\">\n" +
    "      <h3 class=\"popover-title\" ng-bind=\"title\" ng-if=\"title\"></h3>\n" +
    "      <div class=\"popover-content\" ng-bind=\"content\"></div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("tux/template/progressbar/bar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/progressbar/bar.html",
    "<div class=\"progress-bar\" ng-class=\"type && 'progress-bar-' + type\" role=\"progressbar\" aria-valuenow=\"{{value}}\" aria-valuemin=\"0\" aria-valuemax=\"{{max}}\" ng-style=\"{width: (percent < 100 ? percent : 100) + '%'}\" aria-valuetext=\"{{percent | number:0}}%\" aria-labelledby=\"{{::title}}\" ng-transclude></div>\n" +
    "");
}]);

angular.module("tux/template/progressbar/progress.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/progressbar/progress.html",
    "<div class=\"progress-bar-wrapper\"><div class=\"progress tux-progressbar\" ng-transclude aria-labelledby=\"{{::title}}\"></div></div>");
}]);

angular.module("tux/template/progressbar/progressbar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/progressbar/progressbar.html",
    "<div class=\"progress-bar-wrapper\">\n" +
    "<div class=\"progress tux-progressbar\">\n" +
    "  <div class=\"progress-bar\" ng-class=\"type && 'progress-bar-' + type\" role=\"progressbar\" aria-valuenow=\"{{value}}\" aria-valuemin=\"0\" aria-valuemax=\"{{max}}\" ng-style=\"{width: (percent < 100 ? percent : 100) + '%'}\" aria-valuetext=\"{{percent | number:0}}%\" aria-labelledby=\"{{::title}}\" ng-transclude></div>\n" +
    "</div>\n" +
    "</div>");
}]);

angular.module("tux/template/slider/slider.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/slider/slider.html",
    "<span class=\"bar\"></span>\n" +
    "<span class=\"bar selection\"></span>\n" +
    "<span class=\"pointer\"></span>\n" +
    "<span class=\"pointer\"></span>\n" +
    "<span class=\"bubble selection\"></span>\n" +
    "<span ng-bind-html=\"translate({value: floor})\" class=\"bubble limit\"></span>\n" +
    "<span ng-bind-html=\"translate({value: ceiling})\" class=\"bubble limit\"></span>\n" +
    "<span class=\"bubble\"></span>\n" +
    "<span class=\"bubble\"></span>\n" +
    "<span class=\"bubble\"></span>\n" +
    "");
}]);

angular.module("tux/template/tabs/tab.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/tabs/tab.html",
    "<li ng-class=\"{active: active, disabled: disabled}\" class=\"tux-tab\">\n" +
    "  <a href ng-click=\"select()\" tux-tab-heading-transclude>{{heading}}</a>\n" +
    "</li>\n" +
    "");
}]);

angular.module("tux/template/tabs/tabset.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/tabs/tabset.html",
    "<div class=\"tux-tabs clearfix\">\n" +
    "<div class=\"nav-tab-toggle-wrap\"><button class=\"nav-tab-toggle\" ng-click=\"toggletabs()\"><span class=\"text\">{{selectedGroup}}</span></button></div>\n" +
    "  <ul class=\"nav nav-{{type || 'tabs'}}\" ng-class=\"{'nav-stacked': vertical, 'nav-justified': justified}\" ng-transclude></ul>\n" +
    "  <div class=\"tab-content\">\n" +
    "    <div class=\"tab-pane\" \n" +
    "         ng-repeat=\"tab in tabs\" \n" +
    "         ng-class=\"{active: tab.active}\"\n" +
    "         tux-tab-content-transclude=\"tab\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("tux/template/timepicker/timepicker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/timepicker/timepicker.html",
    "<table class=\"tux-timepicker\">\n" +
    "    <tbody>\n" +
    "        <tr class=\"text-center\" ng-show=\"::showSpinners\">\n" +
    "            <td class=\"tux-increment hours\"><a ng-click=\"incrementHours()\" ng-class=\"{disabled: noIncrementHours()}\" class=\"btn btn-link\" ng-disabled=\"noIncrementHours()\" tabindex=\"{{::tabindex}}\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
    "            <td>&nbsp;</td>\n" +
    "            <td class=\"tux-increment minutes\"><a ng-click=\"incrementMinutes()\" ng-class=\"{disabled: noIncrementMinutes()}\" class=\"btn btn-link\" ng-disabled=\"noIncrementMinutes()\" tabindex=\"{{::tabindex}}\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
    "            <td ng-show=\"showSeconds\">&nbsp;</td>\n" +
    "            <td ng-show=\"showSeconds\" class=\"tux-increment seconds\"><a ng-click=\"incrementSeconds()\" ng-class=\"{disabled: noIncrementSeconds()}\" class=\"btn btn-link\" ng-disabled=\"noIncrementSeconds()\" tabindex=\"{{::tabindex}}\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
    "            <td ng-show=\"showMeridian\"></td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td class=\"form-group tux-time hours\" ng-class=\"{'has-error': invalidHours}\">\n" +
    "                <input style=\"width:50px;\" type=\"text\" placeholder=\"HH\" ng-model=\"hours\" ng-change=\"updateHours()\" class=\"form-control text-center\" ng-readonly=\"::readonlyInput\" maxlength=\"2\" tabindex=\"{{::tabindex}}\" ng-disabled=\"noIncrementHours()\" ng-blur=\"blur()\">\n" +
    "            </td>\n" +
    "            <td class=\"tux-separator\">:</td>\n" +
    "            <td class=\"form-group tux-time minutes\" ng-class=\"{'has-error': invalidMinutes}\">\n" +
    "                <input style=\"width:50px;\" type=\"text\" placeholder=\"MM\" ng-model=\"minutes\" ng-change=\"updateMinutes()\" class=\"form-control text-center\" ng-readonly=\"::readonlyInput\" maxlength=\"2\" tabindex=\"{{::tabindex}}\" ng-disabled=\"noIncrementMinutes()\" ng-blur=\"blur()\">\n" +
    "            </td>\n" +
    "            <td ng-show=\"showSeconds\" class=\"tux-separator\">:</td>\n" +
    "            <td class=\"form-group tux-time seconds\" ng-class=\"{'has-error': invalidSeconds}\" ng-show=\"showSeconds\">\n" +
    "                <input style=\"width:50px;\" type=\"text\" placeholder=\"SS\" ng-model=\"seconds\" ng-change=\"updateSeconds()\" class=\"form-control text-center\" ng-readonly=\"readonlyInput\" maxlength=\"2\" tabindex=\"{{::tabindex}}\" ng-disabled=\"noIncrementSeconds()\" ng-blur=\"blur()\">\n" +
    "            </td>\n" +
    "            <td ng-show=\"showMeridian\" class=\"tux-time am-pm\">\n" +
    "                <button type=\"button\" ng-class=\"{disabled: noToggleMeridian()}\" class=\"btn btn-default text-center\" ng-click=\"toggleMeridian()\" ng-disabled=\"noToggleMeridian()\" tabindex=\"{{::tabindex}}\">{{meridian}}</button>\n" +
    "            </td>\n" +
    "        </tr>\n" +
    "        <tr class=\"text-center\" ng-show=\"::showSpinners\">\n" +
    "            <td class=\"tux-decrement hours\"><a ng-click=\"decrementHours()\" ng-class=\"{disabled: noDecrementHours()}\" class=\"btn btn-link\" ng-disabled=\"noDecrementHours()\" tabindex=\"{{::tabindex}}\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
    "            <td>&nbsp;</td>\n" +
    "            <td class=\"tux-decrement minutes\"><a ng-click=\"decrementMinutes()\" ng-class=\"{disabled: noDecrementMinutes()}\" class=\"btn btn-link\" ng-disabled=\"noDecrementMinutes()\" tabindex=\"{{::tabindex}}\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
    "            <td ng-show=\"showSeconds\">&nbsp;</td>\n" +
    "            <td ng-show=\"showSeconds\" class=\"tux-decrement seconds\"><a ng-click=\"decrementSeconds()\" ng-class=\"{disabled: noDecrementSeconds()}\" class=\"btn btn-link\" ng-disabled=\"noDecrementSeconds()\" tabindex=\"{{::tabindex}}\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
    "            <td ng-show=\"showMeridian\"></td>\n" +
    "        </tr>\n" +
    "    </tbody>\n" +
    "</table>\n" +
    "");
}]);

angular.module("tux/template/typeahead/typeahead-match.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/typeahead/typeahead-match.html",
    "<a href tabindex=\"-1\" ng-bind-html=\"match.label | tuxTypeaheadHighlight:query\" ng-attr-title=\"{{match.label}}\"></a>\n" +
    "");
}]);

angular.module("tux/template/typeahead/typeahead-popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/typeahead/typeahead-popup.html",
    "<ul class=\"dropdown-menu\" ng-show=\"isOpen() && !moveInProgress\" ng-style=\"{top: position().top+'px', left: position().left+'px'}\" role=\"listbox\" aria-hidden=\"{{!isOpen()}}\">\n" +
    "    <li ng-repeat=\"match in matches track by $index\" ng-class=\"{active: isActive($index) }\" ng-mouseenter=\"selectActive($index)\" ng-click=\"selectMatch($index, $event)\" role=\"option\" id=\"{{::match.id}}\">\n" +
    "        <div tux-typeahead-match index=\"$index\" match=\"match\" query=\"query\" template-url=\"templateUrl\"></div>\n" +
    "    </li>\n" +
    "</ul>");
}]);

angular.module("tux/template/verticalImageGallery/verticalImageGallery.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/verticalImageGallery/verticalImageGallery.html",
    "<div class=\"col-xs-12 vertical-image-gallery row\">\n" +
    "    <div class=\"col-sm-2 col-md-1 hidden-xs padzero vertical-gallery\">\n" +
    "        <tux-carousel slides-to-show=\"4\" slides-to-scroll=\"1\" counter-offset=\"counterOffset\" carousel-buttons=true direction=\"vertical\">\n" +
    "            <tux-slide ng-repeat=\"slide in data\">\n" +
    "                <img class=\"img-responsive\" ng-src=\"{{slide.path}}\" />\n" +
    "            </tux-slide>\n" +
    "        </tux-carousel>\n" +
    "    </div>\n" +
    "    <div class=\"col-md-6 col-sm-10  col-xs-12 horizontal-gallery\">\n" +
    "        <tux-carousel slides-to-show=\"1\" slides-to-scroll=\"1\" counter-offset=\"counterOffset\" carousel-buttons=true>\n" +
    "            <tux-slide ng-repeat=\"slide in data\">\n" +
    "                <img class=\"img-responsive\" ng-src=\"{{slide.path}}\" />\n" +
    "            </tux-slide>\n" +
    "        </tux-carousel>\n" +
    "    </div>\n" +
    "    <div class=\"col-md-5 col-xs-12\">        \n" +
    "        <h2 class=\"image-title\">{{current.title}}</h2>\n" +
    "        <div class=\"image-desc\" ng-bind-html=\"current.descriptionHtml\"></div>\n" +
    "        <div class=\"item-caption\">{{current.price}}</div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("tux/template/widgets/widgets-sort.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/widgets/widgets-sort.html",
    "<div class=\"modal-header\">\n" +
    "    <button type=\"button\" class=\"close\" ng-click=\"cancel()\"><span aria-hidden=\"true\">×</span></button>\n" +
    "    <h2 class=\"modal-title pull-left\" id=\"myModalLabel\">Customize</h2>\n" +
    "    <div class=\"modal-add-remove-text col-xs-12 row\">Add/Remove Or Move Widgets</div>\n" +
    "</div>\n" +
    "<div class=\"modal-body widget-modal\n" +
    "\">\n" +
    "    <div class=\"col-md-9 col-sm-8 widget-left-wrap\">\n" +
    "        <div class=\"widget-left-container\" data-toggle=\"dragdropwidget\">\n" +
    "            <h2>YOUR WIDGETS</h2>\n" +
    "            <div class=\"widget-cont col-3\" tmp data-toggle=\"widget-move\" as-sortable=\"dragControlListeners\" ng-model=\"dashBoardDataCopy\">\n" +
    "                <div class=\"widget-wrap\" ng-class=\"breakClasses\" ng-repeat=\"data in dashBoardDataCopy\" as-sortable-item>\n" +
    "                    <div class=\"movingWidgetWrapper\" as-sortable-item-handle>\n" +
    "                        <a href=\"javascript:void(0)\" class=\"return-false close-icon\" ng-click=\"removeItemData($index)\"> <span class=\"fa fa-close close-btn\"></span></a>\n" +
    "                        <div class=\"widget-content\">\n" +
    "                            <div class=\"fa widget-icon\" ng-class=\"data.iconName\"></div>\n" +
    "                            <span>{{data.title}}</span>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"col-md-3 col-sm-4 widget-right-wrap\">\n" +
    "        <div class=\"widget-right-cont\">\n" +
    "            <h2>Available Widget(s)</h2>\n" +
    "            <div class=\"add-widget-cont\" tmp1>\n" +
    "            <div class=\"no-widgets-message\" ng-show=\"availableWidgetsCopy.length == 0\">All widgets have been added</div>\n" +
    "                <div class=\"widget-wrap\" ng-repeat=\"data in availableWidgetsCopy\">\n" +
    "                    <div class=\"movingWidgetWrapper\">\n" +
    "                        <a href=\"javascript:void(0)\" class=\"return-false add-icon\" ng-click=\"addItem($index)\"> <span class=\"fa fa-plus\"></span></a>\n" +
    "                        <div class=\"widget-content\">\n" +
    "                            <div class=\"fa widget-icon\" ng-class=\"data.iconName\"></div><span>{{data.title}}</span></div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "    <button class=\"btn btn-primary\" type=\"button\" ng-click=\"done()\">DONE</button>\n" +
    "    <button class=\"btn btn-default\" type=\"button\" ng-click=\"cancel()\">CANCEL</button>\n" +
    "</div>\n" +
    "");
}]);

angular.module("tux/template/widgets/widgets.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/widgets/widgets.html",
    "<div class=\"dashboard-main\">\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"col-lg-6 col-sm-6 col-xs-6\">\n" +
    "            <h2 class=\"hidden-xs page-title col-xs-12\">Home</h2>\n" +
    "            <a href=\"javascript:void(0);\" class=\"visible-xs page-title col-xs-12\">Home</a>\n" +
    "        </div>\n" +
    "        <div class=\"col-md-6 col-sm-6 col-xs-6\">\n" +
    "            <div class=\"col-xs-12\">\n" +
    "                <button type=\"button\" class=\"btn btn-default pull-right addmorewidget iconic-button\" id=\"\" value=\"Customize\" ng-click=\"open()\"><i class=\"fa fa-cog\"></i></button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"moving-item\" ng-repeat=\"data in dashBoardData\">\n" +
    "            <div class=\"dashboard-container\" dash-item  index={{$index}}>\n" +
    "                <div class=\"dashboard-header\"><span class=\"fa pull-left icon\" ng-class=\"data.iconName\"></span>\n" +
    "                    <h2 class=\"pull-left\">{{data.title}}</h2></div>\n" +
    "                <div class=\"dashboard-content-wrapper\">\n" +
    "                    <div class=\"dashboard-content\">\n" +
    "                        <p ng-repeat=\"content in data.documents\">{{content.value}}</p>\n" +
    "                    </div>\n" +
    "                    <p class=\"dashboard-content-wrapper-link\"><a href=\"{{data.navLink}}\">{{data.linkValue}}</a></p>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("tux/template/wizard/step.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/wizard/step.html",
    "<section ng-class=\"{current: selected, done: completed}\" class=\"step tux-wz-step\" ng-transclude>\n" +
    "</section>");
}]);

angular.module("tux/template/wizard/wizard.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tux/template/wizard/wizard.html",
    "<div class=\"tux-wizard\">\n" +
    "    <ul class=\"steps-indicator steps-{{getEnabledSteps().length}}\" ng-if=\"!hideIndicators\">\n" +
    "        <li ng-class=\"{default: !step.completed && !step.selected, current: step.selected && !step.completed, done: step.completed && !step.selected, editing: step.selected && step.completed, visited: step.visited}\" ng-repeat=\"step in getEnabledSteps()\">\n" +
    "            <a>\n" +
    "                <i class=\"{{step.icon}}\"></i>\n" +
    "            </a>\n" +
    "            <span ng-click=\"jumpTo(step)\" class=\"wizard-menu-title\">{{step.title}}</span>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "    <div class=\"mobile-nav\">\n" +
    "        <span class=\"phn-prev tux-Carousel-prev\" tux-wz-previous>&lt;</span>\n" +
    "        <span class=\"phn-next tux-Carousel-next\" tux-wz-next> &gt;</span>\n" +
    "    </div>\n" +
    "    <div class=\"wizard-step-count-wrapper\">STEP <span class=\"wizard-step-count\">{{currentStepNumber()}}</span> of {{steps.length}}</div>\n" +
    "    <div class=\"steps\" ng-transclude></div>\n" +
    "</div>\n" +
    "");
}]);
angular.module('ui.tux.accordion').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">body{font-family:"helvatica55";}.h1,h1{font-family:"helvatica65";}.h2{font-family:"helvatica65";}.h3,h3{font-family:"helvatica45";}a:focus,a:hover{outline:none;text-decoration:none;}.default-ul,header.multi-line-header .header-identifier,header.multi-line-header .header-identifier-mobile,nav ul.primary-nav,nav .first-level-wrapper > ul.drpdwn-menu,.cart-tab ul{list-style:none;padding:0;margin:0;}.search-icon,.notification{font-size:16px;color:#000;}.dropdown-menu{font-size:12px;border-radius:0px;left:auto;}.tux-drpdwn{display:inline-block;width:100%;height:31px;padding:6px 12px;font-size:12px;line-height:1.428571429;color:#555555;background-color:#fff;background-image:none;border:1px solid #ddd;-webkit-box-shadow:inset 2px 2px 6px 0px rgba(1,1,1,0.1);box-shadow:inset 2px 2px 6px 0px rgba(1,1,1,0.1);-webkit-transition:border-color ease-in-out 0.15s,box-shadow ease-in-out 0.15s;-o-transition:border-color ease-in-out 0.15s,box-shadow ease-in-out 0.15s;transition:border-color ease-in-out 0.15s,box-shadow ease-in-out 0.15s;}.form-control{border-radius:0px;}img{-ms-interpolation-mode:bicubic;}.tux-box{position:relative;background:#fff;box-shadow:0 1px 2px 0 rgba(51,53,54,0.15);margin:10px 0;padding:10px;border-radius:5px;border:1px solid rgba(51,53,54,0.15);}@mixin clearfix(){&:before,&:after{content:" ";// 1    display:table;// 2}&:after{clear:both;}}@mixin border-radius($radius){-webkit-border-radius:$radius;-moz-border-radius:$radius;-ms-border-radius:$radius;border-radius:$radius;background-clip:padding-box;}@mixin box-shadow($shadow){-webkit-box-shadow:$shadow;-moz-box-shadow:$shadow;-ms-box-shadow:$shadow;box-shadow:$shadow;}@mixin transform($style){-webkit-transform:$style;-moztransform:$style;-ms-transform:$style;transform:$style;}@mixin transition($args...){-webkit-transition:$args;-moz-transition:$args;-ms-transition:$args;-o-transition:$args;transition:$args;}@mixin box-sizing($box-model){-webkit-box-sizing:$box-model;// Safari <= 5     -moz-box-sizing:$box-model;// Firefox <= 19          box-sizing:$box-model;}@mixin opacity($opacity){opacity:$opacity;$opacity-ie:$opacity * 100;filter:alpha(opacity=$opacity-ie);//IE8}@mixin abs-pos ($top:auto,$right:auto,$bottom:auto,$left:auto){top:$top;right:$right;bottom:$bottom;left:$left;position:absolute;}$screen-mobile:320px;$screen-fablet:468px;$screen-tablet:768px;$screen-lttablet:767px;$screen-desktop:1024px;$screen-lgdesktop:1200px;@mixin breakpoint($canvas){@if $canvas == mobile{@media only screen and (min-width:$screen-mobile){@content;}}@else if $canvas == tablet{@media only screen and (min-width:$screen-tablet){@content;}}@else if $canvas == lttablet{@media only screen and (max-width:$screen-lttablet){@content;}}@else if $canvas == ltdesktop{@media only screen and (max-width:$screen-desktop){@content;}}@else if $canvas == desktop{@media only screen and (min-width:$screen-desktop){@content;}}@else if $canvas == lgdesktop{@media only screen and (min-width:$screen-lgdesktop){@content;}}}</style>'); });
angular.module('ui.tux.accordion').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.panel{border:none;-webkit-box-shadow:none;box-shadow:none;&.panel-default{border-radius:0px;>.panel-heading{background-color:#EFF5F8;border-bottom:1px solid #bcd1e0;-moz-box-shadow:0px 8px 15px -3px #ebebeb;-webkit-box-shadow:0px 8px 15px -3px #ebebeb;box-shadow:0px 8px 15px -3px #ebebeb;padding:0px;.panel-title{a{position:relative;display:block;padding:15px 15px 15px 15px;&:after{font-family:FontAwesome;content:"\\f067";text-align:center;padding:7px;width:30px;height:30px;border-radius:0;border:1px solid #c1c8d0;top:7px;right:15px;bottom:auto;left:auto;position:absolute;background-image:url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgi…pZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\');background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0%,#fcfcfe),color-stop(100%,#e8eff3));background-image:-moz-linear-gradient(top,#fcfcfe 0%,#e8eff3 100%);background-image:-webkit-linear-gradient(top,#fcfcfe 0%,#e8eff3 100%);background-image:linear-gradient(to bottom,#fcfcfe 0%,#e8eff3 100%);color:#676a6e;}}}&.alert.alert-error{border:1px solid #D69090;background-color:#FEE1DD;color:#D20000;}&.alert-warning{color:#c05f00;background-color:#ffeab7;border-color:#ffb400;}&.alert.alert-success{border:1px solid #25AB01;background-color:#E1FFDD;color:#25AB01;}&.alert{padding:0px;margin:0px;.accordion-toggle{padding:8px 0px 10px 42px;&:after{content:"\\f078";border:none;background:none;padding:0px;width:auto;color:inherit}}}}&.panel-open{>.panel-heading{.panel-title{a{&:after{content:"\\f068";}}}}.btn{margin-bottom:10px;}}.section{.checkbox-header{box-shadow:0 7px 5px -3px #ebebeb;cursor:pointer;float:left;position:relative;padding:0px 15px 0px 10px;label{font-family:\'helvatica65\';color:#161718;font-size:13px;}}}}&.alert-accordion{.panel-collapse{background-color:#fff;border-top:none;max-height:122px;}.alert-error + .panel-collapse{background:#FFFAF9;border:1px solid #D69090;}.alert-warning + .panel-collapse{border-color:#ffb400;}.alert-success + .panel-collapse{border:1px solid #25AB01;}.panel-body{ol{padding-left:20px;}}}}.panel-group .panel-heading+.panel-collapse>.panel-body{border:none;}.panel-group .panel+.panel{margin-top:0px;}.panel.panel-default.panel-open > .panel-heading.alert .accordion-toggle:after{content:\'\\f077\';}.selection-accordian{.panel-title span{font-size:14px;font-family:\'helvatica75\';color:rgb(22,23,24);text-transform:uppercase;}.section{label{text-transform:uppercase;}}.inner-wrapper{margin:10px 0 0 10px;}.panel.panel-default > .panel-heading .panel-title a:after{top:-webkit-calc(50% - 15px);top:-moz-calc(50% - 15px);top:calc(50% - 15px);}span.seleced-val{display:inline-block;margin:5px 35px 0 15px;font-family:\'helvatica55\';font-size:13px;color:rgb(103,106,110);b{color:rgb(22,23,24);}}.collapse-all,.expand-all,.collapse-all:after,.expand-all:after{background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(1%,#feffff),color-stop(39%,#feffff),color-stop(100%,#e8f0f4));background-image:-moz-linear-gradient(top,#feffff 1%,#feffff 39%,#e8f0f4 100%);background-image:-webkit-linear-gradient(top,#feffff 1%,#feffff 39%,#e8f0f4 100%);background-image:linear-gradient(to bottom,#feffff 1%,#feffff 39%,#e8f0f4 100%);}.expand-all:after{content:"\\f067";}.expand-collapse-btn,.collapse-all,.expand-all{margin-top:10px;margin-left:20px;float:right;width:25px;height:25px;border:1px solid #c1c8d0;position:relative;}.collapse-all:after,.expand-all:after{text-align:center;font-family:\'helvatica75\';font-size:1.3333333333em;position:absolute;width:25px;height:25px;border:1px solid #c1c8d0;bottom:3px;left:-5px;font:normal normal normal 14px/1 FontAwesome;text-rendering:auto;-webkit-font-smoothing:antialiased;padding-top:6px;color:#676a6e;}.collapse-all{margin-right:15px;}.collapse-all:after{content:"\\f068";}@media only screen and (min-width:768px){.collapse-all,.expand-all{margin-top:15px;}}@media only screen and (max-width:768px){h3{margin-bottom:0px;}.collapse-all,.expand-all{margin-bottom:10px;margin-top:0px;}.acc-btn-wrap{margin-top:15px;}}}</style>'); });
angular.module('ui.tux.affix').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.demo-sidebar{display:none;}.affix{top:0px;transition:1s top ease-in;}</style>'); });
angular.module('ui.tux.alert').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.alert{position:relative;padding:10px 32px 10px 42px;border-radius:0px;&.alert-dismissible .close{top:-5px;}&:before{font-size:18px;display:inline-block;font-family:FontAwesome;text-rendering:auto;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;position:absolute;left:14px;line-height:1;top:8px;}&.alert-success{border:1px solid #25AB01;background-color:#E1FFDD;color:#25AB01;}&.alert-success:before{content:"\\f058";}&.alert-error{border:1px solid #D69090;background-color:#FEE1DD;color:#D20000;}&.alert-error:before{content:"\\f057";}&.alert-warning{color:#c05f00;background-color:#ffeab7;border-color:#ffb400;}&.alert-warning:before{content:"\\f071";color:#ff9000;}.alert-message{line-height:1;span{line-height :1;}}}</style>'); });
angular.module('ui.tux.breadcrumb').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.breadcrumbs{padding:2em;padding-top:1em;padding-bottom:0;padding-left:0;margin-left:5px;font-family:inherit;font-weight:400;text-transform:capitalize;@include breakpoint(tablet){display:block;margin-bottom:0px;}li{display:none;font-size:22px;font-family:\'helvatica45\';text-transform:capitalize;@include breakpoint(tablet){display:inline-block;font-size:12px;text-transform:uppercase;font-family:\'helvatica55\';}}li:nth-last-child(2){display:inline-block;}li:nth-last-child(2) a{font-size:0;line-height:0;@include breakpoint(tablet){font-size:12px;line-height:20px;}}li:nth-last-child(2) a:before{content:"\\f053";@extend .fa;padding:0 5px 0 0;color:black;line-height:20px;font-size:20px;font-weight:bold;font-weight:300;font-family:fontAwesome;@include breakpoint(tablet){content:\'\';font-size:0;line-height:0;}}li.last{display:inline-block;@include breakpoint(tablet){content:\'\';}}li a{color:#2688DA;}li:after{content:"\\f054";color:#E2E2E2;font-family:\'FontAwesome\';padding:0 1.00em 0 1.00em;display:none;@include breakpoint(tablet){display:inline;}}li.last:before,li.last:after{content:\'\';display:none;}}</style>'); });
angular.module('ui.tux.carousel').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.carousel-cont{margin:25px 0px;.carousel{overflow:hidden;position:relative;box-sizing:content-box;padding:0px;.carousel-container{position:relative;left:0px;top:0px;transition-duration:1s;height:100%;.carousel-slides{padding:3px;float:left;margin-left:10px;margin-top:10px;&:first-child{margin-left:0px;margin-top:0px;}img.img-responsive{height:100%;width:100%;}&.hidd{visibility:hidden;}}}.active{box-shadow:0 0 0 2px red inset;}}.prev:before,.next:before{font-family:\'FontAwesome\';font-size:24 px;line-height:1;opacity:.75;color:#000;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}.prev,.next{font-size:0;line-height:0;position:absolute;top:50%;display:block;width:21px;height:21px;transform:translateY(-50%);-webkit-transform:translateY(-50%);-moz-transform:translateY(-50%);-ms-transform:translateY(-50%);padding:0;cursor:pointer;color:transparent;border:none;outline:none;background:transparent;}.prev{left:20px;z-index:1;}.next{right:20px;z-index:1;}.prev:before,.next:before{content:"\\f190";font-size:20px;background:rgba(255,255,255,0.6);}.next:before{content:"\\f18e";}.slick-arrow{color:#161718;z-index:10;}}@media screen and (max-width:767px){.carousel-cont{.next:before,.prev:before{padding:4px;font-size:20px;}.next{right:-5px;}.prev{left:-10px;}.active{box-shadow:0 0 0 1px red inset;}.carousel-slides{padding:2px;}}}.vertical-carousel{.vertical{width:100%;height:600px;.carousel-slides{padding:2px;}.active{box-shadow:inset 0 0 0 2px red;}}.next{bottom:-10px;left:50%;@include transform(translateX(-50%));top:auto;}.prev{top:0px;left:50%;@include transform(translateX(-50%));}.prev:before{content:"\\f01b";}.next:before{content:"\\f01a";}}@media screen and (max-width:767px){.vertical-carousel{.vertical{height:250px;.active{box-shadow:0 0 0 1px red inset;}}.next{bottom:-10px;left:45%;}.prev{top:0px;left:45%;}}}</style>'); });
angular.module('ui.tux.datepickerPopup').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.tux-datepicker-popup.dropdown-menu{display:block;float:none;margin:0;}.tux-button-bar{padding:10px 9px 2px;}.tux-datepicker{.btn-default{background:none;border:0;padding:3px 6px;span{color:#337ab7;}span.text-muted{color:#777;}}.tux-daypicker a{color:#337ab7;}th{text-align:center;}.btn-default:hover,.btn-default:focus,.btn-default:active,.btn-default:active:hover,.btn-default.active{background:#31b0d5;span{color:#fff;}}.holiday .btn-default{background:#ffeab7;}}</style>'); });
angular.module('ui.tux.dropdown').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.open>.dropdown-toggle.btn-primary{&,&.focus,&:focus,&:active,&:hover{color:#fff;background-color:#45484b;border-color:#141415;}}</style>'); });
angular.module('ui.tux.fileUpload').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.MultiFile-remove,.MultiFile-remove:hover{color:rgb(235,22,30);margin-left:10px;}.multi-file-upload{.error{color:rgb(235,22,30);font-size:12px;margin:10px 0;}ul{list-style:none;margin:0;padding:0;}li{margin:10px 0;}}.file-upload{line-height:1;position:relative;input{position:absolute;height:100%;width:100%;top:0px;left:0px;opacity:0;cursor:pointer;}}.MultiFile-remove{cursor:pointer;}</style>'); });
angular.module('ui.tux.footer').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.copyright-container{width:100%;float:left;border-top:1px dotted #969696;padding:10px 0px;background:#ffffff;left:0;color:#676a6e;font-size:1em;max-height:102px;min-height:28px;z-index:106;}@media only screen and (min-width:768px){.copyright-container{min-height:28px;}}@media only screen and (min-width:992px){.copyright-container{min-height:28px;}}.copyright-container p{padding-left:25px;margin-bottom:0;}.copyright-container .feedback-trigger{width:0;height:0;border-style:solid;border-width:0 0 52px 52px;border-color:transparent transparent #eb161e transparent;position:absolute;right:0px;bottom:0px;z-index:10;}.copyright-container .feedback-trigger-top{width:0;height:0;border-style:solid;border-width:0 0 48px 48px;border-color:transparent transparent #fff transparent;position:absolute;right:0px;bottom:0px;z-index:20;cursor:pointer;}.copyright-container .feedback-trigger-top i{position:absolute;left:-24px;top:24px;font-size:16px;}.footer-left figure{float:left;}.footer-right ul{clear:both;float:right;font-weight:bold;list-style:outside none none;padding-left:0;text-transform:uppercase;margin-bottom:0px;margin-right:30px;}.footer-right ul > li{border-right:2px solid #c5c5c5;float:left;font-size:0.9em;padding:0 6px;text-align:center;}.footer-right ul > li a{color:#2688da;text-decoration:none;}.footer-right ul > li:last-child{border-right:none;}</style>'); });
angular.module('ui.tux.formComponents').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">[tux-checkbox]{label:before{content:"";display:inline-block;width:18px;height:18px;margin-right:10px;vertical-align:text-bottom;background-color:#ffffff;-webkit-box-shadow:rgba(128,128,128,0.2) 0 1px 2px 0 inset;box-shadow:rgba(128,128,128,0.2) 0 1px 2px 0 inset;border:1px solid #b4b4b4;float:left;margin-bottom:3px;}&.active label:before{content:"\\2713";color:#2688da;line-height:17px;padding-left:3px;font-weight:bold;}label{padding-left:0px;}}[tux-radio]{label:before{content:"";display:inline-block;width:25px;height:25px;border-radius:40px;margin-right:10px;vertical-align:middle;background-color:#ffffff;-webkit-box-shadow:rgba(128,128,128,0.2) 0 1px 2px 0 inset;box-shadow:rgba(128,128,128,0.2) 0 1px 2px 0 inset;border:1px solid #b4b4b4;}&.active label:before{content:"\\2022";color:#2688da;line-height:23px;text-align:center;font-weight:bold;font-size:30px;}label{padding-left:0px;}}input.form-control,{display:inline-block;width:100%;height:31px;padding:6px 12px;font-size:12px;line-height:1.428571429;color:#555555;background-color:#fff;background-image:none;border:1px solid #ddd;-webkit-box-shadow:inset 2px 2px 6px 0px rgba(1,1,1,0.1);box-shadow:inset 2px 2px 6px 0px rgba(1,1,1,0.1);-webkit-transition:border-color ease-in-out 0.15s,box-shadow ease-in-out 0.15s;-o-transition:border-color ease-in-out 0.15s,box-shadow ease-in-out 0.15s;transition:border-color ease-in-out 0.15s,box-shadow}.btn{display:inline-block;margin-bottom:0;text-align:center;vertical-align:middle;cursor:pointer;background-image:none;border:1px solid transparent;white-space:nowrap;text-transform:uppercase;padding:10px 15px;font-size:13px;line-height:1.428571429;border-radius:0px;-moz-user-select:-moz-none;-ms-user-select:none;-webkit-user-select:none;user-select:none;}.btn-default{background-color:#5f6e77;border-color:#ccc;color:#676a6e;background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(1%,#feffff),color-stop(39%,#feffff),color-stop(100%,#e8f0f4));background-image:-moz-linear-gradient(top,#feffff 1%,#feffff 39%,#e8f0f4 100%);background-image:-webkit-linear-gradient(top,#feffff 1%,#feffff 39%,#e8f0f4 100%);background-image:linear-gradient(to bottom,#feffff 1%,#feffff 39%,#e8f0f4 100%);&:hover,&:focus,&:active,&:active:hover,&.active{background-color:#feffff;border-color:#adadad;}}.btn-primary{color:#fff;background-color:#2eb398;border-color:#313335;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(1%,#45484b),color-stop(39%,#45484b),color-stop(100%,#222425));background-image:-moz-linear-gradient(top,#45484b 1%,#45484b 39%,#222425 100%);background-image:-webkit-linear-gradient(top,#45484b 1%,#45484b 39%,#222425 100%);background-image:linear-gradient(to bottom,#45484b 1%,#45484b 39%,#222425 100%);&:hover,&:focus,&:active,&:active:hover,&.active{background-color:#45484b;border-color:#141415;}}.btn.disabled,.btn[disabled],fieldset[disabled] .btn{cursor:not-allowed;pointer-events:none;opacity:0.65;-moz-box-shadow:none;-webkit-box-shadow:none;box-shadow:none;}.form-action-panel{border-top:1px solid #bcd1e0;border-bottom:1px solid #bcd1e0;background-color:#e4ecf0;padding:10px 30px 10px 10px;-moz-box-shadow:0px 8px 15px -3px #ebebeb;-webkit-box-shadow:0px 8px 15px -3px #ebebeb;box-shadow:0px 8px 15px -3px #ebebeb;}.input-group-btn:last-child>.btn{line-height:1;padding:7px 15px;}.mandatory-label{border-left:3px solid #eb161e;padding-left:6px;}label.tms-form-label{margin-bottom:7px;line-height:1;}.tux-checkbox-xs{position:relative;display:inline-block;-webkit-backface-visibility:hidden;backface-visibility:hidden;outline:0;vertical-align:baseline;font-style:normal;min-height:17px;line-height:17px;min-width:17px;.tux-input{cursor:pointer;position:absolute;top:0;left:0;opacity:0!important;outline:0;z-index:3;width:17px;height:17px;box-sizing:border-box;&.displayhidden{z-index:-1;width:50px;}&:checked~label:before{background-color:#2185d0!important;}&:checked~label:after{left:30px;}}label{color:rgba(0,0,0,.87);-webkit-transition:color .1s ease;transition:color .1s ease;position:relative;display:block;outline:0;padding-left:60px;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;&:before{display:block;position:absolute;content:\'\';z-index:1;-webkit-transform:none;-ms-transform:none;transform:none;border:none;top:0;left:0;background:rgba(0,0,0,.05);width:50px;height:20px;border-radius:10px;border:1px solid #d4d4d5;}&:hover::before{background-color:rgba(0,0,0,.15);border:none;}&:after{background:-webkit-linear-gradient(transparent,rgba(0,0,0,.05)) #fff;background:linear-gradient(transparent,rgba(0,0,0,.05)) #fff;position:absolute;content:\'\'!important;opacity:1;z-index:2;border:none;box-shadow:0 1px 2px 0 rgba(34,36,38,.15),0 0 0 1px rgba(34,36,38,.15) inset;width:20px;height:20px;top:0;left:0;border-radius:50%;-webkit-transition:background .3s ease,left .3s ease;transition:background .3s ease,left .3s ease;}}}</style>'); });
angular.module('ui.tux.formValidations').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">form.ng-invalid{border:0 !important;}.tux-form{.ng-invalid{border:1px solid #ddd !important;}.ng-dirty.ng-invalid{border:1px solid red !important;}.clear{clear:both;}}.tux-form.ng-submitted{.ng-invalid{border:1px solid red !important;}}label.error{color:#eb161e;line-height:20px;font-weight:normal;font-size:12px;}</style>'); });
angular.module('ui.tux.grid').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.tux-grid{&.ag-fresh{.ag-header{background:#e4ecf0;}.ag-cell{padding:5px;border-bottom-color:#ddd;font-family:helvatica55;}.ag-paging-row-summary-panel{width :auto !important;}.ag-body .ag-row-even{background-color:#f7f7f7;}.ag-body .ag-row-odd{background-color:#ffffff;}.ag-filter-value,.ag-selection-checkbox{margin-right:4px;}&.data-grid .ag-header{border-bottom:1px solid #bcd1e0;border-top:1px solid #bcd1e0;}.ag-root{border:none;}.ag-header-cell{border:none;}.ag-header-cell-text{font-size:12px;font-weight:bold;color:#555;font-family:helvatica55;}.ag-cell-no-focus{border-right:none;}.ag-cell-focus{border:none;border-bottom:1px solid #ddd;outline:none;}.ag-cell-focus input[type=text]{width:100%;font-size:12px;padding:3px 0px;color:#555555;border:1px solid #ddd;-webkit-box-shadow:inset 2px 2px 6px 0px rgba(1,1,1,0.1);-webkit-transition:border-color ease-in-out 0.15s,box-shadow ease-in-out 0.15s;-o-transition:border-color ease-in-out 0.15s,box-shadow ease-in-out 0.15s;transition:border-color ease-in-out 0.15s,box-shadow ease-in-out 0.15s;font-family:\'helvatica55\';}.ag-row-selected{background-color:#e5eef3 !important;}.ag-body{padding-top:37px !important;}.ag-header-cell-label{padding:7px 2px;}.ag-header-cell-menu-button{margin-top:8px;}.ag-header-row,.ag-header{height:37px !important;}.ag-pinned-left-cols-viewport{border-right:1px solid #bcd1e0 !important;-moz-box-shadow:5px 0px 15px -5px #ebebeb;-webkit-box-shadow:5px 0px 15px -5px #ebebeb;box-shadow:5px 0px 15px -5px #ebebeb;position:relative;z-index:10;}.ag-header-icon svg{fill:rgb(103,106,110);}.ag-paging-button{border:none;background:none;font-size:0;&:after{font-family:\'FontAwesome\';color:#2688DA;font-size:16px;cursor:pointer;}}.ag-paging-button[disabled]{opacity:0.35;}.ag-paging-button:focus{outline:none;}#btFirst:after{content:"\\f049";}#btPrevious:after{content:"\\f048";}#btNext:after{content:"\\f051";}#btLast:after{content:"\\f050";}.ag-paging-page-summary-panel{float:right;}.align-left{text-align:left;}}}.export-btn,.print-btn{margin:0 0 0 5px;}@media print{.print-body *{height:0;overflow:hidden;}.for-print,.for-print *{visibility:visible;height:auto;}.for-print{position:fixed;left:0;top:0;}}</style>'); });
angular.module('ui.tux.header').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.tux-header{font-size:12px;}.navbar{position:relative;min-height:50px;margin-bottom:17px;border:1px solid transparent;}.navbar:before,.navbar:after{content:" ";display:table;}.navbar:after{clear:both;}@media (min-width:768px){.navbar{border-radius:5px;}}.navbar-header:before,.navbar-header:after{content:" ";display:table;}.navbar-header:after{clear:both;}@media (min-width:768px){.navbar-header{float:left;}nav ul.primary-nav > li > a i{position:absolute;font-size:20px;top:15px;left:15px;}nav ul.primary-nav > li > a:hover i{top:14px;left:14px;}nav ul.primary-nav > li.open > a i{top:13px;left:14px;}}.nav-hamburger{.icon-bar{transition:all 0.5s ease-in-out 0s;}&.active{.skew-clock{-ms-transform:rotate(45deg);-webkit-transform:rotate(45deg);-o-transform:rotate(45deg);transform:rotate(45deg);margin-top:7px;}.skew-counter{-ms-transform:rotate(-45deg);-webkit-transform:rotate(-45deg);-o-transform:rotate(-45deg);transform:rotate(-45deg);margin-top:-10px !important;}}}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .second-level-wrapper .second-level-container:nth-child(1){display:block;}}.navbar-collapse{overflow-x:visible;padding-right:10px;padding-left:10px;border-top:1px solid transparent;box-shadow:inset 0 1px 0 rgba(255,255,255,0.1);-webkit-overflow-scrolling:touch;}.navbar-collapse:before,.navbar-collapse:after{content:" ";display:table;}.navbar-collapse:after{clear:both;}.navbar-collapse.in{overflow-y:auto;}@media (min-width:768px){.navbar-collapse{width:auto;border-top:0;box-shadow:none;}.navbar-collapse.collapse{display:block !important;height:auto !important;padding-bottom:0;overflow:visible !important;}.navbar-collapse.in{overflow-y:visible;}.navbar-fixed-top .navbar-collapse,.navbar-static-top .navbar-collapse,.navbar-fixed-bottom .navbar-collapse{padding-left:0;padding-right:0;}}.navbar-fixed-top .navbar-collapse,.navbar-fixed-bottom .navbar-collapse{max-height:340px;}@media (max-width:320px) and (orientation:landscape){.navbar-fixed-top .navbar-collapse,.navbar-fixed-bottom .navbar-collapse{max-height:200px;}}.container > .navbar-header,.container > .navbar-collapse,.container-fluid > .navbar-header,.container-fluid > .navbar-collapse{margin-right:-10px;margin-left:-10px;}@media (min-width:768px){.container > .navbar-header,.container > .navbar-collapse,.container-fluid > .navbar-header,.container-fluid > .navbar-collapse{margin-right:0;margin-left:0;}}.navbar-static-top{z-index:1000;border-width:0 0 1px;}@media (min-width:768px){.navbar-static-top{border-radius:0;}}.navbar-fixed-top,.navbar-fixed-bottom{position:fixed;right:0;left:0;z-index:1030;-moz-transform:translate3d(0,0,0);-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0);}@media (min-width:768px){.navbar-fixed-top,.navbar-fixed-bottom{border-radius:0;}}.navbar-fixed-top{top:0;border-width:0 0 1px;}.navbar-fixed-bottom{bottom:0;margin-bottom:0;border-width:1px 0 0;}.navbar-brand{float:left;padding:16.5px 10px;font-size:15px;line-height:17px;height:50px;}.navbar-brand:hover,.navbar-brand:focus{text-decoration:none;}@media (min-width:768px){.navbar > .container .navbar-brand,.navbar > .container-fluid .navbar-brand{margin-left:-10px;}}.navbar-toggle,.nav-hamburger,.nav-trigger{position:relative;float:right;margin-right:10px;padding:9px 10px;margin-top:8px;margin-bottom:8px;background-color:transparent;background-image:none;border:1px solid transparent;border-radius:5px;}.navbar-toggle:focus,.nav-hamburger:focus,.nav-trigger:focus{outline:0;}.navbar-toggle .icon-bar,.nav-hamburger .icon-bar,.nav-trigger .icon-bar{display:block;width:22px;height:2px;border-radius:1px;}.navbar-toggle .icon-bar + .icon-bar,.nav-hamburger .icon-bar + .icon-bar,.nav-trigger .icon-bar + .icon-bar{margin-top:4px;}@media (min-width:768px){.navbar-toggle,.nav-hamburger,.nav-trigger{display:none;}}.navbar-nav{margin:8.25px -10px;}.navbar-nav > li > a{padding-top:10px;padding-bottom:10px;line-height:17px;}@media (max-width:767px){.navbar-nav .open .dropdown-menu{position:static;float:none;width:auto;margin-top:0;background-color:transparent;border:0;box-shadow:none;}nav ul.primary-nav > li > a i{position:relative;margin-right:10px;font-size:16px;}.navbar-nav .open .dropdown-menu > li > a,.navbar-nav .open .dropdown-menu .dropdown-header{padding:5px 15px 5px 25px;}.navbar-nav .open .dropdown-menu > li > a{line-height:17px;}.navbar-nav .open .dropdown-menu > li > a:hover,.navbar-nav .open .dropdown-menu > li > a:focus{background-image:none;}}@media (min-width:768px){.navbar-nav{float:left;margin:0;}.navbar-nav > li{float:left;}.navbar-nav > li > a{padding-top:16.5px;padding-bottom:16.5px;}.navbar-nav.navbar-right:last-child{margin-right:-10px;}}@media (min-width:768px){.navbar-left{float:left !important;}.navbar-right{float:right !important;}}.navbar-form{margin-left:-10px;margin-right:-10px;padding:10px 10px;border-top:1px solid transparent;border-bottom:1px solid transparent;-moz-box-shadow:inset 0 1px 0 rgba(255,255,255,0.1),0 1px 0 rgba(255,255,255,0.1);-webkit-box-shadow:inset 0 1px 0 rgba(255,255,255,0.1),0 1px 0 rgba(255,255,255,0.1);box-shadow:inset 0 1px 0 rgba(255,255,255,0.1),0 1px 0 rgba(255,255,255,0.1);margin-top:9.5px;margin-bottom:9.5px;}@media (max-width:767px){.navbar-form .form-group{margin-bottom:5px;}}@media (min-width:768px){.navbar-form{width:auto;border:0;margin-left:0;margin-right:0;padding-top:0;padding-bottom:0;-moz-box-shadow:none;-webkit-box-shadow:none;box-shadow:none;}.navbar-form.navbar-right:last-child{margin-right:-10px;}}.navbar-nav > li > .dropdown-menu{margin-top:0;-moz-border-radius-topleft:0;-webkit-border-top-left-radius:0;border-top-left-radius:0;-moz-border-radius-topright:0;-webkit-border-top-right-radius:0;border-top-right-radius:0;}.navbar-fixed-bottom .navbar-nav > li > .dropdown-menu{-moz-border-radius-bottomleft:0;-webkit-border-bottom-left-radius:0;border-bottom-left-radius:0;-moz-border-radius-bottomright:0;-webkit-border-bottom-right-radius:0;border-bottom-right-radius:0;}.navbar-btn{margin-top:9.5px;margin-bottom:9.5px;}.navbar-btn.btn-sm,.btn-group-sm > .navbar-btn.btn{margin-top:11.5px;margin-bottom:11.5px;}.navbar-btn.btn-xs,.btn-group-xs > .navbar-btn.btn{margin-top:14px;margin-bottom:14px;}.navbar-text{margin-top:16.5px;margin-bottom:16.5px;}@media (min-width:768px){.navbar-text{float:left;margin-left:10px;margin-right:10px;}.navbar-text.navbar-right:last-child{margin-right:0;}}.navbar-default{background-color:#f8f8f8;border-color:#e7e7e7;}.navbar-default .navbar-brand{color:#777;}.navbar-default .navbar-brand:hover,.navbar-default .navbar-brand:focus{color:#5e5e5e;background-color:transparent;}.navbar-default .navbar-text{color:#777;}.navbar-default .navbar-nav > li > a{color:#777;}.navbar-default .navbar-nav > li > a:hover,.navbar-default .navbar-nav > li > a:focus{color:#333;background-color:transparent;}.navbar-default .navbar-nav > .active > a,.navbar-default .navbar-nav > .active > a:hover,.navbar-default .navbar-nav > .active > a:focus{color:#555;background-color:#e7e7e7;}.navbar-default .navbar-nav > .disabled > a,.navbar-default .navbar-nav > .disabled > a:hover,.navbar-default .navbar-nav > .disabled > a:focus{color:#ccc;background-color:transparent;}.navbar-default .navbar-toggle,.navbar-default .nav-hamburger,.navbar-default .nav-trigger{border-color:#ddd;}.navbar-default .navbar-toggle:hover,.navbar-default .nav-hamburger:hover,.navbar-default .nav-trigger:hover,.navbar-default .navbar-toggle:focus,.navbar-default .nav-hamburger:focus,.navbar-default .nav-trigger:focus{background-color:#ddd;}.navbar-default .navbar-toggle .icon-bar,.navbar-default .nav-hamburger .icon-bar,.navbar-default .nav-trigger .icon-bar{background-color:#888;}.navbar-default .navbar-collapse,.navbar-default .navbar-form{border-color:#e7e7e7;}.navbar-default .navbar-nav > .open > a,.navbar-default .navbar-nav > .open > a:hover,.navbar-default .navbar-nav > .open > a:focus{background-color:#e7e7e7;color:#555;}@media (max-width:767px){.navbar-default .navbar-nav .open .dropdown-menu > li > a{color:#777;}.navbar-default .navbar-nav .open .dropdown-menu > li > a:hover,.navbar-default .navbar-nav .open .dropdown-menu > li > a:focus{color:#333;background-color:transparent;}.navbar-default .navbar-nav .open .dropdown-menu > .active > a,.navbar-default .navbar-nav .open .dropdown-menu > .active > a:hover,.navbar-default .navbar-nav .open .dropdown-menu > .active > a:focus{color:#555;background-color:#e7e7e7;}.navbar-default .navbar-nav .open .dropdown-menu > .disabled > a,.navbar-default .navbar-nav .open .dropdown-menu > .disabled > a:hover,.navbar-default .navbar-nav .open .dropdown-menu > .disabled > a:focus{color:#ccc;background-color:transparent;}.search .input-group .input-group-btn .select-wrapper{width:130px;}.search .input-group input[type=\'text\'].form-control{height:49px;}.header-popover.search{width:100%;box-shadow:none;background:none;}.search .input-group .go-btn{background-image:url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzQ2NDk0YyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzFmMjEyMiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\');background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0%,#46494c),color-stop(100%,#1f2122));background-image:-moz-linear-gradient(#46494c,#1f2122);background-image:-webkit-linear-gradient(#46494c,#1f2122);background-image:linear-gradient(#46494c,#1f2122);padding:14px 15px 13px;font-size:1.3333333333em;text-transform:uppercase;border-radius:0;color:#FFFFFF;border:none;}}.navbar-default .navbar-link{color:#777;}.navbar-default .navbar-link:hover{color:#333;}.navbar-default .btn-link{color:#777;}.navbar-default .btn-link:hover,.navbar-default .btn-link:focus{color:#333;}.navbar-default .btn-link[disabled]:hover,.navbar-default .btn-link[disabled]:focus,fieldset[disabled] .navbar-default .btn-link:hover,fieldset[disabled] .navbar-default .btn-link:focus{color:#ccc;}.navbar-inverse{background-color:#222;border-color:#090909;}.navbar-inverse .navbar-brand{color:#777777;}.navbar-inverse .navbar-brand:hover,.navbar-inverse .navbar-brand:focus{color:#fff;background-color:transparent;}.navbar-inverse .navbar-text{color:#777777;}.navbar-inverse .navbar-nav > li > a{color:#777777;}.navbar-inverse .navbar-nav > li > a:hover,.navbar-inverse .navbar-nav > li > a:focus{color:#fff;background-color:transparent;}.navbar-inverse .navbar-nav > .active > a,.navbar-inverse .navbar-nav > .active > a:hover,.navbar-inverse .navbar-nav > .active > a:focus{color:#fff;background-color:#090909;}.navbar-inverse .navbar-nav > .disabled > a,.navbar-inverse .navbar-nav > .disabled > a:hover,.navbar-inverse .navbar-nav > .disabled > a:focus{color:#444;background-color:transparent;}.navbar-inverse .navbar-toggle,.navbar-inverse .nav-hamburger,.navbar-inverse .nav-trigger{border-color:#333;}.navbar-inverse .navbar-toggle:hover,.navbar-inverse .nav-hamburger:hover,.navbar-inverse .nav-trigger:hover,.navbar-inverse .navbar-toggle:focus,.navbar-inverse .nav-hamburger:focus,.navbar-inverse .nav-trigger:focus{background-color:#333;}.navbar-inverse .navbar-toggle .icon-bar,.navbar-inverse .nav-hamburger .icon-bar,.navbar-inverse .nav-trigger .icon-bar{background-color:#fff;}.navbar-inverse .navbar-collapse,.navbar-inverse .navbar-form{border-color:#101010;}.navbar-inverse .navbar-nav > .open > a,.navbar-inverse .navbar-nav > .open > a:hover,.navbar-inverse .navbar-nav > .open > a:focus{background-color:#090909;color:#fff;}@media (max-width:767px){.navbar-inverse .navbar-nav .open .dropdown-menu > .dropdown-header{border-color:#090909;}.navbar-inverse .navbar-nav .open .dropdown-menu .divider{background-color:#090909;}.navbar-inverse .navbar-nav .open .dropdown-menu > li > a{color:#777777;}.navbar-inverse .navbar-nav .open .dropdown-menu > li > a:hover,.navbar-inverse .navbar-nav .open .dropdown-menu > li > a:focus{color:#fff;background-color:transparent;}.navbar-inverse .navbar-nav .open .dropdown-menu > .active > a,.navbar-inverse .navbar-nav .open .dropdown-menu > .active > a:hover,.navbar-inverse .navbar-nav .open .dropdown-menu > .active > a:focus{color:#fff;background-color:#090909;}.navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a,.navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a:hover,.navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a:focus{color:#444;background-color:transparent;}.header-popover.notification .notification-list{width:100%;}.popover-holder .header-popover.notification{width:100%;box-shadow:none;}}.navbar-inverse .navbar-link{color:#777777;}.navbar-inverse .navbar-link:hover{color:#fff;}.navbar-inverse .btn-link{color:#777777;}.navbar-inverse .btn-link:hover,.navbar-inverse .btn-link:focus{color:#fff;}.navbar-inverse .btn-link[disabled]:hover,.navbar-inverse .btn-link[disabled]:focus,fieldset[disabled] .navbar-inverse .btn-link:hover,fieldset[disabled] .navbar-inverse .btn-link:focus{color:#444;}nav ul.primary-nav > li > a.has-child:after,nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li a:after,nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li.active a:after,nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li.ptab-name a:after{display:inline-block;font:normal normal normal 14px/1 FontAwesome;font-size:inherit;text-rendering:auto;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}nav ul.primary-nav li.page-name a.page-icon{font:FontAwesome;text-rendering:auto;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}.tux-header{width:100%;position:relative;z-index:106;background-color:#fff;padding-top:10px;border-bottom:1px solid #aaaaaa;border-top:3px solid #d20000;background-image:url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIvPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmZmZmYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmNWY1ZjUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM3ZGI5ZTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmNWY1ZjUiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPjwvc3ZnPiA=\');background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0%,#ffffff),color-stop(0%,#ffffff),color-stop(100%,#f5f5f5),color-stop(100%,#7db9e8),color-stop(100%,#f5f5f5));background-image:-moz-linear-gradient(top,#ffffff 0%,#ffffff 0%,#f5f5f5 100%,#7db9e8 100%,#f5f5f5 100%);background-image:-webkit-linear-gradient(top,#ffffff 0%,#ffffff 0%,#f5f5f5 100%,#7db9e8 100%,#f5f5f5 100%);background-image:linear-gradient(to bottom,#ffffff 0%,#ffffff 0%,#f5f5f5 100%,#7db9e8 100%,#f5f5f5 100%);}.tux-header:before,header:after{content:" ";display:table;}.tux-header:after{clear:both;}.tux-header.relative-header{position:relative;}.tux-header.relative-header.affix{position:fixed;}@media only screen and (min-width:992px){.tux-header{border-top:none;}}.tux-header.multi-line-header{padding-top:0px;border-bottom:none;}@media only screen and (min-width:992px){.tux-header.multi-line-header{border-bottom:1px solid #aaaaaa;}}.tux-header.multi-line-header nav{padding-left:17px;}.tux-header.multi-line-header nav ul.primary-nav{top:84px;}.tux-header.multi-line-header nav ul.primary-nav li.mega-menu .first-level-wrapper{}@media only screen and (min-width:992px){.tux-header.multi-line-header nav ul.primary-nav li.mega-menu .first-level-wrapper{top:106px;}}.tux-header.multi-line-header .header-top-row{width:100%;float:left;border-bottom:1px solid #cccccc;background-color:#efefef;}.tux-header.multi-line-header .tux-logo{padding:5px 0 5px;width:auto;}@media only screen and (min-width:992px){.tux-header.multi-line-header .tux-logo{padding-left:17px;}}.tux-header.multi-line-header .navigation-menu{width:100%;float:left;}@media only screen and (min-width:992px){.tux-header.multi-line-header .navigation-menu{height:auto;padding-top:8px;}}.tux-header.multi-line-header .header-section-right{margin-top:0px;}@media only screen and (min-width:768px){.tux-header.multi-line-header .header-section-right{margin-top:2px;top:0px;right:0px;bottom:auto;left:auto;position:absolute;}}@media only screen and (min-width:992px){.tux-header.multi-line-header .header-section-right{margin-top:10px;position:static;padding:2px 0 0 0;}}.tux-header.multi-line-header .header-identifier-mobile{opacity:0.5;width:auto !important;}.tux-header.multi-line-header .header-identifier,.tux-header.multi-line-header .header-identifier-mobile{margin-top:18px;margin-bottom:10px;width:100%;margin-left:11px;float:left;}@media only screen and (min-width:992px){.tux-header.multi-line-header .header-identifier,.tux-header.multi-line-header .header-identifier-mobile{width:auto;}}.tux-header.multi-line-header .header-identifier li,.tux-header.multi-line-header .header-identifier-mobile li{padding:0 2px 0 5px;color:#676a6e;border-right:1px solid #484949;float:left;line-height:11px;font-weight:bold;width:100px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:15px;}.tux-header.multi-line-header .header-identifier li:last-child,.tux-header.multi-line-header .header-identifier-mobile li:last-child{border-right:none;}@media only screen and (min-width:768px){.tux-header.multi-line-header .header-identifier li,.tux-header.multi-line-header .header-identifier-mobile li{width:auto;white-space:normal;overflow:visible;text-overflow:visible;}.popover-holder{display:none;}}.tux-header.multi-line-header .nav-hamburger,.tux-header.multi-line-header .nav-trigger{margin-top:1px;margin-bottom:0px;}.tux-header.multi-line-header .btn-user-settings-navigation{margin-top:8px;}.multi-line-header.nav-wrapper.right-nav-wrapper,.multi-line-header.nav-wrapper.icon-setting-popup,.multi-line-header.nav-wrapper.notification-popup,.multi-line-header.nav-wrapper.mob-alert-pop,.multi-line-header.nav-wrapper.mob-alert-subscription-pop{top:88px;}.tux-logo{padding:3px 0 12px;}@media only screen and (min-width:992px){.tux-logo{padding:7px 20px 17px;}}.tux-logo h1{font-weight:bold;font-size:1.3333333333em;color:#d20000;text-transform:uppercase;}@media only screen and (min-width:768px){.tux-logo h1{font-size:1.3333333333em;}}.horizontal-logo{display:table;float:left;}.horizontal-logo img{display:inline;}.horizontal-logo h1{display:inline;vertical-align:bottom;line-height:22px;padding-left:5px;}.vertical-logo{float:left;padding:0 10px;}.vertical-logo h1{margin:5px 0 0 0;}.navigation-menu{margin:0;}.navigation-menu .row{margin:0;}.navigation-menu .header-section-left{float:left;}@media only screen and (min-width:992px){.navigation-menu .header-section-left{width:75%;}}.navigation-menu .header-section-left .nav-hamburger,.navigation-menu .header-section-left .nav-trigger{margin-top:1px;}.navigation-menu .header-section-left .twrwd-logo{margin-top:5px;}.header-section-right{margin-top:2px;}@media only screen and (min-width:768px){.header-section-right{padding:11px 0 4px 0;}}@media only screen and (min-width:992px){.header-section-right{float:left;width:25%;margin-top:6px;}}.header-section-right .page-option-panel{float:right;}.header-section-right .page-option-panel ul{float:left;padding:0;}.header-section-right .page-option-panel ul li{float:left;list-style-type:none;padding:0 17px 0 17px;}@media only screen and (min-width:768px){.header-section-right .page-option-panel ul li{padding:0 16px 0 16px;}}.header-section-right .page-option-panel ul li a{text-decoration:none;}.header-section-right .page-option-panel ul li a.tooltip-open span{color:#d20000;}.header-section-right .page-option-panel ul li a.tooltip-open span.user-name:after{color:#d20000;}.header-section-right .page-option-panel ul li a.tooltip-open:before{color:#d20000;}.header-section-right .page-option-panel ul li a.tooltip-open:after{color:#d20000;}.header-section-right .page-option-panel ul li a.notification{position:relative;&.tooltip-open:before{color:#d20000;}}.header-section-right .page-option-panel ul li a.notification .badge{font-size:0.6666666667em;top:-70%;position:absolute;left:49%;background:#2688da;color:#ffffff;height:20px;width:21px;line-height:14px;text-align:center;border:1px solid #2688da;-moz-box-shadow:-1px 1px 0px 1px white;-webkit-box-shadow:-1px 1px 0px 1px white;box-shadow:-1px 1px 0px 1px white;font-weight:normal;padding:3px 0px;}.header-section-right .page-option-panel ul li a.user-settings{font-size:1.4166666667em;color:#161718;}.header-section-right .page-option-panel ul li a.user-settings.tooltip-open{color:#d20000;}.header-section-right .page-option-panel ul li a.user-settings.tooltip-open:after{color:#d20000;}.header-section-right .page-option-panel ul li a.user-settings:after{content:"\\f107";float:right;margin-left:8px;font-size:1.1666666667em;color:#808285;font-weight:normal;}.header-section-right .page-option-panel ul li a.user-name{font-size:1em;font-family:\'helvatica75\';text-transform:uppercase;padding-right:22px;position:relative;display:inline-block;color:#161718;width:97px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:right;}.header-section-right .page-option-panel ul li a.user-name.tooltip-open{color:#d20000;}.header-section-right .page-option-panel ul li a.user-name.tooltip-open:after{color:#d20000;}.header-section-right .page-option-panel ul li a.user-name:after{content:"\\f107";top:-2px;right:0px;bottom:auto;left:auto;position:absolute;font-size:1.5833333333em;color:#808285;font-weight:normal;font-family:fontAwesome;line-height:19px;}.header-section-right .more-pop-trigger{display:inline-block;float:right;margin-right:10px;}.nav-trigger{color:#aaaaaa;font-size:1.5em;padding:0;margin:5px 9px 9px;}.nav-trigger.active{color:#d20000;}.nav-trigger:after{content:\'\\f141\';font-size:1.3333333333em;color:#43464a;font-family:fontAwesome;}.icon-setting-popup{width:180px;background:#EFF5F8;-moz-box-shadow:-5px 0px 5px 5px transparent;-webkit-box-shadow:-5px 0px 5px 5px transparent;box-shadow:-5px 0px 5px 5px transparent;}.notification-popup,.mob-alert-pop,.mob-alert-subscription-pop{background:#EFF5F8;-moz-box-shadow:-5px 0px 5px 5px transparent;-webkit-box-shadow:-5px 0px 5px 5px transparent;box-shadow:-5px 0px 5px 5px transparent;width:439px;}.notification-popup ul.nav-list li,.mob-alert-pop ul.nav-list li,.mob-alert-subscription-pop ul.nav-list li{float:left;width:100%;}.notification-popup ul.nav-list li a,.mob-alert-pop ul.nav-list li a,.mob-alert-subscription-pop ul.nav-list li a{float:left;width:100%;}.notification-popup ul.nav-list li a span.fa,.mob-alert-pop ul.nav-list li a span.fa,.mob-alert-subscription-pop ul.nav-list li a span.fa,.notification-popup ul.nav-list li a span.nav-trigger:after,.mob-alert-pop ul.nav-list li a span.nav-trigger:after,.mob-alert-subscription-pop ul.nav-list li a span.nav-trigger:after,.notification-popup ul.nav-list li a .message-area span.collapse-area.opened:after,.message-area .notification-popup ul.nav-list li a span.collapse-area.opened:after,.mob-alert-pop ul.nav-list li a .message-area span.collapse-area.opened:after,.message-area .mob-alert-pop ul.nav-list li a span.collapse-area.opened:after,.mob-alert-subscription-pop ul.nav-list li a .message-area span.collapse-area.opened:after,.message-area .mob-alert-subscription-pop ul.nav-list li a span.collapse-area.opened:after,.notification-popup ul.nav-list li a .submit-success span.collapse-area.opened:after,.submit-success .notification-popup ul.nav-list li a span.collapse-area.opened:after,.mob-alert-pop ul.nav-list li a .submit-success span.collapse-area.opened:after,.submit-success .mob-alert-pop ul.nav-list li a span.collapse-area.opened:after,.mob-alert-subscription-pop ul.nav-list li a .submit-success span.collapse-area.opened:after,.submit-success .mob-alert-subscription-pop ul.nav-list li a span.collapse-area.opened:after,.notification-popup ul.nav-list li a .submit-failed span.collapse-area.opened:after,.submit-failed .notification-popup ul.nav-list li a span.collapse-area.opened:after,.mob-alert-pop ul.nav-list li a .submit-failed span.collapse-area.opened:after,.submit-failed .mob-alert-pop ul.nav-list li a span.collapse-area.opened:after,.mob-alert-subscription-pop ul.nav-list li a .submit-failed span.collapse-area.opened:after,.submit-failed .mob-alert-subscription-pop ul.nav-list li a span.collapse-area.opened:after,.notification-popup ul.nav-list li a .message-area span.collapse-area.closed:after,.message-area .notification-popup ul.nav-list li a span.collapse-area.closed:after,.mob-alert-pop ul.nav-list li a .message-area span.collapse-area.closed:after,.message-area .mob-alert-pop ul.nav-list li a span.collapse-area.closed:after,.mob-alert-subscription-pop ul.nav-list li a .message-area span.collapse-area.closed:after,.message-area .mob-alert-subscription-pop ul.nav-list li a span.collapse-area.closed:after,.notification-popup ul.nav-list li a .submit-success span.collapse-area.closed:after,.submit-success .notification-popup ul.nav-list li a span.collapse-area.closed:after,.mob-alert-pop ul.nav-list li a .submit-success span.collapse-area.closed:after,.submit-success .mob-alert-pop ul.nav-list li a span.collapse-area.closed:after,.mob-alert-subscription-pop ul.nav-list li a .submit-success span.collapse-area.closed:after,.submit-success .mob-alert-subscription-pop ul.nav-list li a span.collapse-area.closed:after,.notification-popup ul.nav-list li a .submit-failed span.collapse-area.closed:after,.submit-failed .notification-popup ul.nav-list li a span.collapse-area.closed:after,.mob-alert-pop ul.nav-list li a .submit-failed span.collapse-area.closed:after,.submit-failed .mob-alert-pop ul.nav-list li a span.collapse-area.closed:after,.mob-alert-subscription-pop ul.nav-list li a .submit-failed span.collapse-area.closed:after,.submit-failed .mob-alert-subscription-pop ul.nav-list li a span.collapse-area.closed:after,.notification-popup ul.nav-list li a #refresh-sortView-popover .refresh-block span.refresh-btn:before,#refresh-sortView-popover .refresh-block .notification-popup ul.nav-list li a span.refresh-btn:before,.mob-alert-pop ul.nav-list li a #refresh-sortView-popover .refresh-block span.refresh-btn:before,#refresh-sortView-popover .refresh-block .mob-alert-pop ul.nav-list li a span.refresh-btn:before,.mob-alert-subscription-pop ul.nav-list li a #refresh-sortView-popover .refresh-block span.refresh-btn:before,#refresh-sortView-popover .refresh-block .mob-alert-subscription-pop ul.nav-list li a span.refresh-btn:before,.notification-popup ul.nav-list li a span.has-sort:before,.mob-alert-pop ul.nav-list li a span.has-sort:before,.mob-alert-subscription-pop ul.nav-list li a span.has-sort:before,.notification-popup ul.nav-list li a span.has-sort:after,.mob-alert-pop ul.nav-list li a span.has-sort:after,.mob-alert-subscription-pop ul.nav-list li a span.has-sort:after,.notification-popup ul.nav-list li a .ui-jqdialog .ui-jqdialog-titlebar span.ui-jqdialog-titlebar-close:before,.ui-jqdialog .ui-jqdialog-titlebar .notification-popup ul.nav-list li a span.ui-jqdialog-titlebar-close:before,.mob-alert-pop ul.nav-list li a .ui-jqdialog .ui-jqdialog-titlebar span.ui-jqdialog-titlebar-close:before,.ui-jqdialog .ui-jqdialog-titlebar .mob-alert-pop ul.nav-list li a span.ui-jqdialog-titlebar-close:before,.mob-alert-subscription-pop ul.nav-list li a .ui-jqdialog .ui-jqdialog-titlebar span.ui-jqdialog-titlebar-close:before,.ui-jqdialog .ui-jqdialog-titlebar .mob-alert-subscription-pop ul.nav-list li a span.ui-jqdialog-titlebar-close:before,.notification-popup ul.nav-list li a span.grid-form-heading:before,.mob-alert-pop ul.nav-list li a span.grid-form-heading:before,.mob-alert-subscription-pop ul.nav-list li a span.grid-form-heading:before,.notification-popup ul.nav-list li a .form-wrapper span.collapsable-header:after,.form-wrapper .notification-popup ul.nav-list li a span.collapsable-header:after,.mob-alert-pop ul.nav-list li a .form-wrapper span.collapsable-header:after,.form-wrapper .mob-alert-pop ul.nav-list li a span.collapsable-header:after,.mob-alert-subscription-pop ul.nav-list li a .form-wrapper span.collapsable-header:after,.form-wrapper .mob-alert-subscription-pop ul.nav-list li a span.collapsable-header:after,.notification-popup ul.nav-list li a .link-one-ul-wrapper span.collapsable-header:after,.link-one-ul-wrapper .notification-popup ul.nav-list li a span.collapsable-header:after,.mob-alert-pop ul.nav-list li a .link-one-ul-wrapper span.collapsable-header:after,.link-one-ul-wrapper .mob-alert-pop ul.nav-list li a span.collapsable-header:after,.mob-alert-subscription-pop ul.nav-list li a .link-one-ul-wrapper span.collapsable-header:after,.link-one-ul-wrapper .mob-alert-subscription-pop ul.nav-list li a span.collapsable-header:after,.notification-popup ul.nav-list li a .link-one-ul-wrapper span.link-one-header:after,.link-one-ul-wrapper .notification-popup ul.nav-list li a span.link-one-header:after,.mob-alert-pop ul.nav-list li a .link-one-ul-wrapper span.link-one-header:after,.link-one-ul-wrapper .mob-alert-pop ul.nav-list li a span.link-one-header:after,.mob-alert-subscription-pop ul.nav-list li a .link-one-ul-wrapper span.link-one-header:after,.link-one-ul-wrapper .mob-alert-subscription-pop ul.nav-list li a span.link-one-header:after,.notification-popup ul.nav-list li a span.page-title.linkpage:after,.mob-alert-pop ul.nav-list li a span.page-title.linkpage:after,.mob-alert-subscription-pop ul.nav-list li a span.page-title.linkpage:after,.notification-popup ul.nav-list li a .accumulator div div span.toggle-sender-list-btn,.accumulator div div .notification-popup ul.nav-list li a span.toggle-sender-list-btn,.mob-alert-pop ul.nav-list li a .accumulator div div span.toggle-sender-list-btn,.accumulator div div .mob-alert-pop ul.nav-list li a span.toggle-sender-list-btn,.mob-alert-subscription-pop ul.nav-list li a .accumulator div div span.toggle-sender-list-btn,.accumulator div div .mob-alert-subscription-pop ul.nav-list li a span.toggle-sender-list-btn{float:left;width:32px;}.notification-popup ul.nav-list li a span.nav-text,.mob-alert-pop ul.nav-list li a span.nav-text,.mob-alert-subscription-pop ul.nav-list li a span.nav-text{float:right;width:88%;}.notification-popup ul.nav-list li a span.nav-text:hover,.mob-alert-pop ul.nav-list li a span.nav-text:hover,.mob-alert-subscription-pop ul.nav-list li a span.nav-text:hover{color:#2688da;}.notification-popup ul.nav-list li a span.back-btn,.mob-alert-pop ul.nav-list li a span.back-btn,.mob-alert-subscription-pop ul.nav-list li a span.back-btn{color:#2688da;padding-top:6px;padding-right:5px;}.notification-popup ul.nav-list li:first-child a span.fa,.mob-alert-pop ul.nav-list li:first-child a span.fa,.mob-alert-subscription-pop ul.nav-list li:first-child a span.fa,.notification-popup ul.nav-list li:first-child a span.nav-trigger:after,.mob-alert-pop ul.nav-list li:first-child a span.nav-trigger:after,.mob-alert-subscription-pop ul.nav-list li:first-child a span.nav-trigger:after,.notification-popup ul.nav-list li:first-child a .message-area span.collapse-area.opened:after,.message-area .notification-popup ul.nav-list li:first-child a span.collapse-area.opened:after,.mob-alert-pop ul.nav-list li:first-child a .message-area span.collapse-area.opened:after,.message-area .mob-alert-pop ul.nav-list li:first-child a span.collapse-area.opened:after,.mob-alert-subscription-pop ul.nav-list li:first-child a .message-area span.collapse-area.opened:after,.message-area .mob-alert-subscription-pop ul.nav-list li:first-child a span.collapse-area.opened:after,.notification-popup ul.nav-list li:first-child a .submit-success span.collapse-area.opened:after,.submit-success .notification-popup ul.nav-list li:first-child a span.collapse-area.opened:after,.mob-alert-pop ul.nav-list li:first-child a .submit-success span.collapse-area.opened:after,.submit-success .mob-alert-pop ul.nav-list li:first-child a span.collapse-area.opened:after,.mob-alert-subscription-pop ul.nav-list li:first-child a .submit-success span.collapse-area.opened:after,.submit-success .mob-alert-subscription-pop ul.nav-list li:first-child a span.collapse-area.opened:after,.notification-popup ul.nav-list li:first-child a .submit-failed span.collapse-area.opened:after,.submit-failed .notification-popup ul.nav-list li:first-child a span.collapse-area.opened:after,.mob-alert-pop ul.nav-list li:first-child a .submit-failed span.collapse-area.opened:after,.submit-failed .mob-alert-pop ul.nav-list li:first-child a span.collapse-area.opened:after,.mob-alert-subscription-pop ul.nav-list li:first-child a .submit-failed span.collapse-area.opened:after,.submit-failed .mob-alert-subscription-pop ul.nav-list li:first-child a span.collapse-area.opened:after,.notification-popup ul.nav-list li:first-child a .message-area span.collapse-area.closed:after,.message-area .notification-popup ul.nav-list li:first-child a span.collapse-area.closed:after,.mob-alert-pop ul.nav-list li:first-child a .message-area span.collapse-area.closed:after,.message-area .mob-alert-pop ul.nav-list li:first-child a span.collapse-area.closed:after,.mob-alert-subscription-pop ul.nav-list li:first-child a .message-area span.collapse-area.closed:after,.message-area .mob-alert-subscription-pop ul.nav-list li:first-child a span.collapse-area.closed:after,.notification-popup ul.nav-list li:first-child a .submit-success span.collapse-area.closed:after,.submit-success .notification-popup ul.nav-list li:first-child a span.collapse-area.closed:after,.mob-alert-pop ul.nav-list li:first-child a .submit-success span.collapse-area.closed:after,.submit-success .mob-alert-pop ul.nav-list li:first-child a span.collapse-area.closed:after,.mob-alert-subscription-pop ul.nav-list li:first-child a .submit-success span.collapse-area.closed:after,.submit-success .mob-alert-subscription-pop ul.nav-list li:first-child a span.collapse-area.closed:after,.notification-popup ul.nav-list li:first-child a .submit-failed span.collapse-area.closed:after,.submit-failed .notification-popup ul.nav-list li:first-child a span.collapse-area.closed:after,.mob-alert-pop ul.nav-list li:first-child a .submit-failed span.collapse-area.closed:after,.submit-failed .mob-alert-pop ul.nav-list li:first-child a span.collapse-area.closed:after,.mob-alert-subscription-pop ul.nav-list li:first-child a .submit-failed span.collapse-area.closed:after,.submit-failed .mob-alert-subscription-pop ul.nav-list li:first-child a span.collapse-area.closed:after,.notification-popup ul.nav-list li:first-child a #refresh-sortView-popover .refresh-block span.refresh-btn:before,#refresh-sortView-popover .refresh-block .notification-popup ul.nav-list li:first-child a span.refresh-btn:before,.mob-alert-pop ul.nav-list li:first-child a #refresh-sortView-popover .refresh-block span.refresh-btn:before,#refresh-sortView-popover .refresh-block .mob-alert-pop ul.nav-list li:first-child a span.refresh-btn:before,.mob-alert-subscription-pop ul.nav-list li:first-child a #refresh-sortView-popover .refresh-block span.refresh-btn:before,#refresh-sortView-popover .refresh-block .mob-alert-subscription-pop ul.nav-list li:first-child a span.refresh-btn:before,.notification-popup ul.nav-list li:first-child a span.has-sort:before,.mob-alert-pop ul.nav-list li:first-child a span.has-sort:before,.mob-alert-subscription-pop ul.nav-list li:first-child a span.has-sort:before,.notification-popup ul.nav-list li:first-child a span.has-sort:after,.mob-alert-pop ul.nav-list li:first-child a span.has-sort:after,.mob-alert-subscription-pop ul.nav-list li:first-child a span.has-sort:after,.notification-popup ul.nav-list li:first-child a .ui-jqdialog .ui-jqdialog-titlebar span.ui-jqdialog-titlebar-close:before,.ui-jqdialog .ui-jqdialog-titlebar .notification-popup ul.nav-list li:first-child a span.ui-jqdialog-titlebar-close:before,.mob-alert-pop ul.nav-list li:first-child a .ui-jqdialog .ui-jqdialog-titlebar span.ui-jqdialog-titlebar-close:before,.ui-jqdialog .ui-jqdialog-titlebar .mob-alert-pop ul.nav-list li:first-child a span.ui-jqdialog-titlebar-close:before,.mob-alert-subscription-pop ul.nav-list li:first-child a .ui-jqdialog .ui-jqdialog-titlebar span.ui-jqdialog-titlebar-close:before,.ui-jqdialog .ui-jqdialog-titlebar .mob-alert-subscription-pop ul.nav-list li:first-child a span.ui-jqdialog-titlebar-close:before,.notification-popup ul.nav-list li:first-child a span.grid-form-heading:before,.mob-alert-pop ul.nav-list li:first-child a span.grid-form-heading:before,.mob-alert-subscription-pop ul.nav-list li:first-child a span.grid-form-heading:before,.notification-popup ul.nav-list li:first-child a .form-wrapper span.collapsable-header:after,.form-wrapper .notification-popup ul.nav-list li:first-child a span.collapsable-header:after,.mob-alert-pop ul.nav-list li:first-child a .form-wrapper span.collapsable-header:after,.form-wrapper .mob-alert-pop ul.nav-list li:first-child a span.collapsable-header:after,.mob-alert-subscription-pop ul.nav-list li:first-child a .form-wrapper span.collapsable-header:after,.form-wrapper .mob-alert-subscription-pop ul.nav-list li:first-child a span.collapsable-header:after,.notification-popup ul.nav-list li:first-child a .link-one-ul-wrapper span.collapsable-header:after,.link-one-ul-wrapper .notification-popup ul.nav-list li:first-child a span.collapsable-header:after,.mob-alert-pop ul.nav-list li:first-child a .link-one-ul-wrapper span.collapsable-header:after,.link-one-ul-wrapper .mob-alert-pop ul.nav-list li:first-child a span.collapsable-header:after,.mob-alert-subscription-pop ul.nav-list li:first-child a .link-one-ul-wrapper span.collapsable-header:after,.link-one-ul-wrapper .mob-alert-subscription-pop ul.nav-list li:first-child a span.collapsable-header:after,.notification-popup ul.nav-list li:first-child a .link-one-ul-wrapper span.link-one-header:after,.link-one-ul-wrapper .notification-popup ul.nav-list li:first-child a span.link-one-header:after,.mob-alert-pop ul.nav-list li:first-child a .link-one-ul-wrapper span.link-one-header:after,.link-one-ul-wrapper .mob-alert-pop ul.nav-list li:first-child a span.link-one-header:after,.mob-alert-subscription-pop ul.nav-list li:first-child a .link-one-ul-wrapper span.link-one-header:after,.link-one-ul-wrapper .mob-alert-subscription-pop ul.nav-list li:first-child a span.link-one-header:after,.notification-popup ul.nav-list li:first-child a span.page-title.linkpage:after,.mob-alert-pop ul.nav-list li:first-child a span.page-title.linkpage:after,.mob-alert-subscription-pop ul.nav-list li:first-child a span.page-title.linkpage:after,.notification-popup ul.nav-list li:first-child a .accumulator div div span.toggle-sender-list-btn,.accumulator div div .notification-popup ul.nav-list li:first-child a span.toggle-sender-list-btn,.mob-alert-pop ul.nav-list li:first-child a .accumulator div div span.toggle-sender-list-btn,.accumulator div div .mob-alert-pop ul.nav-list li:first-child a span.toggle-sender-list-btn,.mob-alert-subscription-pop ul.nav-list li:first-child a .accumulator div div span.toggle-sender-list-btn,.accumulator div div .mob-alert-subscription-pop ul.nav-list li:first-child a span.toggle-sender-list-btn{border:none;}.notification-popup ul.nav-list li:first-child a span.alert-txt,.mob-alert-pop ul.nav-list li:first-child a span.alert-txt,.mob-alert-subscription-pop ul.nav-list li:first-child a span.alert-txt{font-size:1em;padding-left:10px;text-transform:uppercase;font-weight:bold;padding-top:5px;}.notification-popup ul.nav-list li:first-child a span.fa-times,.mob-alert-pop ul.nav-list li:first-child a span.fa-times,.mob-alert-subscription-pop ul.nav-list li:first-child a span.fa-times,.notification-popup ul.nav-list li:first-child a .ui-jqdialog .ui-jqdialog-titlebar span.ui-jqdialog-titlebar-close:before,.ui-jqdialog .ui-jqdialog-titlebar .notification-popup ul.nav-list li:first-child a span.ui-jqdialog-titlebar-close:before,.mob-alert-pop ul.nav-list li:first-child a .ui-jqdialog .ui-jqdialog-titlebar span.ui-jqdialog-titlebar-close:before,.ui-jqdialog .ui-jqdialog-titlebar .mob-alert-pop ul.nav-list li:first-child a span.ui-jqdialog-titlebar-close:before,.mob-alert-subscription-pop ul.nav-list li:first-child a .ui-jqdialog .ui-jqdialog-titlebar span.ui-jqdialog-titlebar-close:before,.ui-jqdialog .ui-jqdialog-titlebar .mob-alert-subscription-pop ul.nav-list li:first-child a span.ui-jqdialog-titlebar-close:before{border-left:1px solid #c8cdcf;}.notification-popup .notification-alert-pop ul.nav-list.notification-nav-list li,.mob-alert-pop .notification-alert-pop ul.nav-list.notification-nav-list li,.mob-alert-subscription-pop .notification-alert-pop ul.nav-list.notification-nav-list li{background:#ffffff;}.notification-popup .notification-alert-pop ul.nav-list.notification-nav-list li:first-child,.mob-alert-pop .notification-alert-pop ul.nav-list.notification-nav-list li:first-child,.mob-alert-subscription-pop .notification-alert-pop ul.nav-list.notification-nav-list li:first-child{padding:10px 15px;background:#e4ecf0;}.notification-popup .notification-alert-pop ul.nav-list.notification-nav-list li:not(:first-child):hover,.mob-alert-pop .notification-alert-pop ul.nav-list.notification-nav-list li:not(:first-child):hover,.mob-alert-subscription-pop .notification-alert-pop ul.nav-list.notification-nav-list li:not(:first-child):hover{background:#ffffff;}.notification-popup .notification-alert-pop ul.nav-list.notification-nav-list li a span.nav-text,.mob-alert-pop .notification-alert-pop ul.nav-list.notification-nav-list li a span.nav-text,.mob-alert-subscription-pop .notification-alert-pop ul.nav-list.notification-nav-list li a span.nav-text{text-transform:inherit;}.notification-popup .notification-alert-sub-pop ul.nav-list li:first-child,.mob-alert-pop .notification-alert-sub-pop ul.nav-list li:first-child,.mob-alert-subscription-pop .notification-alert-sub-pop ul.nav-list li:first-child{padding:10px 15px;}.notification-popup .notification-alert-sub-pop ul.nav-list li:not(:first-child),.mob-alert-pop .notification-alert-sub-pop ul.nav-list li:not(:first-child),.mob-alert-subscription-pop .notification-alert-sub-pop ul.nav-list li:not(:first-child){background:#ffffff;padding:5px 10px;border-bottom:none;}.notification-popup .notification-alert-sub-pop ul.nav-list li:not(:first-child) a,.mob-alert-pop .notification-alert-sub-pop ul.nav-list li:not(:first-child) a,.mob-alert-subscription-pop .notification-alert-sub-pop ul.nav-list li:not(:first-child) a{background-image:url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2U5ZjBmNCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\');background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0%,#ffffff),color-stop(100%,#e9f0f4));background-image:-moz-linear-gradient(#ffffff,#e9f0f4);background-image:-webkit-linear-gradient(#ffffff,#e9f0f4);background-image:linear-gradient(#ffffff,#e9f0f4);border:1px solid #d7dcdf;padding:15px 10px;}.notification-popup .notification-alert-sub-pop ul.nav-list li:not(:first-child) a span.subscribe,.mob-alert-pop .notification-alert-sub-pop ul.nav-list li:not(:first-child) a span.subscribe,.mob-alert-subscription-pop .notification-alert-sub-pop ul.nav-list li:not(:first-child) a span.subscribe{color:#2688da;}.search-popover{width:480px;}.right-nav-wrapper,.icon-setting-popup,.notification-popup,.mob-alert-pop,.mob-alert-subscription-pop{background:#eff5f8;}.right-nav-wrapper ul.nav-list,.icon-setting-popup ul.nav-list,.notification-popup ul.nav-list,.mob-alert-pop ul.nav-list,.mob-alert-subscription-pop ul.nav-list{padding:0;margin:0;}.right-nav-wrapper ul.nav-list li,.icon-setting-popup ul.nav-list li,.notification-popup ul.nav-list li,.mob-alert-pop ul.nav-list li,.mob-alert-subscription-pop ul.nav-list li{list-style-type:none;border-bottom:1px solid #d9dddf;padding:15px 15px;background:#eff5f8;}.right-nav-wrapper ul.nav-list li:first-child,.icon-setting-popup ul.nav-list li:first-child,.notification-popup ul.nav-list li:first-child,.mob-alert-pop ul.nav-list li:first-child,.mob-alert-subscription-pop ul.nav-list li:first-child{background:#e4ecf0;border-bottom:1px solid #d9dddf;}.right-nav-wrapper ul.nav-list li:first-child a span.nav-text .manager-txt,.icon-setting-popup ul.nav-list li:first-child a span.nav-text .manager-txt,.notification-popup ul.nav-list li:first-child a span.nav-text .manager-txt,.mob-alert-pop ul.nav-list li:first-child a span.nav-text .manager-txt,.mob-alert-subscription-pop ul.nav-list li:first-child a span.nav-text .manager-txt{font-size:1em;text-transform:none;font-weight:normal;color:#676a6e;}.right-nav-wrapper ul.nav-list li:first-child a span.fa-user,.icon-setting-popup ul.nav-list li:first-child a span.fa-user,.notification-popup ul.nav-list li:first-child a span.fa-user,.mob-alert-pop ul.nav-list li:first-child a span.fa-user,.mob-alert-subscription-pop ul.nav-list li:first-child a span.fa-user{display:inline-block;float:left;border:none;background:none;color:#161718;}.right-nav-wrapper ul.nav-list li a,.icon-setting-popup ul.nav-list li a,.notification-popup ul.nav-list li a,.mob-alert-pop ul.nav-list li a,.mob-alert-subscription-pop ul.nav-list li a{text-decoration:none;color:#161718;}.right-nav-wrapper ul.nav-list li a span.nav-text,.icon-setting-popup ul.nav-list li a span.nav-text,.notification-popup ul.nav-list li a span.nav-text,.mob-alert-pop ul.nav-list li a span.nav-text,.mob-alert-subscription-pop ul.nav-list li a span.nav-text{display:table-cell;font-size:1em;padding-left:10px;text-transform:uppercase;font-weight:bold;}.right-nav-wrapper ul.nav-list li a span.fa,.icon-setting-popup ul.nav-list li a span.fa,.notification-popup ul.nav-list li a span.fa,.mob-alert-pop ul.nav-list li a span.fa,.mob-alert-subscription-pop ul.nav-list li a span.fa,.right-nav-wrapper ul.nav-list li a span.nav-trigger:after,.icon-setting-popup ul.nav-list li a span.nav-trigger:after,.notification-popup ul.nav-list li a span.nav-trigger:after,.mob-alert-pop ul.nav-list li a span.nav-trigger:after,.mob-alert-subscription-pop ul.nav-list li a span.nav-trigger:after,.right-nav-wrapper ul.nav-list li a .message-area span.collapse-area.opened:after,.message-area .right-nav-wrapper ul.nav-list li a span.collapse-area.opened:after,.icon-setting-popup ul.nav-list li a .message-area span.collapse-area.opened:after,.message-area .icon-setting-popup ul.nav-list li a span.collapse-area.opened:after,.notification-popup ul.nav-list li a .message-area span.collapse-area.opened:after,.message-area .notification-popup ul.nav-list li a span.collapse-area.opened:after,.mob-alert-pop ul.nav-list li a .message-area span.collapse-area.opened:after,.message-area .mob-alert-pop ul.nav-list li a span.collapse-area.opened:after,.mob-alert-subscription-pop ul.nav-list li a .message-area span.collapse-area.opened:after,.message-area .mob-alert-subscription-pop ul.nav-list li a span.collapse-area.opened:after,.right-nav-wrapper ul.nav-list li a .submit-success span.collapse-area.opened:after,.submit-success .right-nav-wrapper ul.nav-list li a span.collapse-area.opened:after,.icon-setting-popup ul.nav-list li a .submit-success span.collapse-area.opened:after,.submit-success .icon-setting-popup ul.nav-list li a span.collapse-area.opened:after,.notification-popup ul.nav-list li a .submit-success span.collapse-area.opened:after,.submit-success .notification-popup ul.nav-list li a span.collapse-area.opened:after,.mob-alert-pop ul.nav-list li a .submit-success span.collapse-area.opened:after,.submit-success .mob-alert-pop ul.nav-list li a span.collapse-area.opened:after,.mob-alert-subscription-pop ul.nav-list li a .submit-success span.collapse-area.opened:after,.submit-success .mob-alert-subscription-pop ul.nav-list li a span.collapse-area.opened:after,.right-nav-wrapper ul.nav-list li a .submit-failed span.collapse-area.opened:after,.submit-failed .right-nav-wrapper ul.nav-list li a span.collapse-area.opened:after,.icon-setting-popup ul.nav-list li a .submit-failed span.collapse-area.opened:after,.submit-failed .icon-setting-popup ul.nav-list li a span.collapse-area.opened:after,.notification-popup ul.nav-list li a .submit-failed span.collapse-area.opened:after,.submit-failed .notification-popup ul.nav-list li a span.collapse-area.opened:after,.mob-alert-pop ul.nav-list li a .submit-failed span.collapse-area.opened:after,.submit-failed .mob-alert-pop ul.nav-list li a span.collapse-area.opened:after,.mob-alert-subscription-pop ul.nav-list li a .submit-failed span.collapse-area.opened:after,.submit-failed .mob-alert-subscription-pop ul.nav-list li a span.collapse-area.opened:after,.right-nav-wrapper ul.nav-list li a .message-area span.collapse-area.closed:after,.message-area .right-nav-wrapper ul.nav-list li a span.collapse-area.closed:after,.icon-setting-popup ul.nav-list li a .message-area span.collapse-area.closed:after,.message-area .icon-setting-popup ul.nav-list li a span.collapse-area.closed:after,.notification-popup ul.nav-list li a .message-area span.collapse-area.closed:after,.message-area .notification-popup ul.nav-list li a span.collapse-area.closed:after,.mob-alert-pop ul.nav-list li a .message-area span.collapse-area.closed:after,.message-area .mob-alert-pop ul.nav-list li a span.collapse-area.closed:after,.mob-alert-subscription-pop ul.nav-list li a .message-area span.collapse-area.closed:after,.message-area .mob-alert-subscription-pop ul.nav-list li a span.collapse-area.closed:after,.right-nav-wrapper ul.nav-list li a .submit-success span.collapse-area.closed:after,.submit-success .right-nav-wrapper ul.nav-list li a span.collapse-area.closed:after,.icon-setting-popup ul.nav-list li a .submit-success span.collapse-area.closed:after,.submit-success .icon-setting-popup ul.nav-list li a span.collapse-area.closed:after,.notification-popup ul.nav-list li a .submit-success span.collapse-area.closed:after,.submit-success .notification-popup ul.nav-list li a span.collapse-area.closed:after,.mob-alert-pop ul.nav-list li a .submit-success span.collapse-area.closed:after,.submit-success .mob-alert-pop ul.nav-list li a span.collapse-area.closed:after,.mob-alert-subscription-pop ul.nav-list li a .submit-success span.collapse-area.closed:after,.submit-success .mob-alert-subscription-pop ul.nav-list li a span.collapse-area.closed:after,.right-nav-wrapper ul.nav-list li a .submit-failed span.collapse-area.closed:after,.submit-failed .right-nav-wrapper ul.nav-list li a span.collapse-area.closed:after,.icon-setting-popup ul.nav-list li a .submit-failed span.collapse-area.closed:after,.submit-failed .icon-setting-popup ul.nav-list li a span.collapse-area.closed:after,.notification-popup ul.nav-list li a .submit-failed span.collapse-area.closed:after,.submit-failed .notification-popup ul.nav-list li a span.collapse-area.closed:after,.mob-alert-pop ul.nav-list li a .submit-failed span.collapse-area.closed:after,.submit-failed .mob-alert-pop ul.nav-list li a span.collapse-area.closed:after,.mob-alert-subscription-pop ul.nav-list li a .submit-failed span.collapse-area.closed:after,.submit-failed .mob-alert-subscription-pop ul.nav-list li a span.collapse-area.closed:after,.right-nav-wrapper ul.nav-list li a #refresh-sortView-popover .refresh-block span.refresh-btn:before,#refresh-sortView-popover .refresh-block .right-nav-wrapper ul.nav-list li a span.refresh-btn:before,.icon-setting-popup ul.nav-list li a #refresh-sortView-popover .refresh-block span.refresh-btn:before,#refresh-sortView-popover .refresh-block .icon-setting-popup ul.nav-list li a span.refresh-btn:before,.notification-popup ul.nav-list li a #refresh-sortView-popover .refresh-block span.refresh-btn:before,#refresh-sortView-popover .refresh-block .notification-popup ul.nav-list li a span.refresh-btn:before,.mob-alert-pop ul.nav-list li a #refresh-sortView-popover .refresh-block span.refresh-btn:before,#refresh-sortView-popover .refresh-block .mob-alert-pop ul.nav-list li a span.refresh-btn:before,.mob-alert-subscription-pop ul.nav-list li a #refresh-sortView-popover .refresh-block span.refresh-btn:before,#refresh-sortView-popover .refresh-block .mob-alert-subscription-pop ul.nav-list li a span.refresh-btn:before,.right-nav-wrapper ul.nav-list li a span.has-sort:before,.icon-setting-popup ul.nav-list li a span.has-sort:before,.notification-popup ul.nav-list li a span.has-sort:before,.mob-alert-pop ul.nav-list li a span.has-sort:before,.mob-alert-subscription-pop ul.nav-list li a span.has-sort:before,.right-nav-wrapper ul.nav-list li a span.has-sort:after,.icon-setting-popup ul.nav-list li a span.has-sort:after,.notification-popup ul.nav-list li a span.has-sort:after,.mob-alert-pop ul.nav-list li a span.has-sort:after,.mob-alert-subscription-pop ul.nav-list li a span.has-sort:after,.right-nav-wrapper ul.nav-list li a .ui-jqdialog .ui-jqdialog-titlebar span.ui-jqdialog-titlebar-close:before,.ui-jqdialog .ui-jqdialog-titlebar .right-nav-wrapper ul.nav-list li a span.ui-jqdialog-titlebar-close:before,.icon-setting-popup ul.nav-list li a .ui-jqdialog .ui-jqdialog-titlebar span.ui-jqdialog-titlebar-close:before,.ui-jqdialog .ui-jqdialog-titlebar .icon-setting-popup ul.nav-list li a span.ui-jqdialog-titlebar-close:before,.notification-popup ul.nav-list li a .ui-jqdialog .ui-jqdialog-titlebar span.ui-jqdialog-titlebar-close:before,.ui-jqdialog .ui-jqdialog-titlebar .notification-popup ul.nav-list li a span.ui-jqdialog-titlebar-close:before,.mob-alert-pop ul.nav-list li a .ui-jqdialog .ui-jqdialog-titlebar span.ui-jqdialog-titlebar-close:before,.ui-jqdialog .ui-jqdialog-titlebar .mob-alert-pop ul.nav-list li a span.ui-jqdialog-titlebar-close:before,.mob-alert-subscription-pop ul.nav-list li a .ui-jqdialog .ui-jqdialog-titlebar span.ui-jqdialog-titlebar-close:before,.ui-jqdialog .ui-jqdialog-titlebar .mob-alert-subscription-pop ul.nav-list li a span.ui-jqdialog-titlebar-close:before,.right-nav-wrapper ul.nav-list li a span.grid-form-heading:before,.icon-setting-popup ul.nav-list li a span.grid-form-heading:before,.notification-popup ul.nav-list li a span.grid-form-heading:before,.mob-alert-pop ul.nav-list li a span.grid-form-heading:before,.mob-alert-subscription-pop ul.nav-list li a span.grid-form-heading:before,.right-nav-wrapper ul.nav-list li a .form-wrapper span.collapsable-header:after,.form-wrapper .right-nav-wrapper ul.nav-list li a span.collapsable-header:after,.icon-setting-popup ul.nav-list li a .form-wrapper span.collapsable-header:after,.form-wrapper .icon-setting-popup ul.nav-list li a span.collapsable-header:after,.notification-popup ul.nav-list li a .form-wrapper span.collapsable-header:after,.form-wrapper .notification-popup ul.nav-list li a span.collapsable-header:after,.mob-alert-pop ul.nav-list li a .form-wrapper span.collapsable-header:after,.form-wrapper .mob-alert-pop ul.nav-list li a span.collapsable-header:after,.mob-alert-subscription-pop ul.nav-list li a .form-wrapper span.collapsable-header:after,.form-wrapper .mob-alert-subscription-pop ul.nav-list li a span.collapsable-header:after,.right-nav-wrapper ul.nav-list li a .link-one-ul-wrapper span.collapsable-header:after,.link-one-ul-wrapper .right-nav-wrapper ul.nav-list li a span.collapsable-header:after,.icon-setting-popup ul.nav-list li a .link-one-ul-wrapper span.collapsable-header:after,.link-one-ul-wrapper .icon-setting-popup ul.nav-list li a span.collapsable-header:after,.notification-popup ul.nav-list li a .link-one-ul-wrapper span.collapsable-header:after,.link-one-ul-wrapper .notification-popup ul.nav-list li a span.collapsable-header:after,.mob-alert-pop ul.nav-list li a .link-one-ul-wrapper span.collapsable-header:after,.link-one-ul-wrapper .mob-alert-pop ul.nav-list li a span.collapsable-header:after,.mob-alert-subscription-pop ul.nav-list li a .link-one-ul-wrapper span.collapsable-header:after,.link-one-ul-wrapper .mob-alert-subscription-pop ul.nav-list li a span.collapsable-header:after,.right-nav-wrapper ul.nav-list li a .link-one-ul-wrapper span.link-one-header:after,.link-one-ul-wrapper .right-nav-wrapper ul.nav-list li a span.link-one-header:after,.icon-setting-popup ul.nav-list li a .link-one-ul-wrapper span.link-one-header:after,.link-one-ul-wrapper .icon-setting-popup ul.nav-list li a span.link-one-header:after,.notification-popup ul.nav-list li a .link-one-ul-wrapper span.link-one-header:after,.link-one-ul-wrapper .notification-popup ul.nav-list li a span.link-one-header:after,.mob-alert-pop ul.nav-list li a .link-one-ul-wrapper span.link-one-header:after,.link-one-ul-wrapper .mob-alert-pop ul.nav-list li a span.link-one-header:after,.mob-alert-subscription-pop ul.nav-list li a .link-one-ul-wrapper span.link-one-header:after,.link-one-ul-wrapper .mob-alert-subscription-pop ul.nav-list li a span.link-one-header:after,.right-nav-wrapper ul.nav-list li a .field-interaction-wrapper.form-wrapper span.collapsable-header:after,.field-interaction-wrapper.form-wrapper .right-nav-wrapper ul.nav-list li a span.collapsable-header:after,.icon-setting-popup ul.nav-list li a .field-interaction-wrapper.form-wrapper span.collapsable-header:after,.field-interaction-wrapper.form-wrapper .icon-setting-popup ul.nav-list li a span.collapsable-header:after,.notification-popup ul.nav-list li a .field-interaction-wrapper.form-wrapper span.collapsable-header:after,.field-interaction-wrapper.form-wrapper .notification-popup ul.nav-list li a span.collapsable-header:after,.mob-alert-pop ul.nav-list li a .field-interaction-wrapper.form-wrapper span.collapsable-header:after,.field-interaction-wrapper.form-wrapper .mob-alert-pop ul.nav-list li a span.collapsable-header:after,.mob-alert-subscription-pop ul.nav-list li a .field-interaction-wrapper.form-wrapper span.collapsable-header:after,.field-interaction-wrapper.form-wrapper .mob-alert-subscription-pop ul.nav-list li a span.collapsable-header:after,.right-nav-wrapper ul.nav-list li a .field-interaction-wrapper.link-one-ul-wrapper span.collapsable-header:after,.field-interaction-wrapper.link-one-ul-wrapper .right-nav-wrapper ul.nav-list li a span.collapsable-header:after,.icon-setting-popup ul.nav-list li a .field-interaction-wrapper.link-one-ul-wrapper span.collapsable-header:after,.field-interaction-wrapper.link-one-ul-wrapper .icon-setting-popup ul.nav-list li a span.collapsable-header:after,.notification-popup ul.nav-list li a .field-interaction-wrapper.link-one-ul-wrapper span.collapsable-header:after,.field-interaction-wrapper.link-one-ul-wrapper .notification-popup ul.nav-list li a span.collapsable-header:after,.mob-alert-pop ul.nav-list li a .field-interaction-wrapper.link-one-ul-wrapper span.collapsable-header:after,.field-interaction-wrapper.link-one-ul-wrapper .mob-alert-pop ul.nav-list li a span.collapsable-header:after,.mob-alert-subscription-pop ul.nav-list li a .field-interaction-wrapper.link-one-ul-wrapper span.collapsable-header:after,.field-interaction-wrapper.link-one-ul-wrapper .mob-alert-subscription-pop ul.nav-list li a span.collapsable-header:after,.right-nav-wrapper ul.nav-list li a .field-interaction-wrapper.form-wrapper .link-one-ul-wrapper span.link-one-header:after,.field-interaction-wrapper.form-wrapper .link-one-ul-wrapper .right-nav-wrapper ul.nav-list li a span.link-one-header:after,.icon-setting-popup ul.nav-list li a .field-interaction-wrapper.form-wrapper .link-one-ul-wrapper span.link-one-header:after,.field-interaction-wrapper.form-wrapper .link-one-ul-wrapper .icon-setting-popup ul.nav-list li a span.link-one-header:after,.notification-popup ul.nav-list li a .field-interaction-wrapper.form-wrapper .link-one-ul-wrapper span.link-one-header:after,.field-interaction-wrapper.form-wrapper .link-one-ul-wrapper .notification-popup ul.nav-list li a span.link-one-header:after,.mob-alert-pop ul.nav-list li a .field-interaction-wrapper.form-wrapper .link-one-ul-wrapper span.link-one-header:after,.field-interaction-wrapper.form-wrapper .link-one-ul-wrapper .mob-alert-pop ul.nav-list li a span.link-one-header:after,.mob-alert-subscription-pop ul.nav-list li a .field-interaction-wrapper.form-wrapper .link-one-ul-wrapper span.link-one-header:after,.field-interaction-wrapper.form-wrapper .link-one-ul-wrapper .mob-alert-subscription-pop ul.nav-list li a span.link-one-header:after,.right-nav-wrapper ul.nav-list li a .link-one-ul-wrapper .field-interaction-wrapper.form-wrapper span.link-one-header:after,.link-one-ul-wrapper .field-interaction-wrapper.form-wrapper .right-nav-wrapper ul.nav-list li a span.link-one-header:after,.icon-setting-popup ul.nav-list li a .link-one-ul-wrapper .field-interaction-wrapper.form-wrapper span.link-one-header:after,.link-one-ul-wrapper .field-interaction-wrapper.form-wrapper .icon-setting-popup ul.nav-list li a span.link-one-header:after,.notification-popup ul.nav-list li a .link-one-ul-wrapper .field-interaction-wrapper.form-wrapper span.link-one-header:after,.link-one-ul-wrapper .field-interaction-wrapper.form-wrapper .notification-popup ul.nav-list li a span.link-one-header:after,.mob-alert-pop ul.nav-list li a .link-one-ul-wrapper .field-interaction-wrapper.form-wrapper span.link-one-header:after,.link-one-ul-wrapper .field-interaction-wrapper.form-wrapper .mob-alert-pop ul.nav-list li a span.link-one-header:after,.mob-alert-subscription-pop ul.nav-list li a .link-one-ul-wrapper .field-interaction-wrapper.form-wrapper span.link-one-header:after,.link-one-ul-wrapper .field-interaction-wrapper.form-wrapper .mob-alert-subscription-pop ul.nav-list li a span.link-one-header:after,.right-nav-wrapper ul.nav-list li a .field-interaction-wrapper.link-one-ul-wrapper span.link-one-header:after,.field-interaction-wrapper.link-one-ul-wrapper .right-nav-wrapper ul.nav-list li a span.link-one-header:after,.icon-setting-popup ul.nav-list li a .field-interaction-wrapper.link-one-ul-wrapper span.link-one-header:after,.field-interaction-wrapper.link-one-ul-wrapper .icon-setting-popup ul.nav-list li a span.link-one-header:after,.notification-popup ul.nav-list li a .field-interaction-wrapper.link-one-ul-wrapper span.link-one-header:after,.field-interaction-wrapper.link-one-ul-wrapper .notification-popup ul.nav-list li a span.link-one-header:after,.mob-alert-pop ul.nav-list li a .field-interaction-wrapper.link-one-ul-wrapper span.link-one-header:after,.field-interaction-wrapper.link-one-ul-wrapper .mob-alert-pop ul.nav-list li a span.link-one-header:after,.mob-alert-subscription-pop ul.nav-list li a .field-interaction-wrapper.link-one-ul-wrapper span.link-one-header:after,.field-interaction-wrapper.link-one-ul-wrapper .mob-alert-subscription-pop ul.nav-list li a span.link-one-header:after,.right-nav-wrapper ul.nav-list li a span.page-title.linkpage:after,.icon-setting-popup ul.nav-list li a span.page-title.linkpage:after,.notification-popup ul.nav-list li a span.page-title.linkpage:after,.mob-alert-pop ul.nav-list li a span.page-title.linkpage:after,.mob-alert-subscription-pop ul.nav-list li a span.page-title.linkpage:after,.right-nav-wrapper ul.nav-list li a .accumulator div div span.toggle-sender-list-btn,.accumulator div div .right-nav-wrapper ul.nav-list li a span.toggle-sender-list-btn,.icon-setting-popup ul.nav-list li a .accumulator div div span.toggle-sender-list-btn,.accumulator div div .icon-setting-popup ul.nav-list li a span.toggle-sender-list-btn,.notification-popup ul.nav-list li a .accumulator div div span.toggle-sender-list-btn,.accumulator div div .notification-popup ul.nav-list li a span.toggle-sender-list-btn,.mob-alert-pop ul.nav-list li a .accumulator div div span.toggle-sender-list-btn,.accumulator div div .mob-alert-pop ul.nav-list li a span.toggle-sender-list-btn,.mob-alert-subscription-pop ul.nav-list li a .accumulator div div span.toggle-sender-list-btn,.accumulator div div .mob-alert-subscription-pop ul.nav-list li a span.toggle-sender-list-btn{display:table-cell;padding-right:10px;font-size:1.3333333333em;border:1px solid #c1c8d0;text-align:center;padding:6px;color:#676a6e;}.right-nav-wrapper ul.nav-list li:hover,.icon-setting-popup ul.nav-list li:hover,.notification-popup ul.nav-list li:hover,.mob-alert-pop ul.nav-list li:hover,.mob-alert-subscription-pop ul.nav-list li:hover{background:#e4ecf0;}.right-nav-icon-gradient{background-image:url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2U5ZjBmNCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\');background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0%,#ffffff),color-stop(100%,#e9f0f4));background-image:-moz-linear-gradient(#ffffff,#e9f0f4);background-image:-webkit-linear-gradient(#ffffff,#e9f0f4);background-image:linear-gradient(#ffffff,#e9f0f4);}.shadow-left{-moz-box-shadow:-7px 0px 11px -3px rgba(0,0,0,0.38);-webkit-box-shadow:-7px 0px 11px -3px rgba(0,0,0,0.38);box-shadow:-7px 0px 11px -3px rgba(0,0,0,0.38);}.stat-pos{position:static;}.search-mob-container,.alert-mob-container{padding:0;margin:0;background:#EFF5F8;}.search-mob-container a,.alert-mob-container a{text-decoration:none;}.search-mob-container a.mob-search,.alert-mob-container a.mob-search{display:block;padding:10px 10px 0 10px;}.search-mob-container a.mob-search span,.alert-mob-container a.mob-search span{font-size:1.8333333333em;line-height:45px;color:#161718;}.search-mob-container a.mob-search span:first-child,.alert-mob-container a.mob-search span:first-child{margin-right:10px;}.search-mob-container .search,.alert-mob-container .search{padding:20px;}.search-mob-container .search .input-group,.alert-mob-container .search .input-group{border-radius:0 !important;border:none !important;box-shadow:none;}.search-mob-container .search .input-group .input-group-btn,.alert-mob-container .search .input-group .input-group-btn{font-size:inherit;}.search-mob-container .search .input-group .input-group-btn .standard,.alert-mob-container .search .input-group .input-group-btn .standard{padding:5px;font-weight:bold;font-size:1.0833333333em;line-height:35px;text-transform:uppercase;border:2px solid #c1c8d0;border-right:none;border-radius:0;text-align:left;width:130px;background-image:url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2U3ZWZmMyIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\');background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0%,#ffffff),color-stop(100%,#e7eff3));background-image:-moz-linear-gradient(#ffffff,#e7eff3);background-image:-webkit-linear-gradient(#ffffff,#e7eff3);background-image:linear-gradient(#ffffff,#e7eff3);color:#676a6e;}.search-mob-container .search .input-group .input-group-btn .select-wrapper,.alert-mob-container .search .input-group .input-group-btn .select-wrapper{float:left;display:inline-block;cursor:pointer;position:relative;}.search-mob-container .search .input-group .input-group-btn .select-wrapper select,.alert-mob-container .search .input-group .input-group-btn .select-wrapper select{margin:0;position:absolute;z-index:2;cursor:pointer;outline:none;opacity:0;top:0;left:0;width:100%;height:100%;line-height:26px;}.search-mob-container .search .input-group .input-group-btn .select-wrapper .holder,.alert-mob-container .search .input-group .input-group-btn .select-wrapper .holder{display:block;margin:0 0 0 0;white-space:nowrap;overflow:hidden;cursor:pointer;position:relative;}.search-mob-container .search .input-group .input-group-btn .select-wrapper .holder:after,.alert-mob-container .search .input-group .input-group-btn .select-wrapper .holder:after{content:"\\f107";font-family:FontAwesome;font-size:1.4166666667em;position:absolute;font-weight:normal;right:0;top:0;}.search-mob-container .search .input-group input[type=\'text\'].form-control,.alert-mob-container .search .input-group input[type=\'text\'].form-control,.search-mob-container .search .input-group .table-content-wrapper .table-wrapper .editable-table thead tr.filtering th.status input[type=\'text\'].status-selectbox,.table-content-wrapper .table-wrapper .editable-table thead tr.filtering th.status .search-mob-container .search .input-group input[type=\'text\'].status-selectbox,.alert-mob-container .search .input-group .table-content-wrapper .table-wrapper .editable-table thead tr.filtering th.status input[type=\'text\'].status-selectbox,.table-content-wrapper .table-wrapper .editable-table thead tr.filtering th.status .alert-mob-container .search .input-group input[type=\'text\'].status-selectbox,.search-mob-container .search .input-group .table-content-wrapper .table-wrapper .editable-table .table-body tr td input[type=\'text\'].status-selectbox,.table-content-wrapper .table-wrapper .editable-table .table-body tr td .search-mob-container .search .input-group input[type=\'text\'].status-selectbox,.alert-mob-container .search .input-group .table-content-wrapper .table-wrapper .editable-table .table-body tr td input[type=\'text\'].status-selectbox,.table-content-wrapper .table-wrapper .editable-table .table-body tr td .alert-mob-container .search .input-group input[type=\'text\'].status-selectbox,.search-mob-container .search .input-group .ui-search-input input[type=\'text\'],.ui-search-input .search-mob-container .search .input-group input[type=\'text\'],.alert-mob-container .search .input-group .ui-search-input input[type=\'text\'],.ui-search-input .alert-mob-container .search .input-group input[type=\'text\'],.search-mob-container .search .input-group input[type=\'text\'].tms-drpdwn,.alert-mob-container .search .input-group input[type=\'text\'].tms-drpdwn,.search-mob-container .search .input-group input[type=\'text\'].dropButton,.alert-mob-container .search .input-group input[type=\'text\'].dropButton{border:2px solid #c1c8d0;border-right:none;background:#FFFFFF !important;padding:5px 7px;font-size:1em;line-height:35px;color:#676a6e;height:auto;margin-top:0px;}.search-mob-container .search .input-group .go-btn,.alert-mob-container .search .input-group .go-btn{background-image:url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzQ2NDk0YyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzFmMjEyMiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\');background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0%,#46494c),color-stop(100%,#1f2122));background-image:-moz-linear-gradient(#46494c,#1f2122);background-image:-webkit-linear-gradient(#46494c,#1f2122);background-image:linear-gradient(#46494c,#1f2122);padding:14px 15px 13px;font-size:1.3333333333em;text-transform:uppercase;border-radius:0;color:#FFFFFF;border:none;}.alert-mob-container{background:#ffffff;}.mob-alert-pop,.mob-alert-subscription-pop{width:auto;}.mob-alert-pop ul.nav-list.mob-notification-nav-list li:first-child,.mob-alert-subscription-pop ul.nav-list.mob-notification-nav-list li:first-child{background:#e4ecf0;border-top:1px solid #bcd1e0;border-bottom:1px solid #bcd1e0;}.mob-alert-pop ul.nav-list.mob-notification-nav-list li:not(:first-child),.mob-alert-subscription-pop ul.nav-list.mob-notification-nav-list li:not(:first-child){background:#ffffff;}.mob-alert-pop ul.nav-list.mob-notification-nav-list li a span.nav-text,.mob-alert-subscription-pop ul.nav-list.mob-notification-nav-list li a span.nav-text{text-transform:inherit;}.mob-alert-pop ul.nav-list.mob-notification-nav-list li a:hover,.mob-alert-subscription-pop ul.nav-list.mob-notification-nav-list li a:hover{color:#2688DA;}.mob-alert-subscription-pop ul.nav-list li{background:#ffffff;border:none;padding:5px 10px;}.mob-alert-subscription-pop ul.nav-list li:first-child{background:#ffffff;border:none;}.mob-alert-subscription-pop ul.nav-list li a{background-image:url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2U5ZjBmNCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\');background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0%,#ffffff),color-stop(100%,#e9f0f4));background-image:-moz-linear-gradient(#ffffff,#e9f0f4);background-image:-webkit-linear-gradient(#ffffff,#e9f0f4);background-image:linear-gradient(#ffffff,#e9f0f4);border:1px solid #d7dcdf;padding:15px 10px;}.mob-alert-subscription-pop ul.nav-list li a span{display:block;color:#676a6e;font-size:1.0833333333em;line-height:20px;}.mob-alert-subscription-pop ul.nav-list li a span.subscribe{color:#2688da;}.mob-alert-subscription-pop ul.nav-list li:hover{background:#ffffff;}.icon-setting-popup .nav-text{font-weight:bold !important;}.page-option-panel .search-icon{font-size:1.3333333333em;}.nav-wrapper.right-nav-wrapper,.nav-wrapper.icon-setting-popup,.nav-wrapper.notification-popup,.nav-wrapper.mob-alert-pop,.nav-wrapper.mob-alert-subscription-pop{background-color:#eff5f8;}.header-popover{background:#E4ECF0;-moz-box-shadow:3px 3px 6px 0px rgba(0,0,0,0.15);-webkit-box-shadow:3px 3px 6px 0px rgba(0,0,0,0.15);box-shadow:3px 3px 6px 0px rgba(0,0,0,0.15);z-index:108;}.page-option-panel .popover-content{padding:0px;}.page-option-panel .popover{max-width:none;}.header-popover.search{width:480px;padding:20px;}.header-popover.notification{width:440px;}.header-popover.notification header{border-top:none;background:none;padding:10px 5px;border-bottom:1px solid #BCD1E0;position:static;z-index:initial;float:left;width:100%;}.header-popover.notification header h2{font-size:0.75em;padding-left:10px;margin:4px 0 0;text-transform:uppercase;font-family:\'helvatica75\';}.header-popover.notification header div{padding:3px 0 0 0;}.header-popover.notification header div a{font-size:0.8333333333em;padding:0 12px;color:#2688da;text-decoration:none;margin:0px;}.header-popover.notification header div a.fa,.header-popover.notification header div .header-section-right .page-option-panel ul li a.user-settings:after,.header-section-right .page-option-panel ul li .header-popover.notification header div a.user-settings:after,.header-popover.notification header div .header-section-right .page-option-panel ul li a.user-name:after,.header-section-right .page-option-panel ul li .header-popover.notification header div a.user-name:after,.header-popover.notification header div a.nav-trigger:after,.header-popover.notification header div .message-area a.collapse-area.opened:after,.message-area .header-popover.notification header div a.collapse-area.opened:after,.header-popover.notification header div .submit-success a.collapse-area.opened:after,.submit-success .header-popover.notification header div a.collapse-area.opened:after,.header-popover.notification header div .submit-failed a.collapse-area.opened:after,.submit-failed .header-popover.notification header div a.collapse-area.opened:after,.header-popover.notification header div .message-area a.collapse-area.closed:after,.message-area .header-popover.notification header div a.collapse-area.closed:after,.header-popover.notification header div .submit-success a.collapse-area.closed:after,.submit-success .header-popover.notification header div a.collapse-area.closed:after,.header-popover.notification header div .submit-failed a.collapse-area.closed:after,.submit-failed .header-popover.notification header div a.collapse-area.closed:after,.header-popover.notification header div #refresh-sortView-popover .refresh-block a.refresh-btn:before,#refresh-sortView-popover .refresh-block .header-popover.notification header div a.refresh-btn:before,.header-popover.notification header div a.has-sort:before,.header-popover.notification header div a.has-sort:after,.header-popover.notification header div .ui-jqdialog .ui-jqdialog-titlebar a.ui-jqdialog-titlebar-close:before,.ui-jqdialog .ui-jqdialog-titlebar .header-popover.notification header div a.ui-jqdialog-titlebar-close:before,.header-popover.notification header div a.grid-form-heading:before,.header-popover.notification header div .form-wrapper a.collapsable-header:after,.form-wrapper .header-popover.notification header div a.collapsable-header:after,.header-popover.notification header div .link-one-ul-wrapper a.collapsable-header:after,.link-one-ul-wrapper .header-popover.notification header div a.collapsable-header:after,.header-popover.notification header div .link-one-ul-wrapper a.link-one-header:after,.link-one-ul-wrapper .header-popover.notification header div a.link-one-header:after,.header-popover.notification header div .breadcrumbs li:nth-last-child(2) a:before,.breadcrumbs li:nth-last-child(2) .header-popover.notification header div a:before,.header-popover.notification header div a.page-title.linkpage:after,.header-popover.notification header .accumulator div div a.toggle-sender-list-btn,.accumulator .header-popover.notification header div div a.toggle-sender-list-btn,.header-popover.notification header div .accumulator section > ul.accu-receiver-ul li a,.accumulator section > ul.accu-receiver-ul li .header-popover.notification header div a,.header-popover.notification header div nav ul.primary-nav > li > a.has-child:after,nav .header-popover.notification header div ul.primary-nav > li > a.has-child:after,.header-popover.notification header div nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li a:after,nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li .header-popover.notification header div a:after,.header-popover.notification header div nav ul.primary-nav > li.mega-menu .second-level-wrapper ul.drpdwn-menu li a:after,nav ul.primary-nav > li.mega-menu .second-level-wrapper ul.drpdwn-menu li .header-popover.notification header div a:after,.header-popover.notification header div nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul li a:after,nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul li .header-popover.notification header div a:after,.header-popover.notification header div nav ul.primary-nav li.page-name a.page-icon,nav ul.primary-nav li.page-name .header-popover.notification header div a.page-icon,.header-popover.notification header div nav .first-level-wrapper > ul.drpdwn-menu > li.ptab-name.single-link a:after,nav .first-level-wrapper > ul.drpdwn-menu > li.ptab-name.single-link .header-popover.notification header div a:after,.header-popover.notification header div .cart-tab ul li a:after,.cart-tab ul li .header-popover.notification header div a:after{font-size:1.1666666667em;color:#161718;}.header-section-right .page-option-panel ul li .popover{margin-top:21px;padding:0px;}.header-popover.notification header div .divider{background-image:url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2U0ZWNmMCIvPjxzdG9wIG9mZnNldD0iMjUlIiBzdG9wLWNvbG9yPSIjYWFhYWFhIi8+PHN0b3Agb2Zmc2V0PSI3NSUiIHN0b3AtY29sb3I9IiNhYWFhYWEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNGVjZjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPjwvc3ZnPiA=\');background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0%,#e4ecf0),color-stop(25%,#aaaaaa),color-stop(75%,#aaaaaa),color-stop(100%,#e4ecf0));background-image:-moz-linear-gradient(top,#e4ecf0 0%,#aaaaaa 25%,#aaaaaa 75%,#e4ecf0 100%);background-image:-webkit-linear-gradient(top,#e4ecf0 0%,#aaaaaa 25%,#aaaaaa 75%,#e4ecf0 100%);background-image:linear-gradient(to bottom,#e4ecf0 0%,#aaaaaa 25%,#aaaaaa 75%,#e4ecf0 100%);float:left;height:16px;display:block;width:1px;margin-top:1px;}.header-popover.notification .notification-list{list-style:none;background-color:#fff;margin:0px;padding:0px;overflow:hidden;}.header-popover.notification .notification-list li{border-bottom:1px solid #d9dddf;padding:15px;float:left;width:100%;}.header-popover.notification .notification-list li a{color:#161718;}.header-popover.notification .notification-list li a small{float:left;background-image:url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2U5ZjBmNCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\');background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0%,#ffffff),color-stop(100%,#e9f0f4));background-image:-moz-linear-gradient(#ffffff,#e9f0f4);background-image:-webkit-linear-gradient(#ffffff,#e9f0f4);background-image:linear-gradient(#ffffff,#e9f0f4);width:32px;height:32px;padding-right:10px;border:1px solid #c1c8d0;text-align:center;padding:6px;color:#676a6e;}.header-popover.notification .notification-list li a span{float:right;padding:0px;font-size:0.8333333333em;width:90%;}.header-popover.notification .notification-list li a:hover{color:#00509b;}.header-popover.notification .alert-subscription{list-style:none;background-color:#fff;margin:0px;padding:15px 15px 10px;overflow:hidden;float:none;}.header-popover.notification .alert-subscription li{background-image:url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2U5ZjBmNCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\');background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0%,#ffffff),color-stop(100%,#e9f0f4));background-image:-moz-linear-gradient(#ffffff,#e9f0f4);background-image:-webkit-linear-gradient(#ffffff,#e9f0f4);background-image:linear-gradient(#ffffff,#e9f0f4);border:1px solid #d7dcdf;padding:10px;margin-bottom:10px;font-size:0.8333333333em;float:none;}.header-popover.notification .alert-subscription li a{color:#2688da;}.header-popover.settings{width:180px;font-size:12px;}.header-popover.settings ul{list-style:none;margin:0px;padding:0px;overflow:hidden;}.header-popover.settings ul li.username{padding:15px 15px 15px 45px;border-bottom:1px solid #BCD1E0;width:100%;}.header-popover.settings ul li.username:before{content:"\\f007";top:15px;right:auto;bottom:auto;left:15px;position:absolute;font-size:1.5em;font-weight:normal;color:#161718;font-family:fontAwesome;}.header-popover.settings ul li.username span{font-size:1em;text-transform:uppercase;font-family:\'helvatica75\';}.header-popover.settings ul li.username small{display:block;color:#676a6e;font-size:1em;}.header-popover.settings ul li:not(:first-child){background:#eff5f8;border-bottom:1px solid #d9dddf;padding:15px;float:left;width:100%;}.header-popover.settings ul li:not(:first-child) a{color:#161718;}.header-popover.settings ul li:not(:first-child) a small{float:left;background-image:url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2U5ZjBmNCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\');background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0%,#ffffff),color-stop(100%,#e9f0f4));background-image:-moz-linear-gradient(#ffffff,#e9f0f4);background-image:-webkit-linear-gradient(#ffffff,#e9f0f4);background-image:linear-gradient(#ffffff,#e9f0f4);font-size:1.5em;width:32px;height:32px;padding-right:10px;border:1px solid #c1c8d0;text-align:center;padding:6px;color:#676a6e;}.header-popover.settings ul li:not(:first-child) a span{float:right;padding:6px;font-size:1em;text-transform:uppercase;font-weight:bold;width:75%;}.header-popover.settings ul li:not(:first-child):hover{background:#e4ecf0;}.input-group{border-radius:0 !important;border:none !important;box-shadow:none;}.input-group .input-group-btn{font-size:inherit;}.input-group .input-group-btn .standard{padding:5px;font-weight:bold;font-size:1.0833333333em;line-height:35px;text-transform:uppercase;border:2px solid #c1c8d0;border-right:none;border-radius:0;text-align:left;width:87px;background-image:url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2U3ZWZmMyIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\');background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0%,#ffffff),color-stop(100%,#e7eff3));background-image:-moz-linear-gradient(#ffffff,#e7eff3);background-image:-webkit-linear-gradient(#ffffff,#e7eff3);background-image:linear-gradient(#ffffff,#e7eff3);color:#676a6e;}@media only screen and (min-width:768px){.input-group .input-group-btn .standard{padding:0 13px;font-size:1.0833333333em;width:150px;}}.input-group .input-group-btn .select-wrapper{float:left;display:inline-block;cursor:pointer;position:relative;}.input-group .input-group-btn .select-wrapper select{margin:0;position:absolute;z-index:2;cursor:pointer;outline:none;opacity:0;top:0;left:0;width:100%;height:100%;line-height:26px;}.input-group .input-group-btn .select-wrapper .holder{display:block;margin:0 0 0 0;white-space:nowrap;overflow:hidden;cursor:pointer;position:relative;}.input-group .input-group-btn .select-wrapper .holder:after{content:"\\f107";font-family:FontAwesome;font-size:1.4166666667em;position:absolute;font-weight:normal;right:0;top:0;}.tux-header{.input-group input[type=\'text\'].form-control,.input-group .table-content-wrapper .table-wrapper .editable-table thead tr.filtering th.status input[type=\'text\'].status-selectbox,.table-content-wrapper .table-wrapper .editable-table thead tr.filtering th.status .input-group input[type=\'text\'].status-selectbox,.input-group .table-content-wrapper .table-wrapper .editable-table .table-body tr td input[type=\'text\'].status-selectbox,.table-content-wrapper .table-wrapper .editable-table .table-body tr td .input-group input[type=\'text\'].status-selectbox,.input-group .ui-search-input input[type=\'text\'],.ui-search-input .input-group input[type=\'text\'],.input-group input[type=\'text\'].tms-drpdwn,.input-group input[type=\'text\'].dropButton{border:2px solid #c1c8d0;border-right:none;background:#FFFFFF !important;padding:5px 7px;font-size:1em;line-height:35px;color:#676a6e;height:39px;}@media only screen and (min-width:768px){.input-group input[type=\'text\'].form-control,.input-group .table-content-wrapper .table-wrapper .editable-table thead tr.filtering th.status input[type=\'text\'].status-selectbox,.table-content-wrapper .table-wrapper .editable-table thead tr.filtering th.status .input-group input[type=\'text\'].status-selectbox,.input-group .table-content-wrapper .table-wrapper .editable-table .table-body tr td input[type=\'text\'].status-selectbox,.table-content-wrapper .table-wrapper .editable-table .table-body tr td .input-group input[type=\'text\'].status-selectbox,.input-group .ui-search-input input[type=\'text\'],.ui-search-input .input-group input[type=\'text\'],.input-group input[type=\'text\'].tms-drpdwn,.input-group input[type=\'text\'].dropButton{padding:0 13px;font-size:1.0833333333em;}}.input-group .go-btn{background-image:url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzQ2NDk0YyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzFmMjEyMiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\');background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0%,#46494c),color-stop(100%,#1f2122));background-image:-moz-linear-gradient(#46494c,#1f2122);background-image:-webkit-linear-gradient(#46494c,#1f2122);background-image:linear-gradient(#46494c,#1f2122);padding:16px 15px;font-size:1.3333333333em;text-transform:uppercase;border-radius:0;color:#FFFFFF;border:none;}@media only screen and (min-width:768px){.input-group .go-btn{padding:10px 20px 10px 21px;font-size:1.0833333333em;margin-left:0px;}}}.multilieHeader.header-popover.notification{top:43px !important;}.multilieHeader.header-popover.search{top:43px !important;}.multilieHeader.header-popover.settings{top:43px !important;}.nav-wrapper{top:auto;right:auto;bottom:auto;left:-230px;position:absolute;width:0;overflow-y:auto;overflow-x:hidden;-moz-transition:all 0.5s ease;-o-transition:all 0.5s ease;-webkit-transition:all 0.5s ease;transition:all 0.5s ease;background:#fff;z-index:105;}@media only screen and (min-width:768px){.nav-wrapper{width:84px;top:auto;right:auto;bottom:auto;left:0;position:absolute;}}.nav-wrapper.open{left:auto;right:auto;overflow-x:hidden;width:230px;transition-delay:0s;}@media only screen and (min-width:768px){.nav-wrapper.open{width:248px;}}@media only screen and (min-width:992px){.nav-wrapper.open{width:272px;}}.nav-wrapper.right-nav-wrapper,.nav-wrapper.icon-setting-popup,.nav-wrapper.notification-popup,.nav-wrapper.mob-alert-pop,.nav-wrapper.mob-alert-subscription-pop{top:63px;right:-230px;bottom:auto;left:auto;position:absolute;}.nav-wrapper.right-nav-wrapper.open,.nav-wrapper.open.icon-setting-popup,.nav-wrapper.open.notification-popup,.nav-wrapper.open.mob-alert-pop,.nav-wrapper.open.mob-alert-subscription-pop{right:0;}nav ul.primary-nav{top:56px;right:auto;bottom:auto;left:0px;position:absolute;width:100%;background-color:#676a6e;z-index:106;}@media only screen and (min-width:768px){nav ul.primary-nav{top:60px;right:auto;bottom:auto;left:0px;position:absolute;}}@media only screen and (min-width:992px){nav ul.primary-nav{position:static;width:auto;display:block;background-color:#fff;overflow:visible;margin:0px;}}nav ul.primary-nav > li{background-color:#676a6e;display:inline-block;width:100%;border-bottom:1px solid #585a5e;}@media only screen and (min-width:992px){nav ul.primary-nav > li{float:left;width:auto;background-color:transparent;border-bottom:none;position:relative;}}nav ul.primary-nav > li > a{display:block;text-decoration:none;padding:17px 20px;text-transform:uppercase;font-family:\'helvatica75\';color:#fff;text-align:center;}@media only screen and (min-width:992px){nav ul.primary-nav > li > a{color:#808285;margin:0 3px;float:left;padding:20px 21px 17px;}}nav ul.primary-nav > li > a:hover{}@media only screen and (min-width:992px){nav ul.primary-nav > li > a:hover{border-top:1px solid #aaaaaa;border-right:1px solid #aaaaaa;border-bottom:0px solid transparent;border-left:1px solid #aaaaaa;background-image:url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2VjZWJlYiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\');background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0%,#ecebeb),color-stop(100%,#ffffff));background-image:-moz-linear-gradient(top,#ecebeb 0%,#ffffff 100%);background-image:-webkit-linear-gradient(top,#ecebeb 0%,#ffffff 100%);background-image:linear-gradient(to bottom,#ecebeb 0%,#ffffff 100%);color:#d20000;box-shadow:6px -4px 14px -4px #c8c8c8,-6px -4px 14px -4px #c8c8c8;padding:17px 20px;}}nav ul.primary-nav > li > a.has-child,nav ul.primary-nav > li > a.has-icon{position:relative;}nav ul.primary-nav > li > a.has-child:after{top:18px;right:21px;bottom:auto;left:auto;position:absolute;content:"\\f054";}@media only screen and (min-width:992px){nav ul.primary-nav > li > a.has-child:after{font-size:1.5833333333em;content:"\\f107";right:22px;}}@media only screen and (min-width:992px){nav ul.primary-nav > li > a.has-child,nav ul.primary-nav > li > a.has-icon{padding:20px 43px 17px 45px;}}nav ul.primary-nav > li > a.has-child:hover{}nav ul.primary-nav > li > a.has-child:hover:after{top:18px;right:21px;}@media only screen and (min-width:992px){nav ul.primary-nav > li > a.has-child:hover:after{top:17px;right:21px;}}@media only screen and (min-width:992px){nav ul.primary-nav > li > a.has-child:hover,nav ul.primary-nav > li > a.has-icon:hover{padding:19px 42px 17px 44px;}}nav ul.primary-nav > li.visited > a{}@media only screen and (min-width:992px){nav ul.primary-nav > li.visited > a{border-left:3px solid #d20000;}}nav ul.primary-nav > li.visited{}nav ul.primary-nav > li.visited > a{}nav ul.primary-nav > li.visited > a.has-child{}nav ul.primary-nav > li.visited > a.has-child:after{top:18px;right:21px;}@media only screen and (min-width:992px){nav ul.primary-nav > li.visited > a.has-child:after{right:21px;top:15px;}}@media only screen and (min-width:992px){nav ul.primary-nav > li.visited > a.has-child,nav ul.primary-nav > li.visited > a.has-icon{padding:17px 42px 17px 19px;}}@media only screen and (min-width:992px){nav ul.primary-nav > li.visited > a{border-top:3px solid #d20000;border-right:1px solid #aaaaaa;border-bottom:0px solid transparent;border-left:1px solid #aaaaaa;background-color:#fff;color:#d20000;box-shadow:6px -4px 14px -4px #c8c8c8,-6px -4px 14px -4px #c8c8c8;position:relative;top:1px;padding:17px 20px;z-index:1001;}}nav ul.primary-nav > li.visited .divider{display:none;}nav ul.primary-nav > li.open{}nav ul.primary-nav > li.open > a{border-left:3px solid #d20000;background-color:#5e6165;}nav ul.primary-nav > li.open > a.has-child:after{top:18px;right:21px;}@media only screen and (min-width:992px){nav ul.primary-nav > li.open > a.has-child:after{right:21px;top:16px;}}@media only screen and (min-width:992px){nav ul.primary-nav > li.open > a.has-child,nav ul.primary-nav > li.open > a.has-icon{padding:18px 42px 18px 44px;}}@media only screen and (min-width:992px){nav ul.primary-nav > li.open > a{border-top:1px solid #aaaaaa;border-right:1px solid #aaaaaa;border-bottom:0px solid transparent;border-left:1px solid #aaaaaa;background-image:url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2VjZWJlYiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\');background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0%,#ecebeb),color-stop(100%,#ffffff));background-image:-moz-linear-gradient(top,#ecebeb 0%,#ffffff 100%);background-image:-webkit-linear-gradient(top,#ecebeb 0%,#ffffff 100%);background-image:linear-gradient(to bottom,#ecebeb 0%,#ffffff 100%);color:#d20000;box-shadow:6px -4px 14px -4px #c8c8c8,-6px -4px 14px -4px #c8c8c8;position:relative;top:1px;z-index:99999;padding:18px 20px;}}nav ul.primary-nav > li.mega-menu{}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu{position:static;}}nav ul.primary-nav > li.mega-menu .submenu{}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .submenu{background-color:#fff;width:100%;}}nav ul.primary-nav > li.mega-menu .submenu .drpdwn-menu{}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .submenu .drpdwn-menu{width:25%;padding-right:20px;padding-left:22px;}}nav ul.primary-nav > li.mega-menu .submenu .drpdwn-menu li{}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .submenu .drpdwn-menu li{width:auto;display:block;padding:0 12px 0 10px;}}nav ul.primary-nav > li.mega-menu .submenu .drpdwn-menu li a{}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .submenu .drpdwn-menu li a{margin:0;}}nav ul.primary-nav > li.mega-menu .first-level-wrapper{}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .first-level-wrapper{top:64px;right:auto;bottom:auto;left:0px;position:absolute;padding-bottom:35px;margin:0px;z-index:1002;}}nav ul.primary-nav > li.mega-menu .first-level-wrapper h1{color:#161718;font-size:1.8333333333em;padding-left:22px;margin:15px 0;font-family:\'helvatica45\';}nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li{}nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li:last-child a{}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li:last-child a{border-bottom:1px dotted #aaaaaa;}}nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li a{position:relative;}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li a{color:#161718;}}nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li a:after{top:21px;right:15px;bottom:auto;left:auto;position:absolute;content:"\\f054";}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li a:after{content:"";}}nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li.active{}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li.active,nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li.firstNavSelect{border-left:3px solid #d20000;padding:0 12px 0 7px;}}nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li.active a{position:relative;}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li.active a,nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li.firstNavSelect a{color:#161718;}nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li.firstNavSelect a{position:relative;}}nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li.active a:after{top:21px;right:15px;bottom:auto;left:auto;position:absolute;content:"\\f054";}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li.active a:after,nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li.firstNavSelect a:after{content:"\\f0da";color:#d20000;right:-11px;top:15px;}}nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li.ptab-name{}nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li.ptab-name a{position:relative;}nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li.ptab-name a:after{top:16px;right:auto;bottom:auto;left:10px;position:absolute;content:"\\f053";font-size:1.5em;}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li.ptab-name a:after{content:"";}}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li.ptab-name{display:none;}}nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li a{}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li a{color:#676a6e;}}nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li a span.fa-circle{}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li a span.fa-circle{display:block;float:left;margin-right:10px;margin-top:0;font-size:0.3333333333em;line-height:14px;color:#d20000;}}nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li a .menu-arrow{}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .first-level-wrapper ul li a .menu-arrow{display:none;}}nav ul.primary-nav > li.mega-menu .second-level-wrapper{top:0px;right:auto;bottom:auto;left:0px;position:absolute;width:100%;}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .second-level-wrapper{float:left;position:static;width:75%;}}nav ul.primary-nav > li.mega-menu .second-level-wrapper .second-level-container{display:none;}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .second-level-wrapper .second-level-container{width:100%;float:left;}}nav ul.primary-nav > li.mega-menu .second-level-wrapper .second-level-container:nth-child(1){}nav ul.primary-nav > li.mega-menu .second-level-wrapper ul.drpdwn-menu{width:100%;float:left;padding-left:0px;}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .second-level-wrapper ul.drpdwn-menu{width:33%;border-right:none;float:left;padding-left:20px;}}nav ul.primary-nav > li.mega-menu .second-level-wrapper ul.drpdwn-menu li{background-color:#676a6e;display:inline-block;width:100%;border-bottom:1px solid #585a5e;}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .second-level-wrapper ul.drpdwn-menu li{border-bottom:none;background-color:#fff;}}nav ul.primary-nav > li.mega-menu .second-level-wrapper ul.drpdwn-menu li:last-child > a{}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .second-level-wrapper ul.drpdwn-menu li:last-child > a{border-bottom:none;}}nav ul.primary-nav > li.mega-menu .second-level-wrapper ul.drpdwn-menu li.ptab-name{background-color:#85898d;}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .second-level-wrapper ul.drpdwn-menu li.ptab-name{display:block;background-color:#fff;}}nav ul.primary-nav > li.mega-menu .second-level-wrapper ul.drpdwn-menu li.ptab-name a{color:#161718;text-transform:capitalize;}nav ul.primary-nav > li.mega-menu .second-level-wrapper ul.drpdwn-menu li.ptab-name a:after{}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .second-level-wrapper ul.drpdwn-menu li.ptab-name a:after{content:"";}}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .second-level-wrapper ul.drpdwn-menu li.ptab-name a{font-size:1.0833333333em;color:#161718;text-transform:uppercase;font-family:\'helvatica75\';padding-top:0px;padding-left:0px;}}nav ul.primary-nav > li.mega-menu .second-level-wrapper ul.drpdwn-menu li a{display:block;text-decoration:none;padding:17px;text-transform:capitalize;color:#fff;text-align:center;float:none;position:relative;font-family:\'helvatica75\';}nav ul.primary-nav > li.mega-menu .second-level-wrapper ul.drpdwn-menu li a:after{content:"";font-size:0.3333333333em;color:#d20000;}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .second-level-wrapper ul.drpdwn-menu li a{font-size:1.0833333333em;color:#2688da;padding:3px 7px 3px 12px;text-align:left;font-weight:normal;font-family:\'helvatica55\';}nav ul.primary-nav > li.mega-menu .second-level-wrapper ul.drpdwn-menu li a:after{content:"\\f0c8";position:absolute;left:0;top:11px;}}nav ul.primary-nav > li.mega-menu .second-level-wrapper ul.drpdwn-menu li.main-tab{background-color:#fff;}nav ul.primary-nav > li.mega-menu .second-level-wrapper ul.drpdwn-menu li.main-tab a{text-transform:uppercase;}nav ul.primary-nav > li.mega-menu .second-level-wrapper ul.drpdwn-menu li.main-tab a:after{top:16px;right:auto;bottom:auto;left:10px;position:absolute;content:"\\f053";font-size:1.5em;color:#161718;}@media only screen and (min-width:992px){nav ul.primary-nav > li.mega-menu .second-level-wrapper ul.drpdwn-menu li.main-tab a:after{content:"";}}nav ul.primary-nav > li.smMegamenu .first-level-wrapper > ul{}@media only screen and (min-width:992px){nav ul.primary-nav > li.smMegamenu .first-level-wrapper > ul{border-right:none !important;}}nav ul.primary-nav > li.smMegamenu .first-level-wrapper > ul li{}@media only screen and (min-width:992px){nav ul.primary-nav > li.smMegamenu .first-level-wrapper > ul li{border-bottom:none !important;}}nav ul.primary-nav > li.smMegamenu .second-level-wrapper{float:left;}@media only screen and (min-width:992px){nav ul.primary-nav > li.smMegamenu .second-level-wrapper{background-color:#fff;width:100%;padding:40px 0 15px;}}nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container{float:left;display:block;}nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul{list-style:none;width:100%;float:left;padding-left:0px;}@media only screen and (min-width:992px){nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul{width:25%;padding-left:3%;border-right:1px solid #bcd1e0;}}nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul:last-child{}@media only screen and (min-width:992px){nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul:last-child{border-right:none;}}nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul li{background-color:#676a6e;display:inline-block;width:100%;border-bottom:1px solid #585a5e;}@media only screen and (min-width:992px){nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul li{background-color:#fff;border-bottom:none;}}nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul li a{display:block;text-decoration:none;padding:17px;text-transform:capitalize;color:#fff;text-align:center;float:none;position:relative;font-family:\'helvatica75\';}nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul li a:after{content:"";font-size:0.3333333333em;}@media only screen and (min-width:992px){nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul li a{color:#2688da;text-align:left;padding:4px 10px 4px 12px;text-transform:capitalize;font-weight:normal;font-family:\'helvatica55\';}nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul li a:after{content:"\\f0c8";position:absolute;left:0;top:11px;font-size:4px;}}nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul li.ptab-name{background-color:#85898d;}@media only screen and (min-width:992px){nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul li.ptab-name{background-color:#fff;}}nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul li.ptab-name a{color:#161718;text-transform:capitalize;}nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul li.ptab-name a:after{}@media only screen and (min-width:992px){nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul li.ptab-name a:after{content:"";}}@media only screen and (min-width:992px){nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul li.ptab-name a{text-transform:uppercase;padding-left:0px;}}nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul li.ptab-name a.page-icon{font-size:1.75em;padding:15px;}nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul li.main-tab{background-color:#fff;}nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul li.main-tab a{text-transform:uppercase;position:relative;}nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul li.main-tab a:after{top:16px;right:auto;bottom:auto;left:10px;position:absolute;content:"\\f053";font-size:1.5em;color:#161718;}@media only screen and (min-width:992px){nav ul.primary-nav > li.smMegamenu .second-level-wrapper .second-level-container ul li.main-tab a:after{content:"";}}nav ul.primary-nav li.page-name{border-top:1px solid #585a5e;}@media only screen and (min-width:992px){nav ul.primary-nav li.page-name{border-top:none;background-color:transparent;}}nav ul.primary-nav li.page-name a{}@media only screen and (min-width:992px){nav ul.primary-nav li.page-name a.page-icon{font-size:1.75em;float:left;width:60px;height:54px;position:relative;top:1px;z-index:101;color:#808285;}}nav ul.primary-nav li.page-name a.page-icon:after{content:"";position:absolute;left:20px;top:14px;}@media only screen and (min-width:992px){nav ul.primary-nav li.page-name a.page-icon:after{content:"";}}nav ul.primary-nav li.page-name a:after{content:"";}nav ul.primary-nav li.page-name a:hover{top:0px;}@media only screen and (min-width:992px){nav ul.primary-nav li.page-name a:hover{color:#d20000;}nav ul.primary-nav li.page-name a:hover:after{top:14px;left:19px;}}nav ul.primary-nav li.page-name.visited a{top:1px;}@media only screen and (min-width:992px){nav ul.primary-nav li.page-name.visited a{border-top:3px solid #d20000;border-right:1px solid #aaaaaa;border-bottom:0px solid transparent;border-left:1px solid #aaaaaa;background-color:#fff;color:#d20000;box-shadow:6px -4px 14px -4px #c8c8c8,-6px -4px 14px -4px #c8c8c8;}}nav ul.primary-nav li.page-name.visited a:hover{}@media only screen and (min-width:992px){nav ul.primary-nav li.page-name.visited a:hover:after{top:14px;left:20px;}}nav ul.primary-nav li.page-name.visited .divider{display:none;}nav.navbar-custom{width:100%;padding:0px;font-size:14px;line-height:1.42857143;color:#555;background-color:#fff;background-image:none;border:1px solid #ccc;border-radius:4px;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,0.075);box-shadow:inset 0 1px 1px rgba(0,0,0,0.075);min-height:auto;}nav.navbar-custom .navbar-toggle,nav.navbar-custom .nav-hamburger,nav.navbar-custom .nav-trigger{margin:0px;}@media only screen and (min-width:768px){nav.navbar-custom{background-color:#fff;padding:0px;padding-top:10px;border:none;height:auto;border-bottom:1px solid #aaaaaa;background-image:url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiΓÇª3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPjwvc3ZnPiA=");background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0%,#ffffff),color-stop(0%,#ffffff),color-stop(100%,#f5f5f5),color-stop(100%,#7db9e8),color-stop(100%,#f5f5f5));background-image:-moz-linear-gradient(top,#ffffff 0%,#ffffff 0%,#f5f5f5 100%,#7db9e8 100%,#f5f5f5 100%);background-image:-webkit-linear-gradient(top,#ffffff 0%,#ffffff 0%,#f5f5f5 100%,#7db9e8 100%,#f5f5f5 100%);background-image:linear-gradient(to bottom,#ffffff 0%,#ffffff 0%,#f5f5f5 100%,#7db9e8 100%,#f5f5f5 100%);}}nav.navbar-custom ul.navbar-nav{margin:0px -10px;font-size:12px;}nav.navbar-custom ul.navbar-nav > li{border-top:1px solid #dde8ef;}nav.navbar-custom ul.navbar-nav > li:nth-child(odd) a{background-color:#ffffff;}nav.navbar-custom ul.navbar-nav > li:nth-child(even) a{background-color:#fafcfd;}nav.navbar-custom ul.navbar-nav > li a{color:#000;}nav.navbar-custom ul.navbar-nav > li a:hover{background-color:#e5eef3;}nav.navbar-custom ul.navbar-nav > li:active a{background-color:#e5eef3;}@media only screen and (min-width:768px){nav.navbar-custom ul.navbar-nav{margin-left:20px;}nav.navbar-custom ul.navbar-nav > li{border:none;}nav.navbar-custom ul.navbar-nav > li a.scroll-link{background-color:transparent;font-family:\'helvatica75\';color:#808285;border-top:1px solid transparent;border-right:1px solid transparent;border-bottom:0px solid transparent;border-left:1px solid transparent;}nav.navbar-custom ul.navbar-nav > li a.scroll-link:hover{border-top:1px solid #aaaaaa;border-right:1px solid #aaaaaa;border-bottom:0px solid transparent;border-left:1px solid #aaaaaa;background-image:url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiΓÇªpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==");background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0%,#ecebeb),color-stop(100%,#ffffff));background-image:-moz-linear-gradient(top,#ecebeb 0%,#ffffff 100%);background-image:-webkit-linear-gradient(top,#ecebeb 0%,#ffffff 100%);background-image:linear-gradient(to bottom,#ecebeb 0%,#ffffff 100%);color:#d20000;box-shadow:6px -4px 14px -4px #c8c8c8,-6px -4px 14px -4px #c8c8c8;}nav.navbar-custom ul.navbar-nav > li.active a.scroll-link{border-top:3px solid #d20000;border-right:1px solid #aaaaaa;border-bottom:0px solid transparent;border-left:1px solid #aaaaaa;background-color:#fff;color:#d20000;box-shadow:6px -4px 14px -4px #c8c8c8,-6px -4px 14px -4px #c8c8c8;top:1px;}}nav .first-level-wrapper{top:0px;right:auto;bottom:auto;left:0px;position:absolute;z-index:1000;display:none;width:100%;background-color:#676a6e;border-top:1px solid #aaaaaa;}@media only screen and (min-width:992px){nav .first-level-wrapper{top:54px;right:auto;bottom:auto;left:0px;position:absolute;min-width:250px;background-color:#fff;border:1px solid #aaaaaa;margin:0px 3px;box-shadow:1px 10px 15px 1px #c8c8c8;}}@media only screen and (max-width:992px){nav .first-level-wrapper{margin:0px;padding:0px;}}nav .first-level-wrapper:before,nav .first-level-wrapper:after{content:" ";display:table;}nav .first-level-wrapper:after{clear:both;}nav .first-level-wrapper > ul.drpdwn-menu{float:left;width:100%;}@media only screen and (min-width:992px){nav .first-level-wrapper > ul.drpdwn-menu{background-color:#fff;border-right:1px solid #bcd1e0;}}nav .first-level-wrapper > ul.drpdwn-menu > li{display:inline-block;width:100%;border-bottom:1px solid #585a5e;}@media only screen and (min-width:992px){nav .first-level-wrapper > ul.drpdwn-menu > li{border-bottom:none;padding:0 6px;}}nav .first-level-wrapper > ul.drpdwn-menu > li:nth-child(2) a{}@media only screen and (min-width:992px){nav .first-level-wrapper > ul.drpdwn-menu > li:nth-child(2) a{border-top:1px solid #fff;}}nav .first-level-wrapper > ul.drpdwn-menu > li.ptab-name.single-link{position:relative;}nav .first-level-wrapper > ul.drpdwn-menu > li.ptab-name.single-link a:after{top:16px;right:auto;bottom:auto;left:10px;position:absolute;content:"\\f053";font-size:1.5em;font-family:fontAwesome;}@media only screen and (min-width:992px){nav .first-level-wrapper > ul.drpdwn-menu > li.ptab-name.single-link a:after{content:"";}}@media only screen and (min-width:992px){nav .first-level-wrapper > ul.drpdwn-menu > li.ptab-name.single-link{display:none;}}nav .first-level-wrapper > ul.drpdwn-menu > li:hover{}@media only screen and (min-width:992px){nav .first-level-wrapper > ul.drpdwn-menu > li:hover{color:#d20000;background-color:#EFF5F8;}}nav .first-level-wrapper > ul.drpdwn-menu > li > a{display:block;text-decoration:none;padding:17px;text-transform:capitalize;font-family:\'helvatica75\';color:#fff;text-align:center;}@media only screen and (min-width:992px){nav .first-level-wrapper > ul.drpdwn-menu > li > a{background-color:#fff;color:#161718;font-size:1.0833333333em;padding:12px 12px;text-align:left;text-transform:uppercase;border-top:1px dotted #aaaaaa;}}nav .first-level-wrapper > ul.drpdwn-menu > li > a span.fa,nav .first-level-wrapper > ul.drpdwn-menu > li > a span.nav-trigger:after,nav .first-level-wrapper > ul.drpdwn-menu > li > a .message-area span.collapse-area.opened:after,.message-area nav .first-level-wrapper > ul.drpdwn-menu > li > a span.collapse-area.opened:after,nav .first-level-wrapper > ul.drpdwn-menu > li > a .submit-success span.collapse-area.opened:after,.submit-success nav .first-level-wrapper > ul.drpdwn-menu > li > a span.collapse-area.opened:after,nav .first-level-wrapper > ul.drpdwn-menu > li > a .submit-failed span.collapse-area.opened:after,.submit-failed nav .first-level-wrapper > ul.drpdwn-menu > li > a span.collapse-area.opened:after,nav .first-level-wrapper > ul.drpdwn-menu > li > a .message-area span.collapse-area.closed:after,.message-area nav .first-level-wrapper > ul.drpdwn-menu > li > a span.collapse-area.closed:after,nav .first-level-wrapper > ul.drpdwn-menu > li > a .submit-success span.collapse-area.closed:after,.submit-success nav .first-level-wrapper > ul.drpdwn-menu > li > a span.collapse-area.closed:after,nav .first-level-wrapper > ul.drpdwn-menu > li > a .submit-failed span.collapse-area.closed:after,.submit-failed nav .first-level-wrapper > ul.drpdwn-menu > li > a span.collapse-area.closed:after,nav .first-level-wrapper > ul.drpdwn-menu > li > a #refresh-sortView-popover .refresh-block span.refresh-btn:before,#refresh-sortView-popover .refresh-block nav .first-level-wrapper > ul.drpdwn-menu > li > a span.refresh-btn:before,nav .first-level-wrapper > ul.drpdwn-menu > li > a span.has-sort:before,nav .first-level-wrapper > ul.drpdwn-menu > li > a span.has-sort:after,nav .first-level-wrapper > ul.drpdwn-menu > li > a .ui-jqdialog .ui-jqdialog-titlebar span.ui-jqdialog-titlebar-close:before,.ui-jqdialog .ui-jqdialog-titlebar nav .first-level-wrapper > ul.drpdwn-menu > li > a span.ui-jqdialog-titlebar-close:before,nav .first-level-wrapper > ul.drpdwn-menu > li > a span.grid-form-heading:before,nav .first-level-wrapper > ul.drpdwn-menu > li > a .form-wrapper span.collapsable-header:after,.form-wrapper nav .first-level-wrapper > ul.drpdwn-menu > li > a span.collapsable-header:after,nav .first-level-wrapper > ul.drpdwn-menu > li > a .link-one-ul-wrapper span.collapsable-header:after,.link-one-ul-wrapper nav .first-level-wrapper > ul.drpdwn-menu > li > a span.collapsable-header:after,nav .first-level-wrapper > ul.drpdwn-menu > li > a .link-one-ul-wrapper span.link-one-header:after,.link-one-ul-wrapper nav .first-level-wrapper > ul.drpdwn-menu > li > a span.link-one-header:after,nav .first-level-wrapper > ul.drpdwn-menu > li > a span.page-title.linkpage:after,nav .first-level-wrapper > ul.drpdwn-menu > li > a .accumulator div div span.toggle-sender-list-btn,.accumulator div div nav .first-level-wrapper > ul.drpdwn-menu > li > a span.toggle-sender-list-btn{float:right;margin-top:5px;}nav .first-level-wrapper > ul.drpdwn-menu > li > a:hover{}@media only screen and (min-width:992px){nav .first-level-wrapper > ul.drpdwn-menu > li > a:hover{border-top:none;padding:13px 12px 12px;background-color:transparent;color:#d20000;}}nav .first-level-wrapper > ul.drpdwn-menu > li.active a{border-left:3px solid #d20000;background-color:#5e6165;}@media only screen and (min-width:992px){nav .first-level-wrapper > ul.drpdwn-menu > li.active a{color:#d20000;border-left:none;background-color:transparent;}}nav .first-level-wrapper > ul.drpdwn-menu > li.ptab-name{background-color:#ffffff;}nav .first-level-wrapper > ul.drpdwn-menu > li.ptab-name a{color:#161718;text-transform:uppercase;}nav .first-level-wrapper > ul.drpdwn-menu > li.ptab-name a.page-icon{font-size:1.75em;padding:15px;}nav .second-level-wrapper{border:none;overflow:auto;}@media only screen and (min-width:992px){nav .second-level-wrapper{display:block;}}nav .second-level-wrapper ul{border-right:none;}.active-tab{border-top:3px solid #d20000;font-size:1em;text-transform:uppercase;color:#d20000;font-weight:bold;border-right:1px solid #aaaaaa;border-left:1px solid #aaaaaa;}.nav-hamburger,.nav-trigger{display:block;margin-left:5px;margin-right:5px;}@media only screen and (min-width:992px){.nav-hamburger,.nav-trigger{display:none;}}.nav-hamburger .icon-bar,.nav-trigger .icon-bar{background-color:#43464a;width:24px;height:3px;}.active .skew-clock{ms-transform:rotate(45deg);-webkit-transform:rotate(45deg);-o-transform:rotate(45deg);transform:rotate(45deg);margin-top:7px;transition:all 0.5s ease-in-out 0s;}.active .hide-closed{opacity:0 !important;transition-delay:.1s;transition-duration:.4s;transition:all 0.5s ease-in-out 0s;}.active .skew-counter{-ms-transform:rotate(-45deg);-webkit-transform:rotate(-45deg);-o-transform:rotate(-45deg);transform:rotate(-45deg);margin-top:-10px !important;transition:all 0.5s ease-in-out 0s;}.primary-nav .divider{background-image:url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIvPjxzdG9wIG9mZnNldD0iMjUlIiBzdG9wLWNvbG9yPSIjZjVmNWY1Ii8+PHN0b3Agb2Zmc2V0PSIzMiUiIHN0b3AtY29sb3I9IiNmNWY1ZjUiLz48c3RvcCBvZmZzZXQ9IjUxJSIgc3RvcC1jb2xvcj0iI2FhYWFhYSIvPjxzdG9wIG9mZnNldD0iNzIlIiBzdG9wLWNvbG9yPSIjZjVmNWY1Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZjVmNWY1Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmFkKSIgLz48L3N2Zz4g\');background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0%,#ffffff),color-stop(25%,#f5f5f5),color-stop(32%,#f5f5f5),color-stop(51%,#aaaaaa),color-stop(72%,#f5f5f5),color-stop(100%,#f5f5f5));background-image:-moz-linear-gradient(top,#ffffff 0%,#f5f5f5 25%,#f5f5f5 32%,#aaaaaa 51%,#f5f5f5 72%,#f5f5f5 100%);background-image:-webkit-linear-gradient(top,#ffffff 0%,#f5f5f5 25%,#f5f5f5 32%,#aaaaaa 51%,#f5f5f5 72%,#f5f5f5 100%);background-image:linear-gradient(to bottom,#ffffff 0%,#f5f5f5 25%,#f5f5f5 32%,#aaaaaa 51%,#f5f5f5 72%,#f5f5f5 100%);float:right;height:54px;display:block;width:1px;}@media only screen and (min-width:992px){nav ul.primary-nav li.page-name a.page-icon:after{content:"\\f015";font-family:fontAwesome;}}.navbar-toggle,.nav-hamburger,.nav-trigger{position:relative;float:right;background-color:transparent;background-image:none;border:1px solid transparent;border-radius:5px;}.sr-only{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);border:0;}@media only screen and (max-width:768px){nav ul.primary-nav > li.open > a.has-child{display:none;}nav ul.primary-nav > li.mega-menu .first-level-wrapper,nav .open .first-level-wrapper{position:relative;box-shadow:none;border-bottom:none;}nav ul.primary-nav > li.smMegamenu .second-level-wrapper{position:relative;}nav ul.primary-nav{background-color:transparent;}nav ul.primary-nav > li{float:left;}nav ul.primary-nav > li.open{position:absolute;top:0px;left:0px;}}</style>'); });
angular.module('ui.tux.modal').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.modal{.modal-content{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAACCAIAAAASFvFNAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Q0M3NkY0QjBEMjIwMTFFNEE1RkVFMjcxQzE5NjIwQTgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Q0M3NkY0QjFEMjIwMTFFNEE1RkVFMjcxQzE5NjIwQTgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDQzc2RjRBRUQyMjAxMUU0QTVGRUUyNzFDMTk2MjBBOCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDQzc2RjRBRkQyMjAxMUU0QTVGRUUyNzFDMTk2MjBBOCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrV4cvUAAAAZSURBVHjaYvj////NmzeBJCMQM4ABQIABAJfRC4S2C35qAAAAAElFTkSuQmCC) 0 0 repeat;border-radius:0;}.modal-header{padding:18px 20px;border-bottom:1px solid rgb(170,170,170);box-shadow:rgb(231,231,231) 0px 8px 10px -5px;.close{border:2px solid rgb(49,51,53);border-image-source:initial;border-image-slice:initial;border-image-width:initial;border-image-outset:initial;border-image-repeat:initial;border-radius:50px;color:rgb(255,255,255);font-weight:normal;height:35px;opacity:1;position:absolute;right:-13px;text-shadow:none;top:-17px;width:35px;font-size:1.66667em;line-height:1;}}.close,.btn-primary{background-image:url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIxJSIgc3RvcC1jb2xvcj0iIzQ1NDg0YiIvPjxzdG9wIG9mZnNldD0iMzklIiBzdG9wLWNvbG9yPSIjNDU0ODRiIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMjIyNDI1Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmFkKSIgLz48L3N2Zz4g\');background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(1%,#45484b),color-stop(39%,#45484b),color-stop(100%,#222425));background-image:-moz-linear-gradient(top,#45484b 1%,#45484b 39%,#222425 100%);background-image:-webkit-linear-gradient(top,#45484b 1%,#45484b 39%,#222425 100%);background-image:linear-gradient(to bottom,#45484b 1%,#45484b 39%,#222425 100%);}.modal-body{li{padding:3px 0px;}p{margin:10px;}}.btn-default{background-image:url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIxJSIgc3RvcC1jb2xvcj0iI2ZlZmZmZiIvPjxzdG9wIG9mZnNldD0iMzklIiBzdG9wLWNvbG9yPSIjZmVmZmZmIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZThmMGY0Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmFkKSIgLz48L3N2Zz4g\');background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(1%,#feffff),color-stop(39%,#feffff),color-stop(100%,#e8f0f4));background-image:-moz-linear-gradient(top,#feffff 1%,#feffff 39%,#e8f0f4 100%);background-image:-webkit-linear-gradient(top,#feffff 1%,#feffff 39%,#e8f0f4 100%);background-image:linear-gradient(to bottom,#feffff 1%,#feffff 39%,#e8f0f4 100%);}.btn-primary{border-color:#313335;}.modal-footer{border-top:1px solid rgb(188,209,224);border-bottom:1px solid rgb(188,209,224);box-shadow:none;background-color:rgb(228,236,240);padding:10px 20px;text-align:center;}}@media (max-width:767px){#modal .btn-default{margin:5px 5px 5px 0;}}</style>'); });
angular.module('ui.tux.imageGallery').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.image-gallery{width:100%;clear:both;.tiles-wrapper{margin-bottom:20px;overflow:hidden;padding:0px 7px;.gallery-image-detail{font-family:\'helvatica75\';h3{color:#2688da;font-size:14px;margin-bottom:0px;text-transform:uppercase;font-family:"helvatica55";}a.image-title{cursor:pointer;}a.image-title:hover{text-decoration:none;}}.tiles{width:100%;float:left;position:relative;margin-bottom:10px;overflow:hidden;cursor:pointer;border:1px solid #bcd1e0;-moz-box-shadow:1px 1px 5px 1px rgba(7,7,7,0.2);-webkit-box-shadow:1px 1px 5px 1px rgba(7,7,7,0.2);box-shadow:1px 1px 5px 1px rgba(7,7,7,0.2);img{width:100%;height:auto;}@media only screen and (min-width:992px){img{max-width:100%;}}.gallery-hover-menu{top:-100px;right:5px;bottom:auto;left:auto;position:absolute;font-size:16px;border:1px solid #c1c8d0;background:#ffffff;background:-moz-linear-gradient(top,#ffffff 0%,#e7eff3 100%);background:-webkit-linear-gradient(top,#ffffff 0%,#e7eff3 100%);background:linear-gradient(to bottom,#ffffff 0%,#e7eff3 100%);-moz-transition:all 0.5s;-o-transition:all 0.5s;-webkit-transition:all 0.5s;transition:all 0.5s;z-index:1;a{color:#676a6e;padding:0px 5px;}a + a{border-left:1px solid #c1c8d0;}}&:hover .gallery-hover-menu{top:5px;}&:hover:after{content:"";border:2px solid #d20000;position:absolute;height:100%;width:100%;left:0px;top:0px;}}}}.modal-dialog{.modal-title{font-size:2em;line-height:30px;font-family:\'helvatica45\';text-transform:capitalize;}.modal-body{.carousel-cont{margin:0px;position:relative;.carousel{.carousel-slides{padding:0;}.active{box-shadow:none;}}.next{right:19px;}@media screen and (max-width:767px){.next{right:4px;}}.prev{}}@media screen and (min-width:768px){.carousel-cont{.next:before,.prev:before{padding:4px;font-size:20px;}.next{right:5px;}.prev{left:0px;}.active{box-shadow:0 0 0 1px red inset;}.carousel-slides{padding:2px;}}}.gallery-detail{font-size:13px;padding:15px 20px;text-align:left;color:#676a6e;.open-new-win{display:inline-block;margin-bottom:10px;}span{margin-right:10px;}.gallery-desc{margin-bottom:5px;}.old-price{text-decoration:line-through;font-family:"helvatica65";}.product-price{color:#161718;font-family:\'helvatica75\';}.product-discount{background-color:#d20000;border-radius:10px;color:#fff;padding:2px 10px;font-family:"helvatica65";}}.carousel-indicator{padding-bottom:10px;.carousel-cont{position:relative;.next:before,.prev:before{padding:4px;font-size:20px;}.next{right:-30px;}.prev{left:-30px;}.active{box-shadow:0 0 0 1px red inset;}.carousel-slides{padding:2px;}}}}.fa{font-size:20px;}@media screen and (max-width:767px){.footer-buttons{a.btn{padding:5px;}.fa + span{display:none;}}}}</style>'); });
angular.module('ui.tux.login').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">@mixin linearGradient($top,$bottom){background:$top;background:-moz-linear-gradient(top,$top 0%,$bottom 100%);background:-webkit-gradient(linear,left top,left bottom,color-stop(0%,$top),color-stop(100%,$bottom));background:-webkit-linear-gradient(top,$top 0%,$bottom 100%);background:-o-linear-gradient(top,$top 0%,$bottom 100%);background:-ms-linear-gradient(top,$top 0%,$bottom 100%);background:linear-gradient(to bottom,$top 0%,$bottom 100%);}@mixin linear-gradient-2($args...){background-image:-o-linear-gradient($args);background-image:-moz-linear-gradient($args);background-image:-webkit-linear-gradient($args);background-image:linear-gradient($args);}@mixin full-left(){float:left;width:100%;}.login_wrapper{min-height:100%;padding-top:56px;background:#bcd1e0 url(assets/img/login-bg.png) no-repeat;background-size:cover;header{top:0;}}.login_container{float:left;width:100%;overflow:hidden;position:relative;&:before{content:"";position:absolute;top:0;z-index:1;-moz-box-shadow:0 0 50px #9EBCD0;-webkit-box-shadow:0 0 50px #9EBCD0;box-shadow:0 0 50px #9EBCD0;bottom:0px;left:20%;right:20%;width:60%;height:48px;-webkit-border-radius:100%;;-moz-border-radius:100%;border-radius:100%;}.tux-drpdwn,.i_input .form-control{font-size:13px;}@media only screen and (min-width:768px){width:390px;position:absolute;top:50%;left:50%;-webkit-transform:translate(-50%,-50%);-moz-transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%);-o-transform:translate(-50%,-50%);transform:translate(-50%,-50%);padding:0 15px;}@include breakpoint(mobile){overflow:auto;margin-bottom:34px;}}.login_head{font-size:25px;position:relative;text-align:center;border:1px solid #bcd1e0;z-index:2;margin:0;padding:8px 12px 12px;@include linearGradient(#fff,#f4f5f8);@media only screen and (min-width:768px){margin:0 -15px;border-top:3px solid #d81b23;&:before{content:"";position:absolute;left:-1px;bottom:-9px;border-top:8px solid #6f7882;border-left:15px solid transparent;}&:after{content:"";position:absolute;right:-1px;bottom:-9px;border-top:8px solid #6f7882;border-right:15px solid transparent;}}}.login_body{background:#ebf1f6;padding:20px 15px 10px;@include full-left();font-size:13px;border:1px solid #bcd1e0;margin-top:-1px;-webkit-box-shadow:0 0 20px 0px rgba(0,0,0,0.1);-moz-box-shadow:0 0 20px 0px rgba(0,0,0,0.1);box-shadow:0 0 20px 0px rgba(0,0,0,0.1);@media only screen and (min-width:768px){-webkit-border-radius:0 0 4px 4px;-moz-border-radius:0 0 4px 4px;border-radius:0 0 4px 4px;}.btn{min-width:92px;}.checkbox label{margin-right:15px !important;}.chk-holder{margin:0;}.login_options{.checkbox.pull-left{margin-top:4px;}}.fa-exclamation-triangle{font-size:1.6em;}.login_options p{line-height:2em;width:91%;}a{cursor:pointer;}}.forgot_password{line-height:25px;padding-left:15px;position:relative;&:before{content:"";position:absolute;left:0;width:1px;height:100%;@include linear-gradient-2(rgba(0,0,0,0) 0%,rgba(147,147,147,0.5) 50%,rgba(0,0,0,0) 100%);}}.i_input{position:relative;&:before{content:"";position:absolute;left:45px;width:1px;height:100%;@include linear-gradient-2(rgba(0,0,0,0) 10%,rgba(147,147,147,0.5) 50%,rgba(0,0,0,0) 90%);}.form-control{padding-left:60px;outline:none;border:1px solid rgba(206,213,219,1);}.fa{font-size:16px;position:absolute;width:45px;left:0;top:50%;text-align:center;-webkit-transform:translateY(-50%);-moz-transform:translateY(-50%);-ms-transform:translateY(-50%);transform:translateY(-50%);}.tux-drpdwn{padding-left:12px;text-indent:44px;border:1px solid rgba(206,213,219,1);}}.no-cssgradients .i_input:before{background:rgba(147,147,147,0.5);}.checkbox.top-fix label:before{top:4px;}.full-left{float:left;width:100%;}.mb_10{margin-bottom:10px;}.mb_20{margin-bottom:20px;}.text-big{font-weight:bold;text-transform:uppercase;}.faded_hr{float:left;width:100%;border:0;padding-bottom:20px;position:relative;overflow:hidden;&:before{content:"";margin:0 0 10px;border:0;height:1px;background:#333;background:-webkit-gradient(linear,left top,right top,color-stop(0%,transparent),color-stop(50%,rgba(0,0,0,0.3)),color-stop(100%,transparent));background:-webkit-linear-gradient(left,transparent 0%,rgba(0,0,0,0.3) 50%,transparent 100%);background:-moz-linear-gradient(left,transparent 0%,rgba(0,0,0,0.3) 50%,transparent 100%);background:-ms-linear-gradient(left,transparent 0%,rgba(0,0,0,0.3) 50%,transparent 100%);background:-o-linear-gradient(left,transparent 0%,rgba(0,0,0,0.3) 50%,transparent 100%);background:linear-gradient(to right,rgba(0,0,0,0) 0%,rgba(0,0,0,0.3) 50%,rgba(0,0,0,0) 100%);left:0;right:0;top:0;position:absolute;}&:after{content:"";position:absolute;top:-50px;z-index:1;-webkit-box-shadow:0 0 50px #BBD3E2;box-shadow:0 0 50px #BBD3E2;-moz-box-shadow:0 0 50px #BBD3E2;bottom:0px;left:20%;right:20%;width:60%;height:50px;-webkit-border-radius:100%;-moz-border-radius:100%;border-radius:100%;}}.visible-usm{display:none;@media only screen and (max-width:480px){display:block;}}</style>'); });
angular.module('ui.tux.multiselect').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.form-multiselect{padding:0;.dropdown-trigger{text-align:left;position:relative;cursor:pointer;border-radius:3px;color:#676a6e;background-color:#fff;border-color:#ccc;height:31px;border-width:1px;-webkit-box-shadow:inset 2px 2px 6px 0px rgba(1,1,1,0.1);box-shadow:inset 2px 2px 6px 0px rgba(1,1,1,0.1);text-transform:none;display:inline-block;padding:7px 15px;border:1px solid #ccc;line-height:1;width:100%;}}.multiSelect{.vertical{float:none;width:100%;margin:0;height:auto;}.horizontal:not(.multiSelectGroup){float:left;}.line{padding:2px 0px 4px 0px;max-height:30px;overflow:hidden;box-sizing:content-box;}.acol{display:inline-block;min-width:12px;}.inlineBlock{display:inline-block;}.buttonClicked{box-shadow:0 2px 5px rgba(0,0,0,0.15) inset,0 1px 2px rgba(0,0,0,0.05);}.buttonLabel{display:block;}.selectionLabel{background-color:#eff5f8;border:#ced5db 1px solid;display:inline-block;padding:5px 10px;margin-right:10px;margin-top:5px;text-transform:capitalize;a.close{color:#676a6e;font-size:15px;margin:2px 0 0 30px;}}.caret{display:inline-block;width:0;height:0;margin:5px 0 0 !important;vertical-align:middle;border-top:4px solid #333;border-right:4px solid transparent;border-left:4px solid transparent;border-bottom:0 dotted;float:right;}.checkboxLayer{background-color:#fff;position:absolute;z-index:999;border:1px solid rgba(0,0,0,0.15);border-radius:4px;-webkit-box-shadow:0 6px 12px rgba(0,0,0,0.175);box-shadow:0 6px 12px rgba(0,0,0,0.175);min-width:278px;display:none !important;width:97%;}.helperContainer{border-bottom:1px solid #ddd;padding:8px 8px 0px 8px;}.helperButton{display:inline;text-align:center;cursor:pointer;border:0;height:26px;font-size:13px;font-weight:bold;border-radius:2px;color:#2688da;background-color:#fff;line-height:1.6;margin:0px 0px 8px 0px;outline:none;}.helperButton.reset{float:right;}.helperButton:not( .reset){margin-right:4px;}.clearAll{float:right;}.clearButton{position:absolute;display:inline;text-align:center;cursor:pointer;border:1px solid #ccc;height:22px;width:22px;font-size:13px;border-radius:2px;color:#666;background-color:#f1f1f1;line-height:1.4;right:2px;top:4px;}.inputFilter{border-radius:2px;border:1px solid #ccc;height:26px;font-size:14px;width:100%;padding-left:7px;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;color:#888;margin:0px 0px 8px 0px;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075);box-shadow:inset 0 1px 1px rgba(0,0,0,.075);}.clearButton:hover{border:1px solid #ccc;color:#999;background-color:#f4f4f4;}.inputFilter:focus{border:1px solid #66AFE9 !important;outline:0;-webkit-box-shadow:inset 0 0 1px rgba(0,0,0,.065),0 0 5px rgba(102,175,233,.6) !important;box-shadow:inset 0 0 1px rgba(0,0,0,.065),0 0 5px rgba(102,175,233,.6) !important;}.checkBoxContainer{display:block;padding:0px;overflow:hidden;}.show{display:block !important;}.multiSelectItem{display:block;padding:3px 3px 3px 25px;color:#444;white-space:nowrap;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;border:1px solid transparent;position:relative;min-width:278px;min-height:32px;}.multiSelectItem:not(.multiSelectGroup).selected{background:#EFF4F8;color:#555;cursor:pointer;border-top:1px solid #fff;}.multiSelectItem .acol label{display:inline-block;padding-right:30px;margin:0px;font-weight:normal;line-height:normal;}.multiSelectItem:hover,.multiSelectGroup:hover{background:#EFF4F8;cursor:pointer;border-top:1px solid #fff;}.multiSelectFocus{background:#EFF4F8;cursor:pointer;border-top:1px solid #fff;}.multiSelectItem span:hover,.multiSelectGroup span:hover{cursor:pointer;}.multiSelectGroup{display:block;clear:both;}.tickMark{display:inline-block;position:absolute;left:10px;top:2px;font-size:18px;color:#2688da;}.checkbox{color:#ddd !important;position:absolute;left:-9999px;cursor:pointer;}.disabled,.disabled:hover,.disabled label input:hover ~ span{color:#c4c4c4 !important;cursor:not-allowed !important;}img{vertical-align:middle;margin-bottom:0px;max-height:22px;max-width:22px;}}.multiSelect > button{display:inline-block;position:relative;text-align:center;cursor:pointer;border:1px solid #c6c6c6;padding:1px 8px 1px 8px;font-size:14px;min-height:38px !important;border-radius:4px;color:#555;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;white-space:normal;background-color:#fff;background-image:linear-gradient(#fff,#f7f7f7);}.multiSelect > button:hover{background-image:linear-gradient(#fff,#e9e9e9);}.multiSelect > button:disabled{background-image:linear-gradient(#fff,#fff);border:1px solid #ddd;color:#999;}.inlineFauxCode{font-size:12.5px;border-radius:3px;font-family:monospace !important;padding:1px 2px 1px 2px;margin:0px 2px 0px 2px;position:relative;top:-2px;border:1px solid #ccc;background-color:#F8F8F8;}.fauxCode{border:1px solid #ccc;background-color:#F8F8F8;padding:10px !important;}div.fauxCode,.fauxCode td{font-family:monospace !important;font-size:12.5px;padding-right:0px;border-radius:3px;vertical-align:top;white-space:normal;margin-bottom:15px;}div.fauxCode + p,.fauxCode td + p{margin-top:10px;}</style>'); });
angular.module('ui.tux.popover').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.popover{border-radius:0;border:1px solid #BCD1E0;background:#E4ECF0;.popover-title{background:none;border-bottom:1px solid #BCD1E0;word-wrap:break-word;}.popover-content{background:#fff;}}.popover.bottom>.arrow:after{border-bottom-color:#E4ECF0;}.popover.top>.arrow{bottom:-10px;}#popover .btn-default{margin:5px 5px 5px 0;}</style>'); });
angular.module('ui.tux.progressbar').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.verticalProgressBar{transform:rotate(-90deg);margin:45% 0;}.progress-wrapped{background:#EFF5F8;padding:17px;border-radius:30px;}.progress-bar{background:#0094e4;background:-moz-linear-gradient(top,#0094e4 0%,#0c5c8a 66%,#247eba 100%);background:-webkit-gradient(left top,left bottom,color-stop(0%,#0094e4),color-stop(66%,#0c5c8a),color-stop(100%,#247eba));background:-webkit-linear-gradient(top,#0094e4 0%,#0c5c8a 66%,#247eba 100%);background:-o-linear-gradient(top,#0094e4 0%,#0c5c8a 66%,#247eba 100%);background:-ms-linear-gradient(top,#0094e4 0%,#0c5c8a 66%,#247eba 100%);background:linear-gradient(to bottom,#0094e4 0%,#0c5c8a 66%,#247eba 100%);&.progress-bar-danger{background:#ea5a5a;}&.progress-bar-warning{background:#E0A01D;}&.progress-bar-info{background:#5bc0de;}}.tux-progressbar{&.progress{border-radius:10px;box-shadow:2px 2px 5px #888888;overflow:hidden;height:17px;background-color:#f5f5f5;margin-bottom:0px;.progress-bar{font-size:10px;line-height:17px;}}}.circular-progress{path{stroke:#00509b;stroke-linecap:butt;stroke-linejoin:miter;-webkit-transition:stroke-dashoffset 0.2s ease-in;transition:stroke-dashoffset 0.2s ease-in;fill:transparent;}circle{stroke:#E6E7E8;fill:transparent;}.circular-progress-container{position:relative;display:inline-block;padding:15px;margin-bottom:20px;background:#EFF5F8;border-radius:150px;}.config-sec{label{width:25%;.slider{margin-top:30px;}}}@media only screen and (max-width:768px){.config-sec label{width:50%;}}.progress-value{position:absolute;color:#bbb;font-weight:100;line-height:1;top:50%;bottom:auto;left:50%;transform:translateY(-50%) translateX(-50%);font-size:35.7143px;}}@media only screen and (max-width:768px){.progress-wrapped{margin:10px 0;}.verticalProgressBar{margin:45% 0 45%;}.vbar-spacer:not(:last-child){margin-bottom:90%;}}</style>'); });
angular.module('ui.tux.scrollspy').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">#scrollspy{@media only screen and (max-width:768px){.scroll-spy-demo ul{margin-bottom:0px;li{float:left;&:first-child{margin-left:10px;}}}}@media only screen and (max-width:380px){.scroll-spy-demo ul{margin-bottom:0px;li{&:first-child{margin-left:0px;}float:none;a{border:1px solid #aaaaaa;}}}.scroll-spy-demo .scroll-spy-cointainer{margin-top:10px;}}}</style>'); });
angular.module('ui.tux.slider').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.slider{display:inline-block;position:relative;height:7px;width:100%;margin:25px 5px 25px 5px;vertical-align:middle;span{white-space:nowrap;position:absolute;display:inline-block;}span.base{width:100%;height:100%;padding:0;}span.bar{width:100%;height:100%;z-index:0;-webkit-border-radius:1em/1em;border-radius:1em/1em;background-color:#e4ecf0;&.selection{width:0%;z-index:1;background-color:#2688da;}}span.pointer{cursor:pointer;width:24px;height:24px;top:-9px;background-color:#fff;border:1px solid #ccc;z-index:2;-webkit-border-radius:1em/1em;border-radius:1em/1em;&:after{content:\'\';background-color:#808080;width:10px;height:10px;position:absolute;top:6px;left:6px;-webkit-border-radius:1em/1em;border-radius:1em/1em;}&:hover:after{background-color:#2688da;}&.active:after{background-color:#ea5a5a;}}span.bubble{cursor:default;top:-28px;padding:1px 3px 1px 3px;font-size:1em;font-family:\'helvetica55\';&.selection{top:17px;}&.limit{color:#808080;}}}</style>'); });
angular.module('ui.tux.submitFeedback').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.feedback-form{font-size:12px;.clear{clear:both;}.mandatory .tms-hform-label:before{content:"";background:#eb161e;width:3px;height:15px;position:relative;left:0px;display:inline-block;float:left;margin-right:8px;}.required-fields-legend{margin-top:10px;}.MultiFile-applied{display:none;}.subtext{font-size:9px;}.ng-invalid{border:1px solid #ddd !important;}.ng-dirty.ng-invalid{border:1px solid red !important;}.radio{margin-top:0;.radio-holder{margin:0 10px 0 0;display:inline-block;}}.fa-upload{display:none;}.multi-file-upload{display:inline-block;}.field-wrapper{padding-top:15px;}input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}}.feedback-form.ng-submitted{.ng-invalid,.invalid .dropdown-trigger{border:1px solid red !important;}}</style>'); });
angular.module('ui.tux.tabs').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.nav-tabs{background:#fff;}.tux-tabs{position:relative;}.nav-stacked .tux-tab{float:none;}.nav-tabs>li{float:none;margin:0px;@include breakpoint(tablet){float:left;}}.nav-tabs>li>a{color:#676a6e;border-radius:0px;}.nav-tab-toggle-wrap{background-color:#EFF5F8;border-top:1px solid #bcd1e0;border-bottom:1px solid #bcd1e0;padding:15px 0;}.nav-tab-toggle{-webkit-box-shadow:inset 2px 2px 6px 0px rgba(1,1,1,0.1);box-shadow:inset 2px 2px 6px 0px rgba(1,1,1,0.1);-webkit-transition:border-color ease-in-out 0.15s,box-shadow ease-in-out 0.15s;-o-transition:border-color ease-in-out 0.15s,box-shadow ease-in-out 0.15s;transition:border-color ease-in-out 0.15s,box-shadow ease-in-out 0.15s;width:96%;text-align:left;padding:10px 12px;color:#161718;text-transform:none;cursor:pointer;position:relative;background-color:#fff;background-image:none;border:1px solid #ddd;margin:0 2%;&:after{content:"\\f078";position:absolute;right:10px;top:12px;color:#878c92;font:normal normal normal 14px/1 FontAwesome;text-rendering:auto;-webkit-font-smoothing:antialiased;}}@include breakpoint(lttablet){.nav-tabs>li:nth-child(odd){background-color:#fafcfd;}.nav-tabs>li{border-bottom:1px solid #dde8ef;}.nav-stacked>li+li{margin-top:0px;}.nav-tabs{transition:0.5s max-height;max-height:0px;overflow:hidden;position:absolute;width:96%;margin:0 2%;border:1px solid #c1c8d0;border-top:none;top:58px;z-index:105;-moz-box-shadow:9px 10px 12px -5px #dddddd;-webkit-box-shadow:9px 10px 12px -5px #dddddd;box-shadow:9px 10px 12px -5px #dddddd;&.open{max-height:400px;}}}.nav-tabs>li.active>a,.nav-tabs>li.active>a:hover,.nav-tabs>li>a:hover,.nav-tabs>li>a:focus,.nav-tabs>li.active>a:focus{border:1px solid transparent;background-color:#e5eef3;padding:10px 15px;position:relative;color:#161718;@include breakpoint(tablet){background:none;border-bottom:3px solid #d20000;}}@include breakpoint(tablet){.nav-tab-toggle-wrap{display:none;}.nav-tabs>li.active>a:after,.nav-tabs>li>a:hover:after,.nav-tabs>li>a:focus:after{content:"\\f0d7";font:normal normal normal 14px/1 FontAwesome;text-rendering:auto;-webkit-font-smoothing:antialiased;color:#d20000;position:absolute;bottom:-12px;text-align:center;left:45%;}}.nav-tabs.nav-justified>.active>a,.nav-tabs.nav-justified>.active>a:focus,.nav-tabs.nav-justified>.active>a:hover{border:1px solid transparent;}.nav-tabs.nav-justified>.active>a,.nav-tabs.nav-justified>.active>a:focus,.nav-tabs.nav-justified>.active>a:hover{border-bottom:3px solid #d20000;}.tab-content>.tab-pane{padding:10px;}@media only screen and (min-width:1280px){[vertical="true"] .nav-tabs{width:19%;}[vertical="true"] .tab-content{width:81%;}}@media only screen and (min-width:768px){[vertical="true"] .tab-content{width:72%;float:left;}[vertical="true"] .nav-tabs{border-right:1px solid #bcd1e0;height:inherit;float:left;width:19%;padding:0 2% 0 0;}[vertical="true"] .nav-tabs > li > a{color:#676a6e;text-decoration:none;padding:15px 0 15px 12px;text-transform:uppercase;display:block;border-left:2px solid #fff;border-bottom:1px dotted #ccc;font-size:1em;}[vertical="true"] .nav-tabs > li.active > a{border-bottom:1px dotted #ccc;padding:15px 0;color:#161718;background:transparent;}[vertical="true"] .nav-tabs > li.active > a:after,[vertical="true"] .nav-tabs > li.active > a:hover:after,[vertical="true"] .nav-tabs > li > a:hover:after,[vertical="true"] .nav-tabs > li > a:focus:after,[vertical="true"] .nav-tabs > li.active > a:focus:after{content:\'\\f0da\';font:normal normal normal 14px/1 FontAwesome;text-rendering:auto;-webkit-font-smoothing:antialiased;position:absolute;right:0px;top:17px;color:#d20000;left:100%;}[vertical="true"] .nav-tabs > li.active > a,[vertical="true"] .nav-tabs > li.active > a:hover,[vertical="true"] .nav-tabs > li > a:hover,[vertical="true"] .nav-tabs > li > a:focus,[vertical="true"] .nav-tabs > li.active > a:focus{color:#161718;position:relative;border-bottom:1px dotted #ccc;padding:15px 0 15px 0;border-left:2px solid #fff;}[vertical="true"] .nav-tabs > li.active{border-left:3px solid #d20000;}[vertical="true"] .tab-pane{padding:0px 20px 20px;overflow:hidden;line-height:20px;}[vertical="true"]{margin-top:15px;width:100%;}[vertical="true"] .nav-tabs{width:28%;}[vertical="true"] .nav-tabs > li{padding-left:12px;}[vertical="true"] .nav-tabs > li > a,[vertical="true"] .nav-tabs > li > a:hover,[vertical="true"] .nav-tabs > li.active > a,[vertical="true"] .nav-tabs > li.active > a:hover{padding:15px 0 15px 0;}}</style>'); });
angular.module('ui.tux.textEditor').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss"></style>'); });
angular.module('ui.tux.timepicker').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.tux-time input{width:50px;}.am-pm .btn-default{padding:5px 12px;margin-left:2px;background-color:white;box-shadow:inset 2px 2px 6px 0px rgba(1,1,1,0.1);border-color:#ddd;}</style>'); });
angular.module('ui.tux.typeahead').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">[tux-typeahead-popup].dropdown-menu{display:block;}.helper-note{margin-top:5px;font-size:13px;}</style>'); });
angular.module('ui.tux.verticalImageGallery').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.vertical-image-gallery{padding-bottom:15px;.carousel{.active{box-shadow:none;}}.vertical-carousel{.next,.prev{visibility:visible;}.prev{}}.vertical{height:230px;margin-top:10px;.active{box-shadow:0 0 0 2px red inset;}}.vertical-gallery{margin-top:15px;}.image-title{font-family:\'helvatica75\';font-size:13px;margin-top:25px;text-transform:uppercase;}.image-desc{font-family:\'helvatica55\',Arial,sans-serif;color:#676a6e;font-size:12px;}.item-caption{font-family:\'helvatica65\';font-size:15px;margin-top:10px;color:#161718;}.padzero{padding:0px;}.next,.prev{visibility:hidden;}@media screen and (max-width:994px){.image-title{margin-top:15px;}}@media screen and (max-width:767px){.carousel{.carousal-slides{padding:0;}}.next,.prev{visibility:visible;}.next:before,.prev:before{padding:10px;font-size:20px;}.next{right:33px;}.prev{left:16px;}}}</style>'); });
angular.module('ui.tux.widgets').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.dashboard-main{font-size:12px;}.dashboard-container{.dashboard-header,.dashboard-right-side-panel-header{width:100%;float:left;position:relative;background-color:#f0f5f7;border-bottom:1px solid #ededed;box-shadow:0 4px 6px -2px #ededed;}.dashboard-content-wrapper{color:#8d8f91;float:left;margin-bottom:20px;padding:15px 10px 5px 10px;border-left:1px solid #ededed;border-right:1px solid #ededed;border-bottom:1px solid #ededed;box-shadow:0 4px 6px -2px #ededed;width:100%;p{font-size:13px;margin-top:10px;}}h2{font-size:1.08333em;font-weight:bold;color:#303233;text-transform:uppercase;margin:14px 9px 9px;}.dashboard-header .icon{margin:10px 0px 3px 10px;font-size:20px;color:#2789d9;}.dashboard-content-wrapper-link a{color:#2688da;font-size:13px;text-transform:uppercase;font-family:\'helvatica75\';}}.page-title,a.page-title{font-size:2.0833333333em;color:#161718;text-transform:capitalize;margin-bottom:20px;font-family:\'helvatica45\';}.pull-right{float:right;}.pull-left{float:left;}.addmorewidget{text-decoration:none;color:#ffffff;font-size:14px;display:block;float:left;margin-bottom:15px;text-transform:uppercase;width:auto;}.widget-modal{font-size:12px;.modal-body{padding:0;}.modal-body h2{float:left;padding:0 0 20px 0;margin:0;font-size:1.25em;font-family:\'helvatica75\';}}.addmorewidget{.fa{color:#676a6e;}}.widget-left-container{width:100%;float:left;padding:20px;position:relative;}.widget-cont{float:left;width:100%;position:relative;}.widget-wrap{font-size:1.5em;float:left;margin:0 0 2% 0;.movingWidgetWrapper{float:left;padding:10px;background-image:linear-gradient(to bottom,#ffffff 0%,#e8f0f3 100%);width:100%;-moz-box-shadow:0 5px 7px rgba(0,0,0,0.4);-webkit-box-shadow:0 5px 7px rgba(0,0,0,0.4);box-shadow:0 5px 7px rgba(0,0,0,0.4);border:1px solid #bcd1e0;height:100%;.close-icon{width:25px;height:25px;color:#fff;line-height:25px;text-align:center;float:right;-moz-border-radius:50%;-webkit-border-radius:50%;border-radius:50%;background-image:-moz-linear-gradient(top,#45484b 1%,#45484b 39%,#222425 100%);background-image:-webkit-linear-gradient(top,#45484b 1%,#45484b 39%,#222425 100%);background-image:linear-gradient(to bottom,#45484b 1%,#45484b 39%,#222425 100%);.close-btn{font-size:12px;vertical-align:middle;}}.widget-content{span{font-size:13px;font-family:\'helvatica75\';color:#161718;text-transform:uppercase;width:70%;display:block;}.widget-icon{color:#6f7275;font-size:16px;margin-right:10px;float:left;}}}}@media only screen and (min-width:768px){.modal-add-remove-text{margin-top:12px;margin-left:126px;float:none;}.widget-wrap{height:110px;.movingWidgetWrapper{padding:0px;.close-icon{position:relative;top:-9px;right:-6px;width:20px;height:20px;line-height:1;}.widget-content{width:100%;padding-top:16%;text-align:center;span{padding:8px 10px 0;width:auto;}.widget-icon{display:block;margin-right:0;float:none;}}}}.add-widget-cont{overflow-y:auto;padding-right:20px;}}.widget-modal{overflow:hidden;}.widget-right-cont{width:100%;float:left;padding:20px 20px 0 20px;}.widget-right-wrap{background:gray;background-color:#eff5f8;border-left:1px solid #bcd1e0;}@media only screen and (min-width:768px){.modal-body.widget-modal{max-height:403px;overflow-y:scroll;}.widget-right-cont{padding:20px 5px 0 20px;}.widget-right-wrap,.widget-left-wrap{display:table-cell;vertical-align:top;float:none;}}.add-widget-cont{float:left;width:100%;position:relative;.widget-wrap{width:100%;.add-icon{width:30px;height:30px;line-height:30px;text-align:center;position:relative;top:0;right:0;border:1px solid #c1c8d0;border-radius:0px;color:#676a6e;float:right;}@media only screen and (min-width:768px){margin:0 0 20px 0;.add-icon{border:none;border-left:1px solid #c1c8d0;border-bottom:1px solid #c1c8d0;}}}}.as-sortable-drag .widget-wrap{width:100%;}.as-sortable-placeholder{float:left;margin:0 0 2% 0;}.as-sortable-item{-ms-touch-action:none;touch-action:none;-webkit-touch-callout:none;}.as-sortable-item-handle{cursor:move;cursor:-webkit-grab;cursor:-moz-grab;}.as-sortable-placeholder{}.as-sortable-drag{position:absolute;pointer-events:none;z-index:9999;}.as-sortable-hidden{display:none !important;}.as-sortable-un-selectable{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;}.as-sortable-item-handle{}.as-sortable-placeholder{box-sizing:border-box;background-color:#dbdbdb;}.as-sortable-drag{opacity:.8;}</style>'); });
angular.module('ui.tux.wizard').run(function() {!angular.$$csp().noInlineStyle && angular.element(document).find('head').prepend('<style type="text/scss">.tux-wizard{position:relative;section{padding-top:10px;}.carousel .active{box-shadow:none;}.carousel-cont{margin:25px 0 0;}.steps-indicator{padding-left:0px;overflow:hidden;li{display:none;text-align:center;background:#eff5f8;font-weight:bold;padding-bottom:25px;-moz-box-shadow:0px 3px 5px 0px rgba(0,0,0,0.1);-webkit-box-shadow:0px 3px 5px 0px rgba(0,0,0,0.1);box-shadow:0px 3px 5px 0px rgba(0,0,0,0.1);&.current,&.editing{display:block;}a{border:none;background:none;font-size:24px;color:#d20000;display:block;padding:10px 15px;}}}.mobile-nav{position:absolute;top:35px;width:100%;font-weight:bold;font-size:18px;.phn-prev{position:absolute;left:15px;cursor:pointer;}.phn-next{position:absolute;right:15px;cursor:pointer;}}.wizard-step-count-wrapper{position:absolute;top:72px;width:100%;text-align:center;}.hide-button{display:none;}@media only screen and (min-width:768px){.steps-indicator{right:0;bottom:0;left:0;margin:0;padding:20px 0 0 0;box-shadow:none;list-style:none;position:relative;li{position:relative;float:left;margin:0;padding:0;line-height:15px;background:none;text-align:left;display:block;box-shadow:none;&:before{content:"";height:1px;border-top:1px solid #bcd1e0;position:absolute;top:32px;left:66px;width:calc(100% - 66px);}a{text-decoration:none;text-transform:uppercase;font-weight:bold;transition:0.25s;border:1px solid #ddd;padding:18px;border-radius:50%;display:inline-block;font-size:25px;color:#000;height:66px;width:66px;cursor:default;text-align:center;}.wizard-menu-title{margin-top:-18px;color:#676a6e;position:absolute;bottom:55%;left:70px;margin-top:-22x;font-weight:normal;width:calc(100% - 80px);font-family:\'helvatica65\';word-break:break-word;}&.visited,&.done{.wizard-menu-title{color:#2688da;cursor:pointer;}}&.current,&.editing{a{color:#d20000;background-color:#eff5f8;}.wizard-menu-title{color:#d20000;cursor:default;}}}&.steps-2 li{width:calc((100% - 10px) / 2);}&.steps-3 li{width:calc((100% - 10px) / 3);}&.steps-4 li{width:calc((100% - 10px) / 4);}&.steps-5 li{width:calc((100% - 10px) / 5);}&.steps-6 li{width:calc((100% - 10px) / 6);}&.steps-7 li{width:calc((100% - 10px) / 7);}&.steps-8 li{width:calc((100% - 10px) / 8);}&.steps-9 li{width:calc((100% - 10px) / 9);}&.steps-10 li{width:calc((100% - 10px) / 10);}&.steps-11 li{width:calc((100% - 10px) / 11);}&:after{content:"";float:left;height:10px;width:10px;background:#bcd1e0;border-radius:50%;position:relative;top:27px;}}.mobile-nav,.wizard-step-count-wrapper{display:none;}}.radio-holder{display:inline-block;margin:0;}.panel-body{padding:15px 0;}.tux-wizard-wrap{border-top:1px solid #eaeaea;padding-top:20px;}[tux-radio] label:before{margin-right:0;}.checkboxes label span{margin:5px 15px 0 0;}[tux-checkbox] label{min-height:20px;padding-left:0px;margin-bottom:0;font-weight:normal;cursor:pointer;text-transform:uppercase;font-size:13px;}@media only screen and (min-width:768px){.steps-indicator li .wizard-menu-title{width:180px;}}label.selectedItems{padding-left:0;}label.selectedItems .fa-check:before{color:#2688da;line-height:17px;padding-left:3px;font-weight:bold;}.chk-holder{position:relative;display:block;margin-top:10px;margin-bottom:10px;}.color-box{padding:1px 12px;border:1px solid;MARGIN-RIGHT:10PX;}.color-box-red{background-color:#a12022;}.color-box-black{background-color:#1b1c1c;}.color-box-white{background-color:#f2f2f2;}.color-box-green{background-color:#375263;}.color-box-grey{background-color:#adadac;}.tux-form .form-group .vb-example-text{color:#555555;font-weight:normal;margin-top:5px;font-size:0.9em;}.color-box-mix{background:#4a2328;background:-moz-linear-gradient(top,#4a2328 52%,#c4bebe 55%);background:-webkit-gradient(linear,left top,left bottom,color-stop(52%,#4a2328),color-stop(55%,#c4bebe));background:-webkit-linear-gradient(top,#4a2328 52%,#c4bebe 55%);background:-o-linear-gradient(top,#4a2328 52%,#c4bebe 55%);background:-ms-linear-gradient(top,#4a2328 52%,#c4bebe 55%);background:linear-gradient(to bottom,#4a2328 52%,#c4bebe 55%);}.tux-form{border:none;background:none;}.tux-form{margin-bottom:0;width:100%;float:left;}@media only screen and (min-width:768px){.tux-form{margin-bottom:127px;}}@media only screen and (min-width:992px){.tux-form{margin-bottom:0;}}.tux-form .form-control,.tux-form .table-content-wrapper .table-wrapper .editable-table thead tr.filtering th.status .status-selectbox,.table-content-wrapper .table-wrapper .editable-table thead tr.filtering th.status .tux-form .status-selectbox,.tux-form .table-content-wrapper .table-wrapper .editable-table .table-body tr td .status-selectbox,.table-content-wrapper .table-wrapper .editable-table .table-body tr td .tux-form .status-selectbox,.tux-form .ui-search-input input,.ui-search-input .tux-form input,.tux-form .tms-drpdwn,.tux-form .dropButton{width:100%;font-size:1.0833333333em;font-family:\'helvatica55\';}@media only screen and (min-width:768px){.tux-form .form-control,.tux-form .table-content-wrapper .table-wrapper .editable-table thead tr.filtering th.status .status-selectbox,.table-content-wrapper .table-wrapper .editable-table thead tr.filtering th.status .tux-form .status-selectbox,.tux-form .table-content-wrapper .table-wrapper .editable-table .table-body tr td .status-selectbox,.table-content-wrapper .table-wrapper .editable-table .table-body tr td .tux-form .status-selectbox,.tux-form .ui-search-input input,.ui-search-input .tux-form input,.tux-form .tms-drpdwn,.tux-form .dropButton{width:262px;}}.tms-drpdwn{border:1px solid #ddd;}.error .form-control,.error .table-content-wrapper .table-wrapper .editable-table thead tr.filtering th.status .status-selectbox,.table-content-wrapper .table-wrapper .editable-table thead tr.filtering th.status .error .status-selectbox,.error .table-content-wrapper .table-wrapper .editable-table .table-body tr td .status-selectbox,.table-content-wrapper .table-wrapper .editable-table .table-body tr td .error .status-selectbox,.error .ui-search-input input,.ui-search-input .error input,.error .tms-drpdwn,.error .dropButton{border:1px solid #eb161e;}.error.form-control,.table-content-wrapper .table-wrapper .editable-table thead tr.filtering th.status .error.status-selectbox,.table-content-wrapper .table-wrapper .editable-table .table-body tr td .error.status-selectbox,.ui-search-input input.error,.error.tms-drpdwn,.error.dropButton{border:1px solid #eb161e;}.error.tms-drpdwn{border:1px solid #eb161e;}.error .checkboxes label:before{border:1px solid #eb161e;}.tms-field-mandatory .tms-form-label{border-left:3px solid #eb161e;padding-left:6px;text-transform:uppercase;}.right-spacer{margin-right:15px;}.tux-field-error-msg{color:#eb161e;font-size:1.0833333333em;width:100%;display:block;line-height:30px;clear:both;}.tab-section.vertical{}@media only screen and (min-width:768px){.tab-section.vertical{margin-top:15px;width:100%;float:left;}}.tab-section.vertical .tab-links li{}@media only screen and (min-width:768px){.tab-section.vertical .tab-links li{padding-left:12px;}}.tab-section.vertical .tab-links li a{color:#676a6e;text-decoration:none;padding:15px 0 15px 12px;font-family:\'helvatica75\';text-transform:uppercase;display:block;border-left:2px solid #fff;border-bottom:1px dotted #ccc;font-size:1em;}@media only screen and (min-width:768px){.tab-section.vertical .tab-links li a{padding:15px 0 15px 0;}}.tab-section.vertical .tab-links li.active{border-left:3px solid #d20000;}.selected-vtab,.tab-section.vertical .tab-links li:hover a,.tab-section.vertical .tab-links li.active a{color:#161718;font-family:\'helvatica75\';position:relative;}.selected-vtab:after,.tab-section.vertical .tab-links li:hover a:after,.tab-section.vertical .tab-links li.active a:after{content:\'\\f0da\';font:normal normal normal 14px/1 FontAwesome;text-rendering:auto;-webkit-font-smoothing:antialiased;position:absolute;right:0px;top:17px;color:#d20000;}.required-indicator{float:left;margin-top:17px;padding-left:10px;border-left:3px solid #eb161e;color:#878c92;}@media only screen and (min-width:768px){.required-indicator{float:right;margin-right:16px;margin-top:25px;}}.tux-dropdown-none{display:block;min-width:400px;padding:0;margin:0;list-style:none;box-shadow:none;background:none;border:none;border-radius:0;}.tux-menu-top{min-height:20px;top:auto;bottom:50px;right:10px;padding:10px 10px 0;}.tux-menu-top:after{content:"\\f0d7";font:normal normal normal 14px/1 FontAwesome;text-rendering:auto;-webkit-font-smoothing:antialiased;color:#fff;position:absolute;right:10px;bottom:-7px;height:16px;width:16px;font-size:2em;}@media only screen and (min-width:768px){.tux-menu-top:after{right:61px;}}.tux-menu-top span{display:inline-block;margin-bottom:10px;width:100%;}.tux-menu-top span .btn{width:100%;}.form-footer .dropdown{margin-left:10px;}.tux-button-space .open:after{content:none;}.primary-tux-buttonset .btn-primary{margin-bottom:0;}.primary-tux-buttonset span{display:inline-block;margin-bottom:0;width:auto;margin-left:10px;}.leftAln{}@media only screen and (min-width:768px){.leftAln{float:left !important;}}.tux-button-space{min-width:100px;float:right;}.tux-action-button{padding:10px 15px;}.btn-close:hover{background-image:-webkit-linear-gradient(top,#feffff 1%,#feffff 39%,#e8f0f4 100%);}.dropdown-menu{border-radius:0;}.row-wrapper{clear:both;}.checkboxes label span{padding:1px 12px;border:1px solid;}.checkboxes label span.color-red{background-color:#a12022;}.checkboxes label span.color-black{background-color:#1b1c1c;}.checkboxes label span.color-white{background-color:#f2f2f2;}.checkboxes label span.color-green{background-color:#375263;}.checkboxes label span.color-grey{background-color:#adadac;}.checkboxes label span.color-mix{background:#4a2328;background:-moz-linear-gradient(top,#4a2328 52%,#c4bebe 55%);background:-webkit-gradient(linear,left top,left bottom,color-stop(52%,#4a2328),color-stop(55%,#c4bebe));background:-webkit-linear-gradient(top,#4a2328 52%,#c4bebe 55%);background:-o-linear-gradient(top,#4a2328 52%,#c4bebe 55%);background:-ms-linear-gradient(top,#4a2328 52%,#c4bebe 55%);background:linear-gradient(to bottom,#4a2328 52%,#c4bebe 55%);}span.status-holder.ng-binding.DELIVERED{background:#24b685;}span.status-holder.ng-binding.CONFIGURED{background:#24b685;}span.status-holder.ng-binding.SAVED{background:#736F6E;}span.status-holder.ng-binding.BUILT{background:#24b685;}span.status-holder.ng-binding.VALIDATED{background:#24b685;}span.colorBlock{width:30px;height:22px;border:1px solid black;text-indent:-999999px;display:inline-block;}.ng-binding.Red{background:#a21f23;}.ng-binding.Black{background:#000;}.ng-binding.White{background:#ffffff;}.ng-binding.Beige{background:#c5bfbf;}.ng-binding.Green{background:#23f328;}.ng-binding.Blue{background:#375265;}#loadingModal img{position:fixed;top:50%;left:50%;margin-top:-50px;margin-left:-50px;}.settingsDown{width:24px;height:22px;background-image:url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4gPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgeDE9IjAuNSIgeTE9IjAuMCIgeDI9IjAuNSIgeTI9IjEuMCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2U3ZWZmMyIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiIC8+PC9zdmc+IA==\');background-size:100%;background-image:-webkit-gradient(linear,50% 0%,50% 100%,color-stop(0%,#ffffff),color-stop(100%,#e7eff3));background-image:-moz-linear-gradient(#ffffff,#e7eff3);background-image:-webkit-linear-gradient(#ffffff,#e7eff3);background-image:linear-gradient(#ffffff,#e7eff3);border:1px solid #c1c8d0;font-size:1.3333333333em;text-align:center;cursor:pointer;margin-left:8px;margin-right:10px;}.settingsDown:before{font-size:17px;}.order-no-holder{vertical-align:top;}@media only screen and (min-width:992px){.settingsDown{margin-left:5px;margin-right:15px;}}.ng-submitted .ng-invalid{border:1px solid red !important;}}</style>'); });