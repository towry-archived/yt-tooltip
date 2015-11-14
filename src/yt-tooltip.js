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

      var ajustTooltipStyle = function (variations) {
        for (var i in variations) {
          tooltipElement.style[i] = variations[i];
        }
      };

      ajustTooltipStyle({display: 'none'});

      return {
        replace: false,
        restrict: "AE",
        scope: true,

        link: function (scope, aElement, aAttrs) {
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

            ajustTooltipStyle({
              display: 'block',
              visibility: 'hidden',
              opacity: 0,
            });

            var off = getOffset(ele);
            var tooltipBox = getElementBox(tooltipElement);
            var eleBox = getElementBox(ele);

            var paddingSide = 6; 
            var arrowHeight = 0; 
            
            // change tooltip style
            ajustTooltipStyle({
              left: off.left + eleBox.width / 2 + 'px',
              top: off.top - tooltipBox.height - paddingSide - arrowHeight + 'px',
              visibility: 'visible',
              opacity: 1
            });
          }

          function mouseleaveHandler (e) {
            e.stopPropagation();

            ajustTooltipStyle({
              display: 'none',
              visibility: 'hidden',
              opacity: 0
            });
          }
        }
      }
    }]);


/* ======================================== 
  FUNCTIONS
  ======================================== */

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
  ele.className = klass;
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
