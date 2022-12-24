var mkturl = '//hrawards.51job.com';

function ellipsis(obj){
	for (var i = 0; i < obj.length; i++) {
		var cont = obj.eq(i).children('span').get(0);
		var divH = obj[i].offsetHeight;
		while (cont.offsetHeight > divH) {
			var c = cont.innerHTML;
			var cc = c.replace(/(\s)*([a-zA-Z0-9]+|\W|\-|_|#)(\.\.\.)?$/, "...");
			cont.innerHTML = cc;
		}
	};
}

function strlen (str){
  var len = 0;
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    var one = (c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f);
    //���ֽڼ�1
    if (one) {
      if (c != 32) {
        len++;
      }
    } else {
      len+=2;
    }
  }
  return len;
}

function html2Escape(sHtml) {
 return sHtml.replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});
}

function getDateDiff(dateTimeStamp){
	var minute = 1000 * 60;
	var hour = minute * 60;
	var day = hour * 24;
	var halfamonth = day * 15;
	var month = day * 30;
	var now = new Date().getTime();
	var diffValue = now - dateTimeStamp;
	if (diffValue < 0) { return; }
	var monthC = diffValue / month;
	var weekC = diffValue / (7 * day);
	var dayC = diffValue / day;
	var hourC = diffValue / hour;
	var minC = diffValue / minute;
	if (monthC >= 1) {
		result = '' + parseInt(monthC) + '��ǰ';
	}
	else if (weekC >= 1) {
		result = '' + parseInt(weekC) + '��ǰ';
	}
	else if(dayC >= 1){
		result = '' + parseInt(dayC) + '��ǰ';
	}
	else if (hourC >= 1) {
		result = ''+ parseInt(hourC) + 'Сʱǰ';
	}
	else if(minC >= 1){
		result = '' + parseInt(minC) + '����ǰ';
	} else
	result = '�ո�';
	return result;
}

//��ʾ
function pop(msg){
  if ($('#popNote').length == 0) {
    $('body').append('<div id="popNote">'+ msg +'</div>');
    setTimeout(function(){
      $('#popNote').remove();
    }, 3000)
  }
}


//�Ƿ��¼��token
var user_token = '', accountid = '';

var clientid   = '000006';
var clientpws  = 'aec50e675758805d28e95b6f39fea667';
var userinfo = {},
    userCommentLen = 10,
    userThisLen = 0,
		topicid = '';

var pageNum = '0',
    isEnd = false,
    useruncom = 0,
    isFirst = true;
var commentids = [];

//�Ƿ��¼
function getToken(){
  var tokenUrl = 'https://oauth.51job.com/ajax/get_user_token.php';
  $.ajax({
    url: tokenUrl,
    async: false,
    type: 'POST',
    dataType: 'json',
    xhrFields: {
      withCredentials: true
    },
    success: function(data) {
      if (data.result === '1') {
        user_token = data.user_token;
        accountid = data.accountid;
        getUserInfo()
      } else {
        console.log(data.scode);
      }
    }
  })
};

//�û���Ϣ
function getUserInfo(){
  var actionUrl = 'https://vapi.51job.com/user.php?query=userinfo&version=400&clientid=' + clientid;
  var data = {
    'accountid': accountid,
    'usertoken': user_token,
  };

  var sign = getcrypto.createApiSign(data, clientpws);
  $.ajax({
    url: actionUrl,
    async: false,
    type: 'POST',
    dataType: 'json',
    data: {
      data: JSON.stringify(data),
      sign: sign,
    },
    success: function(data) {
      if (data.status == '1') {
        userinfo = data.resultbody;
        if (userinfo.sex) {
          var sexImg = userinfo.sex == '0' ? 'https://img01.51jobcdn.com/im/mkt/df/man.png' : 'https://img01.51jobcdn.com/im/mkt/df/woman.png';
          $('#userHeader').attr('src', sexImg);
        }
      } else {
				user_token = '';
				accountid = '';
			}
    }
  })
};

//�����б�
function getComments(t){
  var commentUrl = 'https://vapi.51job.com/task.php?query=comment&apiversion=400&clientid=' + clientid;
  var data = {
    'topicid': topicid,
    'page': pageNum,
    'pagenum': 20
  };

  if (user_token !== '') {
    data.accountid = accountid;
    data.usertoken = user_token
  }
  var sign = getcrypto.createApiSign(data, clientpws);

  $.ajax({
    url: commentUrl,
    async: false,
    type: 'POST',
    dataType: 'json',
    data: {
      data: JSON.stringify(data),
      sign: sign,
    },
    success: function(data) {
      if (data.status == '1') {
        var result = data.resultbody;
        var commentList = result.commentList;

        if (commentList.length == 0) {
          isEnd = true;
        } else {
          var clist = '';
          for (var i = 0; i < commentList.length; i++) {
            var l = commentList[i];
            if (commentids.indexOf(l.commentid) < 0) {
              var sexImg = l.sex && l.sex == '0' ? 'https://img01.51jobcdn.com/im/mkt/df/man.png' : 'https://img01.51jobcdn.com/im/mkt/df/woman.png';
              var islike = l.islike == '0' ? '' : 'on';
              clist += '<li class="ce">';
              clist += '  <img src="'+ sexImg +'" alt="ͷ��">';
              clist += '  <div class="p1">'+ l.cname +'<p class="p2">'+ l.disscussdatestr +'</p></div>';
              clist += '    <i class="zan '+ islike +'" data-id="'+ l.commentid +'" data-islike="'+ l.islike +'" data-caid="'+ l.accountid +'">'+ l.likecount +'</i>';
              clist += '  <p class="pb2">'+ l.comment +'</p>';
              clist += '</li>';
            }
            if (isFirst) {
              commentids.push(l.commentid)
            }
          }
          isFirst = false;
          if (t) {
            $('#commentList').html(clist)
          } else {
            $('#commentList').append(clist)
          }

					$('#commentList .pb2').each(function(index) {
						$(this).text($(this).html())
					});

          if (result.page.isend == '1') {
            isEnd = true;
            return false;
          }
          pageNum = result.page.page;
          useruncom = parseInt(result.useruncom);
        }
      }
    },
    error: function(err) {
      console.log(err)
    }
  })
}

//��������
function getTopic(topicid){
  var topicUrl = 'https://vapi.51job.com/task.php?query=topic&apiversion=400&clientid=' + clientid;
  var data = {
    'topicid': topicid,
  };

  if (user_token !== '') {
    data.accountid = accountid;
    data.usertoken = user_token
  }

  var sign = getcrypto.createApiSign(data, clientpws);

  $.ajax({
    url: topicUrl,
    async: false,
    type: 'POST',
    dataType: 'json',
    data: {
      data: JSON.stringify(data),
      sign: sign,
    },
    success: function(data) {
      if (data.status == '1') {
        var len = parseInt(data.resultbody.topicinfo.commentcount)
        $('#commentListLen').text(len);
      }
    }
  })
}

//�û�������
function getUserPublish() {
  var publishUrl = 'https://vapi.51job.com/task.php?query=user_publish&apiversion=400&clientid=' + clientid;
  var data = {
    'accountid': accountid,
    'usertoken': user_token,
  };

  var sign = getcrypto.createApiSign(data, clientpws);

  $.ajax({
    url: publishUrl,
    async: false,
    type: 'POST',
    dataType: 'json',
    data: {
      data: JSON.stringify(data),
      sign: sign,
    },
    success: function(data) {
      if (data.status == '1') {
				let topics = []

        for (const key in result.resultbody.publish) {
          let oneTopic = result.resultbody.publish[key]
          if (oneTopic.topicid == this.topicid && oneTopic.name == '����') {
            topics.push(key)
          }
        }
        userCommentLen = 10 - topics.length
      }
    }
  })
}

// ��¼
function toLogin() {
  pop('��δ��¼�����ȵ�¼~');
	var ishttps = 'https:' == document.location.protocol ? true : false;
	var url = location.href;
	if (!ishttps) {
		url = url.replace(/http:/, 'https:')
	}

  setTimeout(function(){
		location.href = 'https://login.51job.com/login.php?lang=c&url=' + encodeURI(url)
  }, 1000)
}

//�Ƿ��������
function canComment() {
	if (user_token == '') {
    toLogin()
    return false
  }
}

//����
function dolike(t, d, s, a){
  if (user_token == '') {
    toLogin()
    return false
  }
  var dolikeUrl = 'https://vapi.51job.com/task.php?module=dolike&apiversion=400&clientid=' + clientid;
  var data = {
    'accountid': accountid,
    'usertoken': user_token,
    'topicid': topicid,
    'type': 0,
    'disscussid': d,
		'commentacid': a,
    'status': s
  };
  var sign = getcrypto.createApiSign(data, clientpws);

  $.ajax({
    url: dolikeUrl,
    async: false,
    type: 'POST',
    dataType: 'json',
    data: {
      data: JSON.stringify(data),
      sign: sign,
    },
    success: function(data) {
      if (data.status !== '1') {
        pop('����ʧ��~');
        return false
      }
      if (s == '1') {
        $(t).addClass('on').text(parseInt($(t).text()) + 1).attr('data-islike', 1)
      } else {
        $(t).removeClass('on').text(parseInt($(t).text()) - 1).attr('data-islike', 0)
      }
    }
  })
}

//��������
function postComment() {
  var commentVal = $.trim($('#commentVal').val())
  if (commentVal.length > 200) {
    pop('��������������~');
    return false
  }

  if (commentVal.length == 0) {
    pop('�������ݲ���Ϊ��~');
    return false
  }

  if (user_token == '') {
    toLogin()
    return false
  }

  if (userThisLen >= userCommentLen) {
    pop('��ֻ֧��10������~');
    return false
  }

  var postUrl = 'https://vapi.51job.com/task.php?module=comment&oprtype=add&apiversion=400&clientid=' + clientid;

  var data = {
    'accountid': accountid,
    'usertoken': user_token,
    'topicid': topicid,
    'comment': commentVal
  };

  var sign = getcrypto.createApiSign(data, clientpws);

  $.ajax({
    url: postUrl,
    async: false,
    type: 'POST',
    dataType: 'json',
    data: {
      data: JSON.stringify(data),
      sign: sign,
    },
    success: function(data) {
      var data = data
      if (data.status == '1') {
        //���ڵ�һλ
        var clist = '';
        var sexImg = '';
        if (userinfo.sex) {
          sexImg = userinfo.sex == '0' ? 'https://img01.51jobcdn.com/im/mkt/df/man.png' : 'https://img01.51jobcdn.com/im/mkt/df/woman.png';
        } else {
          sexImg = 'https://img01.51jobcdn.com/im/mkt/df/cent_moren.png';
        }
        var cname = '';
        if (userinfo.cname && userinfo.sex) {
          var sexName = userinfo.sex == '0' ? '����' : 'Ůʿ';
          cname = userinfo.cname.substr(0, 1) + sexName;
        } else {
          cname = '�����û�';
        }
        var commentid = data.resultbody.last_insert_id;
        var disscussdatestr = getDateDiff(new Date());

        clist += '<li class="ce">';
        clist += '  <img src="'+ sexImg +'" alt="ͷ��">';
        clist += '  <div class="p1">'+ cname +'<p class="p2">'+ disscussdatestr +'</p></div>';
        clist += '    <i class="zan" data-id="'+ commentid +'" data-islike="0"  data-caid="'+ accountid +'">0</i>';
        clist += '  <p class="pb2"></p>';
        clist += '</li>';

        $('#commentList').prepend(clist);
				$('#commentList .pb2').eq(0).text(commentVal)
				$('#commentVal').val('');
        $('#conmmentLength').html(0);

        userThisLen++;
      }
    },
    error: function(err) {
      console(err)
    }
  })
}

$(function(){
	$('.m-nav .search').click(function(){
		$('.m-nav .srbox').fadeIn(500);
	});

	$('.m-nav .cl').click(function(){
		$('.m-nav .srbox').fadeOut(500);
	});

	ellipsis( $('.e-hot .cr .b') );

	//��ʼ��
	var topicswitch = $('.topicswitch').val() || 0;
	topicid = $('#topicid').val() || 0;

	$(window).scroll(function(){
		var stop = $(this).scrollTop();
		if (stop > 0) {
			$('.m-back').show();
		} else {
			$('.m-back').hide();
		}

		if (stop > 400) {
			$('.m-nav').addClass('fixed');
			$('.m-place').show();
		} else {
			$('.m-nav').removeClass('fixed');
			$('.m-place').hide();
		}

		if(isEnd) {
	    return false
	  }

	  var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
	  var clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
	  var scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;

	  if (scrollTop + clientHeight > scrollHeight - 5) {
	    getComments()
	  }
	});

	//����
	var url = mkturl + '/ajax/like.php';

	$('.ashe .s, .abot .heart').click(function(){
		if ($(this).hasClass('on')) {
			$('.ashe .s, .abot .heart').removeClass('on');
			$('.abot .heart').html("<span></span>����");
		} else {
			var that = $(this);
			var id = that.attr("data-id");

			$.get(url,{artid:id},function(data){
				data = JSON.parse(data);

				//���ް�ť��Ϊ����
				var vote = getLikeNum(id);
				var html = $('.abot .heart').html("<span></span>" + vote);

				if(data.result == 1)
				{
					$('.ashe .s, .abot .heart').addClass('on');
					$('.ashe .s, .abot .heart').unbind("click");
				}
			});
		}
	});


	if (topicswitch == 1) {
		getToken()
		getComments()
	} else {
		$('.m-comment').hide();
	}

	//��������
	$('#commentList').on('click', '.zan', function(){
		var cid = $(this).attr('data-id');
		var islike = $(this).attr('data-islike');
		var caid = $(this).attr('data-caid');
		islike = islike == '1' ? '0' : '1';
		dolike($(this), cid, islike, caid)
	})

	//���ۿ������ж�
	$('#commentVal').on('input change', function(){
		var length = strlen($('#commentVal').val());
		if (length > 200) {
			length = -(length - 200);
			$('#maxComment').removeClass('hide');
			$('#conmmentLength').addClass('org');
		} else {
			$('#maxComment').addClass('hide');
			$('#conmmentLength').removeClass('org');
		}
		$('#conmmentLength').text(parseInt(length / 2));
	})
})
