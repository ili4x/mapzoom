(function ($) {
	$.fn.mapzoom = function (params) {
		var defaults = {
			fixSize: false,
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

			if (typeof params == "string") {
				//Обработка комманты

				if (!$wrap.prop("has_mapzoom")) {
					//вызов на неинициализированом объекте
					console.error("mapzoom caller on not initialized element!", element);
					return;
				}

				//считать параметры
				$cont = $(".mapzoom_cont", $wrap);
				settings = $wrap.prop("settings");

				if (params == "zoomin") {
					zoomIn();
				}
				if (params == "zoomout") {
					zoomOut();
				}
			} else {
				init();
			}

			function init() {

				$cont = $("<div class='mapzoom_cont'>");
				$("*", $wrap).appendTo($cont);
				$cont.appendTo($wrap);
				$cont.css({"cursor": "grab"});
				$wrap.prop("has_mapzoom", true);

				if (settings.fixSize) {
					//var w = Math.max();
					$wrap.width($wrap.width() + "px");
					$wrap.height($wrap.height() + "px");
				}

				$wrap.prop("settings", settings);
				$wrap.css({overflow: "hidden", position: "relative"});
				if (settings.debug) {
					$("<div>").css({position: "absolute", left: 0, top: "50%", "box-sizing": "border-box", "border-bottom": "1px dashed blue", width: "100%", height: "1px"}).appendTo($wrap);
					$("<div>").css({position: "absolute", left: "50%", top: 0, "box-sizing": "border-box", "border-left": "1px dashed blue", width: "1px", height: "100%"}).appendTo($wrap);
				}

				$cont.on("mousedown touchstart", function (e) {
					e.preventDefault();
					ee = e;
					$cont.addClass("dragging");
					$("body").addClass("dragging");
				});
				$(window).on("mousedown touchstart", function (e) {
					e = e.originalEvent;
					e = e.touches ? e.touches[0] : e;
					startEvent = e;
					oldX = parseInt($cont.css("margin-left"));
					oldY = parseInt($cont.css("margin-top"));
				});
				$(window).on("mouseup touchend", function (e) {
					e.preventDefault();
					$cont.removeClass("dragging");
					$("body").removeClass("dragging");
				});
				$(window).on("mousemove touchmove", function (e) {
					if (!$("body").hasClass("dragging")) {
						return;
					}
					ee = e;
					e = e.originalEvent;
					e = e.touches ? e.touches[0] : e;
					console.log(e);
					console.log("move: " + e.screenX + " " + e.screenY);
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
					f = f - 1;
					var minX = f == 0 ? 0 : -parseInt($cont.css("width")) / (1 + 1 / f);
					var minY = f == 0 ? 0 : -parseInt($cont.css("height")) / (1 + 1 / f);

					if (x < minX) {
						x = minX;
					}
					if (y < minY) {
						y = minY;
					}

					console.log(x, y, minX, minY);
					$cont.css({
						"margin-left": x + "px",
						"margin-top": y + "px",
					});
				});
			}


			function getPos() {
				var f = Math.round($cont.width() / $cont.parent().width());
				f = f - 1;
				if (f == 0) {
					return {x: 0.5, y: 0.5};
				}
				var minX = f == 0 ? 0 : -parseInt($cont.css("width")) / (1 + 1 / f);
				var minY = f == 0 ? 0 : -parseInt($cont.css("height")) / (1 + 1 / f);
				var curX = parseInt($cont.css("margin-left"));
				var curY = parseInt($cont.css("margin-top"));
				return {x: curX / minX, y: curY / minY}

			}

			function setPos(x, y) {
				var f = Math.round($cont.width() / $cont.parent().width());
				f = f - 1;
				var minX = f == 0 ? 0 : -parseInt($cont.css("width")) / (1 + 1 / f);
				var minY = f == 0 ? 0 : -parseInt($cont.css("height")) / (1 + 1 / f);
				var curX = minX * x;
				var curY = minY * y;
				$cont.css("margin-left", curX + 'px')
				$cont.css("margin-top", curY + 'px')
			}

			function zoomIn() {
				debug("zoomIn");
				var f = Math.round($cont.width() / $cont.parent().width()) * 100;
				if (f >= settings.maxZoom) {
					return;
				}
				f = f + 100;
				setZoom(f);
			}

			function zoomOut() {
				debug("zoomOut");
				var f = Math.round($cont.width() / $cont.parent().width()) * 100;
				if (f <= 100) {
					return;
				}
				f = f - 100;
				setZoom(f);
			}

			function setZoom(f) {
				debug("setZoom: " + f);
				var pos = getPos();
				$cont.width(f + "%").height(f + "%");
				setPos(pos.x, pos.y);
				console.log(f, pos);
			}

			function debug(s) {
				console.log(settings);
				if (settings.debug) {
					console.log(window.performance.now() + ": " + s);
				}
			}
		});
		return this;
	};
}
)(jQuery);
