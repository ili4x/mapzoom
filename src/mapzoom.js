(function ($) {
	$.fn.mapzoom = function (params) {
		var defaults = {
			maxZoom: 300,
			debug: false
		};
		var settings = {};
		if (typeof params === "object") {
			for (var n in defaults) {
				settings[n] = params[n] ? params[n] : defaults[n];
			}
		} else {
			settings = defaults;
		}

		this.each(function (n, element) {
			var $wrap = $(element);
			var $cont, oldX, oldY, startEvent;

			if (typeof params === "string") {
				//Обработка комманты

				if (!$wrap.prop("has_mapzoom")) {
					//вызов на неинициализированом объекте
					console.error("mapzoom called on not initialized element!", element);
					return;
				}

				//считать параметры
				$cont = $(".mapzoom_cont", $wrap);
				settings = $wrap.prop("settings");

				if (params === "zoomin") {
					zoomIn();
				}
				if (params === "zoomout") {
					zoomOut();
				}
			} else {
				init();
			}

			function init() {

				$cont = $("<div class='mapzoom_cont'>");
				$("*", $wrap).appendTo($cont);
				$cont.appendTo($wrap);
				$wrap.prop("has_mapzoom", true);

				$wrap.width($wrap.width() + "px");
				$wrap.height($wrap.height() + "px");

				$wrap.prop("settings", settings);
				$wrap.css({overflow: "hidden", position: "relative"});
				if (settings.debug) {
					//рисуем центр
					$("<div>").css({position: "absolute", left: 0, top: "50%", "box-sizing": "border-box", "border-bottom": "1px dashed blue", width: "100%", height: "1px"}).appendTo($wrap);
					$("<div>").css({position: "absolute", left: "50%", top: 0, "box-sizing": "border-box", "border-left": "1px dashed blue", width: "1px", height: "100%"}).appendTo($wrap);
				}

				$cont.on("mousedown touchstart", function (e) {
					debug("down", e);
					e.preventDefault();
					$cont.addClass("dragging");
					$("body").addClass("dragging");
				});
				$(window).on("mousedown touchstart", function (e) {
					debug("window down", e);
					e = e.originalEvent;
					e = e.touches ? e.touches[0] : e;
					startEvent = e;
					oldX = parseInt($cont.css("margin-left"));
					oldY = parseInt($cont.css("margin-top"));
				});
				$(window).on("mouseup touchend", function (e) {
					debug("window up", e);
					e.preventDefault();
					$cont.removeClass("dragging");
					$("body").removeClass("dragging");
				});
				$(window).on("mousemove touchmove", function (e) {
					debug("move", e);
					if (!$("body").hasClass("dragging")) {
						return;
					}
					e = e.originalEvent;
					e = e.touches ? e.touches[0] : e;

					debug("move pos: " + e.screenX + " " + e.screenY);
					var x = e.screenX - startEvent.screenX;
					var y = e.screenY - startEvent.screenY;

					x = oldX + x;
					y = oldY + y;
					if (x > 0) {
						x = 0;
					}
					if (y > 0) {
						y = 0;
					}
					var f = Math.round($cont.width() / $cont.parent().width());
					var minX = f == 1 ? 0 : -parseInt($cont.css("width")) / (1 + 1 / (f - 1));
					var minY = f == 1 ? 0 : -parseInt($cont.css("height")) / (1 + 1 / (f - 1));

					if (x < minX) {
						x = minX;
					}
					if (y < minY) {
						y = minY;
					}

					$cont.css({
						"margin-left": x + "px",
						"margin-top": y + "px",
					});
				});
			}


			function getPos() {
				var f = Math.round($cont.width() / $cont.parent().width());
				var curX = -parseInt($cont.css("margin-left")) / parseInt($cont.css("width")) + (1 / f / 2);
				var curY = -parseInt($cont.css("margin-top")) / parseInt($cont.css("height")) + (1 / f / 2);
				return {x: curX, y: curY}

			}

			function setPos(x, y) {
				var f = Math.round($cont.width() / $cont.parent().width());
				var curX = -((x - (1 / f / 2)) * parseInt($cont.css("width")));
				var curY = -((y - (1 / f / 2)) * parseInt($cont.css("height")));
				var minX = f == 1 ? 0 : -parseInt($cont.css("width")) / (1 + 1 / (f - 1));
				var minY = f == 1 ? 0 : -parseInt($cont.css("height")) / (1 + 1 / (f - 1));
				if (curX < minX) {
					curX = minX;
				}
				if (curY < minY) {
					curY = minY;
				}
				if (curX > 0) {
					curX = 0;
				}
				if (curY > 0) {
					curY = 0;
				}
				debug("setpos", curX, curY, minX, minY);

				$cont.css("margin-left", curX + 'px')
				$cont.css("margin-top", curY + 'px')
			}

			function zoomIn() {
				debug("zoomIn");
				var zoom = Math.round($cont.width() / $cont.parent().width()) * 100;
				if (zoom >= settings.maxZoom) {
					return;
				}
				zoom = zoom + 100;
				setZoom(zoom);
			}

			function zoomOut() {
				debug("zoomOut");
				var zoom = Math.round($cont.width() / $cont.parent().width()) * 100;
				if (zoom <= 100) {
					return;
				}
				zoom = zoom - 100;
				setZoom(zoom);
			}

			function setZoom(zoom) {
				debug("setZoom: " + zoom);
				var pos = getPos();
				$cont.width(zoom + "%").height(zoom + "%");
				setPos(pos.x, pos.y);
				if (zoom > 100) {
					$cont.css({"cursor": "grab"});
				} else {
					$cont.css({"cursor": ""});
				}
			}

			function debug() {
				if (settings.debug) {
					console.log(window.performance.now() + ": ", ...arguments);
				}
			}
		});
		return this;
	};
}
)(jQuery);
