var mkturl = '//hrawards.51job.com';

function sharepop (t)
{
	$('#shadow').show();
	$('#sharepop').show();
	var imgsrc = $(t).attr('data-code');
	$('#sharepop').find('.scode').attr('src', imgsrc);

	$('#sharepop .sclose').click(function(){
		$('#shadow, #sharepop').hide();
	});
}

function pointUp(t)
{
	var url = mkturl + '/ajax/like.php?type=0';

	if ($(t).hasClass('like')) {
		$(t).removeClass('like');
	} else {
		var id = $(t).attr("data-id");

		$.get(url,{artid:id},function(data){
			data = JSON.parse(data);

			if(data.result == 1)
			{
				$(t).addClass('like');
				$(t).attr('onclick','return false;');
				var vote = parseInt($(t).next("em").text());

				if(vote < 999)
				{
					vote++;
					$(t).next("em").text(vote);
				}
			}
		});
	}
}

function search()
{
	var keyword = $("#keyword").val();
	$("#formkwd").val(keyword);
	$("form").submit();
}

function getLikeNum(artid)
{
	var url = mkturl + '/ajax/like.php?type=1';
	var vote = 0;

	$.ajax({
		type:"get",
		url:url,
		data:{artid:artid},
		async:false,
		success:function(data){
			data = JSON.parse(data);
			if(data.result == 1)
			{
				vote = data.num;
			}
		}
	});

	return vote ;
}


$(function(){

	//榜单
	function getList(n, b, w)
	{
		w.find('ul').hide();
		if (w.find('.ul' + n).length > 0) {
			w.find('.ul' + n).show();
		} else {
			var lhtml = '<ul class="ul'+ n +'">';
			var list = b[n].list;
			for (var i = 0; i < list.length; i++) {
				lhtml += '<li><img src="' + list[i].logourl + '"><span>' + list[i].name + '</span></li>';
			}
			lhtml += '</ul>';
			w.append(lhtml);
		}
	}

	function getTitles(l, w)
	{
		var sht = '';
		if (w.selector == "#singleAward") {
			for (var i = 0; i < l.length; i++) {
				sht += '<li>'+ l[i].cname + ' <span class="eng">'+ l[i].ename + '</span></li>'
			}
		} else {
			for (var i = 0; i < l.length; i++) {
				sht += '<li>'+ l[i].name + '</li>'
			}
		}

		w.html(sht);
	}

	var getTop100 = (function ()
	{
		var len = Math.ceil(top100.length / 15);
		var thtml = '';
		var p = 0;
		for (var i = 0; i < len; i++) {
			thtml += '<ul>';
			var c = 15;
			if (i == len - 1) {
				c = top100.length % 15 - 1;
			}
			for (var j = 0; j < c; j++) {
				p++;
				thtml += '<li><img src="'+ top100[p].logourl +'"><span>'+ top100[p].name +'</span></li>'
			}
			thtml += '</ul>';
		}
		$('.atoplist .ul').html(thtml);
		$('.atoplist ul').hide();
	})();

	getTitles(single_awards, $('#singleAward'));
	getTitles(industry_awards, $('#industryAward'));

	getList(0, single_awards, $('#singleList'));
	getList(0, industry_awards, $('#industryList'));


	//回车提交表单
	$(window).keydown(function(e){
		if (e.target.id == 'keyword') {
			var curKey = e.which;

			if(curKey == 13)
			{
				var keyword = $("#keyword").val();
				$("#formkwd").val(keyword);
				$("form").submit();
			}
		}
	});

	if($("#pageindex").length > 0)//首页
	{
		$('.m-tab .check').click(function(){
			$(this).addClass('on').siblings().removeClass('on');
			$('.m-award .ain').hide();
			$('.m-award .ain').eq($(this).index() - 1).show();

			if ($(this).index() == 2) {
				//轮播
				var breathTop = (function ()
				{
					$('.atoplist ul:first').show();

					var oNextBtn = $('.nextbtn');
					var oPrevBtn = $('.prevbtn');
					var aImgLi = $('.atoplist ul');
					var oBanner = $('.atoplist');

					var num = 0;
					var speed = 500;
					var intervalSpeed = 5000;

					function nextFn(event) {
						aImgLi.eq(num).stop().fadeOut(speed);
						num++;
						if (num > aImgLi.length - 1) {
							num = 0;
						};
						aImgLi.eq(num).stop().fadeIn(speed);
					};

					var timer = setInterval(nextFn, intervalSpeed);

					oBanner.hover(function() {
						clearInterval(timer);
					}, function() {
						clearInterval(timer);
						timer = setInterval(nextFn, intervalSpeed);
					});

					oNextBtn.click(nextFn);

					oPrevBtn.click(function(event) {
						aImgLi.eq(num).stop().fadeOut(speed);

						num--;
						if (num < 0) {
							num = aImgLi.length - 1;
						};

						aImgLi.eq(num).stop().fadeIn(speed);
					});
				})();
			}
		});

		$('.select .set').click(function(){
			var spo = $(this).siblings('.spo');
			if (spo.css('display')== 'block') {
				spo.hide();
			} else {
				spo.show();
			}
		});

		$('.select .spo li').click(function(){
			var text = $(this).html();
			var index = $(this).index();
			$(this).parents('.spo').siblings('.set').html(text);
			$(this).parents('.spo').hide();
			if ($(this).parent().attr('id') == 'singleAward') {
				getList(index, single_awards, $('#singleList'));
			} else {
				getList(index, industry_awards, $('#industryList'));
			}
		});

		//瀑布流
		var $container = $('.masonry-container');
		var $grid;
		$container.imagesLoaded( function () {
			$grid = $container.masonry({
				columnWidth: 320,
				itemSelector: '.item',
				gutterWidth: 30,
				horizontalOrder: false,
				isAnimated: true
			});
			$('.loading').hide();
		});

		var arts = [];
		var url = mkturl + '/ajax/getAriticles.php';

		$.ajax({
			type: "get",
			url: url,
			dateType: "json",
			async: false,
			success: function(result){
				arts = JSON.parse(result).result;

			}
		});

		var page = 1,
		p = 19;
		acount = arts.length,
		totalpage = Math.ceil(acount / 20);
		var flag = true;

		$(window).scroll(function(){
			var stop = $(this).scrollTop();
			if (stop > 500) {
				$('.video-m').addClass('fixed');
			} else {
				$('.video-m').removeClass('fixed');
			}

			var scrollHeight = $(document).height();
			var windowHeight = $(this).height();

				if(stop + windowHeight == scrollHeight){
					if (page < totalpage) {
						if (flag) {
							page++;
							flag = false;

							var flength = 20;
							if (page == totalpage) {
								flength = acount % 20;
							}
							for (var i = 0; i < flength; i++) {
								var ahtml = "";
								p++;
								ahtml += '<div class="item">';
								ahtml += 	'<a href="'+ arts[p].url +'" class="e">';
								ahtml += 		'<img src='+ arts[p].img +'>';
								ahtml += 		'<span>'+ arts[p].title +'</span>';
								ahtml += 		'<p><i data-code="'+ mkturl + '/ajax/get_qrcode.php?url=' + encodeURIComponent(arts[p].url) + '" onclick="sharepop(this); return false;"></i><b data-id="' + arts[p].id + '" onclick="pointUp(this); return false;"></b><em>' + getLikeNum(arts[p].id) + '</em></p>';
								ahtml +=	'</a>';
								ahtml += '</div>';
								var $ahtml = $(ahtml);
								$grid.append($ahtml).masonry('appended', $ahtml, true);

								$grid.on( 'progress', function(){
									$grid.masonry('layout');
								});

							}
							setTimeout(function(){
								flag = true;
							}, 2000)
						}
					}
				}
		});

		//vote
		var i,artsid,vote;

		for(i = 0;i < arts.length && i < 20;i++)
		{
			artsid = arts[i].id;
			vote = getLikeNum(artsid);
			$("#em" + artsid).text(vote);
		}

	}

})
