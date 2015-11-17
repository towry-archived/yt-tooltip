/*!
  (c) 2015, Towry Wang (@tovvry)
  MIT License
*/

(function (window) {
  'use strict';

  angular.module('yt.tooltip', [])

    .directive('ytTooltip', ["$parse", "$window", "$compile", function ($parse, $window, $compile) {

      var options = {
        klass: 'yt--tooltip',
        contentKlass: 'tooltip-content'
      };

      var parentElement = $window.document.body;
      var tooltipElement = parentElement.querySelector('.' + options.klass);
      var changeTooltipContent;

      if (!tooltipElement) {
        tooltipElement = $window.document.createElement('div');
        addClass(tooltipElement, options.klass);

        changeTooltipContent = (function () {
          var tooltipContent = $window.document.createElement('div');
          tooltipElement.appendChild(tooltipContent);

          addClass(tooltipContent, options.contentKlass);

          return function (content, bHtml) {
            if (bHtml) {
              tooltipContent.innerHTML = content;
            } else {
              if ('textContent' in tooltipContent) {
                tooltipContent.textContent = content;
              } else {
                tooltipContent.innerText = content;
              }
            }
          }
        }());

        parentElement.appendChild(tooltipElement);
      } else {
        changeTooltipContent = (function () {
          var tooltipContent = tooltipElement.querySelector('.' + options.contentKlass);

          return function (content, bHtml) {
            if (bHtml) {
              tooltipContent.innerHTML = content;
            } else {
              if ('textContent' in tooltipContent) {
                tooltipContent.textContent = content;
              } else {
                tooltipContent.innerText = content;
              }
            }
          }
        }());
      }

      ajustTooltipStyle(tooltipElement, {display: 'none'});

      return {
        replace: false,
        restrict: "AE",
        scope: true,

        link: function (scope, aElement, aAttrs) {
          var isBottom = aAttrs.tooltipSide && aAttrs.tooltipSide === 'bottom';
          var ele = aElement[0];
          var tooltipText = $parse(aAttrs.tooltipText)(scope.$parent || scope);
          var tooltipHtml = htmlWrap(aAttrs.tooltipHtml);
          if (tooltipHtml) {
            tooltipHtml = $compile(tooltipHtml)(scope.$parent || scope);
          }
          if (tooltipHtml.length) {
            tooltipHtml = tooltipHtml[0];
          }

          // add event
          ele.addEventListener('mouseenter', mouseenterHandler, false);
          ele.addEventListener('mouseleave', mouseleaveHandler, false);
          
          // destory
          scope.$on("$destory", function () {
            ele.removeEventListener('mouseenter', mouseenterHandler);
            ele.removeEventListener('mouseleave', mouseleaveHandler);
          });

          function mouseenterHandler (e) {
            e.stopPropagation();

            // change tooltip content
            changeTooltipContent(tooltipText || tooltipHtml && tooltipHtml.innerHTML, !tooltipText && tooltipHtml);

            ajustTooltipStyle(tooltipElement, {
              display: 'block',
              visibility: 'hidden',
              opacity: 0,
            });

            if (isBottom) {
              addClass(tooltipElement, 'bottom');
              ajustTooltipStyleBottom(ele, tooltipElement);
            } else {
              ajustTooltipStyleDefault(ele, tooltipElement);
            }
          }

          function mouseleaveHandler (e) {
            e.stopPropagation();

            ajustTooltipStyle(tooltipElement, {
              display: 'none',
              visibility: 'hidden',
              opacity: 0
            });

            if (isBottom) {
              removeClass(tooltipElement, 'bottom');
            }
          }
        }
      }
    }]);


/* ======================================== 
  FUNCTIONS
  ======================================== */
function ajustTooltipStyle (tooltipElement, variations) {
  for (var i in variations) {
    tooltipElement.style[i] = variations[i];
  }
}

/**
 * for bottom tooltip
 * @see `ajustTooltipStyleDefault`.
 */
function ajustTooltipStyleBottom (tEle, tooltipEle) {
  var off = getOffset(tEle);
  // var tooltipBox = getElementBox(tooltipEle);
  var eleBox = getElementBox(tEle);

  var paddingSide = 6; 
  var arrowHeight = 7; 

  ajustTooltipStyle(tooltipEle, {
    left: off.left + eleBox.width / 2 + 'px',
    top: off.top + eleBox.height + arrowHeight + paddingSide + 'px',
    visibility: 'visible',
    opacity: 1
  });
}

/**
 * @param {object} tEle - The element that mouse hover on.
 * @param {object} tooltipEle - The tooltip element.
 */
function ajustTooltipStyleDefault (tEle, tooltipEle) {
  var off = getOffset(tEle);
  var tooltipBox = getElementBox(tooltipEle);
  var eleBox = getElementBox(tEle);

  var paddingSide = 3; 
  var arrowHeight = 7; 

  // change tooltip style
  ajustTooltipStyle(tooltipEle, {
    left: off.left + eleBox.width / 2 + 'px',
    top: off.top - tooltipBox.height - arrowHeight - paddingSide + 'px',
    visibility: 'visible',
    opacity: 1
  });
}

function getOffset (ele) {
  return {
    top: getOffsetTop(ele),
    left: getOffsetLeft(ele)
  }
}

function getOffsetTop (ele) {
  var offtop = ele.getBoundingClientRect().top + window.scrollY;
  if (isNaN(offtop)) {
    offtop = ele.getBoundingClientRect().top + window.pageYOffset;
  }
  return offtop;
}

function getOffsetLeft (ele) {
  var offleft = ele.getBoundingClientRect().left + window.scrollX;
  if (isNaN(offleft)) {
    offleft = ele.getBoundingClientRect().left + window.pageXOffset;
  }
  return offleft;
}

function getElementBox (ele) {
  var box = ele.getBoundingClientRect();
  return {
    width: box.width,
    height: box.height
  }
}

function addClass (ele, klass) {
  var eleKlass = ele.className;
  if (eleKlass !== '') {
    klass = klass[0] === ' ' ? klass : ' ' + klass;
  }

  ele.className = eleKlass + klass;
}

function removeClass (ele, klass) {
  var eleKlass = ele.className.replace(/^\s+|\s+$/g, '').split(/\s+/);
  var sKlass = klass.replace(/^\s+|\s+$/g, '');
  for (var i = 0; i < eleKlass.length; i++) {
    if (sKlass === eleKlass[i]) {
      eleKlass.splice(i, 1);
      break;
    }
  }
  ele.className = eleKlass.join(' ');
}

function htmlWrap (strHtml) {
  var ele = document.createElement('div');
  ele.innerHTML = strHtml;

  if (/^\s*$/.test(strHtml)) {
    return '';
  }

  return ele.childNodes[0].nodeType === 1 ? strHtml : '<span>' + strHtml + '</span>';
}

}(window));
